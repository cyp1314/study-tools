const jimengService = require('../services/jimeng');
const imageRecordService = require('../services/imageRecord');
const qiniuUploader = require('../utils/qiniu');
const pointService = require('../services/pointService');
const productService = require('../services/productService');
const config = require('../config');
const { buildPrompt, getPromptConfig, promptConfig } = require('../config/prompts');
const { success, AppError } = require('../middleware/response');

/**
 * 图片生成控制器
 * 提供即梦AI图片生成相关API
 */
class ImageController {
  /**
   * 获取所有支持的图片生成类型
   * GET /api/v1/image/types
   */
  async getTypes(ctx) {
    // 优先从数据库读取产品列表
    try {
      const products = await productService.getActiveList();
      const types = products.map(p => ({
        type: p.type,
        description: p.description,
        defaultPrompt: p.default_prompt,
      }));
      success(ctx, types);
    } catch (_) {
      // 降级到 prompts.js
      const types = Object.entries(promptConfig).map(([key, cfg]) => ({
        type: key,
        description: cfg.description,
        defaultPrompt: cfg.defaultPrompt,
      }));
      success(ctx, types);
    }
  }

  /**
   * 生成图片（一站式：提交+等待+上传七牛云+写入数据库+返回结果）
   * POST /api/v1/image/generate
   * Body: { type, prompt, options? }
   */
  async generate(ctx) {
    const { type, prompt, options = {} } = ctx.request.body;
    const userId = ctx.state.user?.id;
    const costPoints = config.points.perGeneration;

    if (!type) {
      throw new AppError('type参数必填', -1, 400);
    }

    // 验证type有效性 + 构建完整提示词（优先从DB读取）
    let fullPrompt = '';
    try {
      const product = await productService.findByType(type);
      if (!product) throw new Error(`未找到产品: ${type}`);
      fullPrompt = productService.buildPrompt(product, prompt);
    } catch (dbErr) {
      // 降级到 prompts.js
      try {
        const result = buildPrompt(type, prompt);
        fullPrompt = result.prompt;
      } catch (err) {
        throw new AppError(err.message, -1, 400);
      }
    }

    // 扣减积分（登录用户）
    if (userId) {
      try {
        await pointService.deduct(userId, costPoints, 'generate', `生成${type}图片`);
      } catch (err) {
        throw new AppError(err.message, -1, 400);
      }
    }

    // 创建数据库记录（pending状态）
    let recordId;
    try {
      recordId = await imageRecordService.createRecord({
        userInput: prompt || '',
        fullPrompt,
        type,
      });
    } catch (dbErr) {
      console.error('[Image] 创建记录失败（继续生成）:', dbErr.message);
    }

    try {
      // 更新为生成中
      if (recordId) {
        await imageRecordService.markGenerating(recordId);
      }

      // 调用即梦AI生成图片
      const result = await jimengService.textToImage(fullPrompt, options);

      // 上传图片到七牛云，存储 key
      let imageKeys = [];
      if (result.images && result.images.length > 0) {
        try {
          imageKeys = await qiniuUploader.uploadBase64List(result.images, `jimeng/${type}`);
        } catch (uploadErr) {
          console.error('[Image] 七牛云上传失败:', uploadErr.message);
        }
      }

      // 更新数据库记录为成功
      if (recordId) {
        await imageRecordService.markSuccess(recordId, {
          images: result.images || [],
          imageKeys: qiniuUploader.getPublicUrls(imageKeys || []),
          taskId: result.taskId || '',
        });
      }

      // 生成七牛云预览URL
      const previewUrls = imageKeys.filter(Boolean).length > 0
        ? qiniuUploader.getPublicUrls(imageKeys.filter(Boolean))
        : [];

      // 只返回 recordId 和预览URL
      success(ctx, {
        recordId,
        previewUrls,
      }, '图片生成成功');
    } catch (err) {
      // 积分退还（登录用户且非积分不足导致的失败）
      if (userId && !err.message.includes('积分不足')) {
        try {
          await pointService.add(userId, costPoints, 'other', `生成失败退还积分`);
        } catch (_) { }
      }
      // 更新数据库记录为失败
      if (recordId) {
        await imageRecordService.markFailed(recordId, err.message).catch(() => { });
      }
      throw err;
    }
  }

  /**
   * 提交图片生成任务（异步模式，立即返回taskId和recordId）
   * POST /api/v1/image/submit
   * Body: { type, prompt, options? }
   */
  async submit(ctx) {
    const { type, prompt, options = {} } = ctx.request.body;

    if (!type) {
      throw new AppError('type参数必填', -1, 400);
    }

    let fullPrompt = '';
    try {
      const product = await productService.findByType(type);
      if (!product) throw new Error(`未找到产品: ${type}`);
      fullPrompt = productService.buildPrompt(product, prompt);
    } catch (dbErr) {
      try {
        const result = buildPrompt(type, prompt);
        fullPrompt = result.prompt;
      } catch (err) {
        throw new AppError(err.message, -1, 400);
      }
    }

    // 创建数据库记录
    let recordId;
    try {
      recordId = await imageRecordService.createRecord({
        userInput: prompt || '',
        fullPrompt,
        type,
      });
    } catch (dbErr) {
      console.error('[Image] 创建记录失败（继续提交）:', dbErr.message);
    }

    let taskId;
    try {
      taskId = await jimengService.submitTask({
        prompt: fullPrompt,
        extra: { return_url: true, logo_info: { add_logo: false }, ...options },
      });

      // 更新记录的taskId和状态
      if (recordId) {
        await imageRecordService.update(recordId, {
          task_id: taskId,
          status: 'generating',
        });
      }
    } catch (err) {
      if (recordId) {
        await imageRecordService.markFailed(recordId, err.message).catch(() => { });
      }
      throw err;
    }

    success(ctx, { taskId, recordId }, '任务提交成功');
  }

  /**
   * 查询图片生成任务结果（单次查询，不轮询）
   * GET /api/v1/image/result/:taskId
   */
  async getResult(ctx) {
    const { taskId } = ctx.params;

    if (!taskId) {
      throw new AppError('taskId参数必填', -1, 400);
    }

    // interval=0 表示只查一次，不轮询
    const result = await jimengService.getTaskResult(taskId, 1, 0);

    // 如果任务完成，上传七牛云并更新数据库
    if (result.status === 'success') {
      await this._uploadAndUpdateRecord(taskId, result);
    }

    success(ctx, result);
  }

  /**
   * 轮询等待任务结果（阻塞式，直到完成或超时）
   * GET /api/v1/image/poll/:taskId
   */
  async pollResult(ctx) {
    const { taskId } = ctx.params;
    const maxRetries = parseInt(ctx.query.maxRetries, 10) || 30;
    const interval = parseInt(ctx.query.interval, 10) || 2000;

    if (!taskId) {
      throw new AppError('taskId参数必填', -1, 400);
    }

    const result = await jimengService.getTaskResult(taskId, maxRetries, interval);

    // 如果任务完成，上传七牛云并更新数据库
    if (result.status === 'success') {
      await this._uploadAndUpdateRecord(taskId, result);
    }

    success(ctx, result);
  }

  /**
   * 查询图片生成记录列表
   * GET /api/v1/image/records?type=xxx&page=1&pageSize=20
   */
  async getRecords(ctx) {
    const { type, page = 1, pageSize = 20 } = ctx.query;
    const conditions = {};
    if (type) {
      conditions.type = type;
    }
    const records = await imageRecordService.findAll(conditions, parseInt(page, 10), parseInt(pageSize, 10));
    const total = await imageRecordService.count(conditions);
    success(ctx, { list: records, total, page: parseInt(page, 10), pageSize: parseInt(pageSize, 10) });
  }

  /**
   * 获取单条图片生成记录
   * GET /api/v1/image/records/:id
   */
  async getRecordById(ctx) {
    const { id } = ctx.params;
    const record = await imageRecordService.findById(id);
    if (!record) {
      throw new AppError('记录不存在', -1, 404);
    }
    // 解析 image_keys JSON，生成预览URL
    let previewUrls = [];
    try {
      const keys = typeof record.image_keys === 'string' ? JSON.parse(record.image_keys) : (record.image_keys || []);
      if (keys.length > 0) {
        previewUrls = qiniuUploader.getPublicUrls(keys);
      }
    } catch (e) {
      // ignore
    }
    success(ctx, { ...record, previewUrls });
  }

  /**
   * 内部方法：上传七牛云并更新数据库记录
   * @param {string} taskId
   * @param {Object} result - 即梦AI返回的结果
   */
  async _uploadAndUpdateRecord(taskId, result) {
    try {
      // 上传图片到七牛云，存储 key
      let imageKeys = [];
      if (result.images && result.images.length > 0) {
        imageKeys = await qiniuUploader.uploadBase64List(result.images, 'jimeng');
      }

      // 通过taskId查找记录并更新
      if (imageKeys.filter(Boolean).length > 0) {
        const pool = require('../db/mysql');
        const [rows] = await pool.query('SELECT id FROM image_records WHERE task_id = ?', [taskId]);
        if (rows.length > 0) {
          await imageRecordService.markSuccess(rows[0].id, {
            images: result.images || [],
            imageKeys: qiniuUploader.getPublicUrls(imageKeys || []),
            taskId: result.taskId || '',
          });
        }
      }
    } catch (err) {
      console.error('[Image] 上传七牛云/更新记录失败:', err.message);
    }
  }
}

module.exports = new ImageController();

const pool = require('../db/mysql');
const imageRecordService = require('../services/imageRecord');
const qiniuUploader = require('../utils/qiniu');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 图片记录管理控制器
 */
class AdminImageRecordController {
  /**
   * 图片记录列表
   * GET /api/v1/admin/image-record?page=1&pageSize=20&type=xxx&status=xxx
   */
  async list(ctx) {
    const { page = 1, pageSize = 20, type = '', status = '' } = ctx.query;
    const conditions = {};
    if (type) conditions.type = type;
    if (status) conditions.status = status;
    const records = await imageRecordService.findAll(conditions, parseInt(page), parseInt(pageSize));
    const total = await imageRecordService.count(conditions);
    success(ctx, { list: records, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  }

  /**
   * 图片记录详情
   * GET /api/v1/admin/image-record/:id
   */
  async getById(ctx) {
    const { id } = ctx.params;
    const record = await imageRecordService.findById(id);
    if (!record) throw new AppError('记录不存在', -1, 404);
    // 生成预览URL
    let previewUrls = [];
    try {
      const keys = typeof record.image_keys === 'string' ? JSON.parse(record.image_keys) : (record.image_keys || []);
      if (keys.length > 0) previewUrls = qiniuUploader.getPublicUrls(keys);
    } catch (_) {}
    success(ctx, { ...record, previewUrls });
  }

  /**
   * 删除图片记录
   * DELETE /api/v1/admin/image-record/:id
   */
  async remove(ctx) {
    const { id } = ctx.params;
    const record = await imageRecordService.findById(id);
    if (!record) throw new AppError('记录不存在', -1, 404);
    await imageRecordService.deleteById(id);
    success(ctx, null, '删除成功');
  }
}

module.exports = new AdminImageRecordController();

const BaseService = require('./base');

class ImageRecordService extends BaseService {
  constructor() {
    super('image_records');
  }

  /**
   * 创建图片生成记录
   * @param {Object} data
   * @param {string} data.userInput - 用户输入词
   * @param {string} data.fullPrompt - 完整提示词
   * @param {string} data.type - 图片类型
   * @param {string} data.taskId - 即梦AI任务ID
   * @returns {number} insertId
   */
  async createRecord({ userInput, fullPrompt, type, taskId }) {
    return this.create({
      user_input: userInput,
      full_prompt: fullPrompt,
      type,
      task_id: taskId || '',
      status: 'pending',
    });
  }

  /**
   * 更新记录为成功状态（含上传后的URL）
   * @param {number} id - 记录ID
   * @param {Object} data
   * @param {string[]} data.images - base64图片列表
   * @param {string[]} data.imageUrls - 七牛云URL列表
   */
  async markSuccess(id, { images, imageKeys, taskId }) {
    if (!images || !imageKeys) throw new AppError('images和imageKeys参数必填', -1, 400);
    console.log('markSuccess:', id, taskId, imageKeys);

    return this.update(id, {
      status: 'success',
      images: JSON.stringify(images || []),
      image_keys: JSON.stringify(imageKeys || []),
      task_id: taskId || '',
    });
  }

  /**
   * 更新记录为失败状态
   * @param {number} id - 记录ID
   * @param {string} errorMsg - 错误信息
   */
  async markFailed(id, errorMsg) {
    return this.update(id, {
      status: 'failed',
      images: JSON.stringify([]),
      image_keys: JSON.stringify([]),
    });
  }

  /**
   * 更新记录为生成中状态
   * @param {number} id - 记录ID
   */
  async markGenerating(id) {
    return this.update(id, { status: 'generating' });
  }

  /**
   * 按类型分页查询记录
   * @param {string} type - 图片类型
   * @param {number} page
   * @param {number} pageSize
   */
  async findByType(type, page = 1, pageSize = 20) {
    return this.findAll({ type }, page, pageSize);
  }
}

module.exports = new ImageRecordService();

const qiniu = require('../utils/qiniu');
const { success, fail } = require('../middleware/response');

class CommonController {
  /**
   * 上传图片到七牛云（通用接口）
   * POST /api/v1/common/upload
   * Body: { image: base64字符串 }
   */
  async uploadImage(ctx) {
    const { image, prefix = 'common/icon' } = ctx.request.body;

    if (!image) {
      return fail(ctx, '请上传图片');
    }

    try {
      // 自动生成 key，使用传入的 prefix
      const key = qiniu.generateKey(prefix, '.png');
      const uploadedKey = await qiniu.uploadBase64(image, key, prefix);

      // 返回文件key，前端可以通过七牛云domain拼接完整URL
      success(ctx, { key: uploadedKey, url: qiniu.getPublicUrl(uploadedKey) }, '上传成功');
    } catch (err) {
      console.error('[Common] uploadImage FAILED:', err.message);
      fail(ctx, '上传失败: ' + err.message);
    }
  }
}

module.exports = new CommonController();
const bannerService = require('../services/bannerService');
const qiniuUploader = require('../utils/qiniu');
const { success, AppError } = require('../middleware/response');

class AdminBannerController {
  async list(ctx) {
    const list = await bannerService.getAllList();
    // 生成预览URL
    const result = list.map(b => ({
      ...b,
      imageUrl: b.image_key ? qiniuUploader.getPrivateDownloadUrl(b.image_key) : '',
    }));
    success(ctx, result);
  }

  async getById(ctx) {
    const { id } = ctx.params;
    const banner = await bannerService.findById(id);
    if (!banner) throw new AppError('轮播图不存在', -1, 404);
    success(ctx, { ...banner, imageUrl: banner.image_key ? qiniuUploader.getPrivateDownloadUrl(banner.image_key) : '' });
  }

  async create(ctx) {
    const { title, imageKey, linkType, linkUrl, sortOrder, isActive } = ctx.request.body;
    if (!title) throw new AppError('title为必填项', -1, 400);
    const id = await bannerService.createBanner({ title, imageKey, linkType, linkUrl, sortOrder, isActive });
    success(ctx, { id }, '创建成功');
  }

  async update(ctx) {
    const { id } = ctx.params;
    const banner = await bannerService.findById(id);
    if (!banner) throw new AppError('轮播图不存在', -1, 404);
    await bannerService.updateBanner(id, ctx.request.body);
    success(ctx, null, '更新成功');
  }

  async remove(ctx) {
    const { id } = ctx.params;
    const banner = await bannerService.findById(id);
    if (!banner) throw new AppError('轮播图不存在', -1, 404);
    await bannerService.deleteById(id);
    success(ctx, null, '删除成功');
  }

  async toggleActive(ctx) {
    const { id } = ctx.params;
    await bannerService.toggleActive(id);
    success(ctx, null, '操作成功');
  }
}

module.exports = new AdminBannerController();

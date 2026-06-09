const productService = require('../services/productService');
const categoryService = require('../services/categoryService');
const qiniuUploader = require('../utils/qiniu');
const { success, AppError } = require('../middleware/response');

class AdminProductController {
  async list(ctx) {
    const list = await productService.getAllList();
    // 附加分类ID列表
    const result = [];
    for (const p of list) {
      const categoryIds = await productService.getCategoryIds(p.id);
      result.push({
        ...p,
        categoryIds,
        coverUrl: p.cover_image ? qiniuUploader.getPublicUrl(p.cover_image) : '',
      });
    }
    success(ctx, result);
  }

  async getById(ctx) {
    const { id } = ctx.params;
    const product = await productService.findById(id);
    if (!product) throw new AppError('产品不存在', -1, 404);
    const categoryIds = await productService.getCategoryIds(id);
    success(ctx, {
      ...product,
      categoryIds,
      coverUrl: product.cover_image ? qiniuUploader.getPublicUrl(product.cover_image) : '',
    });
  }

  async create(ctx) {
    const { name, type, prefix, suffix, defaultPrompt, description, coverImage, sortOrder, isActive, categoryIds } = ctx.request.body;
    if (!name || !type) throw new AppError('name、type为必填项', -1, 400);
    // 检查type唯一
    const existing = await productService.findByType(type);
    if (existing) throw new AppError(`type "${type}" 已存在`, -1, 400);
    const id = await productService.createProduct({ name, type, prefix, suffix, defaultPrompt, description, coverImage, sortOrder, isActive, categoryIds });
    success(ctx, { id }, '创建成功');
  }

  async update(ctx) {
    const { id } = ctx.params;
    const product = await productService.findById(id);
    if (!product) throw new AppError('产品不存在', -1, 404);
    // 检查type唯一性（如果改了type）
    const { type } = ctx.request.body;
    if (type && type !== product.type) {
      const existing = await productService.findByType(type);
      if (existing) throw new AppError(`type "${type}" 已存在`, -1, 400);
    }
    await productService.updateProduct(id, ctx.request.body);
    success(ctx, null, '更新成功');
  }

  async remove(ctx) {
    const { id } = ctx.params;
    const product = await productService.findById(id);
    if (!product) throw new AppError('产品不存在', -1, 404);
    await productService.deleteProduct(id);
    success(ctx, null, '删除成功');
  }

  async toggleActive(ctx) {
    const { id } = ctx.params;
    await productService.toggleActive(id);
    success(ctx, null, '操作成功');
  }
}

module.exports = new AdminProductController();

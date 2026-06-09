const categoryService = require('../services/categoryService');
const qiniuUploader = require('../utils/qiniu');
const { success, AppError } = require('../middleware/response');

class AdminCategoryController {
  async list(ctx) {
    const list = await categoryService.getAllList();
    // 生成图标预览URL
    const result = list.map(cat => ({
      ...cat,
      icon: cat.icon ? qiniuUploader.getPublicUrl(cat.icon) : '',
    }));
    success(ctx, result);
  }

  async getById(ctx) {
    const { id } = ctx.params;
    const cat = await categoryService.findById(id);
    if (!cat) throw new AppError('分类不存在', -1, 404);
    // 生成图标预览URL
    success(ctx, { 
      ...cat, 
      icon: cat.icon ? qiniuUploader.getPublicUrl(cat.icon) : '',
    });
  }

  async create(ctx) {
    const { name, icon, sortOrder, isActive } = ctx.request.body;
    if (!name) throw new AppError('name为必填项', -1, 400);
    const id = await categoryService.createCategory({ name, icon, sortOrder, isActive });
    success(ctx, { id }, '创建成功');
  }

  async update(ctx) {
    const { id } = ctx.params;
    const cat = await categoryService.findById(id);
    if (!cat) throw new AppError('分类不存在', -1, 404);
    await categoryService.updateCategory(id, ctx.request.body);
    success(ctx, null, '更新成功');
  }

  async remove(ctx) {
    const { id } = ctx.params;
    const cat = await categoryService.findById(id);
    if (!cat) throw new AppError('分类不存在', -1, 404);
    // 删除关联
    await categoryService.pool.query('DELETE FROM product_categories WHERE category_id = ?', [id]);
    await categoryService.deleteById(id);
    success(ctx, null, '删除成功');
  }

  async toggleActive(ctx) {
    const { id } = ctx.params;
    await categoryService.toggleActive(id);
    success(ctx, null, '操作成功');
  }
}

module.exports = new AdminCategoryController();

const rechargePackageService = require('../services/rechargePackageService');
const { success, AppError } = require('../middleware/response');

class RechargePackageController {
  /**
   * 获取所有套餐（管理端）
   * GET /api/v1/admin/recharge-package
   */
  async list(ctx) {
    const list = await rechargePackageService.getAllList();
    success(ctx, list);
  }

  /**
   * 获取单个套餐
   * GET /api/v1/admin/recharge-package/:id
   */
  async getById(ctx) {
    const { id } = ctx.params;
    const pkg = await rechargePackageService.findById(id);
    if (!pkg) throw new AppError('套餐不存在', -1, 404);
    success(ctx, pkg);
  }

  /**
   * 创建套餐
   * POST /api/v1/admin/recharge-package
   * Body: { name, points, bonus?, amount, sortOrder?, isActive? }
   */
  async create(ctx) {
    const { name, points, bonus, amount, sortOrder, isActive } = ctx.request.body;
    if (!name || points === undefined || amount === undefined) {
      throw new AppError('name、points、amount 为必填项', -1, 400);
    }
    const id = await rechargePackageService.createPackage({ name, points, bonus, amount, sortOrder, isActive });
    success(ctx, { id }, '创建成功');
  }

  /**
   * 更新套餐
   * PUT /api/v1/admin/recharge-package/:id
   * Body: { name?, points?, bonus?, amount?, sortOrder?, isActive? }
   */
  async update(ctx) {
    const { id } = ctx.params;
    const pkg = await rechargePackageService.findById(id);
    if (!pkg) throw new AppError('套餐不存在', -1, 404);
    await rechargePackageService.updatePackage(id, ctx.request.body);
    success(ctx, null, '更新成功');
  }

  /**
   * 删除套餐
   * DELETE /api/v1/admin/recharge-package/:id
   */
  async remove(ctx) {
    const { id } = ctx.params;
    const pkg = await rechargePackageService.findById(id);
    if (!pkg) throw new AppError('套餐不存在', -1, 404);
    await rechargePackageService.deleteById(id);
    success(ctx, null, '删除成功');
  }

  /**
   * 切换启用/禁用
   * PATCH /api/v1/admin/recharge-package/:id/toggle
   */
  async toggleActive(ctx) {
    const { id } = ctx.params;
    await rechargePackageService.toggleActive(id);
    success(ctx, null, '操作成功');
  }
}

module.exports = new RechargePackageController();

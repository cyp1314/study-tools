const userService = require('../services/userService');
const pointService = require('../services/pointService');
const { success, AppError } = require('../middleware/response');

class UserController {
  /**
   * 获取用户信息+积分余额
   * GET /api/v1/user/profile
   */
  async getProfile(ctx) {
    const userId = ctx.state.user.id;
    const [user, points] = await Promise.all([
      userService.getProfile(userId),
      pointService.getBalance(userId),
    ]);
    if (!user) throw new AppError('用户不存在', -1, 404);
    success(ctx, { ...user, points });
  }

  /**
   * 更新用户信息
   * PUT /api/v1/user/profile
   * Body: { nickname?, avatarUrl? }
   */
  async updateProfile(ctx) {
    const userId = ctx.state.user.id;
    const { nickname, avatarUrl } = ctx.request.body;
    await userService.updateProfile(userId, { nickname, avatarUrl });
    success(ctx, null, '更新成功');
  }

  /**
   * 绑定手机号
   * POST /api/v1/user/phone
   * Body: { phone }
   */
  async bindPhone(ctx) {
    const userId = ctx.state.user.id;
    const { phone } = ctx.request.body;
    if (!phone) throw new AppError('phone参数必填', -1, 400);
    await userService.bindPhone(userId, phone);
    success(ctx, null, '绑定成功');
  }
}

module.exports = new UserController();

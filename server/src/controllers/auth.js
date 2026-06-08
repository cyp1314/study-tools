const wxAuthService = require('../services/wxAuth');
const { success, AppError } = require('../middleware/response');

class AuthController {
  /**
   * 微信小程序登录
   * POST /api/v1/auth/login
   * Body: { code }
   */
  async login(ctx) {
    const { code } = ctx.request.body;
    if (!code) throw new AppError('code参数必填', -1, 400);

    const result = await wxAuthService.login(code);
    success(ctx, result, result.isNewUser ? '注册成功' : '登录成功');
  }
}

module.exports = new AuthController();

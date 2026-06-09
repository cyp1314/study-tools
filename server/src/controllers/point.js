const pointService = require('../services/pointService');
const signInService = require('../services/signInService');
const rechargeService = require('../services/rechargeService');
const { success, AppError } = require('../middleware/response');

class PointController {
  // ==================== 积分 ====================

  /**
   * 查询积分余额
   * GET /api/v1/point/balance
   */
  async getBalance(ctx) {
    const userId = ctx.state.user.id;
    const points = await pointService.getBalance(userId);
    success(ctx, points);
  }

  /**
   * 积分变更记录
   * GET /api/v1/point/logs?page=1&pageSize=20
   */
  async getLogs(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;
    const result = await pointService.getLogs(userId, parseInt(page, 10), parseInt(pageSize, 10));
    success(ctx, result);
  }

  // ==================== 签到 ====================

  /**
   * 签到
   * POST /api/v1/point/signin
   */
  async signIn(ctx) {
    const userId = ctx.state.user.id;
    const result = await signInService.signIn(userId);
    success(ctx, result, result.message || '签到成功');
  }

  /**
   * 签到状态
   * GET /api/v1/point/signin/status
   */
  async getSignInStatus(ctx) {
    const userId = ctx.state.user.id;
    const result = await signInService.getStatus(userId);
    success(ctx, result);
  }

  /**
   * 签到奖励配置
   * GET /api/v1/point/signin/config
   */
  async getSignInConfig(ctx) {
    const config = await signInService.getConfig();
    success(ctx, config);
  }

  // ==================== 充值 ====================

  /**
   * 充值套餐列表
   * GET /api/v1/point/recharge/packages
   */
  async getRechargePackages(ctx) {
    const packages = await rechargeService.getPackages();
    success(ctx, packages);
  }

  /**
   * 创建充值订单
   * POST /api/v1/point/recharge/create
   * Body: { packageId, openid }
   */
  async createRechargeOrder(ctx) {
    const userId = ctx.state.user.id;
    const { packageId, openid } = ctx.request.body;
    if (!packageId) throw new AppError('packageId参数必填', -1, 400);
    const result = await rechargeService.createOrder(userId, packageId, openid);
    success(ctx, result, '订单创建成功');
  }

  /**
   * 微信支付回调
   * POST /api/v1/point/recharge/notify
   */
  async rechargeNotify(ctx) {
    const wechatPay = require('../utils/wechatPay');

    // 验证签名并解密数据
    const notifyData = wechatPay.verifyNotify(ctx.headers, ctx.request.body);
    if (!notifyData) {
      ctx.status = 400;
      ctx.body = { code: 'FAIL', message: '签名验证失败' };
      return;
    }

    // 处理支付结果
    const result = await rechargeService.handlePayNotify(notifyData);

    if (result.success) {
      ctx.status = 200;
      ctx.body = { code: 'SUCCESS', message: '成功' };
    } else {
      ctx.status = 400;
      ctx.body = { code: 'FAIL', message: result.message };
    }
  }

  /**
   * 充值记录
   * GET /api/v1/point/recharge/orders?page=1&pageSize=20
   */
  async getRechargeOrders(ctx) {
    const userId = ctx.state.user.id;
    const { page = 1, pageSize = 20 } = ctx.query;
    const result = await rechargeService.getOrders(userId, parseInt(page, 10), parseInt(pageSize, 10));
    success(ctx, result);
  }
}

module.exports = new PointController();

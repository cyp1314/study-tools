const crypto = require('crypto');
const pool = require('../db/mysql');
const pointService = require('./pointService');
const rechargePackageService = require('./rechargePackageService');
const wechatPay = require('../utils/wechatPay');

/**
 * 充值服务
 */
class RechargeService {
  /**
   * 充值套餐列表（仅启用的，C端使用）
   */
  async getPackages() {
    const list = await rechargePackageService.getActiveList();
    return list.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      points: pkg.points,
      bonus: pkg.bonus,
      amount: parseFloat(pkg.amount),
      label: pkg.bonus > 0 ? `${pkg.name}+${pkg.bonus}赠送` : pkg.name,
    }));
  }

  /**
   * 创建充值订单（接入微信支付）
   * @param {number} userId
   * @param {number} packageId - 套餐ID
   * @param {string} openid - 用户openid（用于微信支付）
   * @returns {{ orderNo, points, amount, paymentParams }}
   */
  async createOrder(userId, packageId, openid) {
    // 从数据库查询套餐
    const pkg = await rechargePackageService.findById(packageId);
    if (!pkg) throw new Error('无效的充值套餐');
    if (!pkg.is_active) throw new Error('该套餐已下架');

    const orderNo = this._generateOrderNo();
    const totalPoints = pkg.points + (pkg.bonus || 0);

    // 写入订单记录
    await pool.query(
      'INSERT INTO recharge_orders (user_id, order_no, points, amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, orderNo, totalPoints, pkg.amount, 'pending', 'wechat']
    );

    console.log(`[Recharge] Order created: ${orderNo}, userId=${userId}, points=${totalPoints}, amount=${pkg.amount}`);

    // 调用微信支付创建订单
    let paymentParams = null;
    try {
      if (openid) {
        paymentParams = await wechatPay.createJsapiOrder({
          orderNo,
          amount: parseFloat(pkg.amount),
          description: `充值${totalPoints}积分`,
          openid,
        });
      } else {
        console.warn('[Recharge] 未提供openid，跳过微信支付');
      }
    } catch (error) {
      console.error('[Recharge] 微信支付创建失败:', error.message);
      // 支付创建失败，但订单已创建，返回订单信息让用户可以稍后支付
    }

    return {
      orderNo,
      points: totalPoints,
      amount: parseFloat(pkg.amount),
      paymentParams, // 前端调起支付需要的参数
    };
  }

  /**
   * 处理微信支付回调
   * @param {object} notifyData - 微信支付回调数据
   * @returns {object}
   */
  async handlePayNotify(notifyData) {
    const { out_trade_no, transaction_id, trade_state } = notifyData;

    if (trade_state !== 'SUCCESS') {
      console.log(`[Recharge] 支付未成功: ${out_trade_no}, state=${trade_state}`);
      return { success: false, message: '支付未成功' };
    }

    // 查询订单
    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE order_no = ? AND status = ?',
      [out_trade_no, 'pending']
    );
    if (rows.length === 0) {
      console.log(`[Recharge] 订单不存在或已处理: ${out_trade_no}`);
      return { success: true, message: '订单已处理' };
    }

    const order = rows[0];

    // 更新订单状态
    await pool.query(
      'UPDATE recharge_orders SET status = ?, paid_at = NOW(), transaction_id = ? WHERE order_no = ?',
      ['paid', transaction_id, out_trade_no]
    );

    // 加积分
    await pointService.add(order.user_id, order.points, 'recharge', `充值${order.points}积分`, out_trade_no);

    console.log(`[Recharge] Order paid: ${out_trade_no}, points=${order.points}`);
    return { success: true, orderNo: out_trade_no, points: order.points };
  }

  /**
   * 充值成功回调（模拟/手动调用）
   * @param {string} orderNo
   */
  async paySuccess(orderNo) {
    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE order_no = ? AND status = ?',
      [orderNo, 'pending']
    );
    if (rows.length === 0) throw new Error('订单不存在或已处理');

    const order = rows[0];

    // 更新订单状态
    await pool.query(
      'UPDATE recharge_orders SET status = ?, paid_at = NOW() WHERE order_no = ?',
      ['paid', orderNo]
    );

    // 加积分
    await pointService.add(order.user_id, order.points, 'recharge', `充值${order.points}积分`, orderNo);

    console.log(`[Recharge] Order paid: ${orderNo}, points=${order.points}`);
    return { orderNo, points: order.points, status: 'paid' };
  }

  /**
   * 查询充值记录
   */
  async getOrders(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [userId, pageSize, offset]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM recharge_orders WHERE user_id = ?',
      [userId]
    );
    return { list: rows, total: countRows[0].total };
  }

  /**
   * 根据订单号查询订单
   * @param {string} orderNo
   */
  async findByOrderNo(orderNo) {
    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE order_no = ?',
      [orderNo]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 生成订单号
   */
  _generateOrderNo() {
    const date = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RC${date}${rand}`;
  }
}

module.exports = new RechargeService();

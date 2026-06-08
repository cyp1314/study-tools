const crypto = require('crypto');
const pool = require('../db/mysql');
const pointService = require('./pointService');
const rechargePackageService = require('./rechargePackageService');

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
   * 创建充值订单
   * @param {number} userId
   * @param {number} packageId - 套餐ID
   * @returns {{ orderNo, points, amount }}
   */
  async createOrder(userId, packageId) {
    // 从数据库查询套餐
    const pkg = await rechargePackageService.findById(packageId);
    if (!pkg) throw new Error('无效的充值套餐');
    if (!pkg.is_active) throw new Error('该套餐已下架');

    const orderNo = this._generateOrderNo();
    const totalPoints = pkg.points + (pkg.bonus || 0);

    await pool.query(
      'INSERT INTO recharge_orders (user_id, order_no, points, amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, orderNo, totalPoints, pkg.amount, 'pending', 'wechat']
    );

    console.log(`[Recharge] Order created: ${orderNo}, userId=${userId}, points=${totalPoints}, amount=${pkg.amount}`);
    return { orderNo, points: totalPoints, amount: parseFloat(pkg.amount) };
  }

  /**
   * 充值成功回调（模拟/微信支付通知后调用）
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
   * 生成订单号
   */
  _generateOrderNo() {
    const date = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RC${date}${rand}`;
  }
}

module.exports = new RechargeService();

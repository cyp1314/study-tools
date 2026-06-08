const pool = require('../db/mysql');
const pointService = require('../services/pointService');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 充值订单管理控制器
 */
class AdminRechargeOrderController {
  /**
   * 充值订单列表
   * GET /api/v1/admin/recharge-order?page=1&pageSize=20&status=xxx&userId=xxx
   */
  async list(ctx) {
    const { page = 1, pageSize = 20, status = '', userId = '' } = ctx.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = '';
    const params = [];
    const conditions = [];
    if (status) { conditions.push('ro.status = ?'); params.push(status); }
    if (userId) { conditions.push('ro.user_id = ?'); params.push(parseInt(userId)); }
    if (conditions.length > 0) where = 'WHERE ' + conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT ro.*, u.nickname, u.phone
       FROM recharge_orders ro LEFT JOIN users u ON ro.user_id = u.id ${where}
       ORDER BY ro.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM recharge_orders ro ${where}`, params
    );
    success(ctx, { list: rows, total: countRows[0].total, page: parseInt(page), pageSize: limit });
  }

  /**
   * 订单详情
   * GET /api/v1/admin/recharge-order/:id
   */
  async getById(ctx) {
    const { id } = ctx.params;
    const [rows] = await pool.query(
      `SELECT ro.*, u.nickname, u.phone
       FROM recharge_orders ro LEFT JOIN users u ON ro.user_id = u.id WHERE ro.id = ?`,
      [id]
    );
    if (rows.length === 0) throw new AppError('订单不存在', -1, 404);
    success(ctx, rows[0]);
  }

  /**
   * 手动标记订单为已支付（线下/手动确认）
   * PATCH /api/v1/admin/recharge-order/:id/pay
   * Body: { paymentMethod? }
   */
  async markPaid(ctx) {
    const { id } = ctx.params;
    const { paymentMethod = 'admin' } = ctx.request.body;

    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE id = ? AND status = ?', [id, 'pending']
    );
    if (rows.length === 0) throw new AppError('订单不存在或非待支付状态', -1, 400);

    const order = rows[0];
    await pool.query(
      'UPDATE recharge_orders SET status = ?, paid_at = NOW(), payment_method = ? WHERE id = ?',
      ['paid', paymentMethod, id]
    );
    // 加积分
    await pointService.add(order.user_id, order.points, 'recharge', `管理员确认充值${order.points}积分`, order.order_no);
    success(ctx, null, '已标记为已支付并充值积分');
  }

  /**
   * 退款
   * PATCH /api/v1/admin/recharge-order/:id/refund
   */
  async refund(ctx) {
    const { id } = ctx.params;
    const { remark = '管理员退款' } = ctx.request.body;

    const [rows] = await pool.query(
      'SELECT * FROM recharge_orders WHERE id = ? AND status = ?', [id, 'paid']
    );
    if (rows.length === 0) throw new AppError('订单不存在或非已支付状态', -1, 400);

    const order = rows[0];
    await pool.query('UPDATE recharge_orders SET status = ? WHERE id = ?', ['refunded', id]);
    // 扣回积分
    await pointService.deduct(order.user_id, order.points, 'other', remark, order.order_no);
    success(ctx, null, '已退款并扣回积分');
  }
}

module.exports = new AdminRechargeOrderController();

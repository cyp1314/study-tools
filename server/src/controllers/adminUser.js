const pool = require('../db/mysql');
const pointService = require('../services/pointService');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 用户管理控制器
 */
class AdminUserController {
  /**
   * 用户列表（分页+搜索）
   * GET /api/v1/admin/user?page=1&pageSize=20&keyword=xxx
   */
  async list(ctx) {
    const { page = 1, pageSize = 20, keyword = '' } = ctx.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = '';
    const params = [];
    if (keyword) {
      where = 'WHERE nickname LIKE ? OR phone LIKE ? OR openid LIKE ?';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.openid, u.unionid, u.nickname, u.avatar_url, u.phone, u.role, u.created_at, u.updated_at,
              COALESCE(up.balance, 0) as balance, COALESCE(up.total_earned, 0) as total_earned, COALESCE(up.total_spent, 0) as total_spent
       FROM users u LEFT JOIN user_points up ON u.id = up.user_id ${where}
       ORDER BY u.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    success(ctx, { list: rows, total: countRows[0].total, page: parseInt(page), pageSize: limit });
  }

  /**
   * 用户详情
   * GET /api/v1/admin/user/:id
   */
  async getById(ctx) {
    const { id } = ctx.params;
    const [rows] = await pool.query(
      `SELECT u.*, COALESCE(up.balance, 0) as balance, COALESCE(up.total_earned, 0) as total_earned, COALESCE(up.total_spent, 0) as total_spent
       FROM users u LEFT JOIN user_points up ON u.id = up.user_id WHERE u.id = ?`,
      [id]
    );
    if (rows.length === 0) throw new AppError('用户不存在', -1, 404);
    // 脱敏
    const user = rows[0];
    user.session_key = undefined;
    success(ctx, user);
  }

  /**
   * 更新用户信息
   * PUT /api/v1/admin/user/:id
   * Body: { nickname?, role?, phone? }
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { nickname, role, phone } = ctx.request.body;
    const updates = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (role !== undefined) updates.role = role;
    if (phone !== undefined) updates.phone = phone;
    if (Object.keys(updates).length === 0) throw new AppError('无更新字段', -1, 400);
    await pool.query('UPDATE users SET ? WHERE id = ?', [updates, id]);
    success(ctx, null, '更新成功');
  }

  /**
   * 管理员调整积分
   * POST /api/v1/admin/user/:id/adjust-points
   * Body: { amount, remark }
   */
  async adjustPoints(ctx) {
    const { id } = ctx.params;
    const { amount, remark } = ctx.request.body;
    if (!amount || amount === 0) throw new AppError('amount 不能为0', -1, 400);

    // 确保用户存在
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError('用户不存在', -1, 404);

    if (amount > 0) {
      await pointService.add(id, amount, 'admin_adjust', remark || '管理员调整');
    } else {
      await pointService.deduct(id, Math.abs(amount), 'admin_adjust', remark || '管理员调整');
    }
    success(ctx, null, '积分调整成功');
  }

  /**
   * 删除用户
   * DELETE /api/v1/admin/user/:id
   */
  async remove(ctx) {
    const { id } = ctx.params;
    const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError('用户不存在', -1, 404);
    // 同时删除积分账户
    await pool.query('DELETE FROM user_points WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    success(ctx, null, '删除成功');
  }
}

module.exports = new AdminUserController();

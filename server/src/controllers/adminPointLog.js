const pool = require('../db/mysql');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 积分记录管理控制器
 */
class AdminPointLogController {
  /**
   * 积分记录列表
   * GET /api/v1/admin/point-log?page=1&pageSize=20&userId=xxx&type=xxx
   */
  async list(ctx) {
    const { page = 1, pageSize = 20, userId = '', type = '' } = ctx.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = '';
    const params = [];
    const conditions = [];
    if (userId) { conditions.push('pl.user_id = ?'); params.push(parseInt(userId)); }
    if (type) { conditions.push('pl.type = ?'); params.push(type); }
    if (conditions.length > 0) where = 'WHERE ' + conditions.join(' AND ');

    const [rows] = await pool.query(
      `SELECT pl.*, u.nickname, u.phone
       FROM point_logs pl LEFT JOIN users u ON pl.user_id = u.id ${where}
       ORDER BY pl.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM point_logs pl ${where}`, params
    );
    success(ctx, { list: rows, total: countRows[0].total, page: parseInt(page), pageSize: limit });
  }
}

module.exports = new AdminPointLogController();

const pool = require('../db/mysql');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 签到记录管理控制器
 */
class AdminSignInRecordController {
  /**
   * 签到记录列表
   * GET /api/v1/admin/signin-record?page=1&pageSize=20&userId=xxx
   */
  async list(ctx) {
    const { page = 1, pageSize = 20, userId = '' } = ctx.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let where = '';
    const params = [];
    if (userId) { where = 'WHERE sr.user_id = ?'; params.push(parseInt(userId)); }

    const [rows] = await pool.query(
      `SELECT sr.*, u.nickname, u.phone
       FROM sign_in_records sr LEFT JOIN users u ON sr.user_id = u.id ${where}
       ORDER BY sr.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM sign_in_records sr ${where}`, params
    );
    success(ctx, { list: rows, total: countRows[0].total, page: parseInt(page), pageSize: limit });
  }

  /**
   * 删除签到记录
   * DELETE /api/v1/admin/signin-record/:id
   */
  async remove(ctx) {
    const { id } = ctx.params;
    await pool.query('DELETE FROM sign_in_records WHERE id = ?', [id]);
    success(ctx, null, '删除成功');
  }
}

module.exports = new AdminSignInRecordController();

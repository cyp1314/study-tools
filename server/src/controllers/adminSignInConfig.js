const pool = require('../db/mysql');
const { success, AppError } = require('../middleware/response');

/**
 * 管理端 - 签到配置管理控制器
 */
class AdminSignInConfigController {
  /**
   * 签到配置列表
   * GET /api/v1/admin/signin-config
   */
  async list(ctx) {
    const [rows] = await pool.query(
      'SELECT * FROM sign_in_config ORDER BY continuous_days ASC'
    );
    success(ctx, rows);
  }

  /**
   * 创建签到配置
   * POST /api/v1/admin/signin-config
   * Body: { continuousDays, rewardPoints, isActive? }
   */
  async create(ctx) {
    const { continuousDays, rewardPoints, isActive } = ctx.request.body;
    if (!continuousDays || !rewardPoints) throw new AppError('continuousDays、rewardPoints 为必填', -1, 400);

    // 检查重复
    const [existing] = await pool.query(
      'SELECT id FROM sign_in_config WHERE continuous_days = ?', [continuousDays]
    );
    if (existing.length > 0) throw new AppError(`第${continuousDays}天配置已存在`, -1, 400);

    await pool.query(
      'INSERT INTO sign_in_config (continuous_days, reward_points, is_active) VALUES (?, ?, ?)',
      [continuousDays, rewardPoints, isActive !== undefined ? (isActive ? 1 : 0) : 1]
    );
    success(ctx, null, '创建成功');
  }

  /**
   * 更新签到配置
   * PUT /api/v1/admin/signin-config/:id
   * Body: { continuousDays?, rewardPoints?, isActive? }
   */
  async update(ctx) {
    const { id } = ctx.params;
    const { continuousDays, rewardPoints, isActive } = ctx.request.body;
    const updates = {};
    if (continuousDays !== undefined) updates.continuous_days = continuousDays;
    if (rewardPoints !== undefined) updates.reward_points = rewardPoints;
    if (isActive !== undefined) updates.is_active = isActive ? 1 : 0;
    if (Object.keys(updates).length === 0) throw new AppError('无更新字段', -1, 400);

    await pool.query('UPDATE sign_in_config SET ? WHERE id = ?', [updates, id]);
    success(ctx, null, '更新成功');
  }

  /**
   * 删除签到配置
   * DELETE /api/v1/admin/signin-config/:id
   */
  async remove(ctx) {
    const { id } = ctx.params;
    await pool.query('DELETE FROM sign_in_config WHERE id = ?', [id]);
    success(ctx, null, '删除成功');
  }
}

module.exports = new AdminSignInConfigController();

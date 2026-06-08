const pool = require('../db/mysql');
const pointService = require('./pointService');

/**
 * 签到服务
 */
class SignInService {
  /**
   * 签到
   * @param {number} userId
   * @returns {{ earnedPoints, continuousDays, todaySigned }}
   */
  async signIn(userId) {
    const today = new Date().toISOString().slice(0, 10);

    // 1. 检查今日是否已签到
    const [existing] = await pool.query(
      'SELECT id FROM sign_in_records WHERE user_id = ? AND sign_date = ?',
      [userId, today]
    );
    if (existing.length > 0) {
      return { todaySigned: true, earnedPoints: 0, continuousDays: 0, message: '今日已签到' };
    }

    // 2. 计算连续签到天数
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const [yesterdayRow] = await pool.query(
      'SELECT continuous_days FROM sign_in_records WHERE user_id = ? AND sign_date = ?',
      [userId, yesterday]
    );
    const continuousDays = yesterdayRow.length > 0 ? yesterdayRow[0].continuous_days + 1 : 1;

    // 3. 查询签到奖励配置
    const rewardPoints = await this._getRewardPoints(continuousDays);

    // 4. 写签到记录
    await pool.query(
      'INSERT INTO sign_in_records (user_id, sign_date, continuous_days, earned_points) VALUES (?, ?, ?, ?)',
      [userId, today, continuousDays, rewardPoints]
    );

    // 5. 加积分
    await pointService.add(userId, rewardPoints, 'sign_in', `连续签到第${continuousDays}天`);

    console.log(`[SignIn] userId=${userId}, day=${continuousDays}, earned=${rewardPoints}`);
    return { todaySigned: true, earnedPoints: rewardPoints, continuousDays };
  }

  /**
   * 获取签到状态
   * @param {number} userId
   */
  async getStatus(userId) {
    const today = new Date().toISOString().slice(0, 10);

    // 今日是否已签到
    const [todayRow] = await pool.query(
      'SELECT * FROM sign_in_records WHERE user_id = ? AND sign_date = ?',
      [userId, today]
    );
    const todaySigned = todayRow.length > 0;
    const currentContinuousDays = todaySigned ? todayRow[0].continuous_days : 0;

    // 获取最近7天签到记录（用于日历展示）
    const sevenDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const [recentRows] = await pool.query(
      'SELECT sign_date, continuous_days, earned_points FROM sign_in_records WHERE user_id = ? AND sign_date >= ? ORDER BY sign_date',
      [userId, sevenDaysAgo]
    );

    // 如果今日未签到，查昨日获取连续天数
    let continuousDays = currentContinuousDays;
    if (!todaySigned) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const [yesterdayRow] = await pool.query(
        'SELECT continuous_days FROM sign_in_records WHERE user_id = ? AND sign_date = ?',
        [userId, yesterday]
      );
      continuousDays = yesterdayRow.length > 0 ? yesterdayRow[0].continuous_days : 0;
    }

    // 签到配置
    const config = await this.getConfig();

    return {
      todaySigned,
      continuousDays,
      recentRecords: recentRows,
      config,
    };
  }

  /**
   * 获取签到奖励配置
   */
  async getConfig() {
    const [rows] = await pool.query(
      'SELECT continuous_days, reward_points, is_active FROM sign_in_config WHERE is_active = 1 ORDER BY continuous_days'
    );
    return rows;
  }

  /**
   * 获取连续第N天的奖励积分
   * @param {number} continuousDays
   * @returns {number}
   */
  async _getRewardPoints(continuousDays) {
    // 先查精确匹配
    const [exact] = await pool.query(
      'SELECT reward_points FROM sign_in_config WHERE continuous_days = ? AND is_active = 1',
      [continuousDays]
    );
    if (exact.length > 0) return exact[0].reward_points;

    // 查最大天数配置（超过7天后使用最大天数的奖励）
    const [maxRow] = await pool.query(
      'SELECT reward_points FROM sign_in_config WHERE is_active = 1 ORDER BY continuous_days DESC LIMIT 1'
    );
    if (maxRow.length > 0) return maxRow[0].reward_points;

    // 兜底
    return 5;
  }
}

module.exports = new SignInService();

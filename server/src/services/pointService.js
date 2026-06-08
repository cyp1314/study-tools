const pool = require('../db/mysql');

/**
 * 积分服务
 */
class PointService {
  /**
   * 获取用户积分余额
   * @param {number} userId
   * @returns {{ balance, totalEarned, totalSpent }}
   */
  async getBalance(userId) {
    const [rows] = await pool.query(
      'SELECT balance, total_earned, total_spent FROM user_points WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return { balance: 0, totalEarned: 0, totalSpent: 0 };
    }
    return {
      balance: rows[0].balance,
      totalEarned: rows[0].total_earned,
      totalSpent: rows[0].total_spent,
    };
  }

  /**
   * 增加积分
   * @param {number} userId
   * @param {number} amount - 正数
   * @param {string} type - 变更类型
   * @param {string} remark - 备注
   * @param {string} refId - 关联业务ID
   */
  async add(userId, amount, type, remark = '', refId = '') {
    if (amount <= 0) throw new Error('增加积分 amount 必须为正数');

    // 确保积分账户存在
    await this._ensureAccount(userId);

    const [result] = await pool.query(
      'UPDATE user_points SET balance = balance + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
      [amount, amount, userId]
    );

    // 查询更新后余额
    const { balance } = await this.getBalance(userId);

    // 写日志
    await this._addLog(userId, type, amount, balance, remark, refId);

    console.log(`[Point] +${amount} (type=${type}), userId=${userId}, balance=${balance}`);
    return { balance, amount };
  }

  /**
   * 扣减积分
   * @param {number} userId
   * @param {number} amount - 正数（扣减量）
   * @param {string} type - 变更类型
   * @param {string} remark - 备注
   * @param {string} refId - 关联业务ID
   */
  async deduct(userId, amount, type = 'generate', remark = '', refId = '') {
    if (amount <= 0) throw new Error('扣减积分 amount 必须为正数');

    // 检查余额
    const { balance } = await this.getBalance(userId);
    if (balance < amount) {
      throw new Error(`积分不足，当前余额 ${balance}，需要 ${amount}`);
    }

    await pool.query(
      'UPDATE user_points SET balance = balance - ?, total_spent = total_spent + ?, updated_at = NOW() WHERE user_id = ?',
      [amount, amount, userId]
    );

    const updated = await this.getBalance(userId);

    // 写日志（amount 为负数表示消耗）
    await this._addLog(userId, type, -amount, updated.balance, remark, refId);

    console.log(`[Point] -${amount} (type=${type}), userId=${userId}, balance=${updated.balance}`);
    return { balance: updated.balance, amount: -amount };
  }

  /**
   * 查询积分变更记录
   * @param {number} userId
   * @param {number} page
   * @param {number} pageSize
   */
  async getLogs(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      'SELECT * FROM point_logs WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?',
      [userId, pageSize, offset]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) as total FROM point_logs WHERE user_id = ?',
      [userId]
    );
    return { list: rows, total: countRows[0].total };
  }

  /**
   * 确保用户积分账户存在
   */
  async _ensureAccount(userId) {
    const [rows] = await pool.query('SELECT id FROM user_points WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO user_points (user_id, balance, total_earned, total_spent) VALUES (?, 0, 0, 0)',
        [userId]
      );
    }
  }

  /**
   * 写积分变更日志
   */
  async _addLog(userId, type, amount, balanceAfter, remark = '', refId = '') {
    await pool.query(
      'INSERT INTO point_logs (user_id, type, amount, balance_after, remark, ref_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, amount, balanceAfter, remark, refId]
    );
  }
}

module.exports = new PointService();

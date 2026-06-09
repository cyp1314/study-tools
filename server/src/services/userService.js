const BaseService = require('./base');

class UserService extends BaseService {
  constructor() {
    super('users');
  }

  /**
   * 根据 ID 获取用户信息（脱敏）
   */
  async getProfile(userId) {
    const [rows] = await this.pool.query(
      'SELECT id, openid, unionid, nickname, avatar_url, phone, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * 更新用户信息
   */
  async updateProfile(userId, { nickname, avatarUrl }) {
    const updates = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length === 0) return;

    await this.update(userId, updates);
  }

  /**
   * 绑定手机号
   */
  async bindPhone(userId, phone) {
    await this.update(userId, { phone });
  }
}

module.exports = new UserService();

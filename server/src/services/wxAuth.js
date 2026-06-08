const axios = require('axios');
const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db/mysql');

/**
 * 微信小程序登录服务
 */
class WxAuthService {
  /**
   * 调用微信 code2Session 接口
   * @param {string} code - 小程序 wx.login() 获取的 code
   * @returns {{ openid, session_key, unionid? }}
   */
  async code2Session(code) {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: config.wx.appId,
      secret: config.wx.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    console.log('[WxAuth] code2Session, code:', code.substring(0, 10) + '...');
    const { data } = await axios.get(url, { params });

    if (data.errcode) {
      console.error('[WxAuth] code2Session FAILED:', data.errcode, data.errmsg);
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    return {
      openid: data.openid,
      sessionKey: data.session_key,
      unionid: data.unionid || '',
    };
  }

  /**
   * 微信登录：查找或创建用户，签发 JWT
   * @param {string} code - 小程序 code
   * @returns {{ token, isNewUser, user }}
   */
  async login(code) {
    // 1. 调用微信接口获取 openid
    const { openid, sessionKey, unionid } = await this.code2Session(code);

    // 2. 查找或创建用户
    const [rows] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);
    let user = rows[0];
    let isNewUser = false;

    if (!user) {
      // 新用户注册
      const [result] = await pool.query(
        'INSERT INTO users (openid, unionid, session_key, nickname, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [openid, unionid, sessionKey, '微信用户', '']
      );
      const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
      isNewUser = true;

      // 初始化积分账户 + 新用户奖励
      const pointService = require('./pointService');
      await pool.query(
        'INSERT INTO user_points (user_id, balance, total_earned) VALUES (?, ?, ?)',
        [user.id, config.points.newUserBonus, config.points.newUserBonus]
      );
      await pointService._addLog(user.id, 'new_user', config.points.newUserBonus, config.points.newUserBonus, '新用户注册奖励');

      console.log('[WxAuth] New user created, id:', user.id, ', bonus:', config.points.newUserBonus);
    } else {
      // 更新 session_key
      await pool.query(
        'UPDATE users SET session_key = ?, unionid = ? WHERE id = ?',
        [sessionKey, unionid, user.id]
      );
      user.session_key = sessionKey;
      console.log('[WxAuth] User login, id:', user.id);
    }

    // 3. 签发 JWT
    const token = this.signToken(user);

    return { token, isNewUser, user: this._sanitizeUser(user) };
  }

  /**
   * 签发 JWT
   */
  signToken(user) {
    return jwt.sign(
      { id: user.id, openid: user.openid, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * 清除敏感字段
   */
  _sanitizeUser(user) {
    const { session_key, ...safe } = user;
    return safe;
  }
}

module.exports = new WxAuthService();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/mysql');
const config = require('../config');
const { success, AppError } = require('../middleware/response');

class AdminAuthController {
  /**
   * 管理员账号密码登录
   * POST /api/v1/admin-auth/login
   * Body: { username, password }
   */
  async login(ctx) {
    const { username, password } = ctx.request.body;
    if (!username || !password) {
      throw new AppError('用户名和密码必填', -1, 400);
    }

    // 查询管理员
    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) {
      throw new AppError('用户名或密码错误', -1, 401);
    }

    const admin = rows[0];

    // 验证密码
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      throw new AppError('用户名或密码错误', -1, 401);
    }

    // 生成 token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );

    success(ctx, {
      token,
      user: {
        id: admin.id,
        username: admin.username,
      }
    }, '登录成功');
  }
}

module.exports = new AdminAuthController();
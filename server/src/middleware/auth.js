const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '未登录，请先登录', data: null };
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 401;
    ctx.body = { code: 401, message: '登录已过期，请重新登录', data: null };
  }
};

const optionalAuth = async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      ctx.state.user = decoded;
    } catch (_) {
      // ignore invalid token for optional auth
    }
  }
  await next();
};

module.exports = { auth, optionalAuth };

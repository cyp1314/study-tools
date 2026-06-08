const Router = require('@koa/router');
const authController = require('../controllers/auth');

const router = new Router();

/**
 * 登录模块
 * POST /api/v1/auth/login  — 微信登录
 */
router.post('/login', authController.login);

module.exports = router.routes();

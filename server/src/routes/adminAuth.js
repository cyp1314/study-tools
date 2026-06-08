const Router = require('@koa/router');
const adminAuthController = require('../controllers/adminAuth');

const router = new Router();

/**
 * 管理员账号登录
 * POST /api/v1/admin-auth/login
 */
router.post('/login', adminAuthController.login);

module.exports = router.routes();
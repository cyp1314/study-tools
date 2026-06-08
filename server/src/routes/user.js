const Router = require('@koa/router');
const { auth } = require('../middleware/auth');
const userController = require('../controllers/user');

const router = new Router();

/**
 * 用户模块（需登录）
 */
router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/phone', userController.bindPhone);

module.exports = router.routes();

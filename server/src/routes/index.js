const Router = require('@koa/router');
const { health } = require('../controllers/index');

const router = new Router({ prefix: '/api/v1' });

// ==================== 基础路由 ====================
router.get('/health', health);

// ==================== 业务路由（后续按模块添加）====================
// router.use('/user', require('./user'));
// router.use('/material', require('./material'));
// router.use('/hanzi', require('./hanzi'));
// router.use('/poem', require('./poem'));
// router.use('/english', require('./english'));
// router.use('/ai', require('./ai'));
// router.use('/work', require('./work'));
// router.use('/error-book', require('./errorBook'));
// router.use('/reward', require('./reward'));

module.exports = router;

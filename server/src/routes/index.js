const Router = require('@koa/router');
const { health } = require('../controllers/index');

const router = new Router({ prefix: '/api/v1' });

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 健康检查
 *     tags: [基础]
 *     responses:
 *       200:
 *         description: 服务正常
 */
router.get('/health', health);

// ==================== 业务路由 ====================
router.use('/image', require('./image'));
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/point', require('./point'));
router.use('/admin', require('./admin'));
router.use('/business', require('./business'));
router.use('/admin-auth', require('./adminAuth'));
router.use('/menu', require('./menu'));
router.use('/common', require('./common'));
// router.use('/material', require('./material'));
// router.use('/hanzi', require('./hanzi'));
// router.use('/poem', require('./poem'));
// router.use('/english', require('./english'));
// router.use('/ai', require('./ai'));
// router.use('/work', require('./work'));
// router.use('/error-book', require('./errorBook'));
// router.use('/reward', require('./reward'));

// 测试路由（仅开发环境使用）
router.use('/test', require('./test'));

module.exports = router;

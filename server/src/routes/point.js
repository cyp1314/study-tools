const Router = require('@koa/router');
const { auth } = require('../middleware/auth');
const pointController = require('../controllers/point');

const router = new Router();

/**
 * 微信支付回调（无需登录）
 */
router.post('/recharge/notify', pointController.rechargeNotify);

/**
 * 积分/签到/充值模块（需登录）
 */
router.use(auth);

// 积分
router.get('/balance', pointController.getBalance);
router.get('/logs', pointController.getLogs);

// 签到
router.post('/signin', pointController.signIn);
router.get('/signin/status', pointController.getSignInStatus);
router.get('/signin/config', pointController.getSignInConfig);

// 充值
router.get('/recharge/packages', pointController.getRechargePackages);
router.post('/recharge/create', pointController.createRechargeOrder);
router.get('/recharge/orders', pointController.getRechargeOrders);

module.exports = router.routes();

const Router = require('@koa/router');
const { auth } = require('../middleware/auth');
const pointController = require('../controllers/point');

const router = new Router();

/**
 * @swagger
 * tags:
 *   - name: 积分
 *     description: 积分相关接口
 *   - name: 签到
 *     description: 签到相关接口
 *   - name: 充值
 *     description: 充值相关接口
 *
 * /point/recharge/notify:
 *   post:
 *     summary: 微信支付回调
 *     description: 微信支付成功后的回调接口（无需登录）
 *     tags: [充值]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: 微信支付回调数据
 *     responses:
 *       200:
 *         description: 处理成功
 *
 * /point/balance:
 *   get:
 *     summary: 获取积分余额
 *     description: 获取当前用户的积分余额
 *     tags: [积分]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: integer
 *                       description: 当前积分余额
 *
 * /point/logs:
 *   get:
 *     summary: 获取积分变动记录
 *     description: 获取当前用户的积分变动历史
 *     tags: [积分]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /point/signin:
 *   post:
 *     summary: 签到
 *     description: 用户每日签到获取积分
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 签到成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: integer
 *                       description: 获得的积分
 *                     consecutiveDays:
 *                       type: integer
 *                       description: 连续签到天数
 *       400:
 *         description: 今日已签到
 *
 * /point/signin/status:
 *   get:
 *     summary: 获取签到状态
 *     description: 获取当前用户的签到状态
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasSignedToday:
 *                       type: boolean
 *                       description: 今日是否已签到
 *                     consecutiveDays:
 *                       type: integer
 *                       description: 连续签到天数
 *                     totalPoints:
 *                       type: integer
 *                       description: 累计获得积分
 *
 * /point/signin/config:
 *   get:
 *     summary: 获取签到配置
 *     description: 获取签到奖励配置
 *     tags: [签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /point/recharge/packages:
 *   get:
 *     summary: 获取充值套餐列表
 *     description: 获取所有可用的充值套餐
 *     tags: [充值]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       points:
 *                         type: integer
 *                       description:
 *                         type: string
 *
 * /point/recharge/create:
 *   post:
 *     summary: 创建充值订单
 *     description: 创建充值订单并返回支付参数
 *     tags: [充值]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [packageId]
 *             properties:
 *               packageId:
 *                 type: integer
 *                 description: 充值套餐 ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       description: 订单 ID
 *                     payParams:
 *                       type: object
 *                       description: 微信支付参数
 *
 * /point/recharge/orders:
 *   get:
 *     summary: 获取充值订单列表
 *     description: 获取当前用户的充值订单历史
 *     tags: [充值]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 获取成功
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

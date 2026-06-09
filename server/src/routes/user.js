const Router = require('@koa/router');
const { auth } = require('../middleware/auth');
const userController = require('../controllers/user');

const router = new Router();

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 获取用户信息
 *     description: 获取当前登录用户的详细信息
 *     tags: [用户]
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
 *                     id:
 *                       type: integer
 *                     nickname:
 *                       type: string
 *                     avatarUrl:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     points:
 *                       type: integer
 *                       description: 当前积分
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权
 *   put:
 *     summary: 更新用户信息
 *     description: 更新当前登录用户的信息
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 昵称
 *                 example: "张三"
 *               avatarUrl:
 *                 type: string
 *                 description: 头像 URL
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *
 * /user/phone:
 *   post:
 *     summary: 绑定手机号
 *     description: 绑定用户手机号
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, code]
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *                 example: "13800138000"
 *               code:
 *                 type: string
 *                 description: 验证码
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 绑定成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 */
router.use(auth);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/phone', userController.bindPhone);

module.exports = router.routes();

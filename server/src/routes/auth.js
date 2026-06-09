const Router = require('@koa/router');
const authController = require('../controllers/auth');

const router = new Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 微信小程序登录
 *     description: 使用微信小程序的 code 进行登录，返回 JWT token 和用户信息
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信小程序登录凭证
 *                 example: "081abc123def456"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT 访问令牌
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nickname:
 *                           type: string
 *                         avatarUrl:
 *                           type: string
 *                         isNewUser:
 *                           type: boolean
 *                           description: 是否新用户
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.post('/login', authController.login);

module.exports = router.routes();

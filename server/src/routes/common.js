const Router = require('@koa/router');
const commonController = require('../controllers/common');

const router = new Router();

/**
 * @swagger
 * tags:
 *   - name: 公共
 *     description: 公共接口
 *
 * /common/upload:
 *   post:
 *     summary: 上传图片
 *     description: 上传图片到七牛云对象存储
 *     tags: [公共]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 description: 图片的 base64 编码
 *                 example: "data:image/png;base64,iVBORw0KGgo..."
 *     responses:
 *       200:
 *         description: 上传成功
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
 *                     key:
 *                       type: string
 *                       description: 七牛云文件 key
 *                     url:
 *                       type: string
 *                       description: 图片访问 URL
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 上传失败
 */
router.post('/upload', commonController.uploadImage);

module.exports = router.routes();
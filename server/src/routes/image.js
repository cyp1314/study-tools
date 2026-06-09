const Router = require('@koa/router');
const imageController = require('../controllers/image');
const { auth, optionalAuth } = require('../middleware/auth');

const router = new Router();

/**
 * @swagger
 * tags:
 *   - name: 图片生成
 *     description: 图片生成相关接口
 *
 * /image/types:
 *   get:
 *     summary: 获取图片生成类型
 *     description: 获取所有支持的图片生成类型列表
 *     tags: [图片生成]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         description: 类型标识
 *                       name:
 *                         type: string
 *                         description: 类型名称
 *                       description:
 *                         type: string
 *                         description: 类型描述
 *
 * /image/generate:
 *   post:
 *     summary: 一站式生成图片
 *     description: 提交任务并轮询直到完成，适合前端等待的场景
 *     tags: [图片生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, prompt]
 *             properties:
 *               type:
 *                 type: string
 *                 description: 图片生成类型
 *                 example: "coloringBook"
 *               prompt:
 *                 type: string
 *                 description: 用户输入的提示词
 *                 example: "一只可爱的猫"
 *               width:
 *                 type: integer
 *                 description: 图片宽度
 *                 example: 512
 *               height:
 *                 type: integer
 *                 description: 图片高度
 *                 example: 512
 *     responses:
 *       200:
 *         description: 生成成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *
 * /image/submit:
 *   post:
 *     summary: 提交图片生成任务
 *     description: 异步模式，立即返回 taskId
 *     tags: [图片生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, prompt]
 *             properties:
 *               type:
 *                 type: string
 *               prompt:
 *                 type: string
 *               width:
 *                 type: integer
 *               height:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 提交成功
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
 *                     taskId:
 *                       type: string
 *                       description: 任务 ID
 *
 * /image/result/{taskId}:
 *   get:
 *     summary: 查询任务结果
 *     description: 单次查询，不轮询
 *     tags: [图片生成]
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务 ID
 *     responses:
 *       200:
 *         description: 查询成功
 *       404:
 *         description: 任务不存在
 *
 * /image/poll/{taskId}:
 *   get:
 *     summary: 轮询等待任务结果
 *     description: 阻塞式，直到完成或超时
 *     tags: [图片生成]
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 任务完成
 *       408:
 *         description: 超时
 *
 * /image/records:
 *   get:
 *     summary: 获取图片生成记录列表
 *     description: 获取当前用户的图片生成记录
 *     tags: [图片生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /image/records/{id}:
 *   get:
 *     summary: 获取单条图片生成记录
 *     tags: [图片生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 记录不存在
 */

// 获取所有支持的图片生成类型
router.get('/types', imageController.getTypes);

// 一站式生成图片（提交+轮询+返回，适合前端等待的场景）
router.post('/generate', optionalAuth, imageController.generate);

// 提交图片生成任务（异步模式，立即返回taskId）
router.post('/submit', optionalAuth, imageController.submit);

// 查询任务结果（单次查询，不轮询）
router.get('/result/:taskId', imageController.getResult);

// 轮询等待任务结果（阻塞式，直到完成或超时）
router.get('/poll/:taskId', imageController.pollResult);

// 查询图片生成记录列表
router.get('/records', imageController.getRecords);

// 获取单条图片生成记录
router.get('/records/:id', imageController.getRecordById);

module.exports = router.routes();

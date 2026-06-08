const Router = require('@koa/router');
const imageController = require('../controllers/image');
const { auth, optionalAuth } = require('../middleware/auth');

const router = new Router();

/**
 * 图片生成相关路由
 * 基础路径: /api/v1/image
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

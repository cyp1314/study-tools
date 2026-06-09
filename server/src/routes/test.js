// 测试签到功能的API端点
// 注意：此文件仅供开发测试使用，生产环境请删除或禁用

const Router = require('@koa/router');
const signInService = require('../services/signInService');
const pointService = require('../services/pointService');
const { success, AppError } = require('../middleware/response');

const router = new Router({ prefix: '' });

// 模拟用户ID（测试用）
const TEST_USER_ID = 3;

/**
 * 测试签到功能
 * GET /api/v1/test/sign-in
 */
router.get('/sign-in', async (ctx) => {
  try {
    const result = await signInService.signIn(TEST_USER_ID);
    if (result.message) {
      success(ctx, result, result.message);
    } else {
      success(ctx, result, '签到成功');
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: -1, message: error.message };
  }
});

/**
 * 测试获取签到状态
 * GET /api/v1/test/sign-in/status
 */
router.get('/sign-in/status', async (ctx) => {
  try {
    const status = await signInService.getStatus(TEST_USER_ID);
    success(ctx, status);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: -1, message: error.message };
  }
});

/**
 * 测试获取签到配置
 * GET /api/v1/test/sign-in/config
 */
router.get('/sign-in/config', async (ctx) => {
  try {
    const config = await signInService.getConfig();
    success(ctx, config);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: -1, message: error.message };
  }
});

/**
 * 测试用户积分余额
 * GET /api/v1/test/points
 */
router.get('/points', async (ctx) => {
  try {
    const balance = await pointService.getBalance(TEST_USER_ID);
    success(ctx, { balance });
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: -1, message: error.message };
  }
});

/**
 * 重置测试用户签到记录（用于测试）
 * POST /api/v1/test/sign-in/reset
 */
router.post('/sign-in/reset', async (ctx) => {
  try {
    const pool = require('../db/mysql');
    await pool.query('DELETE FROM sign_in_records WHERE user_id = ?', [TEST_USER_ID]);
    success(ctx, null, '测试用户签到记录已重置');
  } catch (error) {
    ctx.status = 500;
    ctx.body = { code: -1, message: error.message };
  }
});

module.exports = router.routes();

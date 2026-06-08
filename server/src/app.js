require('dotenv').config();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const config = require('./config');
const router = require('./routes/index');
const errorMiddleware = require('./middleware/error');
const loggerMiddleware = require('./middleware/logger');
const initDatabase = require('./db/init');

const app = new Koa();

// ==================== 全局错误监听 ====================
app.on('error', (err, ctx) => {
  console.error('[Global Error]', err.status, err.message, ctx.url);
});

// ==================== 中间件注册（顺序重要）====================
// 1. 全局错误处理 - 最外层，捕获所有下游错误
app.use(errorMiddleware);

// 2. 请求日志
app.use(loggerMiddleware);

// 3. 跨域
app.use(cors());

// 4. 请求体解析
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 5. 路由
app.use(router.routes());
app.use(router.allowedMethods());

// ==================== 启动服务 ====================
let server;

async function start() {
  try {
    // // 初始化数据库（建表）
    await initDatabase();
    console.log('[DB] Database initialized');

    server = app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`);
      console.log(`[Server] Health check: http://localhost:${config.port}/api/v1/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

// ==================== 优雅关闭 ====================
function gracefulShutdown(signal) {
  console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] Closed');
      process.exit(0);
    });
    // 5秒超时强制退出
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常处理
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

start();

require('dotenv').config();

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const serve = require('koa-static');
const path = require('path');
const { koaSwagger } = require('koa2-swagger-ui');
const config = require('./config');
const router = require('./routes/index');
const errorMiddleware = require('./middleware/error');
const loggerMiddleware = require('./middleware/logger');
const apiLoggerMiddleware = require('./middleware/apiLogger');
const initDatabase = require('./db/init');
const swaggerSpec = require('./config/swagger');

const app = new Koa();

// ==================== 全局错误监听 ====================
app.on('error', (err, ctx) => {
  console.error('[Global Error]', err.status, err.message, ctx.url);
});

// ==================== 中间件注册（顺序重要）====================
// 1. 全局错误处理 - 最外层，捕获所有下游错误
app.use(errorMiddleware);

// 2. 请求日志（控制台）
app.use(loggerMiddleware);

// 3. API 调用日志（数据库）
app.use(apiLoggerMiddleware);

// 4. 跨域
app.use(cors());

// 5. 请求体解析
app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '10mb',
  formLimit: '10mb',
}));

// 5. 静态文件服务 - 提供图片访问
// 注意：__dirname 是 app.js 所在目录 (src)，所以 uploads 在上一级
const uploadsPath = path.join(__dirname, '..', 'uploads');
console.log('[Static] Uploads path:', uploadsPath);

// koa-static 会将请求路径直接映射到目录
// 请求 /uploads/images/xxx.png -> 查找 uploads/uploads/images/xxx.png (错误)
// 所以我们需要挂载到根目录，请求时直接用 /images/xxx.png
// 但为了保持 URL 结构，我们使用 koa-mount
const mount = require('koa-mount');
app.use(mount('/uploads', serve(uploadsPath, { maxage: 30 * 24 * 60 * 60 * 1000 })));

// 6. 路由
app.use(router.routes());
app.use(router.allowedMethods());

// 6. Swagger 文档（仅开发环境）
if (process.env.NODE_ENV !== 'production') {
  app.use(
    koaSwagger({
      routePrefix: '/api-docs',
      swaggerOptions: {
        spec: swaggerSpec,
        url: '/api-docs/swagger.json',
      },
    })
  );
}

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
      console.log(`[Server] API Docs: http://localhost:${config.port}/api-docs`);
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

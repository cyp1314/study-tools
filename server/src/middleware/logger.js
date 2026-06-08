const logger = async (ctx, next) => {
  const start = Date.now();
  const reqTime = new Date().toISOString();

  // 请求日志
  console.log(`[Request] --> ${reqTime} ${ctx.method} ${ctx.url}`);
  if (ctx.method === 'POST' || ctx.method === 'PUT') {
    const body = ctx.request.body;
    if (body) {
      const bodyStr = JSON.stringify(body);
      console.log(`[Request]     Body: ${bodyStr.substring(0, 300)}${bodyStr.length > 300 ? '...' : ''}`);
    }
  }

  await next();

  const ms = Date.now() - start;
  const status = ctx.status;

  // 响应日志
  const level = status >= 400 ? 'Error' : 'Info';
  const prefix = status >= 400 ? '[Response ERROR]' : '[Response]';
  console.log(`${prefix} <-- ${ctx.method} ${ctx.url} - ${status} - ${ms}ms`);

  // 错误响应时打印响应体
  if (status >= 400 && ctx.body) {
    console.log(`[Response]     Body: ${JSON.stringify(ctx.body).substring(0, 500)}`);
  }
};

module.exports = logger;

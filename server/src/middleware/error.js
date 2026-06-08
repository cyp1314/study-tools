const error = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      code: err.code || -1,
      message: err.message || 'Internal Server Error',
      data: null,
    };

    // 详细错误日志
    console.error('[Error] ======= Request Error =======');
    console.error('[Error]   Method:', ctx.method, ctx.url);
    console.error('[Error]   Status:', ctx.status);
    console.error('[Error]   Message:', err.message);
    if (err.code) console.error('[Error]   Code:', err.code);
    if (err.stack) console.error('[Error]   Stack:', err.stack);
    console.error('[Error] ==============================');

    ctx.app.emit('error', err, ctx);
  }
};

module.exports = error;

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
    ctx.app.emit('error', err, ctx);
  }
};

module.exports = error;

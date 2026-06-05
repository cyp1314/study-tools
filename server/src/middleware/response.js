class AppError extends Error {
  constructor(message, code = -1, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const success = (ctx, data = null, message = 'success') => {
  ctx.body = {
    code: 0,
    message,
    data,
  };
};

const fail = (ctx, message = 'fail', code = -1, status = 400) => {
  ctx.status = status;
  ctx.body = {
    code,
    message,
    data: null,
  };
};

module.exports = { AppError, success, fail };

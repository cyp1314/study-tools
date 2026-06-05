const { success } = require('../middleware/response');

const health = async (ctx) => {
  success(ctx, {
    status: 'ok',
    timestamp: Date.now(),
  });
};

module.exports = { health };

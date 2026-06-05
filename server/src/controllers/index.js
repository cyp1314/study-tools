const pool = require('../db/mysql');

const index = async (ctx) => {
  ctx.body = {
    code: 0,
    message: 'Study Tools Server is running',
  };
};

const testDb = async (ctx) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    ctx.body = {
      code: 0,
      message: 'Database connection successful',
      data: rows,
    };
  } catch (error) {
    ctx.body = {
      code: -1,
      message: 'Database connection failed',
      error: error.message,
    };
  }
};

module.exports = {
  index,
  testDb,
};

const config = require('../config');

const pool = require('mysql2/promise').createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 添加连接验证，避免超时断开
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

module.exports = pool;
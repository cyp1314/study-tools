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
  // 连接保活配置
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10秒后开始发送keepalive探测
  // 超时配置
  connectTimeout: 10000, // 连接超时10秒
  // 自动重连
  namedPlaceholders: true,
});

module.exports = pool;
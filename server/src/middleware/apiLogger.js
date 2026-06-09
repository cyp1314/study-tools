const pool = require('../db/mysql');

/**
 * API 调用日志中间件
 * 记录每个接口的入参、返回参数、响应时长和用户信息
 */
const apiLogger = async (ctx, next) => {
  const start = Date.now();
  const reqTime = new Date();

  // 跳过 OPTIONS 请求（CORS 预检请求）
  if (ctx.method === 'OPTIONS') {
    return await next();
  }

  // 获取请求信息
  const method = ctx.method;
  const url = ctx.url;
  const queryParams = Object.keys(ctx.query).length > 0 ? ctx.query : null;
  const requestBody = (method === 'POST' || method === 'PUT' || method === 'PATCH') && ctx.request.body
    ? ctx.request.body
    : null;

  // 获取用户信息（如果已登录）
  const userId = ctx.state.user?.id || null;
  const userInfo = ctx.state.user ? {
    id: ctx.state.user.id,
    nickname: ctx.state.user.nickname || '',
    avatarUrl: ctx.state.user.avatarUrl || '',
    role: ctx.state.user.role || 'user',
  } : null;

  // 获取客户端信息
  const ipAddress = ctx.ip || ctx.request.ip || '';
  const userAgent = ctx.headers['user-agent'] || '';

  try {
    // 执行后续中间件和路由
    await next();

    // 计算响应时长
    const responseTime = Date.now() - start;

    // 获取响应信息
    const responseStatus = ctx.status;
    const responseBody = ctx.body || null;

    // 异步写入日志（不阻塞响应）
    writeApiLog({
      userId,
      userInfo,
      method,
      url,
      queryParams,
      requestBody,
      responseStatus,
      responseBody,
      responseTime,
      ipAddress,
      userAgent,
    }).catch(err => {
      console.error('[API Logger] Failed to write log:', err.message);
    });

  } catch (err) {
    // 即使发生错误也要记录日志
    const responseTime = Date.now() - start;

    writeApiLog({
      userId,
      userInfo,
      method,
      url,
      queryParams,
      requestBody,
      responseStatus: err.status || 500,
      responseBody: {
        code: err.status || 500,
        message: err.message || 'Internal Server Error',
      },
      responseTime,
      ipAddress,
      userAgent,
    }).catch(logErr => {
      console.error('[API Logger] Failed to write error log:', logErr.message);
    });

    // 重新抛出错误
    throw err;
  }
};

/**
 * 写入 API 日志到数据库
 */
async function writeApiLog(logData) {
  const {
    userId,
    userInfo,
    method,
    url,
    queryParams,
    requestBody,
    responseStatus,
    responseBody,
    responseTime,
    ipAddress,
    userAgent,
  } = logData;

  // 限制响应体大小，避免日志过大
  let safeResponseBody = responseBody;
  if (responseBody) {
    const bodyStr = JSON.stringify(responseBody);
    if (bodyStr.length > 10000) {
      // 超过 10KB 截断
      safeResponseBody = {
        ...responseBody,
        _truncated: true,
        _originalSize: bodyStr.length,
        data: bodyStr.substring(0, 8000) + '...(truncated)',
      };
    }
  }

  // 限制请求体大小
  let safeRequestBody = requestBody;
  if (requestBody) {
    const bodyStr = JSON.stringify(requestBody);
    if (bodyStr.length > 5000) {
      safeRequestBody = {
        ...requestBody,
        _truncated: true,
        _originalSize: bodyStr.length,
        _preview: bodyStr.substring(0, 3000) + '...(truncated)',
      };
    }
  }

  const sql = `
    INSERT INTO api_logs 
    (user_id, user_info, method, url, query_params, request_body, response_status, response_body, response_time, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    userId,
    userInfo ? JSON.stringify(userInfo) : null,
    method,
    url,
    queryParams ? JSON.stringify(queryParams) : null,
    safeRequestBody ? JSON.stringify(safeRequestBody) : null,
    responseStatus,
    safeResponseBody ? JSON.stringify(safeResponseBody) : null,
    responseTime,
    ipAddress,
    userAgent.substring(0, 500), // 限制 User-Agent 长度
  ];

  await pool.execute(sql, params);
}

module.exports = apiLogger;

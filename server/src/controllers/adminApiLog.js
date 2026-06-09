const pool = require('../db/mysql');

/**
 * 管理后台 - API 日志管理
 */
const adminApiLogController = {
  /**
   * 获取 API 日志列表
   * GET /api/v1/admin/api-log
   */
  async list(ctx) {
    try {
      const {
        page = 1,
        pageSize = 20,
        userId,
        method,
        url,
        status,
        startTime,
        endTime,
      } = ctx.query;

      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      const limit = parseInt(pageSize);

      // 构建查询条件
      const conditions = [];
      const params = [];

      if (userId) {
        conditions.push('user_id = ?');
        params.push(userId);
      }

      if (method) {
        conditions.push('method = ?');
        params.push(method);
      }

      if (url) {
        conditions.push('url LIKE ?');
        params.push(`%${url}%`);
      }

      if (status) {
        conditions.push('response_status = ?');
        params.push(status);
      }

      if (startTime) {
        conditions.push('created_at >= ?');
        params.push(startTime);
      }

      if (endTime) {
        conditions.push('created_at <= ?');
        params.push(endTime);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // 查询总数
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM api_logs ${whereClause}`,
        params
      );
      const total = countRows[0].total;

      // 查询数据
      const [rows] = await pool.execute(
        `SELECT 
          id, user_id, user_info, method, url, query_params, 
          request_body, response_status, response_body, 
          response_time, ip_address, user_agent, created_at
        FROM api_logs 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // 解析 JSON 字段
      const logs = rows.map(row => ({
        ...row,
        user_info: row.user_info ? JSON.parse(row.user_info) : null,
        query_params: row.query_params ? JSON.parse(row.query_params) : null,
        request_body: row.request_body ? JSON.parse(row.request_body) : null,
        response_body: row.response_body ? JSON.parse(row.response_body) : null,
      }));

      ctx.body = {
        code: 0,
        message: 'success',
        data: {
          list: logs,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
        },
      };
    } catch (err) {
      console.error('[AdminApiLog] List error:', err);
      ctx.status = 500;
      ctx.body = { code: -1, message: '查询失败', data: null };
    }
  },

  /**
   * 获取单条 API 日志详情
   * GET /api/v1/admin/api-log/:id
   */
  async getById(ctx) {
    try {
      const { id } = ctx.params;

      const [rows] = await pool.execute(
        'SELECT * FROM api_logs WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        ctx.status = 404;
        ctx.body = { code: -1, message: '日志不存在', data: null };
        return;
      }

      const log = rows[0];
      log.user_info = log.user_info ? JSON.parse(log.user_info) : null;
      log.query_params = log.query_params ? JSON.parse(log.query_params) : null;
      log.request_body = log.request_body ? JSON.parse(log.request_body) : null;
      log.response_body = log.response_body ? JSON.parse(log.response_body) : null;

      ctx.body = {
        code: 0,
        message: 'success',
        data: log,
      };
    } catch (err) {
      console.error('[AdminApiLog] GetById error:', err);
      ctx.status = 500;
      ctx.body = { code: -1, message: '查询失败', data: null };
    }
  },

  /**
   * 清理旧日志（保留最近N天）
   * DELETE /api/v1/admin/api-log/cleanup?days=30
   */
  async cleanup(ctx) {
    try {
      const { days = 30 } = ctx.query;
      const daysNum = parseInt(days);

      if (daysNum < 1 || daysNum > 365) {
        ctx.status = 400;
        ctx.body = { code: -1, message: '天数必须在1-365之间', data: null };
        return;
      }

      const [result] = await pool.execute(
        'DELETE FROM api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysNum]
      );

      ctx.body = {
        code: 0,
        message: `成功清理 ${result.affectedRows} 条日志`,
        data: {
          deletedCount: result.affectedRows,
          retainDays: daysNum,
        },
      };
    } catch (err) {
      console.error('[AdminApiLog] Cleanup error:', err);
      ctx.status = 500;
      ctx.body = { code: -1, message: '清理失败', data: null };
    }
  },

  /**
   * 获取 API 调用统计
   * GET /api/v1/admin/api-log/stats
   */
  async stats(ctx) {
    try {
      const { days = 7 } = ctx.query;
      const daysNum = parseInt(days);

      // 总调用次数
      const [totalRows] = await pool.execute(
        'SELECT COUNT(*) as total FROM api_logs'
      );

      // 平均响应时间
      const [avgRows] = await pool.execute(
        'SELECT AVG(response_time) as avg_time FROM api_logs'
      );

      // 最近N天的调用趋势
      const [trendRows] = await pool.execute(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          AVG(response_time) as avg_time,
          SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as error_count
        FROM api_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC`,
        [daysNum]
      );

      // 接口调用排行
      const [topRows] = await pool.execute(
        `SELECT 
          url,
          method,
          COUNT(*) as count,
          AVG(response_time) as avg_time
        FROM api_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY url, method
        ORDER BY count DESC
        LIMIT 20`,
        [daysNum]
      );

      // 用户调用排行
      const [userRows] = await pool.execute(
        `SELECT 
          user_id,
          user_info,
          COUNT(*) as count
        FROM api_logs
        WHERE user_id IS NOT NULL
          AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY user_id, user_info
        ORDER BY count DESC
        LIMIT 20`,
        [daysNum]
      );

      ctx.body = {
        code: 0,
        message: 'success',
        data: {
          totalCalls: totalRows[0].total,
          avgResponseTime: Math.round(avgRows[0].avg_time || 0),
          trend: trendRows,
          topApis: topRows,
          topUsers: userRows.map(row => ({
            ...row,
            user_info: row.user_info ? JSON.parse(row.user_info) : null,
          })),
        },
      };
    } catch (err) {
      console.error('[AdminApiLog] Stats error:', err);
      ctx.status = 500;
      ctx.body = { code: -1, message: '统计失败', data: null };
    }
  },
};

module.exports = adminApiLogController;

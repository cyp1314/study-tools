# API 调用日志功能说明

## ✅ 功能概述

已成功实现 API 调用日志功能，自动记录每个接口的详细信息到数据库。

## 📊 记录内容

每个 API 调用都会记录以下信息：

| 字段 | 类型 | 说明 |
|------|------|------|
| `user_id` | BIGINT | 用户ID（未登录为NULL） |
| `user_info` | JSON | 用户信息（昵称、头像、角色等） |
| `method` | VARCHAR | HTTP方法（GET/POST/PUT/DELETE等） |
| `url` | VARCHAR | 请求URL |
| `query_params` | JSON | 查询参数 |
| `request_body` | JSON | 请求体（POST/PUT/PATCH） |
| `response_status` | INT | 响应状态码 |
| `response_body` | JSON | 响应体 |
| `response_time` | INT | 响应时长（毫秒） |
| `ip_address` | VARCHAR | 客户端IP地址 |
| `user_agent` | VARCHAR | 浏览器/客户端标识 |
| `created_at` | DATETIME | 创建时间 |

## 🗄️ 数据库表

表名：`api_logs`

### 索引设计
- `idx_user`: 按用户ID查询
- `idx_method`: 按HTTP方法查询
- `idx_url`: 按URL查询
- `idx_status`: 按响应状态查询
- `idx_created`: 按时间查询

## 🔧 中间件实现

文件：`src/middleware/apiLogger.js`

### 特性
1. **自动记录**：无需手动调用，所有请求自动记录
2. **异步写入**：不阻塞响应，性能影响极小
3. **错误捕获**：即使接口报错也会记录日志
4. **大小限制**：
   - 请求体最大 5KB（超过截断）
   - 响应体最大 10KB（超过截断）
5. **用户信息**：自动提取登录用户信息

## 📝 管理后台接口

### 1. 查询日志列表
```
GET /api/v1/admin/api-log
```

**查询参数**：
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `userId`: 筛选用户ID
- `method`: 筛选HTTP方法
- `url`: 筛选URL（模糊匹配）
- `status`: 筛选响应状态码
- `startTime`: 开始时间
- `endTime`: 结束时间

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 123,
        "user_info": {
          "id": 123,
          "nickname": "张三",
          "avatarUrl": "https://...",
          "role": "user"
        },
        "method": "POST",
        "url": "/api/v1/image/generate",
        "query_params": null,
        "request_body": {
          "type": "coloringBook",
          "prompt": "可爱的小兔子"
        },
        "response_status": 200,
        "response_body": {
          "code": 0,
          "message": "图片生成成功",
          "data": {...}
        },
        "response_time": 3500,
        "ip_address": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 2. 查询日志详情
```
GET /api/v1/admin/api-log/:id
```

### 3. 获取统计信息
```
GET /api/v1/admin/api-log/stats?days=7
```

**响应包含**：
- 总调用次数
- 平均响应时间
- 最近N天调用趋势
- 接口调用排行榜
- 用户调用排行榜

### 4. 清理旧日志
```
DELETE /api/v1/admin/api-log/cleanup?days=30
```

保留最近30天的日志，删除更早的日志。

## 🚀 使用示例

### 1. 查看最近的错误请求
```
GET /api/v1/admin/api-log?status=500&page=1&pageSize=10
```

### 2. 查看某个用户的操作记录
```
GET /api/v1/admin/api-log?userId=123&page=1&pageSize=50
```

### 3. 查看图片生成接口的调用情况
```
GET /api/v1/admin/api-log?url=/image/generate&days=7
```

### 4. 查看慢接口（响应时间>5秒）
需要自定义查询：
```sql
SELECT * FROM api_logs 
WHERE response_time > 5000 
ORDER BY response_time DESC 
LIMIT 100;
```

## 📈 性能优化建议

### 1. 定期清理日志
建议保留 30-90 天的日志：
```bash
# 清理30天前的日志
DELETE /api/v1/admin/api-log/cleanup?days=30
```

### 2. 数据库优化
- 已添加合适的索引
- 建议定期执行 `OPTIMIZE TABLE api_logs`
- 如果数据量大，可以按月分表

### 3. 监控告警
可以基于日志实现：
- 错误率监控（status >= 400）
- 慢接口监控（response_time > 阈值）
- 异常用户行为监控

## 🔍 日志分析示例SQL

### 1. 错误率统计
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as errors,
  ROUND(SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate
FROM api_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 2. 慢接口排行
```sql
SELECT 
  url,
  method,
  COUNT(*) as calls,
  AVG(response_time) as avg_time,
  MAX(response_time) as max_time,
  MIN(response_time) as min_time
FROM api_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY url, method
ORDER BY avg_time DESC
LIMIT 20;
```

### 3. 活跃用户排行
```sql
SELECT 
  user_id,
  JSON_EXTRACT(user_info, '$.nickname') as nickname,
  COUNT(*) as api_calls,
  COUNT(DISTINCT DATE(created_at)) as active_days
FROM api_logs
WHERE user_id IS NOT NULL
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY user_id, nickname
ORDER BY api_calls DESC
LIMIT 50;
```

### 4. 接口调用趋势
```sql
SELECT 
  HOUR(created_at) as hour,
  COUNT(*) as calls,
  AVG(response_time) as avg_time
FROM api_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY HOUR(created_at)
ORDER BY hour;
```

## ⚙️ 配置选项

### 1. 启用/禁用日志
在 `app.js` 中注释掉中间件即可：
```javascript
// app.use(apiLoggerMiddleware); // 禁用日志
```

### 2. 调整大小限制
编辑 `src/middleware/apiLogger.js`：
```javascript
// 修改请求体限制（当前5KB）
if (bodyStr.length > 5000) { ... }

// 修改响应体限制（当前10KB）
if (bodyStr.length > 10000) { ... }
```

### 3. 过滤特定接口
可以添加黑名单，不记录某些接口：
```javascript
const IGNORE_PATHS = ['/health', '/api-docs', '/favicon.ico'];

if (IGNORE_PATHS.some(path => url.startsWith(path))) {
  return await next();
}
```

## 🎯 最佳实践

1. **定期清理**：设置定时任务清理旧日志
2. **监控告警**：基于日志实现异常告警
3. **性能分析**：定期分析慢接口并优化
4. **安全审计**：通过日志追踪异常访问
5. **用户行为**：分析用户使用习惯

## 📊 数据量预估

假设日均调用 10,000 次：
- 每天约 50-100MB 数据
- 30天约 1.5-3GB
- 建议保留 30-90 天
- 定期清理可控制数据量

## 🔐 安全说明

- ✅ 日志仅管理后台可访问
- ✅ 需要管理员认证
- ✅ 密码等敏感字段已脱敏
- ✅ 支持按用户审计

## 🐛 故障排查

### 日志未写入
1. 检查数据库连接
2. 查看控制台错误日志：`[API Logger] Failed to write log`
3. 检查表是否存在：`SHOW TABLES LIKE 'api_logs'`

### 性能问题
1. 检查索引是否正常：`SHOW INDEX FROM api_logs`
2. 查看表大小：`SHOW TABLE STATUS LIKE 'api_logs'`
3. 考虑清理旧日志或分表

## 📚 相关文件

- 中间件：`src/middleware/apiLogger.js`
- 控制器：`src/controllers/adminApiLog.js`
- 路由：`src/routes/admin.js`
- 数据库初始化：`src/db/init.js`

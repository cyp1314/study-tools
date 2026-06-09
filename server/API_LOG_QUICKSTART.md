# API 日志功能 - 快速入门

## 🚀 5分钟快速上手

### 1️⃣ 初始化数据库
```bash
cd server
pnpm run init-db
```

这会自动创建 `api_logs` 表。

### 2️⃣ 启动服务
```bash
pnpm run dev
```

服务启动后，所有 API 调用都会自动记录日志。

### 3️⃣ 发起几个请求
随便访问几个接口，例如：
```bash
# 健康检查
curl http://localhost:3000/api/v1/health

# 获取图片类型
curl http://localhost:3000/api/v1/image/types
```

### 4️⃣ 查看日志记录

#### 方法一：直接查询数据库
```sql
-- 查看最新10条日志
SELECT 
  id, user_id, method, url, response_status, response_time, created_at
FROM api_logs 
ORDER BY id DESC 
LIMIT 10;

-- 查看完整信息
SELECT * FROM api_logs ORDER BY id DESC LIMIT 1\G
```

#### 方法二：使用管理接口
```bash
# 需要先登录管理后台获取 token
curl http://localhost:3000/api/v1/admin/api-log?page=1&pageSize=10
```

#### 方法三：查看统计信息
```bash
curl http://localhost:3000/api/v1/admin/api-log/stats?days=7
```

## 📊 日志内容说明

每条日志记录包含：

```json
{
  "id": 1,
  "user_id": 123,                    // 用户ID（未登录为NULL）
  "user_info": {                     // 用户详细信息
    "id": 123,
    "nickname": "张三",
    "avatarUrl": "https://...",
    "role": "user"
  },
  "method": "POST",                  // HTTP方法
  "url": "/api/v1/image/generate",  // 请求URL
  "query_params": null,              // 查询参数
  "request_body": {                  // 请求体
    "type": "coloringBook",
    "prompt": "可爱的小兔子"
  },
  "response_status": 200,            // 响应状态码
  "response_body": {                 // 响应体
    "code": 0,
    "message": "图片生成成功",
    "data": {...}
  },
  "response_time": 3500,             // 响应时长（毫秒）
  "ip_address": "127.0.0.1",        // 客户端IP
  "user_agent": "Mozilla/5.0...",   // 浏览器标识
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 常用查询示例

### 查看错误请求
```sql
SELECT * FROM api_logs 
WHERE response_status >= 400 
ORDER BY created_at DESC 
LIMIT 20;
```

### 查看慢接口（>5秒）
```sql
SELECT * FROM api_logs 
WHERE response_time > 5000 
ORDER BY response_time DESC 
LIMIT 20;
```

### 查看某用户的操作
```sql
SELECT * FROM api_logs 
WHERE user_id = 123 
ORDER BY created_at DESC 
LIMIT 50;
```

### 查看今天的调用量
```sql
SELECT 
  COUNT(*) as total,
  AVG(response_time) as avg_time,
  SUM(CASE WHEN response_status >= 400 THEN 1 ELSE 0 END) as errors
FROM api_logs 
WHERE created_at >= CURDATE();
```

## 🧪 测试功能

运行测试脚本：
```bash
node test-api-log.js
```

这会自动发起几个请求，然后你可以查看日志记录。

## 🗑️ 清理日志

### 保留30天
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/api-log/cleanup?days=30"
```

### 手动清理
```sql
-- 删除30天前的日志
DELETE FROM api_logs 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 📈 查看统计

```bash
# 最近7天统计
curl "http://localhost:3000/api/v1/admin/api-log/stats?days=7"

# 最近30天统计
curl "http://localhost:3000/api/v1/admin/api-log/stats?days=30"
```

统计信息包括：
- 总调用次数
- 平均响应时间
- 每天调用趋势
- 接口调用排行
- 用户调用排行

## 💡 使用建议

1. **定期清理**：建议每周清理一次，保留30-90天
2. **监控错误**：定期检查 status >= 400 的请求
3. **性能优化**：关注 response_time 过大的接口
4. **用户分析**：通过 user_id 分析用户行为

## ❓ 常见问题

### Q: 日志会影响性能吗？
A: 几乎不会。日志采用异步写入，不阻塞响应，影响 < 1ms。

### Q: 日志会占用很多空间吗？
A: 日均1万次调用约50MB，建议保留30-90天。

### Q: 可以不记录某些接口吗？
A: 可以，在 `apiLogger.js` 中添加黑名单即可。

### Q: 可以关闭日志功能吗？
A: 可以，在 `app.js` 中注释掉 `app.use(apiLoggerMiddleware)` 即可。

## 📚 更多文档

- [API_LOG_GUIDE.md](./API_LOG_GUIDE.md) - 完整使用指南
- [API_LOG_SUMMARY.md](./API_LOG_SUMMARY.md) - 功能总结

## 🎉 开始使用

就这么简单！服务启动后，所有 API 调用都会自动记录，无需任何额外操作。

立即查看你的第一条日志：
```sql
SELECT * FROM api_logs ORDER BY id DESC LIMIT 1\G
```

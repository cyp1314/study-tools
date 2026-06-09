# Swagger API 文档快速使用指南

## 🚀 快速开始

### 1. 访问 Swagger UI
服务器已启动，请在浏览器中访问：
```
http://localhost:3000/api-docs
```

### 2. 查看接口文档
打开后你会看到所有 64 个 API 接口的完整文档，按功能模块分类显示。

## 📋 文档分类

### C 端接口（客户端使用）
- 🔐 **认证** - 登录接口
- 👤 **用户** - 用户信息管理
- 🖼️ **图片生成** - AI 图片生成相关
- 💰 **积分** - 积分查询和变动
- 📅 **签到** - 签到功能
- 💳 **充值** - 充值套餐和订单
- 📤 **公共** - 图片上传等公共接口
- 🌐 **业务公开** - 轮播图、分类、产品等公开数据

### 管理后台接口（后台管理系统使用）
需要管理员权限，所有接口都需要认证：
- 🎁 **管理后台-充值套餐** - 充值套餐 CRUD
- 👥 **管理后台-用户** - 用户管理和积分调整
- 🖼️ **管理后台-图片记录** - 图片生成记录管理
- 📊 **管理后台-积分记录** - 积分变动记录查询
- ⚙️ **管理后台-签到配置** - 签到奖励配置
- 📝 **管理后台-签到记录** - 签到记录管理
- 💵 **管理后台-充值订单** - 充值订单管理和退款
- 🎨 **管理后台-轮播图** - 轮播图管理
- 📂 **管理后台-分类** - 分类管理
- 📦 **管理后台-产品** - 产品管理
- 📋 **管理后台-API日志** - API 调用日志查询和统计

## 🔑 如何测试需要认证的接口

### 第一步：获取 Token
1. 在 Swagger UI 中找到 **认证** 分组
2. 展开 `POST /auth/login` 接口
3. 点击 **Try it out**
4. 在请求体中输入微信小程序的 code：
```json
{
  "code": "你的微信小程序code"
}
```
5. 点击 **Execute**
6. 在响应中找到 token：
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### 第二步：设置认证
1. 点击 Swagger UI 右上角的 **Authorize** 🔓 按钮
2. 在弹出框中输入：`Bearer eyJhbGciOiJIUzI1NiIs...`
   - 格式：`Bearer ` + 你的token
   - 注意 Bearer 后面有一个空格
3. 点击 **Authorize**
4. 点击 **Close**

### 第三步：测试接口
现在所有需要认证的接口都会自动携带 token，可以直接测试！

## 📖 接口文档示例

### 示例 1：获取用户信息
1. 展开 **用户** 分组
2. 展开 `GET /user/profile`
3. 点击 **Try it out**
4. 点击 **Execute**（需要先认证）
5. 查看响应结果

### 示例 2：上传图片
1. 展开 **公共** 分组
2. 展开 `POST /common/upload`
3. 点击 **Try it out**
4. 在请求体中输入 base64 图片数据：
```json
{
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```
5. 点击 **Execute**
6. 响应中会返回 key 和 url：
```json
{
  "code": 0,
  "data": {
    "key": "uploads/2024/01/xxx.png",
    "url": "https://xxx.qiniucdn.com/uploads/2024/01/xxx.png"
  }
}
```

### 示例 3：创建产品（管理后台）
1. 展开 **管理后台-产品** 分组
2. 展开 `POST /admin/product`
3. 点击 **Try it out**
4. 在请求体中输入：
```json
{
  "name": "涂色本",
  "type": "coloringBook",
  "prefix": "请帮我生成一个涂色图：",
  "suffix": "，要求是黑白线稿，适合儿童涂色",
  "defaultPrompt": "可爱的小动物",
  "description": "AI 涂色本",
  "coverImage": "https://xxx.png",
  "sortOrder": 1,
  "categoryIds": [1, 2]
}
```
5. 点击 **Execute**

## 🎯 常用操作

### 查看请求详情
- 点击 **Try it out** 后可见完整的 curl 命令
- 可以复制到终端直接测试

### 查看响应示例
- 执行后在 **Responses** 区域查看
- 包含响应头和响应体

### 下载接口定义
- 点击页面顶部的 **swagger.json** 或 **swagger.yaml**
- 可以下载完整的 OpenAPI 规范文件

### 筛选接口
- 使用顶部的搜索框搜索接口名称
- 点击标签名称筛选该标签下的所有接口

## 📊 接口统计

| 分类 | 接口数量 | 需要认证 |
|------|---------|---------|
| 认证 | 1 | ❌ |
| 用户 | 3 | ✅ |
| 图片生成 | 7 | 部分 |
| 积分 | 2 | ✅ |
| 签到 | 3 | ✅ |
| 充值 | 4 | 部分 |
| 公共 | 1 | ❌ |
| 业务公开 | 4 | ❌ |
| 管理后台 | 39 | ✅ |
| **总计** | **64** | - |

## 🔍 搜索技巧

### 按功能搜索
- 搜索 "登录" - 找到登录接口
- 搜索 "上传" - 找到上传接口
- 搜索 "签到" - 找到签到相关接口
- 搜索 "产品" - 找到产品管理接口

### 按路径搜索
- 搜索 "/auth" - 找到认证接口
- 搜索 "/admin" - 找到管理后台接口
- 搜索 "/image" - 找到图片相关接口

## ⚠️ 注意事项

1. **环境差异**
   - Swagger UI 中的服务器地址是 `http://localhost:3000/api/v1`
   - 如果是其他环境，需要修改 `src/config/swagger.js` 中的 servers 配置

2. **数据类型**
   - 文档中标注的类型是严格要求的
   - integer 表示整数，number 表示浮点数
   - 不要把字符串传给 integer 类型

3. **必填字段**
   - 标注 required 的字段必须提供
   - 可选字段可以不传或使用默认值

4. **分页参数**
   - 大多数列表接口支持分页
   - page: 页码（从 1 开始）
   - pageSize: 每页数量（默认 20）

5. **错误处理**
   - 400: 请求参数错误
   - 401: 未授权（token 无效或过期）
   - 404: 资源不存在
   - 500: 服务器内部错误

## 🛠️ 维护文档

### 新增接口时
在路由文件中添加 Swagger 注释：
```javascript
/**
 * @swagger
 * /path/to/endpoint:
 *   post:
 *     summary: 接口说明
 *     tags: [标签名]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "示例值"
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/endpoint', controller.handler);
```

### 修改接口时
同步更新对应的 Swagger 注释，保持文档与代码一致。

## 📞 获取帮助

- 查看完整文档：`server/SWAGGER_DOCS.md`
- 查看配置说明：`server/README.md`
- 查看代码实现：`server/src/routes/` 下的路由文件

## 🎉 开始使用

现在你可以：
1. 访问 http://localhost:3000/api-docs
2. 浏览所有接口文档
3. 在线测试接口
4. 查看请求和响应示例

祝你使用愉快！🚀

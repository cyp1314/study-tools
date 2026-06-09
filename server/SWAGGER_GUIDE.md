# Swagger API 文档接入说明

## ✅ 已完成的工作

### 1. 安装依赖
已安装以下依赖包:
- `koa2-swagger-ui`: Swagger UI 中间件
- `swagger-jsdoc`: JSDoc 风格的 Swagger 文档生成器

### 2. 配置文件
创建了 `src/config/swagger.js`,包含:
- OpenAPI 3.0 规范定义
- JWT 认证配置
- 17个API模块标签分类
- 服务器配置(开发环境)

### 3. 中间件集成
在 `src/app.js` 中集成:
- Swagger UI 路由(`/api-docs`)
- 仅开发环境启用(生产环境自动禁用)
- 启动时自动输出 API 文档地址

### 4. 路由注释示例
已在以下文件中添加 Swagger 注释示例:
- `src/routes/index.js` - 健康检查接口
- `src/routes/auth.js` - 微信登录接口
- `src/routes/admin.js` - 管理后台标签定义

### 5. README.md 更新
已更新 `README.md`,添加:
- Swagger 文档访问地址
- 快速启动指南
- Swagger 使用说明
- 功能特性介绍

## 📖 如何使用

### 启动服务
```bash
cd server
pnpm install
pnpm run dev
```

### 访问 Swagger 文档
启动成功后,浏览器访问:
```
http://localhost:3000/api-docs
```

### 在线测试 API

#### 1. 查看接口
- 按模块分类展示所有接口
- 点击接口展开详细信息
- 查看请求参数、响应格式

#### 2. 测试接口
1. 点击接口展开详情
2. 点击 "Try it out" 按钮
3. 填写所需参数
4. 点击 "Execute" 执行请求
5. 查看响应结果

#### 3. 认证测试(需要登录的接口)
1. 先通过 `/auth/login` 接口获取 token
2. 点击右上角 "Authorize" 按钮
3. 输入: `Bearer your-token-here`
4. 点击 "Authorize"
5. 之后所有接口自动携带认证信息

## 📝 如何添加更多 API 文档

### 方法一: 在路由文件中添加注释(推荐)

在路由定义上方添加 JSDoc 注释:

```javascript
/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 获取用户信息
 *     tags: [用户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/profile', userController.getProfile);
```

### 方法二: 更新 swagger.js 配置

在 `src/config/swagger.js` 的 `swaggerDefinition` 中添加:
- schemas: 数据模型定义
- tags: 模块标签
- servers: 服务器配置

### 注释格式说明

#### 基本结构
```javascript
/**
 * @swagger
 * /path:
 *   method:
 *     summary: 接口简介
 *     tags: [模块名]
 *     description: 详细描述
 *     security:
 *       - bearerAuth: []  # 需要认证
 *     parameters:         # 参数
 *     requestBody:        # 请求体
 *     responses:          # 响应
 */
```

#### 路径参数
```yaml
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: integer
```

#### 查询参数
```yaml
parameters:
  - name: page
    in: query
    schema:
      type: integer
      default: 1
```

#### 请求体
```yaml
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [fieldName]
        properties:
          fieldName:
            type: string
            description: 字段说明
```

#### 响应
```yaml
responses:
  200:
    description: 成功
    content:
      application/json:
        schema:
          type: object
          properties:
            code:
              type: integer
              example: 0
            message:
              type: string
            data:
              type: object
```

## 🎯 当前状态

### ✅ 已完成
- Swagger UI 集成成功
- 基础配置完成
- README 文档更新
- 示例注释添加
- 开发环境自动启用

### 📋 待完善
如需完整的 API 文档,可以:
1. 为所有路由添加 Swagger 注释
2. 或创建完整的 OpenAPI JSON/YAML 文件
3. 或使用 Swagger Editor 可视化编辑后导入

## 🔒 安全说明

- ✅ 生产环境(`NODE_ENV=production`)自动禁用 Swagger 文档
- ✅ 开发环境可通过 `/api-docs` 访问
- ✅ 支持 JWT 认证测试
- ✅ 不会暴露敏感信息

## 📚 参考资源

- [Swagger 官方文档](https://swagger.io/docs/)
- [OpenAPI 3.0 规范](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [koa2-swagger-ui](https://www.npmjs.com/package/koa2-swagger-ui)

## 🚀 下一步建议

1. **逐步完善文档**: 为常用接口优先添加注释
2. **团队规范**: 制定 Swagger 注释规范,保持代码同步
3. **CI/CD集成**: 在部署流程中验证文档完整性
4. **Mock数据**: 结合示例数据,提升文档可用性

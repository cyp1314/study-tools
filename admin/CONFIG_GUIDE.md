# 配置文件使用说明

## 📁 文件位置

```
admin/public/config.js
```

## 🎯 用途

该配置文件用于存放可以在部署时修改的配置项，无需重新编译代码。

## 📝 配置项说明

### 当前配置

```javascript
window.APP_CONFIG = {
  // 服务器 API 地址（必填）
  API_BASE_URL: 'http://localhost:3000',
  
  // 应用名称
  APP_NAME: '学习工具管理后台',
}
```

### 配置项列表

| 配置项 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `API_BASE_URL` | String | ✅ 是 | 后端 API 服务器地址 | `http://localhost:3000` |
| `APP_NAME` | String | ❌ 否 | 应用显示名称 | `学习工具管理后台` |

## 🚀 部署时修改配置

### 开发环境
```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  APP_NAME: '学习工具管理后台',
}
```

### 测试环境
```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'http://test-api.example.com',
  APP_NAME: '学习工具管理后台（测试）',
}
```

### 生产环境
```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'https://api.example.com',
  APP_NAME: '学习工具管理后台',
}
```

## 📋 使用步骤

### 1. 构建项目
```bash
cd admin
pnpm build
```

### 2. 修改配置
构建完成后，在 `dist/config.js` 中修改配置：

```bash
# 编辑配置文件
vi dist/config.js

# 或
notepad dist/config.js
```

### 3. 部署到服务器
将 `dist` 目录部署到 Nginx 或其他 Web 服务器。

### 4. 重启浏览器
修改配置后，需要刷新浏览器才能生效（因为配置文件会被浏览器缓存）。

## 🔧 添加新配置项

### 1. 在 config.js 中添加
```javascript
window.APP_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  APP_NAME: '学习工具管理后台',
  
  // 新增配置项
  TOKEN_KEY: 'admin_token',
  THEME: 'dark',
  PAGE_SIZE: 20,
}
```

### 2. 在代码中使用
```javascript
// 读取配置
const appConfig = window.APP_CONFIG || {}
const tokenKey = appConfig.TOKEN_KEY || 'default_token'
const theme = appConfig.THEME || 'light'
```

## ⚠️ 注意事项

1. **配置文件位置**
   - 开发时：`public/config.js`
   - 构建后：`dist/config.js`
   - 部署时：修改 `dist/config.js`

2. **缓存问题**
   - 浏览器会缓存 config.js
   - 修改配置后需要强制刷新（Ctrl+F5）
   - 或在 Nginx 中配置不缓存：
     ```nginx
     location = /config.js {
       add_header Cache-Control "no-cache, no-store, must-revalidate";
       add_header Pragma "no-cache";
       add_header Expires "0";
     }
     ```

3. **语法要求**
   - 必须是有效的 JavaScript 语法
   - 使用 `window.APP_CONFIG` 全局变量
   - 确保文件以 `.js` 结尾

4. **默认值**
   - 代码中应该提供默认值
   - 防止配置缺失导致错误
   ```javascript
   const API_BASE_URL = appConfig.API_BASE_URL || 'http://localhost:3000'
   ```

## 🎨 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name admin.example.com;
    root /var/www/admin/dist;
    index index.html;

    # 不缓存配置文件
    location = /config.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # 其他静态资源缓存 30 天
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

## 🔍 验证配置是否生效

打开浏览器控制台，执行：
```javascript
console.log(window.APP_CONFIG)
```

应该看到：
```javascript
{
  API_BASE_URL: "http://localhost:3000",
  APP_NAME: "学习工具管理后台"
}
```

## 📦 完整示例

### config.js
```javascript
window.APP_CONFIG = {
  // 服务器 API 地址
  API_BASE_URL: 'https://api.example.com',
  
  // 应用名称
  APP_NAME: '学习工具管理后台',
  
  // Token 存储键名
  TOKEN_KEY: 'admin_token',
  
  // 主题
  THEME: 'light',
  
  // 默认分页大小
  PAGE_SIZE: 20,
  
  // 是否显示调试信息
  DEBUG: false,
}
```

### 在代码中使用
```javascript
// http/index.js
const appConfig = window.APP_CONFIG || {}
const API_BASE_URL = appConfig.API_BASE_URL || 'http://localhost:3000'

// store/auth.js
const TOKEN_KEY = appConfig.TOKEN_KEY || 'admin_token'

// config/index.js
const THEME = appConfig.THEME || 'light'
```

## 🎉 优势

1. **无需重新编译**：修改配置后直接刷新即可
2. **环境隔离**：不同环境使用不同配置
3. **易于维护**：配置集中管理
4. **灵活扩展**：可随时添加新配置项
5. **部署友好**：运维人员可以直接修改配置

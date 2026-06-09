# 图片存储方案说明

## 📋 方案概述

采用**双存储方案**，同时满足管理端和客户端的不同需求：

| 字段 | 存储内容 | 用途 | 访问方式 |
|------|---------|------|---------|
| `images` | 本地文件路径 | 管理后台显示 | 本地服务器静态文件 |
| `image_keys` | 七牛云 key | 客户端显示 | 七牛云 CDN |

## 🗂️ 存储结构

### 本地文件存储
```
server/
└── uploads/
    └── images/
        └── jimeng/
            ├── coloringBook/
            │   ├── 1719234567890_abc123.png
            │   └── 1719234568901_def456.png
            ├── sketchColoring/
            │   └── 1719234569012_ghi789.png
            └── ...
```

### 数据库记录示例
```json
{
  "id": 1,
  "user_input": "一只可爱的猫",
  "type": "coloringBook",
  "status": "success",
  "images": "[\"uploads/images/jimeng/coloringBook/1719234567890_abc123.png\"]",
  "image_keys": "[\"jimeng/coloringBook/1719234567890_abc123.png\"]",
  "created_at": "2024-01-01 12:00:00"
}
```

## 🔧 技术实现

### 1. 本地存储工具
**文件**: `server/src/utils/localImageStorage.js`

**核心功能**:
- ✅ 将 base64 图片保存到本地文件系统
- ✅ 自动生成唯一文件名（时间戳 + 随机字符串）
- ✅ 智能识别图片类型（png/jpg/webp）
- ✅ 支持子目录分类存储
- ✅ 提供文件访问 URL 生成
- ✅ 支持批量保存和删除

**主要方法**:
```javascript
// 保存单个 base64 图片
const path = await localImageStorage.saveBase64Image(base64Data, 'jimeng/coloringBook');

// 批量保存 base64 图片列表
const paths = await localImageStorage.saveBase64List(base64List, 'jimeng/coloringBook');

// 生成访问 URL
const url = localImageStorage.getPublicUrl('uploads/images/jimeng/coloringBook/xxx.png');
// 返回: http://localhost:3000/uploads/images/jimeng/coloringBook/xxx.png

// 批量生成 URL
const urls = localImageStorage.getPublicUrls(paths);
```

### 2. 图片生成流程
**文件**: `server/src/controllers/image.js`

```javascript
// 1. 调用即梦 AI 生成图片
const result = await jimengService.textToImage(fullPrompt, options);

// 2. 上传到七牛云（客户端使用）
const imageKeys = await qiniuUploader.uploadBase64List(result.images, 'jimeng/coloringBook');

// 3. 保存到本地（管理端使用）
const imagePaths = await localImageStorage.saveBase64List(result.images, 'jimeng/coloringBook');

// 4. 更新数据库
await imageRecordService.markSuccess(recordId, {
  images: imagePaths,    // 本地路径
  imageKeys: imageKeys,  // 七牛云 key
  taskId: result.taskId,
});
```

### 3. 静态文件服务
**文件**: `server/src/app.js`

```javascript
const serve = require('koa-static');
const path = require('path');

// 提供 /uploads 目录的静态文件访问
app.use(serve(path.join(__dirname, '../uploads'), { 
  maxage: 30 * 24 * 60 * 60 * 1000  // 缓存 30 天
}));
```

### 4. 管理端显示逻辑
**文件**: `admin/src/views/image-record/components/ImageDetailDialog.vue`

```javascript
// 从数据库获取本地路径
const imagePaths = res.data.data.images || [];

// 构建完整的访问 URL
imageUrls.value = imagePaths.map(path => {
  if (!path) return '';
  return `${window.location.origin}/${path.replace(/\\/g, '/')}`;
}).filter(Boolean);
```

## 📊 数据流向

```
即梦 AI 生成
    ↓
base64 图片数组
    ↓
    ├─→ 上传七牛云 → image_keys 字段 → 客户端访问（CDN 加速）
    │
    └─→ 保存本地文件 → images 字段 → 管理端访问（本地服务器）
```

## 🎯 使用场景

### 管理后台
- **用途**: 查看用户生成的图片记录
- **数据源**: `images` 字段（本地路径）
- **访问方式**: `http://localhost:3000/uploads/images/jimeng/coloringBook/xxx.png`
- **优势**: 
  - 快速加载（本地网络）
  - 不消耗七牛云流量
  - 便于管理和审计

### 客户端（小程序/App）
- **用途**: 用户查看自己生成的图片
- **数据源**: `image_keys` 字段（七牛云 key）
- **访问方式**: 七牛云 CDN URL
- **优势**:
  - CDN 加速，全国快速访问
  - 支持 HTTPS
  - 减轻服务器带宽压力

## 🔒 安全性

### 1. 文件命名
- 使用 `时间戳_随机字符串.扩展名` 格式
- 避免文件名冲突
- 防止路径遍历攻击

### 2. 目录权限
- `uploads/` 目录已在 `.gitignore` 中排除
- 不会提交到 Git 仓库
- 生产环境需配置正确的目录权限

### 3. 文件类型
- 自动识别图片 MIME 类型
- 只允许图片格式（png/jpg/webp）
- 防止恶意文件上传

## 📝 维护说明

### 1. 清理旧图片
可以定期清理 30 天前的图片文件：
```javascript
// 示例：清理脚本
const localImageStorage = require('./utils/localImageStorage');

// 遍历数据库中的记录
const oldRecords = await db.query(
  'SELECT images FROM image_records WHERE created_at < ?',
  [thirtyDaysAgo]
);

// 删除文件
for (const record of oldRecords) {
  const paths = JSON.parse(record.images);
  for (const path of paths) {
    await localImageStorage.deleteImage(path);
  }
}
```

### 2. 备份策略
- 定期备份 `uploads/` 目录
- 可以使用 rsync、云存储同步等工具
- 建议与数据库备份同步进行

### 3. 磁盘空间监控
```bash
# 查看 uploads 目录大小
du -sh server/uploads/

# 查看图片数量
find server/uploads/ -type f | wc -l
```

## 🚀 部署注意事项

### 1. 生产环境
- 确保 `uploads/` 目录有足够的磁盘空间
- 配置 Nginx 静态文件服务（替代 koa-static）
- 设置合适的缓存策略

### 2. Nginx 配置示例
```nginx
location /uploads/ {
    alias /path/to/server/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 容器化部署
- 将 `uploads/` 目录挂载到持久化存储
- Docker volume 示例：
```yaml
volumes:
  - ./uploads:/app/uploads
```

## 📦 依赖包

已安装的依赖：
- `koa-static@5.0.0` - Koa 静态文件中间件

## ✅ 完成的工作

1. ✅ 创建本地图片存储工具 `localImageStorage.js`
2. ✅ 修改图片生成控制器，同时保存到本地和七牛云
3. ✅ 修改管理端显示逻辑，使用本地路径
4. ✅ 添加静态文件服务中间件
5. ✅ 安装 `koa-static` 依赖
6. ✅ 更新 `.gitignore` 排除上传文件

## 🎉 总结

通过双存储方案，我们实现了：
- **管理端**: 使用本地文件，快速访问，不消耗 CDN 流量
- **客户端**: 使用七牛云 CDN，全国加速，体验优秀
- **数据分离**: 两个字段各司其职，互不干扰
- **易于维护**: 清晰的目录结构，方便管理和备份

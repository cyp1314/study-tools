# ImageUpload 公共组件使用说明

## 📦 组件位置
`src/components/Image/ImageUpload.vue`

## ✨ 功能特性

- ✅ 基于 `el-upload` 实现
- ✅ 支持图片预览（点击放大）
- ✅ 支持删除已上传图片
- ✅ 自动文件大小校验
- ✅ 支持自定义尺寸
- ✅ 支持禁用状态
- ✅ 鼠标悬停显示操作按钮
- ✅ 自动调用公共上传接口

## 📖 使用方式

### 基础用法

```vue
<template>
  <el-form-item label="图标">
    <ImageUpload v-model="form.imageUrl" />
  </el-form-item>
</template>

<script setup>
import ImageUpload from '@/components/Image/ImageUpload.vue'

const form = ref({
  imageUrl: ''
})
</script>
```

### 完整示例

```vue
<template>
  <el-form-item label="产品图标">
    <ImageUpload 
      v-model="form.coverImage" 
      :width="'80px'" 
      :height="'80px'"
      placeholder="点击上传图标"
      :show-text="true"
      :max-size="5"
      @change="handleImageChange"
      @success="handleSuccess"
      @error="handleError"
    />
  </el-form-item>
</template>

<script setup>
import ImageUpload from '@/components/Image/ImageUpload.vue'

const form = ref({
  coverImage: '',  // 用于显示的 URL
  coverKey: ''     // 存储到数据库的 key
})

// 监听图片变化
const handleImageChange = ({ key, url }) => {
  form.value.coverKey = key
  form.value.coverImage = url
}

// 上传成功
const handleSuccess = ({ key, url }) => {
  console.log('上传成功', key, url)
}

// 上传失败
const handleError = (error) => {
  console.error('上传失败', error)
}
</script>
```

## 🎯 Props 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | String | `''` | 图片URL（用于显示） |
| `disabled` | Boolean | `false` | 是否禁用上传 |
| `width` | String | `'120px'` | 图片显示宽度 |
| `height` | String | `'80px'` | 图片显示高度 |
| `placeholder` | String | `'点击上传'` | 提示文本 |
| `showText` | Boolean | `false` | 是否显示提示文本 |
| `maxSize` | Number | `5` | 文件大小限制（MB） |

## 🔔 Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(value: string)` | 图片URL变化时触发 |
| `change` | `{ key, url }` | 图片变化时触发，返回 key 和 url |
| `success` | `{ key, url }` | 上传成功时触发 |
| `error` | `(error: Error)` | 上传失败时触发 |

## 💡 使用场景

### 1. 分类图标上传

```vue
<ImageUpload 
  v-model="form.imageUrl" 
  :width="'80px'" 
  :height="'80px'"
  @change="({ key, url }) => {
    form.icon = key
    form.imageUrl = url
  }"
/>
```

### 2. 轮播图上传

```vue
<ImageUpload 
  v-model="form.imageUrl" 
  :width="'120px'" 
  :height="'80px'"
  @change="({ key, url }) => {
    form.imageKey = key
    form.imageUrl = url
  }"
/>
```

### 3. 产品封面上传

```vue
<ImageUpload 
  v-model="form.coverImage" 
  :width="'80px'" 
  :height="'80px'"
  @change="({ key, url }) => {
    form.coverImage = url
  }"
/>
```

## 🎨 样式定制

组件支持通过 props 自定义尺寸，其他样式可通过覆盖 CSS 变量或自定义类名实现。

## 📝 注意事项

1. **存储字段**：
   - `modelValue` / `v-model`：绑定的是图片的完整 URL（用于显示）
   - `change` 事件返回的 `key`：是七牛云的文件 key（用于存储到数据库）

2. **数据库存储**：
   ```javascript
   // ❌ 错误：存储 URL
   db.save({ icon: form.imageUrl })
   
   // ✅ 正确：存储 key
   db.save({ icon: form.iconKey })
   ```

3. **回显处理**：
   ```javascript
   // 编辑时，后端返回的 icon 字段应该是完整的 URL
   // 后端需要将 key 转换为 URL
   icon: cat.icon ? qiniuUploader.getPublicUrl(cat.icon) : ''
   ```

## 🔧 技术实现

- 使用 Element Plus 的 `el-upload` 组件
- 调用 `/api/v1/common/upload` 接口
- 支持 base64 格式上传
- 自动处理文件大小校验
- 鼠标悬停显示预览和删除按钮

## 📦 已替换的页面

以下页面已更新为使用公共组件：

- ✅ 分类管理 - `category/components/CategoryFormDialog.vue`
- ✅ 轮播图管理 - `banner/components/BannerFormDialog.vue`
- ✅ 产品管理 - `product/components/ProductFormDialog.vue`

## 🚀 优势

1. **代码复用**：统一的上传逻辑，减少重复代码
2. **易于维护**：修改上传逻辑只需修改一处
3. **功能完整**：预览、删除、校验等功能内置
4. **类型安全**：完整的 TypeScript 支持
5. **用户体验**：友好的交互和提示

<template>
  <div class="image-upload-component">
    <el-upload
      class="image-uploader"
      :action="uploadAction"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :http-request="handleUpload"
      :disabled="disabled"
      accept="image/*"
    >
      <div v-if="imageUrl" class="image-preview">
        <el-image :src="imageUrl" fit="contain" :style="imageStyle" />
        <div class="image-mask">
          <el-icon @click.stop="handlePreview"><ZoomIn /></el-icon>
          <el-icon v-if="!disabled" @click.stop="handleRemove"><Delete /></el-icon>
        </div>
      </div>
      <div v-else class="upload-placeholder" :style="imageStyle">
        <el-icon :size="30"><Plus /></el-icon>
        <div class="upload-text" v-if="showText">{{ placeholder }}</div>
      </div>
    </el-upload>
    
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px" append-to-body>
      <el-image :src="imageUrl" fit="contain" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, ZoomIn, Delete } from '@element-plus/icons-vue'
import { uploadImage } from '@/api/common'
import notice from '@/utils/notice'

const props = defineProps({
  // 图片URL（用于显示）
  modelValue: {
    type: String,
    default: ''
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 图片宽度
  width: {
    type: String,
    default: '120px'
  },
  // 图片高度
  height: {
    type: String,
    default: '80px'
  },
  // 提示文本
  placeholder: {
    type: String,
    default: '点击上传'
  },
  // 是否显示提示文本
  showText: {
    type: Boolean,
    default: false
  },
  // 文件大小限制（MB）
  maxSize: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'success', 'error'])

const imageUrl = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
  }
})

const uploadAction = computed(() => '')
const previewVisible = ref(false)

const imageStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

/**
 * 上传前校验
 */
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    notice.error('只能上传图片文件')
    return false
  }
  
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    notice.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  return true
}

/**
 * 自定义上传
 */
const handleUpload = async ({ file }) => {
  try {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      try {
        const res = await uploadImage({ image: base64 })
        const key = res.data.data.key
        const url = res.data.data.url
        
        imageUrl.value = url
        emit('change', { key, url })
        emit('success', { key, url })
        notice.success('上传成功')
      } catch (err) {
        notice.error('上传失败')
        emit('error', err)
      }
    }
    reader.readAsDataURL(file)
  } catch (err) {
    notice.error('上传失败')
    emit('error', err)
  }
}

/**
 * 预览图片
 */
const handlePreview = () => {
  if (imageUrl.value) {
    previewVisible.value = true
  }
}

/**
 * 删除图片
 */
const handleRemove = () => {
  imageUrl.value = ''
  emit('change', { key: '', url: '' })
}

defineExpose({
  // 暴露方法供外部调用
})
</script>

<style scoped>
.image-upload-component {
  display: inline-block;
}

.image-uploader {
  display: inline-block;
}

.image-uploader :deep(.el-upload) {
  border: none;
}

.image-preview {
  position: relative;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.image-preview:hover {
  border-color: #409eff;
}

.image-preview:hover .image-mask {
  opacity: 1;
}

.image-preview :deep(.el-image) {
  display: block;
  background-color: #fafafa;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-mask .el-icon {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  transition: background-color 0.3s;
}

.image-mask .el-icon:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
  background-color: #fafafa;
  transition: all 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
  color: #409eff;
}

.upload-text {
  margin-top: 8px;
  font-size: 12px;
}
</style>

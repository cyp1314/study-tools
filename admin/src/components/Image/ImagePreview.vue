<template>
  <el-image v-if="src" :src="src" :preview-src-list="previewSrcList" fit="contain"
    :style="{ width: width, height: height }" @error="handleError">
    <template #error>
      <div class="image-error">
        <img :src="errorImage" :style="{ width: errorWidth, height: errorHeight }" />
      </div>
    </template>
  </el-image>
  <div v-else class=" el-image" :style="{ width: width, height: height }">
    <img :src="errorImage" class="error-img" :style="{ width: errorWidth, height: errorHeight }" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import errorImage from '@/assets/icon/empty.png'

  const props = defineProps({
    src: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '60px'
    },
    height: {
      type: String,
      default: '60px'
    },
    errorWidth: {
      type: String,
      default: '60px'
    },
    errorHeight: {
      type: String,
      default: '60px'
    }
  })

  const previewSrcList = computed(() => {
    return props.src ? [props.src] : []
  })

  const handleError = (e) => {
    e.target.src = errorImage
  }
</script>

<style scoped>
  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
  }

  .error-img {
    display: block;
  }
</style>

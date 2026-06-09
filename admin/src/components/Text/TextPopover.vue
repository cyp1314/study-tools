<template>
  <el-popover placement="top-start" :width="600" trigger="hover" :content="text" :show-after="600">
    <template #reference>
      <div class="text-preview" :style="{ maxWidth: maxWidth }">
        <span class="text-content">{{ text }}</span>
      </div>
    </template>
  </el-popover>
</template>

<script setup>
  import { computed } from 'vue'
  import { ArrowRight } from '@element-plus/icons-vue'

  const props = defineProps({
    text: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: String,
      default: '200px'
    }
  })

  const isTruncated = computed(() => {
    return props.text && props.text.length > 50
  })
</script>

<style scoped>
  .text-preview {
    display: flex;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .text-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .expand-icon {
    margin-left: 4px;
    flex-shrink: 0;
    transform: rotate(90deg);
  }
</style>

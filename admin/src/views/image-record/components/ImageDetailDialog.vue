<template>
  <el-dialog title="图片记录详情" v-model="visible" width="700px">
    <div v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ detail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="任务ID">{{ detail.task_id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户输入" :span="2">{{ detail.user_input || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完整提示词" :span="2">
          <div style="max-height:120px;overflow:auto;white-space:pre-wrap;">{{ detail.full_prompt || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.created_at }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="previewUrls.length > 0" style="margin-top:16px;">
        <h4>生成图片</h4>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <el-image
            v-for="(url, idx) in previewUrls"
            :key="idx"
            :src="url"
            :preview-src-list="previewUrls"
            :initial-index="idx"
            fit="contain"
            style="width:200px;height:200px;border:1px solid #eee;border-radius:4px;"
          />
        </div>
      </div>
      <el-empty v-else description="暂无图片" />
    </div>
  </el-dialog>
</template>

<script setup>
import { getImageRecordById } from '@/api/admin'
import { ref } from 'vue'

const visible = ref(false)
const loading = ref(false)
const detail = ref({})
const previewUrls = ref([])

const statusTagType = (s) => ({ pending: 'info', generating: 'warning', success: 'success', failed: 'danger' }[s] || 'info')

const open = (id) => {
  visible.value = true
  loading.value = true
  detail.value = {}
  previewUrls.value = []
  getImageRecordById(id).then(res => {
    detail.value = res.data.data
    previewUrls.value = res.data.data.previewUrls || []
    loading.value = false
  }).catch(() => { loading.value = false })
}

defineExpose({ open })
</script>

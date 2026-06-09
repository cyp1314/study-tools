<template>
  <el-drawer title="图片记录详情" v-model="visible" size="800px" direction="rtl">
    <div v-loading="loading" class="detail-content">
      <el-descriptions :column="1" border label-width="100px">
        <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ detail.type }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTagType(detail.status)">{{ detail.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="任务ID">
          <span style="word-break:break-all;">{{ detail.task_id || '-' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="用户输入">
          <div style="white-space:normal;word-break:break-all;">{{ detail.user_input || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="完整提示词">
          <div style="white-space:normal;word-break:break-all;max-height:none;">{{ detail.full_prompt || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.created_at }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="imageUrls.length > 0" style="margin-top:16px;">
        <h4>生成图片</h4>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <el-image v-for="(url, idx) in imageUrls" :key="idx" :src="url" :preview-src-list="imageUrls"
            :initial-index="idx" fit="contain"
            style="width:200px;height:200px;border:1px solid #eee;border-radius:4px;" />
        </div>
      </div>
      <el-empty v-else description="暂无图片" />
    </div>
  </el-drawer>
</template>

<script setup>
  import { getImageRecordById } from '@/api/admin'
  import httpRequest from '@/utils/http'
  import { ref } from 'vue'

  const visible = ref(false)
  const loading = ref(false)
  const detail = ref({})
  const imageUrls = ref([])

  const statusTagType = (s) => ({ pending: 'info', generating: 'warning', success: 'success', failed: 'danger' }[s] || 'info')

  const open = (id) => {
    visible.value = true
    loading.value = true
    detail.value = {}
    imageUrls.value = []
    getImageRecordById(id).then(res => {
      detail.value = res.data.data
      // 从本地路径构建图片URL（管理端）
      const imagePaths = res.data.data.images || []
      // images 字段现在存储的是相对路径，如 'uploads/images/jimeng/coloringBook/123.png'
      // 使用 httpRequest.defaults.baseURL 作为服务器地址
      const serverUrl = httpRequest.defaults.baseURL || ''
      imageUrls.value = imagePaths.map(path => {
        if (!path) return ''
        // 将相对路径转为完整的访问URL
        return `${serverUrl}/${path.replace(/\\/g, '/')}`
      }).filter(Boolean)
      loading.value = false
    }).catch(() => { loading.value = false })
  }

  defineExpose({ open })
</script>

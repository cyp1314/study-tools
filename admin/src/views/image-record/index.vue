<template>
  <el-card style="margin:10px;">
    <el-form :inline="true" :model="queryParams">
      <el-form-item>
        <el-select v-model="queryParams.type" placeholder="图片类型" clearable style="width:150px">
          <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width:120px">
          <el-option label="待处理" value="pending" />
          <el-option label="生成中" value="generating" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestData">搜索</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin:10px;">
    <table-action title="图片记录" />
    <el-table :data="table.data" v-loading="table.loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="task_id" label="任务ID" show-overflow-tooltip />
      <el-table-column prop="type" label="类型" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="user_input" label="用户输入" show-overflow-tooltip />
      <el-table-column prop="full_prompt" label="完整提示词" width="600">
        <template #default="scope">
          <TextPopover :text="scope.row.full_prompt" max-width="600px" />
        </template>
      </el-table-column>
      <!-- <el-table-column prop="images" label="预览" width="120" align="center">
        <template #default="scope">
          <el-image v-if="scope.row.images && scope.row.images.length > 0"
            :src="`data:image/png;base64,${scope.row.images[0]}`"
            :preview-src-list="scope.row.images.map(b64 => `data:image/png;base64,${b64}`)" fit="contain"
            style="width: 100px; height: 100px;" />
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="created_at" label="创建时间" width="200" />
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleView(scope.row)">查看</el-button>
          <el-popconfirm title="确定删除该记录？" @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button type="danger" :link="true">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination-right" @current-change="requestData"
      v-model:current-page="table.pagination.currentPage" :page-size="table.pagination.pageSize"
      layout="total, prev, pager, next, jumper" :total="table.pagination.total" />
  </el-card>

  <image-detail-dialog ref="detailDialogRef" />
</template>

<script setup name="imageRecordIndex">
  import { ref, reactive, onMounted } from 'vue'
  import { getImageRecordList, deleteImageRecord } from '@/api/admin'
  import TableAction from '@/components/Table/TableAction.vue'
  import ImageDetailDialog from './components/ImageDetailDialog.vue'
  import TextPopover from '@/components/Text/TextPopover.vue'
  import notice from '@/utils/notice'

  const detailDialogRef = ref(null)
  const queryParams = reactive({ type: '', status: '' })

  const typeOptions = ['coloringBook', 'sketchColoring', 'symmetryDrawing', 'hanziCopybook', 'poemIllustration', 'englishFlashcard', 'mathWorksheet', 'pinyinWorksheet', 'mazeGame', 'connectDots', 'findDifference', 'customColoring']

  const table = reactive({
    data: [],
    pagination: { currentPage: 1, pageSize: 20, total: 0 },
    loading: false,
  })

  const statusTagType = (s) => ({ pending: 'info', generating: 'warning', success: 'success', failed: 'danger' }[s] || 'info')
  const statusLabel = (s) => ({ pending: '待处理', generating: '生成中', success: '成功', failed: '失败' }[s] || s)

  const requestData = () => {
    table.loading = true
    const params = { page: table.pagination.currentPage, pageSize: table.pagination.pageSize }
    if (queryParams.type) params.type = queryParams.type
    if (queryParams.status) params.status = queryParams.status
    getImageRecordList(params).then(res => {
      const data = res.data.data
      console.log('[API] getImageRecordList:', data)
      table.data = data.list
      table.pagination.total = data.total
      table.loading = false
    }).catch(() => { table.loading = false })
  }

  onMounted(() => requestData())

  const handleView = (row) => detailDialogRef.value.open(row.id)
  const handleDelete = (row) => {
    deleteImageRecord(row.id).then(() => { notice.deleteSuccess(); requestData() })
  }
</script>

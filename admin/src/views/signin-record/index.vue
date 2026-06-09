<template>
  <el-card style="margin:10px;">
    <el-form :inline="true" :model="queryParams">
      <el-form-item>
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width:120px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestData">搜索</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin:10px;">
    <table-action title="签到记录" />
    <el-table :data="table.data" v-loading="table.loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="user_id" label="用户ID" width="80" />
      <el-table-column prop="nickname" label="用户昵称">
        <template #default="scope">{{ scope.row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column prop="sign_date" label="签到日期" />
      <el-table-column prop="created_at" label="签到时间" />
      <el-table-column prop="continuous_days" label="连续天数" width="100" />
      <el-table-column prop="earned_points" label="获得积分" width="100">
        <template #default="scope">
          <span style="color:#67c23a">+{{ scope.row.earned_points }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="100">
        <template #default="scope">
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
</template>

<script setup name="signinRecordIndex">
  import { reactive, onMounted } from 'vue'
  import { getSignInRecordList, deleteSignInRecord } from '@/api/admin'
  import TableAction from '@/components/Table/TableAction.vue'
  import notice from '@/utils/notice'

  const queryParams = reactive({ userId: '' })

  const table = reactive({
    data: [],
    pagination: { currentPage: 1, pageSize: 20, total: 0 },
    loading: false,
  })

  const requestData = () => {
    table.loading = true
    const params = { page: table.pagination.currentPage, pageSize: table.pagination.pageSize }
    if (queryParams.userId) params.userId = queryParams.userId
    getSignInRecordList(params).then(res => {
      const data = res.data.data
      table.data = data.list
      table.pagination.total = data.total
      table.loading = false
    }).catch(() => { table.loading = false })
  }

  onMounted(() => requestData())

  const handleDelete = (row) => {
    deleteSignInRecord(row.id).then(() => { notice.deleteSuccess(); requestData() })
  }
</script>

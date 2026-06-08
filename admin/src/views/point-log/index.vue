<template>
  <el-card style="margin:10px;">
    <el-form :inline="true" :model="queryParams">
      <el-form-item>
        <el-input v-model="queryParams.userId" placeholder="用户ID" clearable style="width:120px" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="queryParams.type" placeholder="变更类型" clearable style="width:140px">
          <el-option label="签到" value="sign_in" />
          <el-option label="充值" value="recharge" />
          <el-option label="生成图片" value="generate" />
          <el-option label="管理员调整" value="admin_adjust" />
          <el-option label="新用户奖励" value="new_user" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestData">搜索</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin:10px;">
    <table-action title="积分记录" />
    <el-table :data="table.data" v-loading="table.loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="user_id" label="用户ID" width="80" />
      <el-table-column prop="nickname" label="用户昵称" width="120">
        <template #default="scope">{{ scope.row.nickname || '-' }}</template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="110">
        <template #default="scope">
          <el-tag :type="typeTagMap[scope.row.type] || 'info'">{{ typeLabelMap[scope.row.type] || scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="变更数量" width="100">
        <template #default="scope">
          <span :style="{color: scope.row.amount > 0 ? '#67c23a' : '#f56c6c'}">
            {{ scope.row.amount > 0 ? '+' : '' }}{{ scope.row.amount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="balance_after" label="变更后余额" width="110" />
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column prop="created_at" label="时间" width="170" />
    </el-table>
    <el-pagination class="pagination-right"
      @current-change="requestData"
      v-model:current-page="table.pagination.currentPage"
      :page-size="table.pagination.pageSize"
      layout="total, prev, pager, next, jumper"
      :total="table.pagination.total"
    />
  </el-card>
</template>

<script setup name="pointLogIndex">
import { reactive, onMounted } from 'vue'
import { getPointLogList } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'

const queryParams = reactive({ userId: '', type: '' })

const typeLabelMap = { sign_in: '签到', recharge: '充值', generate: '生成图片', admin_adjust: '管理员调整', new_user: '新用户奖励', other: '其他' }
const typeTagMap = { sign_in: 'success', recharge: 'warning', generate: 'danger', admin_adjust: '', new_user: 'success', other: 'info' }

const table = reactive({
  data: [],
  pagination: { currentPage: 1, pageSize: 20, total: 0 },
  loading: false,
})

const requestData = () => {
  table.loading = true
  const params = { page: table.pagination.currentPage, pageSize: table.pagination.pageSize }
  if (queryParams.userId) params.userId = queryParams.userId
  if (queryParams.type) params.type = queryParams.type
  getPointLogList(params).then(res => {
    const data = res.data.data
    table.data = data.list
    table.pagination.total = data.total
    table.loading = false
  }).catch(() => { table.loading = false })
}

onMounted(() => requestData())
</script>

<template>
  <el-card style="margin:10px;">
    <el-form :inline="true" :model="queryParams">
      <el-form-item>
        <el-input v-model="queryParams.keyword" placeholder="昵称/手机号/OpenID" clearable style="width:220px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="requestData">搜索</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card style="margin:10px;">
    <table-action title="用户管理" />
    <el-table :data="table.data" v-loading="table.loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="nickname" label="昵称" width="120">
        <template #default="scope">
          {{ scope.row.nickname || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130">
        <template #default="scope">
          {{ scope.row.phone || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="80" />
      <el-table-column prop="balance" label="积分余额" width="100" />
      <el-table-column prop="total_earned" label="累计获得" width="100" />
      <el-table-column prop="total_spent" label="累计消耗" width="100" />
      <el-table-column prop="created_at" label="注册时间" width="170" />
      <el-table-column fixed="right" label="操作" min-width="220">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleAdjust(scope.row)">调整积分</el-button>
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该用户？删除后不可恢复" @confirm="handleDelete(scope.$index, scope.row)">
            <template #reference>
              <el-button type="danger" :link="true">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="pagination-right"
      @current-change="requestData"
      v-model:current-page="table.pagination.currentPage"
      :page-size="table.pagination.pageSize"
      layout="total, prev, pager, next, jumper"
      :total="table.pagination.total"
    />
  </el-card>

  <user-edit-dialog ref="editDialogRef" @success="requestData" />
  <adjust-points-dialog ref="adjustDialogRef" @success="requestData" />
</template>

<script setup name="userManageIndex">
import { ref, reactive, onMounted } from 'vue'
import { getUserList, deleteUser } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import UserEditDialog from './components/UserEditDialog.vue'
import AdjustPointsDialog from './components/AdjustPointsDialog.vue'
import notice from '@/utils/notice'

const editDialogRef = ref(null)
const adjustDialogRef = ref(null)
const queryParams = reactive({ keyword: '' })

const table = reactive({
  data: [],
  pagination: { currentPage: 1, pageSize: 20, total: 0 },
  loading: false,
})

const requestData = () => {
  table.loading = true
  getUserList({ page: table.pagination.currentPage, pageSize: table.pagination.pageSize, ...queryParams }).then(res => {
    const data = res.data.data
    table.data = data.list
    table.pagination.total = data.total
    table.loading = false
  }).catch(() => { table.loading = false })
}

onMounted(() => requestData())

const handleEdit = (row) => editDialogRef.value.open(row)
const handleAdjust = (row) => adjustDialogRef.value.open(row)

const handleDelete = (index, row) => {
  deleteUser(row.id).then(() => {
    notice.deleteSuccess()
    requestData()
  })
}
</script>

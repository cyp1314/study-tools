<template>
  <el-card style="margin:10px;">
    <table-action title="签到奖励配置">
      <template #action>
        <el-button type="primary" @click="formDialogRef.open('add')">新增配置</el-button>
      </template>
    </table-action>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="continuous_days" label="连续第N天" width="120" />
      <el-table-column prop="reward_points" label="奖励积分" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'">{{ scope.row.is_active ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="150">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除该配置？" @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button type="danger" :link="true">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <signin-config-form-dialog ref="formDialogRef" @success="requestData" />
</template>

<script setup name="signinConfigIndex">
import { ref, onMounted } from 'vue'
import { getSignInConfigList, deleteSignInConfig } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import SigninConfigFormDialog from './components/SigninConfigFormDialog.vue'
import notice from '@/utils/notice'

const formDialogRef = ref(null)
const tableData = ref([])
const loading = ref(false)

const requestData = () => {
  loading.value = true
  getSignInConfigList().then(res => {
    tableData.value = res.data.data
    loading.value = false
  }).catch(() => { loading.value = false })
}

onMounted(() => requestData())

const handleEdit = (row) => formDialogRef.value.open('edit', row)
const handleDelete = (row) => {
  deleteSignInConfig(row.id).then(() => { notice.deleteSuccess(); requestData() })
}
</script>

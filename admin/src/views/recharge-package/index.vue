<template>
  <el-card style="margin:10px;">
    <table-action title="充值套餐管理">
      <template #action>
        <el-button type="primary" @click="formDialogRef.open('add')">新增套餐</el-button>
      </template>
    </table-action>
    <el-table :data="tableData" v-loading="loading" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="套餐名称" width="150" />
      <el-table-column prop="points" label="积分" width="100" />
      <el-table-column prop="bonus" label="赠送积分" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.bonus > 0" type="success">+{{ scope.row.bonus }}</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="价格(元)" width="120">
        <template #default="scope">
          ¥{{ parseFloat(scope.row.amount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'">
            {{ scope.row.is_active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column fixed="right" label="操作" min-width="220">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            :type="scope.row.is_active ? 'warning' : 'success'"
            :link="true"
            @click="handleToggle(scope.row)"
          >
            {{ scope.row.is_active ? '禁用' : '启用' }}
          </el-button>
          <el-popconfirm title="确定删除该套餐？" @confirm="handleDelete(scope.row)">
            <template #reference>
              <el-button type="danger" :link="true">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <package-form-dialog ref="formDialogRef" @success="requestData" />
</template>

<script setup name="rechargePackageIndex">
import { ref, onMounted } from 'vue'
import { getRechargePackageList, deleteRechargePackage, toggleRechargePackage } from '@/api/rechargePackage'
import TableAction from '@/components/Table/TableAction.vue'
import PackageFormDialog from './components/PackageFormDialog.vue'
import notice from '@/utils/notice'

const formDialogRef = ref(null)
const tableData = ref([])
const loading = ref(false)

const requestData = () => {
  loading.value = true
  getRechargePackageList().then((response) => {
    tableData.value = response.data.data
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

onMounted(() => {
  requestData()
})

const handleEdit = (row) => {
  formDialogRef.value.open('edit', row)
}

const handleToggle = (row) => {
  toggleRechargePackage(row.id).then(() => {
    notice.editSuccess(row.is_active ? '已禁用' : '已启用')
    requestData()
  })
}

const handleDelete = (row) => {
  deleteRechargePackage(row.id).then(() => {
    notice.deleteSuccess()
    requestData()
  })
}
</script>

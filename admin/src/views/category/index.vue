<template>
  <el-card style="margin:10px;">
    <table-action title="分类管理">
      <template #action>
        <el-button type="primary" @click="formDialogRef.open('add')">新增分类</el-button>
      </template>
    </table-action>
    <el-table :data="tableData" v-loading="loading" border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="分类名称"  />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="scope">
          <el-image 
            v-if="scope.row.icon" 
            :src="scope.row.icon" 
            fit="contain" 
            style="width:50px;height:50px" 
            :preview-src-list="[scope.row.icon]"
          />
          <span v-else style="color:#999">无图标</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'">{{ scope.row.is_active ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="300" />
      <el-table-column fixed="right" label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button :type="scope.row.is_active ? 'warning' : 'success'" :link="true" @click="handleToggle(scope.row)">{{ scope.row.is_active ? '禁用' : '启用' }}</el-button>
          <el-popconfirm title="确定删除？关联的产品-分类也会被清除" @confirm="handleDelete(scope.row)">
            <template #reference><el-button type="danger" :link="true">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <category-form-dialog ref="formDialogRef" @success="requestData" />
</template>

<script setup name="categoryIndex">
import { ref, onMounted } from 'vue'
import { getCategoryList, deleteCategory, toggleCategory } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import CategoryFormDialog from './components/CategoryFormDialog.vue'
import notice from '@/utils/notice'

const formDialogRef = ref(null)
const tableData = ref([])
const loading = ref(false)

const requestData = () => {
  loading.value = true
  getCategoryList().then(res => { tableData.value = res.data.data; loading.value = false }).catch(() => { loading.value = false })
}
onMounted(() => requestData())

const handleEdit = (row) => formDialogRef.value.open('edit', row)
const handleToggle = (row) => { toggleCategory(row.id).then(() => { notice.editSuccess(); requestData() }) }
const handleDelete = (row) => { deleteCategory(row.id).then(() => { notice.deleteSuccess(); requestData() }) }
</script>

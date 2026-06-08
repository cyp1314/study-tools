<template>
  <el-card style="margin:10px;">
    <table-action title="产品管理">
      <template #action>
        <el-button type="primary" @click="formDialogRef.open('add')">新增产品</el-button>
      </template>
    </table-action>
    <el-table :data="tableData" v-loading="loading" border style="width:100%">
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="name" label="产品名称" width="100" />
      <el-table-column prop="type" label="类型标识" width="130" />
      <el-table-column prop="default_prompt" label="默认提示词" min-width="140" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="140" show-overflow-tooltip />
      <el-table-column label="分类" width="140">
        <template #default="scope">
          <el-tag v-for="cid in scope.row.categoryIds" :key="cid" size="small" style="margin:2px">{{ getCategoryName(cid) }}</el-tag>
          <span v-if="!scope.row.categoryIds || scope.row.categoryIds.length===0">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="60" />
      <el-table-column label="状态" width="70">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'" size="small">{{ scope.row.is_active ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="200">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button :type="scope.row.is_active ? 'warning' : 'success'" :link="true" @click="handleToggle(scope.row)">{{ scope.row.is_active ? '禁用' : '启用' }}</el-button>
          <el-popconfirm title="确定删除该产品？" @confirm="handleDelete(scope.row)">
            <template #reference><el-button type="danger" :link="true">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <product-form-dialog ref="formDialogRef" @success="requestData" />
</template>

<script setup name="productIndex">
import { ref, onMounted } from 'vue'
import { getProductList, deleteProduct, toggleProduct, getCategoryList } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import ProductFormDialog from './components/ProductFormDialog.vue'
import notice from '@/utils/notice'

const formDialogRef = ref(null)
const tableData = ref([])
const categories = ref([])
const loading = ref(false)

const getCategoryName = (cid) => {
  const cat = categories.value.find(c => c.id === cid)
  return cat ? cat.name : cid
}

const requestData = () => {
  loading.value = true
  getProductList().then(res => { tableData.value = res.data.data; loading.value = false }).catch(() => { loading.value = false })
}

const loadCategories = () => {
  getCategoryList().then(res => { categories.value = res.data.data })
}

onMounted(() => { requestData(); loadCategories() })

const handleEdit = (row) => formDialogRef.value.open('edit', row)
const handleToggle = (row) => { toggleProduct(row.id).then(() => { notice.editSuccess(); requestData() }) }
const handleDelete = (row) => { deleteProduct(row.id).then(() => { notice.deleteSuccess(); requestData() }) }
</script>

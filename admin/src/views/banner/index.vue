<template>
  <el-card style="margin:10px;">
    <table-action title="轮播图管理">
      <template #action>
        <el-button type="primary" @click="formDialogRef.open('add')">新增轮播图</el-button>
      </template>
    </table-action>
    <el-table :data="tableData" v-loading="loading" border style="width:100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" width="150" />
      <el-table-column label="图片" width="160">
        <template #default="scope">
          <el-image v-if="scope.row.imageUrl" :src="scope.row.imageUrl" fit="cover" style="width:120px;height:60px;border-radius:4px" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="link_type" label="跳转类型" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.link_type==='page'">小程序页面</el-tag>
          <el-tag v-else-if="scope.row.link_type==='web'" type="success">网页</el-tag>
          <el-tag v-else type="info">无跳转</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="link_url" label="跳转地址" min-width="180" show-overflow-tooltip />
      <el-table-column prop="sort_order" label="排序" width="70" />
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.is_active ? 'success' : 'info'">{{ scope.row.is_active ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="200">
        <template #default="scope">
          <el-button type="primary" :link="true" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button :type="scope.row.is_active ? 'warning' : 'success'" :link="true" @click="handleToggle(scope.row)">{{ scope.row.is_active ? '禁用' : '启用' }}</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(scope.row)">
            <template #reference><el-button type="danger" :link="true">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <banner-form-dialog ref="formDialogRef" @success="requestData" />
</template>

<script setup name="bannerIndex">
import { ref, onMounted } from 'vue'
import { getBannerList, deleteBanner, toggleBanner } from '@/api/admin'
import TableAction from '@/components/Table/TableAction.vue'
import BannerFormDialog from './components/BannerFormDialog.vue'
import notice from '@/utils/notice'

const formDialogRef = ref(null)
const tableData = ref([])
const loading = ref(false)

const requestData = () => {
  loading.value = true
  getBannerList().then(res => { tableData.value = res.data.data; loading.value = false }).catch(() => { loading.value = false })
}
onMounted(() => requestData())

const handleEdit = (row) => formDialogRef.value.open('edit', row)
const handleToggle = (row) => { toggleBanner(row.id).then(() => { notice.editSuccess(); requestData() }) }
const handleDelete = (row) => { deleteBanner(row.id).then(() => { notice.deleteSuccess(); requestData() }) }
</script>

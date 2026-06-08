<template>
  <el-dialog :title="actionType==='add'?'新增分类':'编辑分类'" v-model="visible" width="450px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="form.icon" placeholder="Element Plus图标名" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="启用">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible=false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { addCategory, editCategory } from '@/api/admin'
import notice from '@/utils/notice'
import { ref, nextTick } from 'vue'

const emit = defineEmits(['success'])
const visible = ref(false)
const actionType = ref('add')
let currentId = null
const formRef = ref(null)

const form = ref({ name: '', icon: '', sortOrder: 0, isActive: true })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const open = (action = 'add', row = null) => {
  actionType.value = action
  if (action === 'add') {
    form.value = { name: '', icon: '', sortOrder: 0, isActive: true }
    nextTick(() => formRef.value?.clearValidate())
  } else {
    currentId = row.id
    form.value = { name: row.name, icon: row.icon || '', sortOrder: row.sort_order, isActive: !!row.is_active }
  }
  visible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    if (actionType.value === 'add') {
      addCategory(form.value).then(() => { notice.addSuccess(); visible.value = false; emit('success') })
    } else {
      editCategory(currentId, form.value).then(() => { notice.editSuccess(); visible.value = false; emit('success') })
    }
  })
}

defineExpose({ open })
</script>

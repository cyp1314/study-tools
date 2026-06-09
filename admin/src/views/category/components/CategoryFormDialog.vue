<template>
  <el-dialog :title="actionType==='add'?'新增分类':'编辑分类'" v-model="visible" width="450px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="图标">
        <ImageUpload 
          v-model="form.imageUrl" 
          :width="'80px'" 
          :height="'80px'"
          placeholder="点击上传图标"
          @change="handleImageChange"
        />
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
import ImageUpload from '@/components/Image/ImageUpload.vue'

const emit = defineEmits(['success'])
const visible = ref(false)
const actionType = ref('add')
let currentId = null
const formRef = ref(null)

const form = ref({ name: '', icon: '', imageUrl: '', sortOrder: 0, isActive: true })
const rules = { name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }

const open = (action = 'add', row = null) => {
  actionType.value = action
  if (action === 'add') {
    form.value = { name: '', icon: '', imageUrl: '', sortOrder: 0, isActive: true }
    nextTick(() => formRef.value?.clearValidate())
  } else {
    currentId = row.id
    form.value = { 
      name: row.name, 
      icon: row.icon || '', 
      imageUrl: row.icon || '',
      sortOrder: row.sort_order, 
      isActive: !!row.is_active 
    }
  }
  visible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    const submitData = {
      name: form.value.name,
      icon: form.value.icon,
      sortOrder: form.value.sortOrder,
      isActive: form.value.isActive,
    }
    if (actionType.value === 'add') {
      addCategory(submitData).then(() => { notice.addSuccess(); visible.value = false; emit('success') })
    } else {
      editCategory(currentId, submitData).then(() => { notice.editSuccess(); visible.value = false; emit('success') })
    }
  })
}

const handleImageChange = ({ key, url }) => {
  form.value.icon = key
  form.value.imageUrl = url
}

defineExpose({ open })
</script>

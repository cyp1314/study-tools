<template>
  <el-dialog title="编辑用户" v-model="visible" width="500px">
    <el-form :model="form" ref="formRef" label-width="80px">
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { updateUser } from '@/api/admin'
  import notice from '@/utils/notice'
  import { ref } from 'vue'

  const emit = defineEmits(['success'])
  const visible = ref(false)
  const formRef = ref(null)
  let currentId = null

  const form = ref({ nickname: '', phone: '' })

  const open = (row) => {
    currentId = row.id
    form.value = { nickname: row.nickname || '', phone: row.phone || '' }
    visible.value = true
  }

  const handleSubmit = () => {
    updateUser(currentId, form.value).then(() => {
      notice.editSuccess()
      visible.value = false
      emit('success')
    })
  }

  defineExpose({ open })
</script>

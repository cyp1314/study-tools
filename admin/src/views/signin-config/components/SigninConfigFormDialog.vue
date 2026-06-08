<template>
  <el-dialog :title="actionType === 'add' ? '新增签到配置' : '编辑签到配置'" v-model="visible" width="450px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="连续第N天" prop="continuousDays">
        <el-input-number v-model="form.continuousDays" :min="1" :max="365" />
      </el-form-item>
      <el-form-item label="奖励积分" prop="rewardPoints">
        <el-input-number v-model="form.rewardPoints" :min="1" :max="10000" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-switch v-model="form.isActive" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { addSignInConfig, updateSignInConfig } from '@/api/admin'
import notice from '@/utils/notice'
import { ref, nextTick } from 'vue'

const emit = defineEmits(['success'])
const visible = ref(false)
const actionType = ref('add')
let currentId = null
const formRef = ref(null)

const form = ref({ continuousDays: 1, rewardPoints: 5, isActive: true })
const rules = {
  continuousDays: [{ required: true, message: '请输入天数', trigger: 'change' }],
  rewardPoints: [{ required: true, message: '请输入积分', trigger: 'change' }],
}

const open = (action = 'add', row = null) => {
  actionType.value = action
  if (action === 'add') {
    form.value = { continuousDays: 1, rewardPoints: 5, isActive: true }
    nextTick(() => formRef.value?.clearValidate())
  } else {
    currentId = row.id
    form.value = {
      continuousDays: row.continuous_days,
      rewardPoints: row.reward_points,
      isActive: !!row.is_active,
    }
  }
  visible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    const data = { ...form.value }
    if (actionType.value === 'add') {
      addSignInConfig(data).then(() => { notice.addSuccess(); visible.value = false; emit('success') })
    } else {
      updateSignInConfig(currentId, data).then(() => { notice.editSuccess(); visible.value = false; emit('success') })
    }
  })
}

defineExpose({ open })
</script>

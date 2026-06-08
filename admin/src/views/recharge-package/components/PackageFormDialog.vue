<template>
  <el-dialog :title="actionType === 'add' ? '新增套餐' : '编辑套餐'" v-model="visible" width="500px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="套餐名称" prop="name">
        <el-input v-model="form.name" placeholder="如：100积分" />
      </el-form-item>
      <el-form-item label="积分数" prop="points">
        <el-input-number v-model="form.points" :min="1" :max="100000" />
      </el-form-item>
      <el-form-item label="赠送积分" prop="bonus">
        <el-input-number v-model="form.bonus" :min="0" :max="100000" />
      </el-form-item>
      <el-form-item label="价格(元)" prop="amount">
        <el-input-number v-model="form.amount" :min="0.01" :max="99999" :precision="2" :step="1" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
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
import { addRechargePackage, editRechargePackage } from '@/api/rechargePackage'
import notice from '@/utils/notice'
import { ref, nextTick } from 'vue'

const emit = defineEmits(['success'])

const visible = ref(false)
const actionType = ref('add')
let currentId = null

const formRef = ref(null)

const form = ref({
  name: null,
  points: 100,
  bonus: 0,
  amount: 9.90,
  sortOrder: 0,
  isActive: true,
})

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  points: [{ required: true, message: '请输入积分数', trigger: 'change' }],
  amount: [{ required: true, message: '请输入价格', trigger: 'change' }],
}

const open = (action = 'add', row = null) => {
  actionType.value = action
  if (action === 'add') {
    form.value = { name: null, points: 100, bonus: 0, amount: 9.90, sortOrder: 0, isActive: true }
    nextTick(() => formRef.value?.clearValidate())
  } else {
    currentId = row.id
    form.value = {
      name: row.name,
      points: row.points,
      bonus: row.bonus || 0,
      amount: parseFloat(row.amount),
      sortOrder: row.sort_order || 0,
      isActive: !!row.is_active,
    }
  }
  visible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    const data = {
      name: form.value.name,
      points: form.value.points,
      bonus: form.value.bonus,
      amount: form.value.amount,
      sortOrder: form.value.sortOrder,
      isActive: form.value.isActive,
    }
    if (actionType.value === 'add') {
      addRechargePackage(data).then(() => {
        notice.addSuccess()
        visible.value = false
        emit('success')
      })
    } else {
      editRechargePackage(currentId, data).then(() => {
        notice.editSuccess()
        visible.value = false
        emit('success')
      })
    }
  })
}

defineExpose({ open })
</script>

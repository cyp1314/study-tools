<template>
  <el-dialog title="调整积分" v-model="visible" width="450px">
    <el-form :model="form" ref="formRef" label-width="80px">
      <el-form-item label="用户">
        <span>{{ userInfo }}</span>
      </el-form-item>
      <el-form-item label="当前余额">
        <span>{{ currentBalance }}</span>
      </el-form-item>
      <el-form-item label="调整数量" prop="amount">
        <el-input-number v-model="form.amount" :step="10" />
        <div style="color:#999;font-size:12px;">正数=增加积分，负数=扣减积分</div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" placeholder="如：补偿积分、扣减异常等" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { adjustUserPoints } from '@/api/admin'
import notice from '@/utils/notice'
import { ref, computed } from 'vue'

const emit = defineEmits(['success'])
const visible = ref(false)
const formRef = ref(null)
let currentId = null
const currentBalance = ref(0)
const nickname = ref('')

const form = ref({ amount: 10, remark: '' })

const userInfo = computed(() => nickname.value || `ID: ${currentId}`)

const open = (row) => {
  currentId = row.id
  currentBalance.value = row.balance
  nickname.value = row.nickname
  form.value = { amount: 10, remark: '' }
  visible.value = true
}

const handleSubmit = () => {
  if (!form.value.amount || form.value.amount === 0) {
    return ElMessage.warning('调整数量不能为0')
  }
  adjustUserPoints(currentId, form.value).then(() => {
    notice.editSuccess('积分调整成功')
    visible.value = false
    emit('success')
  })
}

defineExpose({ open })
</script>

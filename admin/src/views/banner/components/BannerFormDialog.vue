<template>
  <el-dialog :title="actionType === 'add' ? '新增轮播图' : '编辑轮播图'" v-model="visible" width="550px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="轮播图标题" />
      </el-form-item>
      <el-form-item label="图片">
        <ImageUpload 
          v-model="form.imageUrl" 
          :width="'120px'" 
          :height="'80px'"
          placeholder="点击上传图片"
          @change="handleImageChange"
        />
      </el-form-item>
      <el-form-item label="跳转类型">
        <el-select v-model="form.linkType">
          <el-option label="无跳转" value="none" />
          <el-option label="小程序页面" value="page" />
          <el-option label="网页" value="web" />
        </el-select>
      </el-form-item>
      <el-form-item label="跳转地址" v-if="form.linkType !== 'none'">
        <el-input v-model="form.linkUrl"
          :placeholder="form.linkType === 'page' ? '如 pages/detail/index?id=1' : 'https://...'" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="启用">
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
  import { addBanner, editBanner } from '@/api/admin'
  import notice from '@/utils/notice'
  import { ref, nextTick } from 'vue'
  import ImageUpload from '@/components/Image/ImageUpload.vue'

  const emit = defineEmits(['success'])
  const visible = ref(false)
  const actionType = ref('add')
  let currentId = null
  const formRef = ref(null)

  const form = ref({ title: '', imageUrl: '', imageKey: '', linkType: 'none', linkUrl: '', sortOrder: 0, isActive: true })
  const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] }

  const open = (action = 'add', row = null) => {
    actionType.value = action
    if (action === 'add') {
      form.value = { title: '', imageUrl: '', imageKey: '', linkType: 'none', linkUrl: '', sortOrder: 0, isActive: true }
      nextTick(() => formRef.value?.clearValidate())
    } else {
      currentId = row.id
      form.value = {
        title: row.title,
        imageUrl: row.imageUrl || '',
        imageKey: row.image_key,
        linkType: row.link_type,
        linkUrl: row.link_url,
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
        title: form.value.title,
        imageKey: form.value.imageKey,
        linkType: form.value.linkType,
        linkUrl: form.value.linkUrl,
        sortOrder: form.value.sortOrder,
        isActive: form.value.isActive,
      }
      if (actionType.value === 'add') {
        addBanner(submitData).then(() => { notice.addSuccess(); visible.value = false; emit('success') })
      } else {
        editBanner(currentId, submitData).then(() => { notice.editSuccess(); visible.value = false; emit('success') })
      }
    })
  }

  const handleImageChange = ({ key, url }) => {
    form.value.imageKey = key
    form.value.imageUrl = url
  }

  defineExpose({ open })
</script>

<template>
  <el-dialog :title="actionType === 'add' ? '新增轮播图' : '编辑轮播图'" v-model="visible" width="550px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="轮播图标题" />
      </el-form-item>
      <el-form-item label="图片">
        <div class="image-uploader" @click="triggerUpload">
          <el-image v-if="form.imageUrl" :src="form.imageUrl" fit="contain" style="width:120px;height:80px" />
          <el-icon v-else :size="30">
            <Plus />
          </el-icon>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleFileChange" />
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
  import { uploadImage } from '@/api/common'
  import notice from '@/utils/notice'
  import { ref, nextTick } from 'vue'
  import { Plus } from '@element-plus/icons-vue'

  const emit = defineEmits(['success'])
  const visible = ref(false)
  const actionType = ref('add')
  let currentId = null
  const formRef = ref(null)
  const fileInput = ref(null)

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

  const triggerUpload = () => {
    fileInput.value?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      try {
        const res = await uploadImage({ image: base64 })
        form.value.imageKey = res.data.data.key
        form.value.imageUrl = res.data.data.url
        notice.success('上传成功')
      } catch (err) {
        notice.error('上传失败')
      }
    }
    reader.readAsDataURL(file)
  }

  defineExpose({ open })
</script>

<style scoped>
  .image-uploader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    color: #999;
  }

  .image-uploader:hover {
    border-color: #409eff;
    color: #409eff;
  }
</style>

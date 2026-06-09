<template>
  <el-dialog :title="actionType === 'add' ? '新增产品' : '编辑产品'" v-model="visible" width="40vw" top="10vh">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型标识" prop="type">
            <el-input v-model="form.type" :disabled="actionType === 'edit'" placeholder="如 coloringBook" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="提示词前缀" prop="prefix">
        <el-input v-model="form.prefix" type="textarea" :rows="4" placeholder="prefix - 拼接在用户输入前" />
      </el-form-item>
      <el-form-item label="提示词后缀" prop="suffix">
        <el-input v-model="form.suffix" type="textarea" :rows="8" placeholder="suffix - 拼接在用户输入后" />
      </el-form-item>
      <el-form-item label="默认提示词">
        <el-input v-model="form.defaultPrompt" placeholder="用户未输入时的默认值" />
      </el-form-item>
      <el-form-item label="产品描述">
        <el-input v-model="form.description" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="排序">
            <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="产品图标">
            <ImageUpload 
              v-model="form.coverImage" 
              :width="'80px'" 
              :height="'80px'"
              placeholder="点击上传图标"
              @change="handleImageChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="启用">
            <el-switch v-model="form.isActive" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="所属分类">
        <el-checkbox-group v-model="form.categoryIds">
          <el-checkbox v-for="cat in categories" :key="cat.id" :label="cat.id">{{ cat.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { addProduct, editProduct, getCategoryList } from '@/api/admin'
  import notice from '@/utils/notice'
  import { ref, nextTick, onMounted } from 'vue'
  import ImageUpload from '@/components/Image/ImageUpload.vue'

  const emit = defineEmits(['success'])
  const visible = ref(false)
  const actionType = ref('add')
  let currentId = null
  const formRef = ref(null)
  const categories = ref([])

  const form = ref({
    name: '', type: '', prefix: '', suffix: '', defaultPrompt: '', description: '',
    coverImage: '', sortOrder: 0, isActive: true, categoryIds: [],
  })

  const rules = {
    name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    type: [{ required: true, message: '请输入类型标识', trigger: 'blur' }],
  }

  onMounted(() => {
    getCategoryList().then(res => { categories.value = res.data.data })
  })

  const open = (action = 'add', row = null) => {
    actionType.value = action
    if (action === 'add') {
      form.value = { name: '', type: '', prefix: '', suffix: '', defaultPrompt: '', description: '', coverImage: '', sortOrder: 0, isActive: true, categoryIds: [] }
      nextTick(() => formRef.value?.clearValidate())
    } else {
      currentId = row.id
      form.value = {
        name: row.name, type: row.type, prefix: row.prefix || '', suffix: row.suffix || '',
        defaultPrompt: row.default_prompt || '', description: row.description || '',
        coverImage: row.cover_image || '', sortOrder: row.sort_order || 0, isActive: !!row.is_active,
        categoryIds: row.categoryIds || [],
      }
    }
    visible.value = true
  }

  const handleSubmit = () => {
    formRef.value.validate((valid) => {
      if (!valid) return
      if (actionType.value === 'add') {
        addProduct(form.value).then(() => { notice.addSuccess(); visible.value = false; emit('success') })
      } else {
        editProduct(currentId, form.value).then(() => { notice.editSuccess(); visible.value = false; emit('success') })
      }
    })
  }

  const handleImageChange = ({ key, url }) => {
    form.value.coverImage = url
  }

  defineExpose({ open })
</script>

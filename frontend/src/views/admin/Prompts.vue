<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">Prompts 管理</h2>
      <el-button type="primary" @click="handleAdd">
        添加 Prompt
      </el-button>
    </div>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="prompts"
      style="width: 100%"
    >
      <el-table-column prop="model" label="模型" width="180" />
      <el-table-column prop="content" label="内容">
        <template #default="{ row }">
          <div class="truncate max-w-md">{{ row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="usage" label="用法" width="120" />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑 Prompt' : '添加 Prompt'"
      width="50%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="模型" prop="model">
          <el-input v-model="form.model" placeholder="请输入适用的模型" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入prompt内容"
          />
        </el-form-item>
        <el-form-item label="用法" prop="usage">
          <el-input v-model="form.usage" placeholder="请输入使用说明" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提示词来源">
          <el-input v-model="form.source" placeholder="请输入提示词来源，如：Github、Claude等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const prompts = ref([])
const categories = ref([])
const formRef = ref(null)

const form = ref({
  model: '',
  content: '',
  usage: '',
  categoryId: '',
  source: ''
})

const rules = {
  model: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入prompt内容', trigger: 'blur' }],
  usage: [{ required: true, message: '请输入使用说明', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const [promptsRes, categoriesRes] = await Promise.all([
      axios.get('http://localhost:3000/api/prompts', { withCredentials: true }),
      axios.get('http://localhost:3000/api/categories', { withCredentials: true })
    ])
    
    categories.value = categoriesRes.data
    prompts.value = promptsRes.data.map(prompt => ({
      ...prompt,
      categoryName: categoriesRes.data.find(c => c.id === prompt.categoryId)?.name || '未分类'
    }))
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  initForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  editPrompt(row)
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个prompt吗？', '提示', {
      type: 'warning'
    })
    await axios.delete(`http://localhost:3000/api/admin/prompts/${row.id}`, {
      withCredentials: true
    })
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化表单数据
const initForm = () => {
  form.value = {
    model: '',
    content: '',
    usage: '',
    categoryId: '',
    source: ''
  }
}

// 编辑提示词
const editPrompt = (row) => {
  form.value = {
    id: row.id,
    model: row.model,
    content: row.content,
    usage: row.usage,
    categoryId: row.categoryId,
    source: row.source
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      await axios.put(`http://localhost:3000/api/admin/prompts/${form.value.id}`, form.value, {
        withCredentials: true
      })
      ElMessage.success('更新成功')
    } else {
      await axios.post('http://localhost:3000/api/admin/prompts', form.value, {
        withCredentials: true
      })
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    if (error?.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    }
  } finally {
    submitting.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchData()
})
</script> 
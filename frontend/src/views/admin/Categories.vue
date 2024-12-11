<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-medium text-gray-900">分类管理</h2>
      <el-button type="primary" @click="handleAdd">
        添加分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-table
      v-loading="loading"
      :data="categories"
      style="width: 100%"
    >
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="promptCount" label="Prompt数量" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.promptCount }} 个</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button 
            type="danger" 
            link 
            @click="handleDelete(row)"
            :disabled="row.promptCount > 0"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/添加对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="30%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入分类名称"
            maxlength="20"
            show-word-limit
          />
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
const categories = ref([])
const formRef = ref(null)

const form = ref({
  name: ''
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true
    const [categoriesRes, promptsRes] = await Promise.all([
      axios.get('/categories', { withCredentials: true }),
      axios.get('/prompts', { withCredentials: true })
    ])
    
    // 计算每个分类下的prompt数量
    categories.value = categoriesRes.data.map(category => ({
      ...category,
      promptCount: promptsRes.data.filter(p => p.categoryId === category.id).length
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
  form.value = {
    name: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  if (row.promptCount > 0) {
    ElMessage.warning('该分类下还有prompt，不能删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
      type: 'warning'
    })
    await axios.delete(`/categories/${row.id}`, {
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

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (isEdit.value) {
      await axios.put(`/categories/${form.value.id}`, form.value, {
        withCredentials: true
      })
      ElMessage.success('更新成功')
    } else {
      await axios.post('/categories', form.value, {
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
<template>
  <div>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- 统计卡片 -->
      <el-card shadow="hover" :body-style="{ padding: '20px' }">
        <div class="flex items-center">
          <el-icon class="text-3xl text-blue-500"><Document /></el-icon>
          <div class="ml-4">
            <div class="text-sm text-gray-600">总 Prompt 数量</div>
            <div class="text-2xl font-bold">{{ stats.promptCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" :body-style="{ padding: '20px' }">
        <div class="flex items-center">
          <el-icon class="text-3xl text-green-500"><Collection /></el-icon>
          <div class="ml-4">
            <div class="text-sm text-gray-600">分类数量</div>
            <div class="text-2xl font-bold">{{ stats.categoryCount }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近添加的Prompts -->
    <div class="mt-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">最近添加的 Prompts</h3>
      <el-table :data="recentPrompts" style="width: 100%">
        <el-table-column prop="model" label="名称" width="180">
          <template #default="{ row }">
            <el-tooltip
              :content="row.model"
              placement="top"
              :show-after="500"
            >
              <div class="truncate">{{ row.model }}</div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容">
          <template #default="{ row }">
            <div class="truncate max-w-md">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="router.push(`/admin/prompts?edit=${row.id}`)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Collection } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const stats = ref({
  promptCount: 0,
  categoryCount: 0
})
const recentPrompts = ref([])

const fetchData = async () => {
  try {
    const [promptsRes, categoriesRes] = await Promise.all([
      axios.get('/prompts', { withCredentials: true }),
      axios.get('/categories', { withCredentials: true })
    ])

    stats.value = {
      promptCount: promptsRes.data.length,
      categoryCount: categoriesRes.data.length
    }

    // 获取最近5个prompts
    recentPrompts.value = promptsRes.data
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 5)
      .map(prompt => ({
        ...prompt,
        categoryName: categoriesRes.data.find(c => c.id === prompt.categoryId)?.name || '未分类'
      }))
  } catch (error) {
    console.error('获取数据失败:', error)
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
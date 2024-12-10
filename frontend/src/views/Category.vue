<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <el-button @click="router.push('/')" type="text">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h1 class="text-3xl font-bold text-gray-900 ml-4">
            {{ category?.name || '加载中...' }}
          </h1>
        </div>
      </div>
    </header>

    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div v-if="loading" class="flex justify-center items-center py-12">
            <el-spinner />
          </div>
          
          <div v-else-if="error" class="text-center py-12">
            <el-empty :description="error" />
          </div>
          
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <el-card
              v-for="prompt in category.prompts"
              :key="prompt.id"
              class="hover:shadow-lg transition-shadow"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="font-bold truncate">{{ prompt.model }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    @click.stop="sharePrompt(prompt.id)"
                  >
                    分享
                  </el-button>
                </div>
              </template>
              <div class="h-32 overflow-hidden cursor-pointer" @click="viewPrompt(prompt.id)">
                <p class="text-gray-600">{{ prompt.content }}</p>
              </div>
              <div class="mt-4">
                <el-tag size="small">{{ prompt.usage }}</el-tag>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const category = ref(null)
const loading = ref(true)
const error = ref('')

const fetchCategory = async () => {
  try {
    loading.value = true
    error.value = ''
    const res = await axios.get(`/categories/${route.params.id}`)
    category.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || '获取分类数据失败'
    console.error('获取数据失败:', err)
  } finally {
    loading.value = false
  }
}

const viewPrompt = (promptId) => {
  router.push(`/prompt/${promptId}`)
}

const sharePrompt = async (promptId) => {
  const shareUrl = `${window.location.origin}/share/${promptId}`
  try {
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
    console.error('复制失败:', error)
  }
}

onMounted(() => {
  fetchCategory()
})
</script> 
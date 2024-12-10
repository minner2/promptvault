&lt;template>
  &lt;div class="min-h-screen bg-gray-100">
    &lt;header class="bg-white shadow">
      &lt;div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        &lt;div class="flex items-center">
          &lt;el-button @click="router.push('/')" type="text">
            &lt;el-icon>&lt;ArrowLeft />&lt;/el-icon>
            返回
          &lt;/el-button>
          &lt;h1 class="text-3xl font-bold text-gray-900 ml-4">
            {{ category?.name || '加载中...' }}
          &lt;/h1>
        &lt;/div>
      &lt;/div>
    &lt;/header>

    &lt;main>
      &lt;div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        &lt;div class="px-4 py-6 sm:px-0">
          &lt;div v-if="loading" class="flex justify-center items-center py-12">
            &lt;el-spinner />
          &lt;/div>
          
          &lt;div v-else-if="error" class="text-center py-12">
            &lt;el-empty :description="error" />
          &lt;/div>
          
          &lt;div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            &lt;el-card
              v-for="prompt in category.prompts"
              :key="prompt.id"
              class="hover:shadow-lg transition-shadow"
            >
              &lt;template #header>
                &lt;div class="flex items-center justify-between">
                  &lt;span class="font-bold truncate">{{ prompt.model }}</span>
                  &lt;el-button
                    type="primary"
                    size="small"
                    @click.stop="sharePrompt(prompt.id)"
                  >
                    分享
                  &lt;/el-button>
                &lt;/div>
              &lt;/template>
              &lt;div class="h-32 overflow-hidden cursor-pointer" @click="viewPrompt(prompt.id)">
                &lt;p class="text-gray-600">{{ prompt.content }}</p>
              &lt;/div>
              &lt;div class="mt-4">
                &lt;el-tag size="small">{{ prompt.usage }}</el-tag>
              &lt;/div>
            &lt;/el-card>
          &lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/main>
  &lt;/div>
&lt;/template>

&lt;script setup>
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
    const res = await axios.get(`http://localhost:3000/api/categories/${route.params.id}`)
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
&lt;/script> 
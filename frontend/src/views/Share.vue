<template>
  <div class="min-h-screen transition-colors duration-300" :class="isDark ? 'bg-gray-900' : 'bg-gray-50'">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <button
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-300"
          :class="isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
            : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200'"
          @click="router.push('/')"
        >
          <el-icon class="mr-2"><ArrowLeft /></el-icon>
          返回主页
        </button>
      </div>

      <div 
        class="rounded-xl overflow-hidden transition-all duration-500"
        :class="isDark 
          ? 'bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm'
          : 'bg-white border border-gray-200 backdrop-blur-sm shadow-lg'"
      >
        <div class="p-8">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold mb-3" :class="isDark ? 'text-white' : 'text-gray-900'">
                {{ prompt?.model }}
              </h2>
              <div class="flex items-center space-x-2">
                <span 
                  class="px-3 py-1 rounded-full text-xs transition-colors duration-300"
                  :class="isDark
                    ? 'bg-gray-700/50 text-gray-300'
                    : 'bg-gray-100 text-gray-600'"
                >
                  {{ prompt?.category?.name }}
                </span>
                <span 
                  v-if="prompt?.source"
                  class="px-3 py-1 rounded-full text-xs transition-colors duration-300"
                  :class="isDark
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-600'"
                >
                  来源: {{ prompt?.source }}
                </span>
              </div>
            </div>
          </div>
          <div 
            class="whitespace-pre-wrap mb-8 leading-relaxed"
            :class="isDark ? 'text-gray-300' : 'text-gray-600'"
          >
            {{ prompt?.content }}
          </div>
          <div>
            <h3 class="text-lg font-medium mb-4" :class="isDark ? 'text-white' : 'text-gray-900'">
              用途说明
            </h3>
            <div 
              class="whitespace-pre-wrap leading-relaxed"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >
              {{ prompt?.usage }}
            </div>
          </div>
          <div class="mt-8 pt-8 border-t flex items-center justify-between text-xs" 
            :class="isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'"
          >
            <div>创建于 {{ formatDate(prompt?.createTime) }}</div>
            <div>更新于 {{ formatDate(prompt?.updateTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const prompt = ref(null)
const loading = ref(false)
const error = ref('')

// 获取prompt详情
const fetchPrompt = async () => {
  try {
    loading.value = true
    const res = await axios.get(`/prompts/${route.params.id}`)
    prompt.value = res.data
  } catch (error) {
    ElMessage({
      message: '获取数据失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPrompt()
})
</script> 
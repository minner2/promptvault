<template>
  <div class="min-h-screen transition-colors duration-300" :class="isDark ? 'bg-gray-900' : 'bg-gray-50'">
    <!-- 顶部导航栏 -->
    <nav 
      class="sticky top-0 z-50 transition-colors duration-300 backdrop-blur-xl border-b" 
      :class="isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <span class="text-2xl font-bold" :class="isDark ? 'text-white' : 'text-gray-900'">
              Prompt Hub
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <button
              class="p-2 rounded-lg transition-colors duration-300"
              :class="isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'"
              @click="toggleTheme"
            >
              <el-icon v-if="isDark" class="text-gray-400 hover:text-gray-300 w-5 h-5">
                <Sunny />
              </el-icon>
              <el-icon v-else class="text-gray-600 hover:text-gray-800 w-5 h-5">
                <Moon />
              </el-icon>
            </button>
            <el-button 
              type="primary" 
              @click="router.push('/admin/login')"
            >
              管理后台
            </el-button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题 -->
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold mb-4" :class="isDark ? 'text-white' : 'text-gray-900'">
          探索 AI 提示词
        </h1>
        <p class="text-lg" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          发现和分享高质量的 AI 提示词
        </p>
      </div>

      <!-- 分类列表 -->
      <div class="mb-12">
        <div class="flex flex-wrap gap-4">
          <button
            class="px-6 py-2 rounded-lg text-sm transition-all duration-300"
            :class="!selectedCategory 
              ? (isDark
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20')
              : (isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:shadow-lg hover:shadow-gray-800/20'
                : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:shadow-lg')"
            @click="selectCategory(null)"
          >
            全部提示词
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="px-6 py-2 rounded-lg text-sm transition-all duration-300"
            :class="selectedCategory === category.id
              ? (isDark
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20')
              : (isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:shadow-lg hover:shadow-gray-800/20'
                : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:shadow-lg')"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Prompt列表 -->
      <div class="mb-8">
        <div v-if="loading" class="flex justify-center items-center py-12">
          <el-loading />
        </div>
        
        <div v-else-if="filteredPrompts.length === 0" class="text-center py-12">
          <div :class="isDark ? 'text-gray-400' : 'text-gray-600'">
            暂无提示词
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="prompt in filteredPrompts"
            :key="prompt.id"
            class="group rounded-xl overflow-hidden transition-all duration-500 relative transform hover:-translate-y-1"
            :class="isDark 
              ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/5'
              : 'bg-white hover:bg-white border border-gray-200 backdrop-blur-sm hover:shadow-2xl hover:shadow-gray-300/50'"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <el-tooltip
                  :content="prompt.model"
                  placement="top"
                  :show-after="500"
                >
                  <h3 
                    class="text-lg font-medium truncate max-w-[200px]" 
                    :class="isDark ? 'text-white' : 'text-gray-900'"
                  >
                    {{ prompt.model }}
                  </h3>
                </el-tooltip>
                <div class="flex items-center space-x-2">
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-sm transition-all duration-300 rounded-lg"
                    :class="isDark
                      ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-gray-100/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'"
                    @click.stop="showUsage(prompt)"
                  >
                    <el-icon class="mr-1"><Document /></el-icon>
                    用途说明
                  </button>
                  <button
                    class="inline-flex items-center px-3 py-1.5 text-sm transition-all duration-300 rounded-lg"
                    :class="isDark
                      ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-gray-100/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'"
                    @click.stop="sharePrompt(prompt.id)"
                  >
                    <el-icon class="mr-1"><Share /></el-icon>
                    分享
                  </button>
                </div>
              </div>
              <div 
                class="h-32 overflow-hidden cursor-pointer transition-colors duration-300 mb-4"
                :class="isDark ? 'text-gray-300' : 'text-gray-600'"
                @click="viewPrompt(prompt.id)"
              >
                <p class="line-clamp-4">{{ prompt.content }}</p>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span 
                    class="px-3 py-1 rounded-full text-xs transition-colors duration-300"
                    :class="isDark
                      ? 'bg-gray-700/50 text-gray-300'
                      : 'bg-gray-100 text-gray-600'"
                  >
                    {{ getCategoryName(prompt.categoryId) }}
                  </span>
                  <span 
                    v-if="prompt.source"
                    class="px-3 py-1 rounded-full text-xs transition-colors duration-300 flex items-center gap-1 max-w-[200px] group cursor-pointer"
                    :class="isDark
                      ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                    @click.stop="handleSourceClick(prompt.source)"
                  >
                    <span class="whitespace-nowrap">来源：</span>
                    <span class="truncate">
                      {{ formatSource(prompt.source) }}
                    </span>
                    <el-icon class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link />
                    </el-icon>
                  </span>
                </div>
                <button
                  class="inline-flex items-center text-xs transition-all duration-300 hover:translate-x-1"
                  :class="isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'"
                  @click="viewPrompt(prompt.id)"
                >
                  查看详情
                  <el-icon class="ml-1"><ArrowRight /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 用途说明弹窗 -->
    <el-dialog
      v-model="usageDialogVisible"
      width="500px"
      :modal-class="isDark ? '!bg-gray-900/80 backdrop-blur' : '!bg-gray-50/80 backdrop-blur'"
      :close-on-click-modal="true"
      destroy-on-close
      class="usage-dialog"
    >
      <template #title>
        <div class="truncate max-w-[400px]">{{ selectedPrompt?.model }}</div>
      </template>
      <div class="p-4 rounded-lg" :class="isDark ? 'bg-gray-800' : 'bg-white'">
        <div class="whitespace-pre-wrap" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
          {{ selectedPrompt?.usage }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Sunny, Moon, Document, Share, ArrowRight, Link } from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'

const router = useRouter()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const toggleTheme = themeStore.toggleTheme

const categories = ref([])
const prompts = ref([])
const loading = ref(false)
const selectedCategory = ref(null)
const usageDialogVisible = ref(false)
const selectedPrompt = ref(null)

// 获取分类数据
const fetchCategories = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/categories')
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类数据失败')
  }
}

// 获取Prompts
const fetchPrompts = async () => {
  try {
    loading.value = true
    const res = await axios.get('http://localhost:3000/api/prompts')
    prompts.value = res.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的prompts
const filteredPrompts = computed(() => {
  if (!selectedCategory.value) return prompts.value
  return prompts.value.filter(p => p.categoryId === selectedCategory.value)
})

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

// 查看prompt详情
const viewPrompt = (promptId) => {
  router.push(`/prompt/${promptId}`)
}

// 显示用途
const showUsage = (prompt) => {
  selectedPrompt.value = prompt
  usageDialogVisible.value = true
}

// 分享prompt
const sharePrompt = async (promptId) => {
  const shareUrl = `${window.location.origin}/share/${promptId}`
  try {
    await navigator.clipboard.writeText(shareUrl)
    ElMessage({
      message: '分享链接已复制到剪贴板',
      type: 'success'
    })
  } catch (error) {
    ElMessage({
      message: '复制失败',
      type: 'error'
    })
    console.error('复制失败:', error)
  }
}

// 格式化来源显示
const formatSource = (source) => {
  try {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const url = new URL(source)
      return url.hostname.replace(/^www\./, '')
    }
    return source
  } catch {
    return source
  }
}

// 处理来源点击
const handleSourceClick = (source) => {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    window.open(source, '_blank')
  } else {
    ElMessage.info('不是有效的链接')
  }
}

onMounted(() => {
  fetchCategories()
  fetchPrompts()
})
</script>

<style>
/* 重写 Element Plus 弹窗动画 */
.usage-dialog {
  @apply !bg-transparent !border-none;
}

.usage-dialog .el-dialog {
  margin-top: 15vh !important;
  transform: none !important;
  transition: opacity 0.3s ease-in-out !important;
}

.usage-dialog .el-overlay {
  @apply backdrop-blur-sm;
  transition: opacity 0.3s ease-in-out !important;
}

.el-dialog__header {
  @apply !p-4 !mb-0 !border-b;
  @apply dark:!border-gray-700;
}

.el-dialog__headerbtn {
  @apply !top-4 !right-4;
}

.el-dialog__title {
  @apply !text-lg !font-medium;
  @apply dark:!text-white;
}

.el-dialog__body {
  @apply !p-0;
}

/* 移除原有的动画类 */
.el-overlay-dialog {
  animation: none !important;
}

.el-dialog {
  animation: none !important;
}
</style> 
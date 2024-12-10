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
              PROMPT VAULT
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
      <!-- 标题和搜索区域 -->
      <div class="text-center mb-16">
        <h1 
          class="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"
        >
           探索 AI 提示词
        </h1>
        <p class="text-xl mb-12" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
          发现和分享高质量的 AI 提示词，让创作更加高效
        </p>
        <!-- 搜索栏 -->
        <div class="max-w-3xl mx-auto relative group">
          <div 
            class="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            :class="isDark ? 'opacity-30 group-hover:opacity-40' : 'opacity-20 group-hover:opacity-30'"
          ></div>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full px-8 py-6 text-lg rounded-2xl transition-all duration-300 outline-none shadow-lg"
              :class="isDark 
                ? 'bg-gray-800/80 text-white placeholder-gray-500 border border-gray-700/50 focus:border-blue-500/50'
                : 'bg-white/80 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500/30'"
              placeholder="搜索提示词、内容或使用说明..."
              @input="handleSearch"
            />
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span 
                class="text-sm px-2 py-1 rounded"
                :class="isDark ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-100'"
              >
                {{ filteredPrompts.length }} 个结果
              </span>
              <el-icon 
                class="w-6 h-6"
                :class="isDark ? 'text-gray-400' : 'text-gray-500'"
              >
                <Search />
              </el-icon>
            </div>
          </div>
        </div>
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
                <div class="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    class="inline-flex items-center px-2.5 py-1.5 text-sm transition-all duration-300 rounded-lg whitespace-nowrap"
                    :class="isDark
                      ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
                      : 'bg-gray-100/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'"
                    @click.stop="showUsage(prompt)"
                  >
                    <el-icon class="mr-1"><Document /></el-icon>
                    用途
                  </button>
                  <button
                    class="inline-flex items-center px-2.5 py-1.5 text-sm transition-all duration-300 rounded-lg whitespace-nowrap"
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
                <div class="flex items-center gap-2 flex-wrap">
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
                  class="inline-flex items-center text-xs transition-all duration-300 hover:translate-x-1 flex-shrink-0 ml-2"
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
      :show-close="false"
      :append-to-body="true"
      destroy-on-close
      class="usage-dialog"
    >
      <template #header>
        <div class="flex items-center justify-between p-4">
          <el-tooltip
            :content="selectedPrompt?.model"
            placement="top"
            :show-after="500"
          >
            <h3 class="text-lg font-medium truncate max-w-[360px]" :class="isDark ? 'text-white' : 'text-gray-900'">
              {{ selectedPrompt?.model }}
            </h3>
          </el-tooltip>
          <button
            class="rounded-lg p-1 transition-colors duration-200 hover:bg-gray-500/10"
            @click="usageDialogVisible = false"
          >
            <el-icon class="w-5 h-5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
              <Close />
            </el-icon>
          </button>
        </div>
      </template>
      <div 
        class="p-6 rounded-lg" 
        :class="isDark ? 'bg-gray-800/50' : 'bg-gray-50'"
      >
        <div 
          class="whitespace-pre-wrap" 
          :class="isDark ? 'text-gray-300' : 'text-gray-600'"
        >
          {{ selectedPrompt?.usage || '暂无使用说明' }}
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end p-4 border-t" :class="isDark ? 'border-gray-700' : 'border-gray-200'">
          <el-button @click="usageDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button
        v-show="showBackToTop"
        class="fixed right-6 bottom-6 p-3 rounded-xl shadow-lg transition-all duration-300 backdrop-blur-sm"
        :class="isDark 
          ? 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-400 hover:text-gray-300' 
          : 'bg-white/80 hover:bg-gray-50/80 text-gray-600 hover:text-gray-800'"
        @click="scrollToTop"
      >
        <el-icon class="w-5 h-5">
          <CaretTop />
        </el-icon>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Sunny, Moon, Document, Share, ArrowRight, Link, Close, Search, CaretTop } from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'
import axios from 'axios'
import { debounce } from 'lodash-es'

const router = useRouter()
const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)
const toggleTheme = themeStore.toggleTheme

const categories = ref([])
const prompts = ref([])
const allPrompts = ref([]) // 存储所有原始数据
const loading = ref(false)
const selectedCategory = ref(null)
const usageDialogVisible = ref(false)
const selectedPrompt = ref(null)
const searchQuery = ref('')

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
    allPrompts.value = res.data // 保存原始数据
    prompts.value = res.data
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 过滤后的prompts
const filteredPrompts = computed(() => {
  let filtered = allPrompts.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.model.toLowerCase().includes(query) || 
      p.content.toLowerCase().includes(query) ||
      p.usage?.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.categoryId === selectedCategory.value)
  }

  return filtered
})

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

// 处理搜索
const handleSearch = debounce(() => {
  prompts.value = filteredPrompts.value
}, 300)

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  prompts.value = filteredPrompts.value
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

// 回到顶部功能
const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  fetchCategories()
  fetchPrompts()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
/* 重写 Element Plus 弹窗样式 */
.usage-dialog {
  @apply !bg-transparent !border-none;
}

.usage-dialog .el-dialog {
  @apply !rounded-xl overflow-hidden !border !shadow-2xl transition-all duration-300;
}

.usage-dialog .el-dialog__header {
  @apply !p-0 !m-0 !border-b-0;
}

.usage-dialog .el-dialog__headerbtn {
  @apply !hidden;  /* 隐藏默认的关闭按钮 */
}

.usage-dialog .el-dialog__body {
  @apply !p-0;
}

.usage-dialog .el-dialog__footer {
  @apply !p-0 !mt-0;
}

.dark .usage-dialog .el-dialog {
  @apply !bg-gray-800/95 !border-gray-700;
}

.usage-dialog .el-dialog {
  @apply !bg-white/95 !border-gray-200;
}

.usage-dialog .el-overlay {
  @apply backdrop-blur-sm;
  transition: opacity 0.3s ease-in-out !important;
}

/* 移除原有的动画类 */
.el-overlay-dialog {
  animation: none !important;
}

.el-dialog {
  animation: none !important;
}

/* 回到顶部按钮动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 
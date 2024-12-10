<template>
  <div class="min-h-screen bg-gray-100">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="bg-white shadow">
        <div class="p-4">
          <h2 class="text-xl font-bold text-gray-800">Prompt Manage</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="border-0"
          @select="handleSelect"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/prompts">
            <el-icon><Document /></el-icon>
            <span>Prompt 管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Collection /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部栏 -->
        <el-header class="bg-white shadow flex items-center justify-between px-4">
          <div class="text-lg font-medium text-gray-800">
            {{ getPageTitle() }}
          </div>
          <div class="flex items-center">
            <el-button type="primary" @click="goToHome">
              前台首页
            </el-button>
            <el-button type="danger" @click="handleLogout" class="ml-4">
              退出登录
            </el-button>
          </div>
        </el-header>

        <!-- 主要内容区 -->
        <el-main class="p-6">
          <router-view v-if="isAdmin" />
          <div v-else class="flex justify-center items-center h-full">
            <el-empty description="请先登录" />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, Document, Collection } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const isAdmin = ref(false)

const activeMenu = computed(() => route.path)

const getPageTitle = () => {
  switch (route.path) {
    case '/admin/dashboard':
      return '仪表盘'
    case '/admin/prompts':
      return 'Prompt 管理'
    case '/admin/categories':
      return '分类管理'
    default:
      return ''
  }
}

const handleSelect = (index) => {
  router.push(index)
}

const goToHome = () => {
  router.push('/')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    await axios.post('/admin/logout', {}, {
      withCredentials: true
    })
    isAdmin.value = false
    router.push('/admin/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出登录失败')
    }
  }
}

const checkAdminStatus = async () => {
  try {
    const res = await axios.get('/admin/check', {
      withCredentials: true
    })
    isAdmin.value = res.data.isAdmin
    if (!isAdmin.value && route.path !== '/admin/login') {
      router.push('/admin/login')
    }
  } catch (error) {
    console.error('检查登录状态失败:', error)
    router.push('/admin/login')
  }
}

onMounted(() => {
  checkAdminStatus()
})
</script>

<style scoped>
.el-aside {
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.el-container:nth-child(2) {
  margin-left: 200px;
}

.el-header {
  height: 60px;
  line-height: 60px;
}
</style> 
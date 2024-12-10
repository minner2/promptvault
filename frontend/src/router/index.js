import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/category/:id',
      component: () => import('../views/Category.vue')
    },
    {
      path: '/prompt/:id',
      component: () => import('../views/Prompt.vue')
    },
    {
      path: '/share/:id',
      component: () => import('../views/Share.vue')
    },
    {
      path: '/admin/login',
      component: () => import('../views/admin/Login.vue')
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: 'dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'prompts',
          component: () => import('../views/admin/Prompts.vue')
        },
        {
          path: 'categories',
          component: () => import('../views/admin/Categories.vue')
        }
      ]
    }
  ]
})

export default router 
import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
  document.title = `${to.meta.title || ''} - ${import.meta.env.VITE_APP_TITLE}`.replace(/^ - /, '')

  if (to.meta.public) {
    if (to.path === '/login' && store.getters['user/token']) {
      next({ path: '/' })
      return
    }
    next()
    return
  }

  if (!store.getters['user/token']) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (!store.getters['user/userInfo']) {
    try {
      await store.dispatch('user/getInfo')
    } catch {
      await store.dispatch('user/resetToken')
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router

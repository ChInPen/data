import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { guard } from './guards'
import { getMenuRouter } from './menu'

const menus = getMenuRouter()

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: '登入',
    component: () => import('@/views/Login/login.vue')
  },
  {
    path: '/menu',
    name: '選單',
    component: () => import('@/views/Menu/menu.vue'),
    meta: { requiresAuth: true }, //需要登入
    children: menus
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  guard(to, from, next)
})

export default router

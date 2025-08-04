import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { getToken } from '@/utils/auth'

/**
 * 路由檢查
 * @param to 目標路由
 * @param from 來源路由
 */
export const guard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const token = getToken()

  if (token) {
    if (to.path === '/login') {
      // 已登入，還想進 login，導向主頁
      next('/menu')
    } else {
      next()
    }
  } else {
    if (requiresAuth) {
      // 沒登入又想進受保護頁，導去 login
      next('/login')
    } else {
      next()
    }
  }
}

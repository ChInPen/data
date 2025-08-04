import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { getToken } from '@/utils/auth'

/**
 * 路由檢查
 * @param to 目標路由
 * @param from 來源路由
 */
export const guard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const token = getToken()

  const isInvalidFrom = () => {
    //非 menu 中 router 判斷來源是否合法
    const expected = to?.meta?.from as string | string[] | undefined
    const fromPath = from.path

    if (!expected) return false
    if (fromPath === '/') return false
    if (typeof expected === 'string') return fromPath !== expected
    if (Array.isArray(expected) && expected.length > 0) return !expected.includes(fromPath)

    console.error('type of "to.meta.from" is not string or string[]:', expected)
    return true
  }

  if (token) {
    if (to.path === '/login') {
      // 已登入，還想進 login，導向主頁
      next('/menu')
    } else {
      if (isInvalidFrom()) {
        // 不符合指定來源，取消導航回到原頁面
        console.error('router is invalid')
        next(false)
      } else {
        next()
      }
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

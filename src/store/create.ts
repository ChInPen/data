import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

export const createCrudStore = <K extends string>(options: {
  id: string // store id
  keyName: K // 主鍵名稱 (empno/custno...)
  path1: string // 清單頁 path
  path2: string // 表單頁 path
  persist?: {
    // 可選 persist 參數
    key: string
    storage: Storage
  }
}) => {
  return defineStore(options.id, {
    state: () => ({
      [options.keyName]: '' as string,
      action: 'detail' as 'edit' | 'create' | 'copy' | 'detail'
    }),
    getters: {
      path1: () => options.path1,
      path2: () => options.path2,
      keyDisabled: (state) => !['create', 'copy'].includes(state.action),
      isDetail: (state) => !['edit', 'create', 'copy'].includes(state.action),
      actionName: (state) => {
        switch (state.action) {
          case 'edit':
            return '編輯'
          case 'copy':
            return '複製'
          case 'create':
            return '新增'
          default:
            return '瀏覽'
        }
      }
    },
    actions: {
      create(router?: Router) {
        this[options.keyName] = '' as any
        this.action = 'create'
        router?.push(this.path2)
      },
      edit(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'edit'
        router?.push(this.path2)
      },
      copy(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'copy'
        router?.push(this.path2)
      },
      browse(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'detail'
        router?.push(this.path2)
      },
      clear(router?: Router) {
        this[options.keyName] = '' as any
        this.action = 'detail'
        router?.push(this.path1)
      }
    },
    ...(options.persist ? { persist: options.persist } : {})
  })
}

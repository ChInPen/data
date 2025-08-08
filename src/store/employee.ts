import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

const storeName = 'employee-store'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    empno: '',
    action: 'detail' as 'edit' | 'create' | 'copy' | 'detail'
  }),
  getters: {
    path1: () => '/menu/Employee',
    path2: () => '/menu/EmployeeForm',
    keyDisabled: (state) => !['create', 'copy'].includes(state.action),
    isDetail: (state) => !['edit', 'create', 'copy'].includes(state.action),
    actionName: (state) => {
      let acname = ''
      switch (state.action?.toLowerCase()) {
        case 'edit':
          acname = '編輯'
          break
        case 'detail':
          acname = '瀏覽'
          break
        case 'copy':
          acname = '複製'
          break
        default:
          acname = '新增'
          break
      }
      return acname
    }
  },
  actions: {
    create(router?: Router) {
      this.empno = ''
      this.action = 'create'
      router?.push(this.path2)
    },
    edit(empno: string, router?: Router) {
      this.empno = empno
      this.action = 'edit'
      router?.push(this.path2)
    },
    copy(empno: string, router?: Router) {
      this.empno = empno
      this.action = 'copy'
      router?.push(this.path2)
    },
    browse(empno: string, router?: Router) {
      this.empno = empno
      this.action = 'detail'
      router?.push(this.path2)
    },
    clear(router?: Router) {
      this.empno = ''
      this.action = 'detail'
      router?.push(this.path1)
    }
  },
  persist: {
    key: storeName,
    storage: localStorage
  }
})

import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    empno: '',
    action: 'detail' as 'edit' | 'create' | 'copy' | 'detail',
    path1: '/menu/Employee',
    path2: '/menu/EmployeeForm'
  }),
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
    clear() {
      this.empno = ''
      this.action = 'detail'
    },
    actionName() {
      let acname = ''
      switch (this.action?.toLowerCase()) {
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
  }
})

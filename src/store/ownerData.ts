import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

const storeName = 'owner-data-store'

export const useOwnerDataStore = defineStore('ownerData', {
  state: () => ({
    custno: '',
    action: 'detail' as 'edit' | 'create' | 'copy' | 'detail'
  }),
  getters: {
    path1: () => '/menu/OwnerData',
    path2: () => '/menu/OwnerDataForm',
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
      this.custno = ''
      this.action = 'create'
      router?.push(this.path2)
    },
    edit(custno: string, router?: Router) {
      this.custno = custno
      this.action = 'edit'
      router?.push(this.path2)
    },
    copy(custno: string, router?: Router) {
      this.custno = custno
      this.action = 'copy'
      router?.push(this.path2)
    },
    browse(custno: string, router?: Router) {
      this.custno = custno
      this.action = 'detail'
      router?.push(this.path2)
    },
    clear(router?: Router) {
      this.custno = ''
      this.action = 'detail'
      router?.push(this.path1)
    }
  },
  persist: {
    key: storeName,
    storage: localStorage
  }
})

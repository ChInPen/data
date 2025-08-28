import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useConstructionStore = createCrudStore<'protno'>({
  id: 'construction',
  keyName: 'protno',
  path1: '/menu/Construction',
  path2: '/menu/ConstructionForm',
  persist: {
    key: 'construction-data-store',
    storage: localStorage
  }
})

import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useOwnerDataStore = createCrudStore<'custno'>({
  id: 'ownerData',
  keyName: 'custno',
  path1: '/menu/OwnerData',
  path2: '/menu/OwnerDataForm',
  persist: {
    key: 'owner-data-store',
    storage: localStorage
  }
})

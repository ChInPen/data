import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useMaterialDataStore = createCrudStore<'itemno'>({
  id: 'materialData',
  keyName: 'itemno',
  path1: '/menu/MaterialData',
  path2: '/menu/MaterialDataForm',
  persist: {
    key: 'material-data-store',
    storage: localStorage
  }
})

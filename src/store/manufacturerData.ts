import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useManufacturerDataStore = createCrudStore<'suppno'>({
  id: 'manufacturerData',
  keyName: 'suppno',
  path1: '/menu/ManufacturerData',
  path2: '/menu/ManufacturerDataForm',
  persist: {
    key: 'manufacturer-data-store',
    storage: localStorage
  }
})

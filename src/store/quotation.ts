import { createDocStore } from './create'

/* createDocStore() 是已經定義好格式的 defineStore() */
export const useQuotationStore = createDocStore<'index1'>({
  id: 'quotation',
  keyName: 'index1',
  path1: '/menu/Quotation',
  path2: '/menu/QuotationSearch'
  // persist: {
  //   key: 'quotation-store',
  //   storage: localStorage
  // }
})

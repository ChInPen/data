import { createDocStore } from './create'

/* createDocStore() 是已經定義好格式的 defineStore() */
export const useQuotationInvStore = createDocStore<'ono'>({
  id: 'quotationinv',
  keyName: 'ono',
  path1: '/menu/QuotationInv',
  path2: '/menu/QuotationInvSearch'
  // persist: {
  //   key: 'quotation-store',
  //   storage: localStorage
  // }
})

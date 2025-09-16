import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useEmpLoanStore = createCrudStore<'bno'>({
  id: 'emp-loan',
  keyName: 'bno',
  path1: '/menu/EmpLoan',
  path2: '/menu/EmpLoanForm',
  persist: {
    key: 'emp-loan-store',
    storage: localStorage
  }
})

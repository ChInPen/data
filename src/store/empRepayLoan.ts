import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useEmpRepayLoanStore = createCrudStore<'bno'>({
  id: 'emp-repay-loan',
  keyName: 'bno',
  path1: '/menu/EmpRepayLoan',
  path2: '/menu/EmpRepayLoanForm',
  persist: {
    key: 'emp-repay-loan-store',
    storage: localStorage
  }
})

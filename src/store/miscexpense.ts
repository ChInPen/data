import { createDocStore } from './create'

/* createDocStore() 是已經定義好格式的 defineStore() */
export const useMiscExpenseStore = createDocStore<'ono'>({
  id: 'miscExpense',
  keyName: 'ono',
  path1: '/menu/MiscExpense',
  path2: '/menu/MiscExpenseSearch'
  // persist: {
  //   key: 'misc-expense-store',
  //   storage: localStorage
  // }
})

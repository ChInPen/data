import { createCrudStore } from './create'

/* createCrudStore() 是已經定義好格式的 defineStore() */
export const useEmployeeStore = createCrudStore<'empno'>({
  id: 'employee',
  keyName: 'empno',
  path1: '/menu/Employee',
  path2: '/menu/EmployeeForm',
  persist: {
    key: 'employee-store',
    storage: localStorage
  }
})

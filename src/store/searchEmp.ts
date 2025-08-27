import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchEmp/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchEmp = createSearchStore<SearchData>('searchEmp')

import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchSupp/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchSupp = createSearchStore<SearchData>('searchSupp')

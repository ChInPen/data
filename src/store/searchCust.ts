import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchCust/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchCust = createSearchStore<SearchData>('searchCust')

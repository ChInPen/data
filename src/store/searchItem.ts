import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchItem/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchItem = createSearchStore<SearchData>('searchItem')

import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchPurPord/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchPurPord = createSearchStore<SearchData>('searchPurPord')

import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchProt/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchProt = createSearchStore<SearchData>('searchProt')

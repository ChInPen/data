import { createSearchStore } from './create'
import type { SearchData } from '@/components/SearchSkill/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const useSearchSkill = createSearchStore<SearchData>('searchSkill')

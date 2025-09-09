import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickSKind/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickSKind = createSearchStore<SearchData>('pickSKind')

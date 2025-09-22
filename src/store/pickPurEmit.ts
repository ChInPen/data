import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickPurEmit/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickPurEmit = createSearchStore<SearchData>('PickPurEmit')

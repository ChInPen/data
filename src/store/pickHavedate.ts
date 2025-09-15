import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickHavedate/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickHavedate = createSearchStore<SearchData>('pickHavedate')

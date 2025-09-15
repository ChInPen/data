import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickMemo/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickMemo = createSearchStore<SearchData>('pickMemo')

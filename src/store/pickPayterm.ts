import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickPayterm/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickPayterm = createSearchStore<SearchData>('pickPayterm')

import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickPurPord/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickPurPord = createSearchStore<SearchData>('PickPurPord')

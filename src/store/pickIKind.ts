import { createSearchStore } from './create'
import type { SearchData } from '@/components/PickIKind/type'

/* createSearchStore() 是已經定義好格式的 defineStore() */
export const usePickIKind = createSearchStore<SearchData>('pickIKind')

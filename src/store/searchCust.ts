import { defineStore } from 'pinia'
import type { SearchData } from '@/components/SearchCust/type'

type PickSetting = {
  from: keyof SearchData
  to: string
  valueType?: 'string' | 'number'
}

export const useSearchCust = defineStore('searchCust', {
  state: () => ({
    target: {} as { value?: any; row?: number },
    pickSetting: [] as PickSetting[],
    isSearch: false,
    searchText: ''
  }),
  actions: {
    set(ref: any, pickSetting: PickSetting[], options?: { row?: number; open?: Function }) {
      this.target.value = ref
      if (options?.row && typeof options.row === 'number') this.target.row = options.row
      this.pickSetting = pickSetting
      options?.open?.()
    },
    keyEnter(
      e: KeyboardEvent,
      ref: any,
      pickSetting: PickSetting[],
      searchText: string,
      options?: { row?: number; open?: Function }
    ) {
      // 如果還在輸入法組字中，就不要攔截
      if (e.isComposing) return
      // 如果沒輸入就 return
      if (!searchText || !searchText?.trim()) return

      if (e.key === 'Enter') {
        this.set(ref, pickSetting, options)
        this.isSearch = true
        this.searchText = searchText
        options?.open?.()
      }
    },
    pick(data: any) {
      if (!this.target?.value) return

      this.pickSetting.forEach((setting) => {
        let fromVal = data?.[setting.from] ?? ''
        if (setting?.valueType === 'string') fromVal = String(fromVal)
        else if (setting?.valueType === 'number') fromVal = Number(fromVal)

        if (this.target?.row && typeof this.target.row === 'number') {
          if (Array.isArray(this.target.value) && this.target.row < this.target.value.length) {
            if (setting.to in this.target.value[this.target.row]) {
              this.target.value[this.target.row][setting.to] = fromVal
            }
          }
        } else {
          if (setting.to in this.target.value) this.target.value[setting.to] = fromVal
        }
      })
    },
    clear() {
      this.target = {}
      this.pickSetting = []
      this.isSearch = false
      this.searchText = ''
    }
  }
})

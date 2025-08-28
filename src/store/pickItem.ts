import { defineStore } from 'pinia'
import { GeneratePickObj, type PickSetting } from './create'
import type { SearchData } from '@/components/PickItem/type'

type SetOptions = {
  row?: number
  open?: Function
  mode?: 'add' | 'insert'
  empty?: { [key: string]: any }
}

export const usePickItem = defineStore('pickItem', {
  state: () => ({
    target: {} as { value?: any[]; row?: number },
    pickSetting: [] as PickSetting<SearchData>[],
    mode: 'add' as 'add' | 'insert',
    empty: {} as { [key: string]: any },
    temp: '' as any //給父層暫存任何狀態
  }),
  actions: {
    set(ref: any, pickSetting: PickSetting<SearchData>[], options?: SetOptions) {
      this.target.value = ref
      if (typeof options?.row === 'number') this.target.row = options.row
      this.pickSetting = pickSetting
      if (options?.mode && ['add', 'insert'].includes(options.mode)) this.mode = options.mode
      if (options?.empty) this.empty = options.empty
      options?.open?.()
    },
    pick(data: any[]) {
      if (!this.target?.value) return
      if (!Array.isArray(this.target.value)) return //基本一定要是陣列
      if (this.mode === 'insert' && typeof this.target?.row !== 'number') return //做行插入一定要有 row

      if (data && Array.isArray(data)) {
        let currentRow = this.mode === 'insert' ? (this.target.row as number) : 0
        data.forEach((choose, index) => {
          const pickObj = GeneratePickObj([...this.pickSetting], { ...choose })
          if (this.mode === 'insert') {
            // mode 為插入時
            if (index === 0) {
              this.target.value![currentRow] = { ...this.target.value![currentRow], ...pickObj }
            } else {
              this.target.value?.splice(currentRow, 0, { ...this.empty, ...pickObj })
            }
            currentRow++
          } else {
            // mode 為新增時
            this.target.value?.push({ ...this.empty, ...pickObj })
          }
        })
      }
    },
    clear() {
      this.target = {}
      this.pickSetting = []
      this.mode = 'add'
      this.empty = {}
      this.temp = ''
    }
  }
})

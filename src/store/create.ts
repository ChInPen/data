import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

/* 建立查詢頁和明細頁之間的狀態控制 store 方法 (用 persist 可將狀態存至 storage) */
export const createCrudStore = <K extends string>(options: {
  id: string // store id
  keyName: K // 主鍵名稱 (empno/custno...)
  path1: string // 清單頁 path
  path2: string // 表單頁 path
  persist?: {
    // 可選 persist 參數
    key: string
    storage: Storage
  }
}) => {
  return defineStore(options.id, {
    state: () => ({
      [options.keyName]: '' as string,
      action: 'detail' as 'edit' | 'create' | 'copy' | 'detail'
    }),
    getters: {
      path1: () => options.path1,
      path2: () => options.path2,
      keyDisabled: (state) => !['create', 'copy'].includes(state.action),
      isDetail: (state) => !['edit', 'create', 'copy'].includes(state.action),
      actionName: (state) => {
        switch (state.action) {
          case 'edit':
            return '編輯'
          case 'copy':
            return '複製'
          case 'create':
            return '新增'
          default:
            return '瀏覽'
        }
      }
    },
    actions: {
      create(router?: Router) {
        this[options.keyName] = '' as any
        this.action = 'create'
        router?.push(this.path2)
      },
      edit(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'edit'
        router?.push(this.path2)
      },
      copy(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'copy'
        router?.push(this.path2)
      },
      browse(value: string, router?: Router) {
        this[options.keyName] = value as any
        this.action = 'detail'
        router?.push(this.path2)
      },
      clear(router?: Router) {
        this[options.keyName] = '' as any
        this.action = 'detail'
        router?.push(this.path1)
      }
    },
    ...(options.persist ? { persist: options.persist } : {})
  })
}

/* 建立查詢彈窗與輸入框的互動狀態 */
export type PickSetting<T = unknown> = {
  from: unknown extends T ? string : keyof T
  to: string
  valueType?: 'string' | 'number'
}

type SetOption = { row?: number; open?: Function }

export const GeneratePickObj = <T = unknown>(settings: PickSetting<T>[], pickData: any) => {
  const obj: { [key: string]: any } = {}
  settings.forEach((setting) => {
    let fromVal = pickData?.[setting.from] ?? ''
    if (setting?.valueType === 'string') fromVal = String(fromVal)
    else if (setting?.valueType === 'number') fromVal = Number(fromVal)
    obj[setting.to] = fromVal
  })
  return obj
}

export const createSearchStore = <T extends Record<string, any> | undefined = undefined>(
  id: string
) => {
  return defineStore(id, {
    state: () => ({
      target: {} as { value?: any; row?: number },
      pickSetting: [] as PickSetting<T>[],
      isSearch: false,
      searchText: '',
      temp: '' as any //給父層暫存任何狀態
    }),
    actions: {
      set(ref: any, pickSetting: PickSetting<T>[], options?: SetOption) {
        this.target.value = ref
        if (typeof options?.row === 'number') this.target.row = options.row
        this.pickSetting = pickSetting as any[]
        options?.open?.()
      },
      keyEnter(
        e: KeyboardEvent,
        ref: any,
        pickSetting: PickSetting<T>[],
        searchText: string,
        options?: SetOption
      ) {
        // 如果還在輸入法組字中，就不要攔截
        if (e.isComposing) return
        // 如果沒輸入就 return
        if (!searchText || !searchText?.trim()) return

        if (e.key === 'Enter') {
          const { open, ...option } = options ?? {}
          this.set(ref, pickSetting, option)
          this.isSearch = true
          this.searchText = searchText
          open?.()
        }
      },
      pick(data: any) {
        if (!this.target?.value) return

        this.pickSetting.forEach((setting) => {
          let fromVal = data?.[setting.from] ?? ''
          if (setting?.valueType === 'string') fromVal = String(fromVal)
          else if (setting?.valueType === 'number') fromVal = Number(fromVal)

          if (typeof this.target.row === 'number') {
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
        this.temp = ''
      }
    }
  })
}

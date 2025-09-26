import { defineStore } from 'pinia'
import type { Router } from 'vue-router'
import { distinctBy } from '@/utils/ucommon'

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
  to?: string
  valueType?: 'string' | 'number'
}

type SetOption = { row?: number; open?: Function }

export const GeneratePickObj = <T = unknown>(settings: PickSetting<T>[], pickData: any) => {
  const obj: { [key: string]: any } = {}
  settings.forEach((setting) => {
    let fromVal = pickData?.[setting.from] ?? ''
    if (setting?.valueType === 'string') fromVal = String(fromVal)
    else if (setting?.valueType === 'number') fromVal = Number(fromVal)

    const to = (setting.to ?? setting.from) as string
    obj[to] = fromVal
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

        const pickObj = GeneratePickObj([...(this.pickSetting as any[])], { ...data })
        if (typeof this.target.row === 'number') {
          if (Array.isArray(this.target.value) && this.target.row < this.target.value.length) {
            this.target.value[this.target.row] = {
              ...this.target.value[this.target.row],
              ...pickObj
            }
          }
        } else {
          this.target.value = { ...this.target.value, ...pickObj }
        }
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

/**
 * 建立單據作業 - 查詢頁和明細頁之間的狀態控制 store 的方法
 * @param id store 的 id
 * @param keyName 主鍵名稱，如:empno/custno...
 * @param path1 表單頁的 router path
 * @param path2 清單頁的 router path
 * @param persist 可選 persist 參數，控制要不要存進 storage
 */
export const createDocStore = <K extends string>(options: {
  id: string //store id
  keyName: K //主鍵名稱，如:empno/custno...
  path1: string //表單頁 path
  path2: string //清單頁 path
  persist?: {
    // 可選 persist 參數
    key: string
    storage: Storage
  }
}) => {
  return defineStore(options.id, {
    state: () => ({
      [options.keyName]: '' as string,
      action: 'detail' as 'edit' | 'create' | 'copy' | 'detail' | 'search' | 'goback' | 'browse',
      list: [] as { [options.keyName]: string; [key: string]: any }[],
      filter: {} as any
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
      },
      /** 當前單據為首筆時，return true */
      isFirst: (state) => {
        const idx = state.list.findIndex((x) => x[options.keyName] === state[options.keyName])
        return idx === 0
      },
      /** 當前單據為尾筆時，return true */
      isLast: (state) => {
        const idx = state.list.findIndex((x) => x[options.keyName] === state[options.keyName])
        return idx === state.list.length - 1
      }
    },
    actions: {
      /** 表單頁初始化
       * @param list 單據清單，ex: [{ ono: '1' }, { ono: '2' }]
       */
      init(list: any[]) {
        // this.list = list
        this.list = distinctBy(list, (x) => x[options.keyName])
        if (this.list.length > 0) {
          // const lastItem = this.list[this.list.length - 1]
          // if (options.keyName in lastItem) this[options.keyName] = lastItem[options.keyName]
          const firstItem = this.list[0]
          if (options.keyName in firstItem) this[options.keyName] = firstItem[options.keyName]
        }
      },
      create() {
        this.action = 'create'
      },
      edit() {
        this.action = 'edit'
      },
      copy() {
        this.action = 'copy'
      },
      cancel() {
        this.action = 'detail'
      },
      /** 跳轉至清單頁
       * @param router 傳入 const router = useRouter() 的 router
       */
      browse(router: Router) {
        this[options.keyName] = '' as any
        this.filter = {}
        this.action = 'browse'
        router.push(this.path2)
      },
      delete(value: string) {
        this.list = this.list.filter((x) => x[options.keyName] !== value)
      },
      /** 表單頁查詢後，跳轉至清單頁
       * @param router 傳入 const router = useRouter() 的 router
       * @param filter 查詢條件
       */
      search(router: Router, filter: any) {
        this[options.keyName] = '' as any
        this.filter = filter
        this.action = 'search'
        router.push(this.path2)
      },
      /** 清單頁返回表單頁
       * @param router 傳入 const router = useRouter() 的 router
       * @param list 單據清單，ex: [{ ono: '1' }, { ono: '2' }]
       * @param value 可選參數，當有點選某一筆單據時，傳入該單據的鍵值
       */
      goback(router: Router, list: any[], value?: string) {
        // this.list = list
        this.list = distinctBy(list, (x) => x[options.keyName])
        if (value) {
          this[options.keyName] = value as any
        } else {
          this[options.keyName] = this.list[this.list.length - 1]?.[options.keyName] ?? ''
        }
        this.action = 'goback'
        router?.push(this.path1)
      },
      /** 切換至首筆 */
      first() {
        this[options.keyName] = this.list[0][options.keyName]
      },
      /** 切換至上一筆 */
      previous() {
        const idx = this.list.findIndex((x) => x[options.keyName] === this[options.keyName])
        if (idx > 0) {
          this[options.keyName] = this.list[idx - 1][options.keyName]
        }
      },
      /** 切換至下一筆 */
      next() {
        const idx = this.list.findIndex((x) => x[options.keyName] === this[options.keyName])
        if (idx < this.list.length - 1) {
          this[options.keyName] = this.list[idx + 1][options.keyName]
        }
      },
      /** 切換至尾筆 */
      last() {
        const idx = this.list.length - 1
        if (idx >= 0) {
          this[options.keyName] = this.list[idx][options.keyName]
        }
      }
    },
    ...(options.persist ? { persist: options.persist } : {})
  })
}

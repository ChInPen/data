<script lang="ts" setup generic="T extends Record<string, any>">
  import { ref, computed, watch } from 'vue'
  import type { PropType } from 'vue'

  const model = defineModel<T[]>({ default: [] })
  const props = defineProps({
    pageSize: {
      type: String,
      default: '10'
    },
    pageSizes: {
      type: Array as PropType<string[]>,
      default: ['10', '25', '50', '100', '全部']
    },
    showIndex: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Boolean,
      default: true
    },
    headerAlign: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start'
    },
    selectable: {
      type: Boolean,
      default: false
    },
    multiSelect: {
      type: Boolean,
      default: false
    }
  })
  //分頁屬性
  const currentPage = ref(1)
  const page = ref<string>(props.pageSize)
  const pages = ref<string[]>(props.pageSizes)
  const pageNum = computed(() => (page.value === '全部' ? model.value.length : Number(page.value)))
  const pageLenght = computed(() => {
    const quotient = pageNum.value ? Math.ceil(model.value.length / pageNum.value) : 1
    return quotient
  })
  const pageStart = computed(() => (currentPage.value - 1) * pageNum.value)
  //表格資料(僅當前頁資料)
  const tbDataShow = computed(() => {
    if (!props.pagination) {
      return model.value
    }
    return model.value.slice(pageStart.value, pageStart.value + pageNum.value) ?? []
  })
  //表頭 align
  const thAlign = computed(() => {
    return `header-${props.headerAlign}`
  })
  //選中行
  //存選中行的 index 陣列
  const selectIndexs = ref<number[]>([])
  //行被選中時根據是否多選判斷如何加入
  const handleRowSelect = (index: number) => {
    if (!props.multiSelect) selectIndexs.value = []
    if (!selectIndexs.value.includes(index)) selectIndexs.value.push(index)
  }
  //取得選中行的資料陣列
  const selectRow = computed<any[]>(() => {
    if (selectIndexs.value.length > 0) {
      return tbDataShow.value.filter((_, index) => selectIndexs.value.includes(index))
    }
    return []
  })
  //取得選中行的原始資料 index 陣列
  const modelSelectIndex = computed<number[]>(() => {
    if (selectRow.value.length > 0) {
      const findindexs = model.value.reduce((acc: number[], val, idx) => {
        if (selectRow.value.some((x) => x === val)) acc.push(idx)
        return acc
      }, [])
      return findindexs
    }
    return []
  })

  //監聽
  watch(
    () => currentPage.value,
    () => {
      //切換分頁就把 selectIndexs 重置
      selectIndexs.value = []
    }
  )
  watch(
    () => tbDataShow.value,
    (newVal: any[]) => {
      //過濾選中行的 index 陣列中，index 已超出顯示資料筆數的部分
      selectIndexs.value = selectIndexs.value.filter((x) => x < newVal.length)
    }
  )

  const handleKeydownArrow = (event: KeyboardEvent) => {
    // 只處理 input (textarea 是 HTMLTextAreaElement)
    if (!(event.target instanceof HTMLInputElement)) return
    const input = event.target
    // 不處理 readonly、disabled，不處理 checkbox、radio 等類型
    const notInputTypes = ['checkbox', 'radio', 'hidden', 'file', 'submit', 'reset', 'button']
    if (notInputTypes.includes(input.type) || input.readOnly || input.disabled) return

    const row = input.closest('tr')
    if (!row) return
    const td = input.closest('td')
    if (!td) return

    // 找下一格輸入框的判斷標準 (input、textarea)
    const canInput = (el: Element) => {
      if (el instanceof HTMLTextAreaElement) {
        return !el.readOnly && !el.disabled
      }
      if (el instanceof HTMLInputElement) {
        return !notInputTypes.includes(el.type) && !el.readOnly && !el.disabled
      }
      return false
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      const tds = Array.from(row?.children ?? [])
      const colIndex = tds.indexOf(td) // 第幾欄（從 0 開始）

      // 行上下移動
      const targetRow =
        event.key === 'ArrowDown'
          ? (row.nextElementSibling as HTMLTableRowElement)
          : (row.previousElementSibling as HTMLTableRowElement)

      if (targetRow) {
        const targetTd = targetRow.children[colIndex]
        const sameColumnInput = targetTd?.querySelector('input, textarea') as
          | HTMLInputElement
          | HTMLTextAreaElement

        if (canInput(sameColumnInput)) sameColumnInput.focus()
        targetRow.click()
      }
    }
  }

  defineExpose({
    get selected() {
      return selectRow.value
    },
    get selectIndex() {
      return modelSelectIndex.value
    }
  })
</script>

<template>
  <v-table v-bind="$attrs" class="c-table" @keydown="handleKeydownArrow">
    <template v-slot:default>
      <thead v-if="$slots.head">
        <tr :class="[thAlign]">
          <th v-show="showIndex" width="60" class="text-center">#</th>
          <slot name="head"></slot>
        </tr>
      </thead>

      <tbody v-if="$slots.body">
        <tr
          v-for="(item, index) in tbDataShow"
          :key="`tb-row-${index}`"
          @click="selectable ? handleRowSelect(index) : null"
          :class="selectIndexs.includes(index) ? 'tr-selected' : ''"
        >
          <td v-show="showIndex" class="text-center">{{ pageStart + index + 1 }}</td>
          <slot name="body" :scope="item" :index="pageStart + index"></slot>
        </tr>
      </tbody>

      <tfoot v-if="$slots.foot">
        <tr>
          <td v-show="showIndex"><!--對應 index 欄--></td>
          <slot name="foot"></slot>
        </tr>
      </tfoot>
    </template>

    <template v-slot:bottom>
      <v-row
        v-if="pagination"
        no-gutters
        justify="end"
        class="py-2 pe-4 tb-pagination align-items-center"
      >
        <v-col cols="auto me-3">每頁筆數</v-col>
        <v-col cols="auto">
          <v-select
            v-model="page"
            :items="pages"
            variant="outlined"
            density="compact"
            :list-props="{ bgColor: 'white' }"
          ></v-select>
        </v-col>
        <v-col cols="auto">
          <v-pagination
            v-model="currentPage"
            :length="pageLenght"
            :total-visible="5"
            density="comfortable"
            show-first-last-page
            first-icon="mdi:mdi-page-first"
            prev-icon="mdi:mdi-chevron-left"
            next-icon="mdi:mdi-chevron-right"
            last-icon="mdi:mdi-page-last"
          ></v-pagination>
        </v-col>
      </v-row>
    </template>
  </v-table>
</template>

<style scoped>
  .c-table {
    background-color: var(--tb-bg-color);
    color: var(--tb-color);
    /* border: 2px solid var(--tb-th-bg-color); */

    :deep(th) {
      --v-table-header-height: 52px;
      background-color: var(--tb-th-bg-color);
      color: var(--tb-th-color);
      font-size: var(--tb-th-fs);
      font-weight: 300;
      padding: 0 8px !important;
    }

    :deep(td) {
      color: var(--tb-td-color);
      font-size: var(--tb-td-fs);
      padding: 0 6px !important;
    }

    tr.header-start :deep(th),
    tr.header-start :deep(td) {
      text-align: start;
    }

    tr.header-center :deep(th),
    tr.header-center :deep(td) {
      text-align: center;
    }

    tr.header-end :deep(th),
    tr.header-end :deep(td) {
      text-align: end;
    }

    :deep(tr.tr-selected) {
      background-color: rgba(255, 255, 255, 0.4);
    }

    /* 通用 tbody border-bottom */
    .v-table__wrapper > table > tbody > tr:not(:last-child) > :deep(td, th) {
      border-bottom: thin solid rgba(0, 0, 0, 0.3);
    }

    /* fixed-height 時的 border-bottom */
    &.v-table--fixed-height .v-table__wrapper > table > tbody > tr:last-child > :deep(td, th) {
      border-bottom: thin solid rgba(0, 0, 0, 0.3);
    }

    /* fixed-header 時的 thead 樣式 */
    &.v-table--fixed-header > .v-table__wrapper > table > thead > tr > :deep(th) {
      background: var(--tb-th-bg-color);
    }

    /* striped-even 行背景色 */
    &.v-table--striped-even > .v-table__wrapper > table > tbody > tr:nth-child(even) {
      background-color: #1f2d38;
    }
    &.v-table--striped-even > .v-table__wrapper > table > tbody > tr.tr-selected:nth-child(even) {
      background-color: rgba(255, 255, 255, 0.4);
    }
  }

  .tb-pagination {
    background-color: #1b2b36;
    border-top: 1px solid rgba(255, 255, 255, 0.12);

    :deep(.v-pagination__list) {
      margin-bottom: 0;
    }
  }

  .v-select {
    height: 40px;
    width: 97px;
  }
</style>

<script lang="ts" setup>
  import { ref, computed, watch, useSlots } from 'vue'
  import type { PropType } from 'vue'
  import type { DataTableHeader } from 'vuetify'

  const model = defineModel<any[]>({ default: [] as any[] })
  const props = defineProps({
    headers: Array as PropType<DataTableHeader[]>,
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
    // rowProps: Object,
    headerProps: Object,
    // cellProps: Object,
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
  const pageNum = computed(() =>
    page.value === '全部' || !props.pagination ? model.value.length : Number(page.value)
  )
  const pageLenght = computed(() => {
    const quotient = pageNum.value ? Math.ceil(model.value.length / pageNum.value) : 1
    return quotient
  })

  const slots = useSlots()
  // 過濾掉開頭是 header. 以外的 slot
  // const headerSlotList = Object.keys(slots).filter((name) => name.startsWith('header.'))
  // 過濾掉開頭是 item. 以外的 slot
  const itemSlotList = Object.keys(slots).filter((name) => name.startsWith('item.'))

  //選中行
  //存選中行的資料陣列
  const selectRows = ref<any[]>([])
  //行被選中時根據是否多選判斷如何加入
  const handleRowSelect = (data: any) => {
    if (!props.multiSelect) selectRows.value = []
    if (!selectRows.value.includes(data)) selectRows.value.push(data)
  }
  //取得選中行的原始資料 index 陣列
  const modelSelectIndexs = computed<any[]>(() => {
    if (selectRows.value.length > 0) {
      const findindexs = model.value.reduce((acc, val, idx) => {
        if (selectRows.value.some((x) => x === val)) acc.push(idx)
        return acc
      }, [])
      return findindexs
    }
    return []
  })
  //取得該筆資料在原始資料中的 index
  const computIndex = (data: any) => {
    return model.value.findIndex((x) => x === data)
  }

  //監聽
  const changePage = ref(false) //切換分頁用的判斷flag
  watch(
    () => currentPage.value,
    () => {
      changePage.value = true
      //切換分頁就把 selectRows 重置
      selectRows.value = []
    }
  )
  watch(
    () => model.value.length,
    () => {
      //selectRows 過濾掉不在原始資料中的資料
      selectRows.value = selectRows.value.filter((x) => model.value.includes(x))
    }
  )
  watch(
    () => modelSelectIndexs.value,
    (newVal: number[], oldVal: number[]) => {
      if (changePage.value) {
        changePage.value = false
      } else {
        //刪除資料時自動select下一筆
        if (newVal.length == 0 && oldVal.length == 1 && props.selectable) {
          const currentIndex = oldVal[0]
          const data = model.value?.[currentIndex]
          if (data) {
            selectRows.value.push(data)
          }
        }
      }
    }
  )

  defineExpose({
    get selected() {
      return selectRows.value
    },
    get selectIndex() {
      return modelSelectIndexs.value
    }
  })
</script>

<template>
  <v-data-table
    class="c-data-table"
    v-model:page="currentPage"
    :headers="headers"
    :items="model"
    :items-per-page="pageNum"
    :header-props="{
      ...headerProps,
      class: 'c-data-table-th' + (headerProps?.class ?? '')
    }"
  >
    <template v-slot:body="{ items }">
      <tr
        v-for="(row, index) in items"
        :key="`tb-row-${index}`"
        :class="{
          'tr-selected': selectRows.includes(row)
        }"
        @click="selectable ? handleRowSelect(row) : null"
      >
        <td
          v-for="col in headers"
          class="c-data-table-td"
          :class="col?.align ? `text-${col.align}` : ''"
        >
          <template v-if="!itemSlotList.includes(`item.${col?.key ?? ''}`)">
            {{ col?.key ? row[col.key] : '' }}
          </template>
          <template v-else>
            <slot :name="`item.${col?.key ?? ''}`" :scope="row" :index="computIndex(row)"></slot>
          </template>
        </td>
      </tr>
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
  </v-data-table>
</template>

<style scoped>
  .c-data-table {
    background-color: var(--tb-bg-color);
    color: var(--tb-color);
    /* border: 2px solid var(--tb-th-bg-color); */
  }

  :deep(.c-data-table-th) {
    --v-table-header-height: 52px;
    background-color: var(--tb-th-bg-color);
    color: var(--tb-th-color);
    font-size: var(--tb-th-fs);
    font-weight: 300;
    padding: 0 8px !important;
  }
  :deep(.c-data-table-td) {
    color: var(--tb-td-color);
    font-size: var(--tb-td-fs);
    padding: 0 6px !important;
  }

  /* 通用 tbody border-bottom */
  .c-data-table :deep(tr:not(:last-child)) > .c-data-table-td,
  .c-data-table :deep(tr:not(:last-child)) > .c-data-table-th {
    border-bottom: thin solid rgba(0, 0, 0, 0.3);
  }
  /* fixed-height 時的 border-bottom */
  .v-table--fixed-height :deep(tr:last-child) > .c-data-table-td,
  .v-table--fixed-height :deep(tr:last-child) > .c-data-table-th {
    border-bottom: thin solid rgba(0, 0, 0, 0.3);
  }
  /* fixed-header 時的 thead 背景色 */
  .v-table--fixed-header :deep(.c-data-table-th) {
    background-color: var(--tb-th-bg-color) !important;
  }
  /* striped-even 行背景色 */
  .v-table--striped-even :deep(tr):nth-child(even) {
    background-color: #1f2d38 !important;
  }

  :deep(tr.tr-selected),
  :deep(tr.tr-selected):nth-child(even) {
    background-color: rgba(255, 255, 255, 0.4) !important;
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

<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import type { PropType } from 'vue'

  const model = defineModel<any[]>({ default: [] as any[] })
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
</script>

<template>
  <v-table v-bind="$attrs">
    <template v-slot:default>
      <thead v-if="$slots.head">
        <tr>
          <th v-show="showIndex" width="60" class="text-center">#</th>
          <slot name="head"></slot>
        </tr>
      </thead>

      <tbody v-if="$slots.body">
        <tr v-for="(item, index) in tbDataShow" :key="`tb-row-${index}`">
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
  </v-table>
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

<style scoped>
  .v-table {
    background-color: var(--tb-bg-color);
    color: var(--tb-color);

    :deep(th) {
      --v-table-header-height: 52px;
      background-color: var(--tb-th-bg-color);
      color: var(--tb-th-color);
      font-size: var(--tb-th-fs);
      font-weight: 300;
    }

    :deep(td) {
      color: var(--tb-td-color);
      font-size: var(--tb-td-fs);
    }

    /* 通用 tbody border-bottom */
    .v-table__wrapper > table > tbody > tr:not(:last-child) > :deep(td, th) {
      border-bottom: thin solid rgba(0, 0, 0, var(--v-border-opacity));
    }

    /* fixed-height 時的 border-bottom */
    &.v-table--fixed-height .v-table__wrapper > table > tbody > tr:last-child > :deep(td, th) {
      border-bottom: thin solid rgba(0, 0, 0, var(--v-border-opacity));
    }

    /* fixed-header 時的 thead 樣式 */
    &.v-table--fixed-header > .v-table__wrapper > table > thead > tr > :deep(th) {
      background: var(--tb-th-bg-color);
    }

    /* striped-even 行背景色 */
    &.v-table--striped-even > .v-table__wrapper > table > tbody > tr:nth-child(even) {
      background-color: #1f2d38;
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

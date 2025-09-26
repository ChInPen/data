<script lang="ts" setup>
  import { ref } from 'vue'
  import { cButton, cBread, cDataTable } from '@/components/Common' //共用元件
  import type { DataTableHeader } from 'vuetify'
  import { useQuotationStore } from '@/store/quotation'
  import { useRouter } from 'vue-router'
  import Filter from './Components/QuotationFilter.vue'
  import { numberFormat, dateFormat } from '@/utils/uformat'

  const store = useQuotationStore()
  const router = useRouter()

  type TableData = {
    index1: string
    qno: string
    date1: string
    custabbr: string
    sum1: number
    tax: number
    amount: number
    empname: string
    [key: string]: any
  }

  const tbData = ref<TableData[]>([])
  const tbHeader: DataTableHeader[] = [
    { key: 'qno', title: '報價單號' },
    { key: 'date1', title: '報價日期' },
    { key: 'custabbr', title: '客戶簡稱' },
    { key: 'sum1', title: '稅前合計', width: 150, align: 'end' },
    { key: 'tax', title: '營業稅額', width: 150, align: 'end' },
    { key: 'amount', title: '報價總額', width: 150, align: 'end' },
    { key: 'empname', title: '報價人員姓名' }
  ]
  const tableRef = ref()
  /*
  返回表單頁的按鈕
  將查詢出來的清單傳進 store
  如果有點選一筆資料，將該筆單據 key值 也傳入
  */
  const goback = () => {
    const idx = tableRef.value?.selectIndex[0]
    const index1List = tbData.value.map(({ index1 }) => ({ index1 }))
    if (typeof idx === 'number' && idx >= 0) {
      const index1 = tbData.value[idx].index1
      store.goback(router, index1List, index1)
    } else {
      store.goback(router, index1List)
    }
  }

  //查詢條件
  const filterDS = ref(false)
  /*
  @search="handleSearch" 觸發時機是查詢條件彈窗按下查詢按鈕時
  參數 data 是查詢結果
  */
  const handleSearch = (data: any[]) => {
    tbData.value = data
  }
  /*
  @init="handleInit" 觸發時機是查詢條件彈窗的 onMounted()
  如果是透過 瀏覽按鈕 進入查詢頁，會主動查詢一次，回傳清單 data
  如果是透過 表單頁查詢條件 進入查詢頁，會回傳查詢條件查詢後的清單 data
  */
  const handleInit = (data: any[]) => {
    if (data && data.length > 0) tbData.value = data
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread title="查詢" />

  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto">
          <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="filterDS = true">
            查詢
          </c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="goback" icon="fa-solid fa-circle-left" @click="goback">返回</c-button>
        </v-col>
      </v-row>
      <c-data-table
        class="mt-3"
        ref="tableRef"
        v-model="tbData"
        :headers="tbHeader"
        striped="even"
        hover
        selectable
        header-align="center"
      >
        <template v-slot:item.date1="{ scope }">
          {{ dateFormat(scope.date1, { dateTW: true }) }}
        </template>
        <template v-slot:item.sum1="{ scope }">
          {{ numberFormat(scope.sum1, { thousands: true }) }}
        </template>
        <template v-slot:item.tax="{ scope }">
          {{ numberFormat(scope.tax, { thousands: true }) }}
        </template>
        <template v-slot:item.amount="{ scope }">
          {{ numberFormat(scope.amount, { thousands: true }) }}
        </template>
      </c-data-table>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" mode="search" @init="handleInit" @search="handleSearch" />
</template>

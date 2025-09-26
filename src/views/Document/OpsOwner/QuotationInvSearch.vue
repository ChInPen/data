<script lang="ts" setup>
  import { ref } from 'vue'
  import { cButton, cBread, cDataTable } from '@/components/Common' //共用元件
  import type { DataTableHeader } from 'vuetify'
  import { useQuotationInvStore } from '@/store/quotationinv'
  import { useRouter } from 'vue-router'
  import Filter from './Components/QuotationInvFilter.vue'
  import { numberFormat } from '@/utils/uformat'

  const store = useQuotationInvStore()
  const router = useRouter()

  type TableData = {
    ono: string
    date1: string
    protno: string
    custabbr: string
    itemno: string
    itemname: string
    ntotal1: number
    bz: string
    descrip: string
    billfiud1: string
    date2: string
    date3: string
    adate1: string
    adate2: string
    adate3: string
    protabbr: string
    custno: string
    uniform: string
    phase: string
    sum1: number
    taxkind: string
    taxkindc: string
    taxrate: number
    tax: number
    taxflag: string
    amount: number
    payment1: string
    idate1: string
    idate2: string
    idate3: string
    invono: string
    billud1: string
    billud2: string
    memo1: string
    cno: string
    sysname1: string
    execflag: string
    billmo1: string
    billmo2: string
    billmo3: number
    bsrcvpay: number
    acno: string
    invoamount: number
    qno: string
    rcvpay: number
    bsarpay: number
    invotitle: string
    expdatE1: string
    convei: boolean
    ecdate: string
    etdate: string
    invotime: string
    invorandom: string
    invoaddr: string
    printmark: string
    invostatus: string
    invoheader: string
  }

  const tbData = ref<TableData[]>([])
  const tbHeader: DataTableHeader[] = [
    { key: 'ono', title: '請款單號', width: 150 },
    { key: 'date1', title: '請款日期', width: 130 },
    { key: 'protabbr', title: '工程簡稱', width: 200 },
    { key: 'custabbr', title: '業主簡稱', width: 200 },
    { key: 'itemno', title: '工料編號', width: 200 },
    { key: 'itemname', title: '工料名稱', width: 400 },
    { key: 'ntotal1', title: '請款金額', width: 130 },
    { key: 'bz', title: '佔合約比例', width: 150 },
    { key: 'descrip', title: '說明', width: 400 },
    { key: 'billfiud1', title: '明細自定一', width: 400 }
  ]
  const tableRef = ref()
  const goback = () => {
    const idx = tableRef.value?.selectIndex[0]
    const onoList = tbData.value.map(({ ono }) => ({ ono }))
    if (typeof idx === 'number' && idx >= 0) {
      const ono = tbData.value[idx].ono
      store.goback(router, onoList, ono)
    } else {
      store.goback(router, onoList)
    }
  }

  //查詢條件
  const filterDS = ref(false)
  const handleSearch = (data: any[]) => {
    tbData.value = data
  }
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
        layout="fixed"
      >
        <template v-slot:item.itemname="{ scope }">
          {{
            scope.itemname?.length > 20 ? `${scope.itemname?.substring(0, 20)}...` : scope.itemname
          }}
        </template>
        <template v-slot:item.ntotal1="{ scope }">
          {{ numberFormat(scope.ntotal1, { thousands: true }) }}
        </template>
      </c-data-table>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" mode="search" @init="handleInit" @search="handleSearch" />
</template>

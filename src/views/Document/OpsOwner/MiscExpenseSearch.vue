<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cBread, cDataTable } from '@/components/Common' //共用元件
  import type { DataTableHeader } from 'vuetify'
  import { useMiscExpenseStore } from '@/store/miscexpense'
  import { useRouter } from 'vue-router'
  import Filter from './Components/MiscExpenseFilter.vue'

  const store = useMiscExpenseStore()
  const router = useRouter()

  type TableData = {
    ono: string
    date1: string
    protabbr: string
    itemname: string
    qty: number
    unit: string
    price: number
    total1: number
    descrip: string
    desud1: string
  }

  const tbData = ref<TableData[]>([])
  const tbHeader: DataTableHeader[] = [
    { key: 'ono', title: '雜支單號' },
    { key: 'date1', title: '雜支日期' },
    { key: 'protabbr', title: '工程簡稱' },
    { key: 'itemname', title: '雜項名稱' },
    { key: 'qty', title: '數量' },
    { key: 'unit', title: '單位' },
    { key: 'price', title: '單價' },
    { key: 'total1', title: '金額' }
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

  onMounted(() => {
    if (store.list && store.list.length > 0) {
      tbData.value = store.list as any[]
    }
  })
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
      />
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" @search="handleSearch" />
</template>

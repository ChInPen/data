<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useMiscExpenseStore } from '@/store/miscexpense'
  const store = useMiscExpenseStore()
  import { searchProt } from '@/components/SearchProt'
  import { useSearchProt } from '@/store/searchProt'
  const searchProtStore = useSearchProt()
  import { searchItem } from '@/components/SearchItem'
  import { useSearchItem } from '@/store/searchItem'
  const searchItemStore = useSearchItem()

  const model = defineModel<boolean>({ default: false })
  const emit = defineEmits(['init', 'search'])

  //查詢條件
  const filter = ref({
    protno: '',
    itemno: '',
    date1_s: '',
    date1_e: '',
    ono: '',
    desud1: '',
    acno: ''
  })
  const searchApi = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Exes.Exeslist,
      data: {
        ...filter.value,
        data_Count: '1000',
        start: 0,
        length: 1000
      }
    })
    if (res?.status === 200) {
      const { _Lists } = res?.data
      emit('init', _Lists)
      return _Lists
    }
  }
  const handleSearch = async () => {
    const data = await searchApi()
    if (Array.isArray(data)) {
      emit('search', data)
      model.value = false
    }
  }
  const handleClear = () => {
    filter.value = {
      protno: '',
      itemno: '',
      date1_s: '',
      date1_e: '',
      ono: '',
      desud1: '',
      acno: ''
    }
  }
  const handleDialogClose = () => {
    handleClear()
  }

  //起始動作
  onMounted(() => {
    if (!store.list || store.list.length == 0) searchApi()
  })

  //查詢工程彈窗
  const searchProtRef = ref()
  const protset = () => {
    searchProtStore.set(filter, [{ from: 'protno' }])
    searchProtRef.value?.open()
  }
  const protkeyenter = (e: KeyboardEvent) => {
    searchProtStore.keyEnter(e, filter, [{ from: 'protno' }], filter.value.protno, {
      open: searchProtRef.value?.open
    })
  }

  //查詢工料彈窗
  const searchItemRef = ref()
  const itemset = () => {
    searchItemStore.set(filter, [{ from: 'itemno' }])
    searchItemRef.value?.open()
  }
  const itemkeyenter = (e: KeyboardEvent) => {
    searchItemStore.keyEnter(e, filter, [{ from: 'itemno' }], filter.value.itemno, {
      open: searchItemRef.value?.open
    })
  }
</script>

<template>
  <c-dialog v-model="model" @afterLeave="handleDialogClose" title-divider width="840">
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>查詢條件</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="model = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-row dense :align="'center'">
      <v-col cols="12">
        <c-input
          v-model="filter.protno"
          label="工程編號"
          icon="fa-solid fa-helmet-safety"
          @button="protset"
          @keydown="protkeyenter"
          :maxlength="16"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.itemno"
          label="雜項編號"
          icon="fa-solid fa-wrench"
          @button="itemset"
          @keydown="itemkeyenter"
          :maxlength="20"
        />
      </v-col>
      <v-col cols="auto">
        <c-input
          type="date"
          v-model="filter.date1_s"
          label="雜支日期"
          icon="fa-solid fa-calendar-day"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input type="date" v-model="filter.date1_e" icon="fa-solid fa-calendar-day" />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.ono"
          label="雜項單號"
          icon="fa-solid fa-file-lines"
          :maxlength="14"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.desud1"
          label="說明自訂一"
          icon="fa-solid fa-pencil"
          :maxlength="30"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.acno"
          label="傳票單號"
          icon="fa-solid fa-file-lines"
          :maxlength="14"
        />
      </v-col>
    </v-row>
    <v-row dense class="mt-3" justify="end">
      <v-col cols="auto">
        <c-button kind="clear" icon="fa-solid fa-eraser" @click="handleClear">清空</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
          查詢
        </c-button>
      </v-col>
    </v-row>
  </c-dialog>

  <search-prot ref="searchProtRef" @pick="searchProtStore.pick" />
  <search-item ref="searchItemRef" @pick="searchItemStore.pick" />
</template>

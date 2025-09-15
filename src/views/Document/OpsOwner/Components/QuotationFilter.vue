<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useQuotationStore } from '@/store/quotation'
  const store = useQuotationStore()
  import { searchCust } from '@/components/SearchCust'
  import { searchEmp } from '@/components/SearchEmp'
  import { searchItem } from '@/components/SearchItem'

  const model = defineModel<boolean>({ default: false })
  const emit = defineEmits(['init', 'search'])

  //查詢條件
  const filter = ref({
    date1_start: '',
    date1_end: '',
    qno_start: '',
    qno_end: '',
    custno_start: '',
    custno_end: '',
    empno: '',
    protno: '',
    itemno: '',
    memo1: ''
  })
  const searchApi = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Sqte.Sqte_List,
      data: {
        ...filter.value,
        pageNumber: 1,
        pageSize: 1000,
        top: 1000
      }
    })
    if (res?.status === 200) {
      const { data } = res?.data
      emit('init', data)
      return data
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
      date1_start: '',
      date1_end: '',
      qno_start: '',
      qno_end: '',
      custno_start: '',
      custno_end: '',
      empno: '',
      protno: '',
      itemno: '',
      memo1: ''
    }
  }
  const handleDialogClose = () => {
    handleClear()
  }

  //起始動作
  onMounted(() => {
    if (!store.list || store.list.length == 0) searchApi()
  })

  //查詢業主彈窗
  const searchCustDS = ref(false)
  const searchCustIsEnter = ref(false)
  const custTarget = ref<'custno_start' | 'custno_end'>()
  const custopen = (target: 'custno_start' | 'custno_end') => {
    custTarget.value = target
    searchCustDS.value = true
  }
  const custkeyenter = (target: 'custno_start' | 'custno_end') => {
    custTarget.value = target
    searchCustIsEnter.value = true
    searchCustDS.value = true
  }
  //查詢人員彈窗
  const searchEmpDS = ref(false)
  const searchEmpIsEnter = ref(false)
  const empopen = () => {
    searchEmpDS.value = true
  }
  const empkeyenter = () => {
    searchEmpIsEnter.value = true
    searchEmpDS.value = true
  }
  //查詢工料彈窗
  const searchItemRef = ref()
  const searchItemIsEnter = ref(false)
  const itemopen = () => {
    searchItemRef.value?.open()
  }
  const itemkeyenter = () => {
    searchItemIsEnter.value = true
    searchItemRef.value?.open()
  }
</script>

<template>
  <c-dialog v-model="model" @afterLeave="handleDialogClose" title-divider width="898">
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>查詢條件</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="model = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-row dense :align="'center'">
      <v-col cols="auto">
        <c-input
          type="date"
          v-model="filter.date1_start"
          label="報價日期"
          icon="fa-solid fa-calendar-day"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input type="date" v-model="filter.date1_end" icon="fa-solid fa-calendar-day" />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.qno_start"
          label="報價單號"
          icon="fa-solid fa-file-lines"
          :maxlength="14"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input v-model="filter.qno_end" icon="fa-solid fa-file-lines" :maxlength="14" />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.custno_start"
          label="業主編號"
          icon="fa-solid fa-user-tie"
          :maxlength="10"
          @button="custopen('custno_start')"
          @keyEnter="custkeyenter('custno_start')"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input
          v-model="filter.custno_end"
          icon="fa-solid fa-user-tie"
          :maxlength="10"
          @button="custopen('custno_end')"
          @keyEnter="custkeyenter('custno_end')"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.empno"
          label="報價人員"
          icon="fa-solid fa-user"
          @button="empopen"
          @keyEnter="empkeyenter"
          :maxlength="10"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="filter.itemno"
          label="工料編號"
          icon="fa-solid fa-wrench"
          @button="itemopen"
          @keyEnter="itemkeyenter"
          :maxlength="20"
        />
      </v-col>
      <v-col cols="12">
        <c-input v-model="filter.memo1" label="說明" icon="fa-solid fa-pen" />
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

  <search-cust
    v-model="searchCustDS"
    v-model:form="filter"
    v-model:keyenter="searchCustIsEnter"
    :setting="[{ from: 'custno', to: custTarget ?? '' }]"
    :search-text="filter?.[custTarget] ?? ''"
  />
  <search-emp
    v-model="searchEmpDS"
    v-model:form="filter"
    v-model:keyenter="searchEmpIsEnter"
    :setting="[{ from: 'empno' }]"
    :search-text="filter.empno"
  />
  <search-item
    ref="searchItemRef"
    v-model:form="filter"
    v-model:keyenter="searchItemIsEnter"
    :setting="[{ from: 'itemno' }]"
    :search-text="filter.itemno"
  />
</template>

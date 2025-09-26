<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import type { PropType } from 'vue'
  import { cButton, cInput, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useQuotationInvStore } from '@/store/quotationinv'
  const store = useQuotationInvStore()
  import { searchCust } from '@/components/SearchCust'
  import { searchProt } from '@/components/SearchProt'

  const model = defineModel<boolean>({ default: false })
  const props = defineProps({
    // 用來判別是表單頁還是清單頁的查詢條件彈窗
    mode: String as PropType<'detail' | 'search'>
  })
  const emit = defineEmits(['init', 'search'])

  //查詢條件
  const filter = ref({
    ono: '',
    protno: '',
    date1: '',
    custno: '',
    qno: '',
    invono: '',
    billud1: ''
  })
  const searchApi = async () => {
    let data = {
      ...filter.value,
      pageNumber: 1,
      pageSize: 1000,
      top: 1000
    }
    if (props.mode === 'search') data = { ...data, ...store.filter }

    const res = await callApi({
      method: 'POST',
      url: api.Bill2.Bill2_List,
      data
    })
    if (res?.status === 200) {
      const { data } = res?.data
      return data
    }
  }
  const handleSearch = async () => {
    if (props.mode === 'detail') {
      emit('search', { ...filter.value })
    } else {
      const data = await searchApi()
      if (Array.isArray(data)) {
        emit('search', data)
        model.value = false
      }
    }
  }
  const handleClear = () => {
    filter.value = {
      ono: '',
      protno: '',
      date1: '',
      custno: '',
      qno: '',
      invono: '',
      billud1: ''
    }
  }
  const handleDialogClose = () => {
    // handleClear() //關閉彈窗不需要清空條件
  }

  //起始動作
  onMounted(async () => {
    let data
    if (store.action === 'goback') {
      data = [...store.list]
    } else {
      data = await searchApi()
      if (props.mode === 'detail' && Array.isArray(data)) {
        data = data.map(({ ono }) => ({ ono }))
        store.init(data)
      }
    }
    emit('init', data)
    store.cancel()
    store.filter = {}
  })

  //查詢業主彈窗
  const searchCustDS = ref(false)
  const searchCustIsEnter = ref(false)
  const custopen = () => {
    searchCustDS.value = true
  }
  const custkeyenter = () => {
    searchCustIsEnter.value = true
    searchCustDS.value = true
  }
  //查詢工程彈窗
  const searchProtDS = ref(false)
  const searchProtIsEnter = ref(false)
  const protopen = () => {
    searchProtDS.value = true
  }
  const protkeyenter = () => {
    searchProtIsEnter.value = true
    searchProtDS.value = true
  }
</script>

<template>
  <c-dialog v-model="model" @afterLeave="handleDialogClose" title-divider width="860">
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
          v-model="filter.ono"
          label="請款單號"
          icon="fa-solid fa-file-lines"
          :maxlength="14"
        />
      </v-col>
      <v-col cols="auto">
        <c-input
          v-model="filter.qno"
          label="報價單號"
          icon="fa-solid fa-file-lines"
          :maxlength="14"
        />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.protno"
          label="工程編號"
          icon="fa-solid fa-helmet-safety"
          :maxlength="16"
          @button="protopen"
          @keyEnter="protkeyenter"
        />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.custno"
          label="業主編號"
          icon="fa-solid fa-user-tie"
          :maxlength="10"
          @button="custopen"
          @keyEnter="custkeyenter"
        />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.invono"
          label="發票號碼"
          icon="fa-solid fa-file-invoice-dollar"
          :format="{ number: true, english: true }"
          :maxlength="10"
        />
      </v-col>
      <v-col cols="auto">
        <c-input
          type="date"
          v-model="filter.date1"
          label="請款日期"
          icon="fa-solid fa-calendar-day"
        />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="auto">
        <c-input
          v-model="filter.billud1"
          label="明細自定一"
          icon="fa-solid fa-pen"
          :maxlength="30"
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

  <search-cust
    v-model="searchCustDS"
    v-model:form="filter"
    v-model:keyenter="searchCustIsEnter"
    :setting="[{ from: 'custno' }]"
    :search-text="filter.custno ?? ''"
  />
  <search-prot
    v-model="searchProtDS"
    v-model:form="filter"
    v-model:keyenter="searchProtIsEnter"
    :setting="[{ from: 'protno' }]"
    :search-text="filter.protno ?? ''"
  />
</template>

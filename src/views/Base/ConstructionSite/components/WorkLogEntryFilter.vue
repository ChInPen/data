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
  // 業主區間
  import CustStart from '@/views/Analytics/composable/Cust/CustStart.vue'
  import CustEnd from '@/views/Analytics/composable/Cust/CustEnd.vue'

  // 工程區間
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'

  const model = defineModel<boolean>({ default: false })
  const emit = defineEmits(['init', 'search'])
  //查詢條件
  const filter = ref({
    dno: '',
    prot_s: '',
    prot_e: '',
    date_s: '',
    date_e: '',
    cust_s: '',
    cust_e: ''
  })
  const searchApi = async () => {
    const res = await callApi({
      method: 'GET',
      url: api.WorkLogEntry.Search,
      params: { date: '', desc: true }
    })
    console.log('res', res.data)

    if (res?.status === 200) {
      return res?.data
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
      dno: '',
      prot_s: '',
      prot_e: '',
      date_s: '',
      date_e: '',
      cust_s: '',
      cust_e: ''
    }
  }
  const handleDialogClose = () => {
    // handleClear() //關閉彈窗不需要清空條件
  }

  //起始動作
  onMounted(async () => {
    let data
    if (!['search', 'goback'].includes(store.action)) {
      data = await searchApi()
    }
    emit('init', data)
    store.cancel()
  })
</script>

<template>
  <c-dialog v-model="model" @afterLeave="handleDialogClose" title-divider width="900">
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
          v-model="filter.dno"
          label="日誌單號"
          icon="fa-solid fa-helmet-safety"
          :maxlength="16"
        />
      </v-col>
      <!-- 工程區間 -->
      <v-col cols="12">
        <v-row dense :align="'center'">
          <v-col cols="auto">
            <ProtStart v-model="filter.prot_s" />
          </v-col>
          <v-col cols="auto" class="text-center d-none d-md-block">
            <span class="text-h5 text-grey-lighten-1">～</span>
          </v-col>
          <v-col cols="auto">
            <ProtEnd v-model="filter.prot_e" />
          </v-col>
        </v-row>
      </v-col>
      <!-- 日誌區間 -->
      <v-col cols="12">
        <v-row dense :align="'center'">
          <v-col cols="auto">
            <c-input
              type="date"
              v-model="filter.date_s"
              label="日誌日期"
              icon="fa-solid fa-calendar-day"
            />
          </v-col>
          <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
          <v-col cols="auto">
            <c-input type="date" v-model="filter.date_e" icon="fa-solid fa-calendar-day" />
          </v-col>
        </v-row>
      </v-col>
      <!-- 業主區間 -->
      <v-col cols="12">
        <v-row dense :align="'center'">
          <v-col cols="auto">
            <CustStart v-model="filter.cust_s" />
          </v-col>
          <v-col cols="auto" class="text-center d-none d-md-block">
            <span class="text-h5 text-grey-lighten-1">～</span>
          </v-col>
          <v-col cols="auto">
            <CustEnd v-model="filter.cust_e" />
          </v-col>
        </v-row>
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

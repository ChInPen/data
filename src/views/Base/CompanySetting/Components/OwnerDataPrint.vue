<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cButton, cInput, cSelect, cDialog } from '@/components/Common' //共用元件
  import { searchCust } from '@/components/SearchCust'
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'
  import { useSearchCust } from '@/store/searchCust'
  const store = useSearchCust()

  const isOpen = defineModel({ default: false })

  //列印
  const printForm = ref({
    initNo: '',
    finalNo: '',
    feetNo: '01'
  })
  const feetNoDDL = ref({
    list: [
      { feetno: '01', feetname: '第一組' },
      { feetno: '02', feetname: '第二組' },
      { feetno: '03', feetname: '第三組' },
      { feetno: '04', feetname: '第四組' },
      { feetno: '05', feetname: '第五組' },
      { feetno: '00', feetname: '不列印' }
    ],
    value: 'feetno',
    title: 'feetname'
  })
  const handlePrintClose = () => {
    nextTick(() => {
      printForm.value = {
        initNo: '',
        finalNo: '',
        feetNo: '01'
      }
    })
  }
  const handlePreview = () => {
    callApi({
      method: 'POST',
      url: api.Cust.Cust_Print,
      data: { ...printForm.value }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? ''
        window.open(config.apiUri + '/' + data)
      }
    })
  }

  //用 v-model 操控的方式
  const searchCustDS = ref(false)
  //用 ref實例的open() 操控的方式
  const searchRef = ref()
  const chooseInit = () => {
    store.set(printForm, [{ from: 'custno', to: 'initNo' }], {
      open: searchRef.value?.open
    })
  }
  const keydownInit = (e: KeyboardEvent) => {
    store.keyEnter(e, printForm, [{ from: 'custno', to: 'initNo' }], printForm.value.initNo, {
      open: searchRef.value?.open
    })
  }
  const chooseFinal = () => {
    store.set(printForm, [{ from: 'custno', to: 'finalNo' }], {
      open: () => {
        searchCustDS.value = true
      }
    })
  }
  // const keydownFinal = (e: KeyboardEvent) => {
  //   store.keyEnter(e, printForm, [{ from: 'custno', to: 'finalNo' }], printForm.value.initNo, {
  //     open: () => {
  //       searchCustDS.value = true
  //     }
  //   })
  // }
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="列印" width="500" @afterLeave="handlePrintClose">
    <v-row dense justify="center" :align="'center'">
      <v-col cols="12">
        <c-select
          v-model="printForm.feetNo"
          label="單行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="printForm.initNo"
          label="起始業主編號"
          @button="chooseInit"
          @keydown="keydownInit"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="printForm.finalNo"
          label="終止業主編號"
          @button="chooseFinal"
          @keydown="
            (e: KeyboardEvent) =>
              store.keyEnter(e, printForm, [{ from: 'custno', to: 'finalNo' }], printForm.finalNo, {
                open: () => {
                  searchCustDS = true
                }
              })
          "
        />
        <!--@keydown="keydownFinal"-->
      </v-col>
      <v-col cols="12"></v-col>
      <v-responsive width="100%"></v-responsive>
      <v-col cols="auto" class="fs-5 fw-bold text-danger">
        ※起始編號空白表示從第一筆列印
        <br />
        ※終止編號空白表示列印至最後一筆
        <br />
        ※兩者皆空白表示全部列印
      </v-col>
    </v-row>
    <template v-slot:buttons>
      <v-row no-gutters justify="center">
        <v-col cols="auto mx-1">
          <c-button kind="print" icon="fa-solid fa-file-pdf" @click="handlePreview">預覽</c-button>
        </v-col>
        <v-col cols="auto mx-1">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">結束</c-button>
        </v-col>
      </v-row>
    </template>
  </c-dialog>

  <search-cust ref="searchRef" v-model="searchCustDS" @pick="store.pick" />
</template>

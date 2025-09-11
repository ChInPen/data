<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cButton, cInput, cSelect, cDialog } from '@/components/Common' //共用元件
  import { searchSupp } from '@/components/SearchSupp'
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'

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
      url: api.Supp.Supp_Print,
      data: {
        footNote: printForm.value.feetNo,
        suppNo_S: printForm.value.initNo,
        suppNo_E: printForm.value.finalNo
      }
    }).then((res: any) => {
      if (typeof res === 'string' && res.startsWith('PDF')) {
        window.open(config.apiUri + '/' + res)
      }
    })
  }

  //用 v-model 操控的方式
  const searchSuppDS = ref(false)
  //用 ref實例的open() 操控的方式
  const searchRef = ref()
  const pickSetting = ref()
  const isEnter = ref(false)
  const searchText = ref('')
  const searchSuppOpen = (to: 'initNo' | 'finalNo') => {
    pickSetting.value = [{ from: 'suppno', to }]
    searchRef.value?.open()
  }
  const searchSuppEnter = (to: 'initNo' | 'finalNo') => {
    pickSetting.value = [{ from: 'suppno', to }]
    isEnter.value = true
    searchText.value = printForm.value?.[to] ?? ''
    searchRef.value?.open()
  }
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
          label="起始廠商編號"
          @button="searchSuppOpen('initNo')"
          @keyEnter="searchSuppEnter('initNo')"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="printForm.finalNo"
          label="終止廠商編號"
          @button="searchSuppOpen('finalNo')"
          @keyEnter="searchSuppEnter('finalNo')"
        />
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

  <search-supp
    ref="searchRef"
    v-model="searchSuppDS"
    v-model:form="printForm"
    v-model:keyenter="isEnter"
    :setting="pickSetting"
    :search-text="searchText"
  />
</template>

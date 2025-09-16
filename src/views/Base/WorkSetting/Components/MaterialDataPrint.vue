<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cButton, cInput, cSelect, cDialog } from '@/components/Common' //共用元件
  import { searchItem } from '@/components/SearchItem'
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'

  const isOpen = defineModel({ default: false })

  //列印
  const printForm = ref({
    itemNo_S: '',
    itemNo_E: '',
    footNote: '01',
    report_Content: 'Arranged'
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
        itemNo_S: '',
        itemNo_E: '',
        footNote: '01',
        report_Content: 'Arranged'
      }
    })
  }
  const handlePreview = () => {
    callApi({
      method: 'POST',
      url: api.Item.Item_Print,
      data: { ...printForm.value }
    }).then((res: any) => {
      if (typeof res === 'string' && res.startsWith('PDF')) {
        window.open(config.apiUri + '/' + res)
      }
    })
  }

  //用 v-model 操控的方式
  const searchItemDS = ref(false)
  //用 ref實例的open() 操控的方式
  const searchRef = ref()
  const pickSetting = ref()
  const isEnter = ref(false)
  const searchText = ref('')
  const searchItemOpen = (to: 'itemNo_S' | 'itemNo_E') => {
    pickSetting.value = [{ from: 'itemno', to }]
    searchRef.value?.open()
  }
  const searchItemEnter = (to: 'itemNo_S' | 'itemNo_E') => {
    pickSetting.value = [{ from: 'itemno', to }]
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
          v-model="printForm.report_Content"
          label="報表內容"
          :items="[
            { label: '內定報表', value: 'Arranged' },
            { label: '自定一', disabled: true },
            { label: '自定二', disabled: true }
          ]"
          item-title="label"
          item-value="value"
          hide-search
        />
      </v-col>
      <v-col cols="12">
        <c-select
          v-model="printForm.footNote"
          label="單行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="printForm.itemNo_S"
          label="起始工料編號"
          @button="searchItemOpen('itemNo_S')"
          @keyEnter="searchItemEnter('itemNo_S')"
        />
      </v-col>
      <v-col cols="12">
        <c-input
          v-model="printForm.itemNo_E"
          label="終止工料編號"
          @button="searchItemOpen('itemNo_E')"
          @keyEnter="searchItemEnter('itemNo_E')"
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

  <search-item
    ref="searchRef"
    v-model="searchItemDS"
    v-model:form="printForm"
    v-model:keyenter="isEnter"
    :setting="pickSetting"
    :search-text="searchText"
  />
</template>

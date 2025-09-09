<script lang="ts" setup>
  import { ref, nextTick, computed } from 'vue'
  import { cButton, cSelect, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法

  type PrintForm = {
    dates: { begin: string; end: string }
    custNOs: { begin: string; end: string; limiteds: string[] }
    protNOs: { begin: string; end: string; limiteds: string[] }
    feetNo: string
    printType: number
    customType: string
  }
  const isOpen = defineModel<boolean>({ default: false })
  const props = defineProps<{ printForm: PrintForm }>()
  //列印
  const localForm = ref({
    feetNo: '01',
    printType: '0'
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
  const printType = ref({
    list: [
      { value: '0', title: '總額表' },
      { value: '1', title: '工程明細' },
      { value: '2', title: '報價明細' }
    ],
    value: 'value',
    title: 'title'
  })
  const handlePrintClose = () => {
    nextTick(() => {
      localForm.value = {
        feetNo: '01',
        printType: '0'
      }
    })
  }
  // 合併資料
  const payload = computed<PrintForm>(() => ({
    ...props.printForm,
    feetNo: localForm.value.feetNo,
    printType: Number(localForm.value.printType) || 0,
    customType: props.printForm?.customType ?? ''
  }))
  // 檔案下載
  const handlePreview = async () => {
    try {
      const res = await callApi({
        method: 'POST',
        url: api.Billing.Excel,
        data: payload.value
      })
      console.log(res)

      //Excel/報價作業_20250829_111901_173.xlsx
      const path = String(res).trim()

      if (typeof path === 'string' && path.startsWith('Excel')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        const filename = decodeURIComponent(path.split('/').pop())
        const a = document.createElement('a')
        a.href = fileURL
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else return console.warn('沒有取得檔名')
    } catch (err) {
      console.error(err)
    }
  }
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="匯出EXCEL" width="500" @afterLeave="handlePrintClose">
    <v-row dense justify="center" :align="'center'">
      <v-col cols="12">
        <c-select
          v-model="localForm.feetNo"
          label="單行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
        />
      </v-col>
      <v-col cols="12">
        <c-select
          v-model="localForm.printType"
          label="報表內容"
          :items="printType.list"
          :item-title="printType.title"
          :item-value="printType.value"
          hide-search
        />
      </v-col>

      <v-col cols="12"></v-col>
      <v-responsive width="100%"></v-responsive>
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
</template>

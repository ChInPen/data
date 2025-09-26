<script lang="ts" setup>
  import { ref, onMounted, nextTick } from 'vue'
  import { cButton, cInput, cSelect, cTextarea, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'
  import { message } from '@/components/Message/service'

  const isOpen = defineModel({ default: false })
  const props = defineProps({
    no: String
  })

  //列印
  const printForm = ref({
    print_Style: '簡要表',
    footNote_Option: '1',
    footNote_Data: '',
    comptitleNo: 0,
    comptitle: '華薪資訊有限公司'
  })
  const printStyleDDL = ref([
    { label: '簡要表', value: '簡要表' },
    { label: '請款單', value: '請款單' },
    { label: '總  表', value: '總表' },
    { label: '簡要自定ㄧ', disabled: true },
    { label: '簡要自定二', disabled: true },
    { label: '明細表(金額)', value: '明細表(金額)' },
    { label: '明細表(無金額)', value: '明細表' },
    { label: '明細自定ㄧ', disabled: true },
    { label: '明細自定二', disabled: true },
    { label: 'B2B電子發票', value: '電子發票' }
  ])
  const feetNoDDL = ref({
    list: [
      { feetno: '1', feetname: '第一組' },
      { feetno: '2', feetname: '第二組' },
      { feetno: '3', feetname: '第三組' },
      { feetno: '4', feetname: '第四組' },
      { feetno: '5', feetname: '第五組' },
      { feetno: '6', feetname: '不列印' }
    ],
    value: 'feetno',
    title: 'feetname'
  })
  const feetContent = ref<{ groupNumber: number; content: string }[]>([])
  const comptitleList = ref<{ content1: string }[]>([])
  const handlePrintClose = () => {
    nextTick(() => {
      printForm.value = {
        print_Style: '簡要表',
        footNote_Option: '1',
        footNote_Data: '',
        comptitleNo: 0,
        comptitle: '華薪資訊有限公司'
      }
      feetoptionChange()
    })
  }
  const handlePreview = () => {
    if (!props.no) {
      message.alert({ type: 'warning', message: '無請款單號!' })
    }
    const { print_Style, comptitle, footNote_Data } = printForm.value
    callApi({
      method: 'POST',
      url: api.Bill2.Bill2_Print,
      data: {
        ono: props.no,
        type: print_Style,
        comptitle,
        footNote_Data
      }
    }).then((res: any) => {
      if (res.status === 200) {
        if (typeof res.data === 'string' && res.data.startsWith('PDF')) {
          window.open(config.apiInvUri + '/' + res.data)
        }
      }
    })
  }
  const feetoptionChange = () => {
    const find = feetContent.value.find(
      (x) => x.groupNumber.toString() == printForm.value.footNote_Option
    )
    if (find) printForm.value.footNote_Data = find.content
  }
  const comptitleChange = () => {
    if (printForm.value.comptitleNo > 0) {
      const idx = printForm.value.comptitleNo - 1
      const find = comptitleList.value?.[idx]
      if (find && 'content1' in find) printForm.value.comptitle = find.content1
    }
  }
  onMounted(() => {
    //抓註腳api
    callApi({
      method: 'POST',
      url: api.Exes.Exes_FootNote
    }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        if (data && Array.isArray(data)) {
          feetContent.value = data
          feetoptionChange()
        }
      }
    })
    //抓公司抬頭api
    callApi({
      method: 'POST',
      url: api.Phr.Comptitle
    }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        if (data && Array.isArray(data)) {
          comptitleList.value = data
        }
      }
    })
  })
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="列印" width="1000" @afterLeave="handlePrintClose">
    <v-row dense :align="'center'">
      <v-col cols="4">
        <c-input :model-value="no" label="請款單號" :disabled="true" />
      </v-col>
      <v-col cols="4">
        <c-select
          v-model="printForm.print_Style"
          label="報表內容"
          :items="printStyleDDL"
          item-title="label"
          item-value="value"
          hide-search
        />
      </v-col>
      <v-col cols="4">
        <c-select
          v-model="printForm.footNote_Option"
          label="三行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
          @update:modelValue="feetoptionChange"
        />
      </v-col>
      <v-responsive width="100%" />
      <v-col cols="4">
        <c-select
          v-model="printForm.comptitleNo"
          label="公司標題"
          :items="[
            { label: '第一組', value: 1 },
            { label: '第二組', value: 2 },
            { label: '第三組', value: 3 },
            { label: '第四組', value: 4 },
            { label: '第五組', value: 5 }
          ]"
          :item-title="(item) => item?.label ?? ''"
          item-value="value"
          hide-search
          @update:modelValue="comptitleChange"
        />
      </v-col>
      <v-col cols="6">
        <c-input :model-value="printForm.comptitle" disabled />
      </v-col>
      <v-col cols="12">
        <c-textarea
          class="feetnote-data"
          v-model="printForm.footNote_Data"
          label="表尾註腳內容"
          :input-max-rows="3"
        />
      </v-col>
      <v-col cols="12"></v-col>
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

<style scoped>
  .feetnote-data {
    height: 126px;
  }
  .feetnote-data :deep(textarea) {
    white-space: pre; /* 不自動換行 */
    overflow-x: auto; /* 超過寬度時顯示水平捲軸 */
  }
</style>

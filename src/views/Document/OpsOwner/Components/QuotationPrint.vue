<script lang="ts" setup>
  import { ref, onMounted, nextTick } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTextarea,
    cRadioGroup,
    cDialog,
    cDataTable
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'
  import type { DataTableHeader } from 'vuetify'
  import { numberFormat } from '@/utils/uformat'
  import { transTWdate } from '@/utils/udate'

  const isOpen = defineModel({ default: false })
  const props = defineProps({
    no: String
  })

  //列印
  const printForm = ref({
    print_Style: '',
    footNote_Option: '1',
    footNote_Data: '',
    comptitleNo: 0,
    comptitle: '華薪資訊有限公司',
    easyMeno: true,
    easyRow: 10
  })
  const printStyleDDL = ref([
    { label: '詳細價目表', value: '' },
    { label: '總  表', value: 'SUM' },
    { label: '單價分析表', value: 'BOM' },
    { label: '簡要表', value: 'EASY' },
    { label: '規格說明', value: 'PJT' },
    { label: '工程分析表', value: 'PRM' },
    { label: '簡要自定ㄧ', disabled: true },
    { label: '簡要自定二', disabled: true },
    { label: '規格說明ㄧ', disabled: true },
    { label: '規格說明二', disabled: true },
    { label: '工程分析ㄧ', disabled: true },
    { label: '工程分析二', disabled: true }
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
        print_Style: '',
        footNote_Option: '1',
        footNote_Data: '',
        comptitleNo: 0,
        comptitle: '華薪資訊有限公司',
        easyMeno: true,
        easyRow: 10
      }
      feetoptionChange()
    })
  }
  const handlePreview = (type: 'single' | 'multi' = 'single') => {
    const { print_Style, comptitle, footNote_Data, easyMeno, easyRow } = printForm.value
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_Print,
      data: {
        qno: type === 'multi' ? [...selected.value] : [props.no ?? ''],
        type: print_Style,
        comptitle,
        footNote_Data,
        easyMeno,
        easyRow
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

  //列印多筆彈窗
  const multiPrintDS = ref(false)
  const dateFilter = ref({
    start: '',
    end: ''
  })
  const sqteList = ref<any[]>([])
  const headers: DataTableHeader[] = [
    { title: '報價單號', key: 'qno', sortable: false },
    { title: '報價日期', key: 'date1', sortable: false },
    { title: '工程名稱', key: 'protname', sortable: false },
    { title: '總計金額', key: 'amount', sortable: false }
  ]
  const selected = ref([])
  const sqtedetList = ref<any[]>([])
  const detHeaders: DataTableHeader[] = [
    { title: '工料編號', key: 'itemno', sortable: false },
    { title: '工料名稱', key: 'itemname', sortable: false },
    { title: '數量', key: 'qty', sortable: false },
    { title: '單位', key: 'unit', sortable: false },
    { title: '進價', key: 'price', sortable: false }
  ]
  const searchSqteList = () => {
    dateFilter.value.end = transTWdate(new Date())
    if (!dateFilter.value.start) {
      const after30day = new Date()
      after30day.setDate(after30day.getDate() - 30)
      dateFilter.value.start = transTWdate(after30day)
    }
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_List,
      data: {
        date1_start: dateFilter.value.start,
        date1_end: dateFilter.value.end,
        qno_start: '',
        qno_end: '',
        custno_start: '',
        custno_end: '',
        empno: '',
        protno: '',
        itemno: '',
        memo1: '',
        pageNumber: 1,
        pageSize: 1000,
        top: 1000
      }
    }).then((res) => {
      if (res?.status === 200) {
        const { data } = res?.data
        if (data && Array.isArray(data)) {
          sqteList.value = data
          selected.value = []
        }
      }
    })
  }
  const handleMultiPrintClose = () => {
    nextTick(() => {
      dateFilter.value = {
        start: '',
        end: ''
      }
      sqteList.value = []
      selected.value = []
      sqtedetList.value = []
    })
  }
  const handleSqteRowSelect = (data) => {
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_Data,
      data: { index1: data.index1 }
    }).then((res) => {
      if (res.status === 200) {
        const { sqtedet_chinesenum_list } = res.data

        if (sqtedet_chinesenum_list && Array.isArray(sqtedet_chinesenum_list)) {
          sqtedetList.value = sqtedet_chinesenum_list
        } else {
          sqtedetList.value = []
        }
      } else {
        sqtedetList.value = []
      }
    })
  }
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="列印" width="1000" @afterLeave="handlePrintClose">
    <v-row dense :align="'center'">
      <v-col cols="4">
        <c-input :model-value="no" label="報價單號" :disabled="true" />
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
      <v-col cols="auto">
        <c-radio-group
          v-model="printForm.easyMeno"
          label="簡要表-備註列印："
          :items="[
            { value: true, label: '是' },
            { value: false, label: '否' }
          ]"
          inline
          :disabled="printForm.print_Style !== 'EASY'"
        />
      </v-col>
      <v-col cols="auto">
        <c-input
          v-model="printForm.easyRow"
          type="number"
          label="簡要表列印筆數（最多28筆）"
          :maxlength="2"
          :disabled="printForm.print_Style !== 'EASY'"
        />
      </v-col>
      <v-col cols="auto">
        <c-button
          kind="pick"
          :disabled="!['EASY', 'PJT'].includes(printForm.print_Style)"
          @click="multiPrintDS = true"
        >
          列印其他單號
        </c-button>
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

  <c-dialog v-model="multiPrintDS" width="1200" @afterLeave="handleMultiPrintClose">
    <v-row dense :align="'center'">
      <v-col cols="auto">
        <c-input
          type="date"
          v-model="dateFilter.start"
          label="日期區間"
          icon="fa-solid fa-calendar-day"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input type="date" v-model="dateFilter.end" icon="fa-solid fa-calendar-day" disabled />
      </v-col>
      <v-col cols="auto" class="ms-2 me-1">
        <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="searchSqteList">
          查詢
        </c-button>
      </v-col>
      <v-col cols="auto mx-1">
        <c-button
          kind="print"
          icon="fa-solid fa-file-pdf"
          @click="handlePreview('multi')"
          :disabled="selected.length == 0 || !selected"
        >
          預覽
        </c-button>
      </v-col>
      <v-col cols="auto mx-1">
        <c-button kind="cancel" icon="mdi-close-circle" @click="multiPrintDS = false">
          結束
        </c-button>
      </v-col>
      <v-col cols="12" class="fs-5 fw-bold text-danger">
        EX：如不輸入日期區間，則系統會自動搜索30天內的單據
      </v-col>
      <c-data-table
        v-model="sqteList"
        v-model:selected="selected"
        :headers="headers"
        striped="even"
        show-select
        selectable
        item-value="qno"
        height="279"
        fixed-header
        @rowselect="handleSqteRowSelect"
      >
        <template v-slot:item.amount="{ scope }">
          {{ numberFormat(scope.amount, { thousands: true }) }}
        </template>
      </c-data-table>

      <c-data-table
        class="mt-3"
        v-model="sqtedetList"
        :headers="detHeaders"
        striped="even"
        height="310"
        fixed-header
      >
        <template v-slot:item.qty="{ scope }">
          {{ numberFormat(scope.qty, { thousands: true }) }}
        </template>
        <template v-slot:item.price="{ scope }">
          {{ numberFormat(scope.price, { thousands: true }) }}
        </template>
      </c-data-table>
    </v-row>
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

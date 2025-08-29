<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cButton, cInput, cBread } from '@/components/Common' //匯入自定義的UI元件
  import { searchCust } from '@/components/SearchCust' //業主彈窗元件查詢
  import { searchItem } from '@/components/SearchItem' //工料彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' //工程彈窗元件查詢
  import MultiCust from './Components/MultiCust.vue' //業主彈窗(多選)
  import MultiItem from './Components/MultiItem.vue' //工料彈窗(多選)
  import MultiProt from './Components/MultiProt.vue'
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import api from '@/api' //api清單
  import { useSearchCust } from '@/store/searchCust'
  const storeCust = useSearchCust()
  import { useSearchItem } from '@/store/searchItem'
  const storeItem = useSearchItem()
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()

  // 查詢的資料(結果)
  const formData = ref({
    quotationDateFrom: '',
    quotationDateTo: '',
    ownerNoFrom: '',
    ownerNoTo: '',
    itemNoFrom: '',
    itemNoTo: '',
    projectNoFrom: '',
    projectNoTo: '',
    remark: '',
    custom1: '',
    ownerNosLimiteds: [], //業主多選(只有業主編號)
    itemNosLimiteds: [], //工料多選
    projectNosLimiteds: [], //工程多選
    owners: [],
    items: [],
    prot: []
  })

  // 業主選單 / 多選控制
  // 業主單選彈窗開關
  const ownerPickOpen = ref()
  // 業主多選彈窗開關
  const MultiCustDs = ref(false)
  // 判斷業主是否為多選的狀態
  const isMultiOwner = ref(false)
  // 業主單選的資料
  const openOwnerPicker = (t) => {
    const toKey = t === 'from' ? 'ownerNoFrom' : 'ownerNoTo'
    storeCust.set(formData, [{ from: 'custno', to: toKey }], {
      open: ownerPickOpen.value?.open
    })
  }
  const onMultiOwnerPicks = (rows) => {
    formData.value.owners = rows //全部資料
    formData.value.ownerNosLimiteds = rows //只有業主編號
      .map((r) => String(r.custno).trim())
      .filter(Boolean)
    isMultiOwner.value = formData.value.ownerNosLimiteds.length > 0
    formData.value.ownerNoFrom = ''
    formData.value.ownerNoTo = ''
    console.log(formData.value.owners)
    console.log(formData.value.ownerNosLimiteds)
    if (formData.value.ownerNosLimiteds.length <= 0) {
      formData.value.ownerNoFrom = ''
      formData.value.ownerNoTo = ''
    }
  }

  // 工料單選控制
  const itemPickOpen = ref()

  const openItemPicker = (t) => {
    const toKey = t === 'from' ? 'itemNoFrom' : 'itemNoTo'
    storeItem.set(formData, [{ from: 'itemno', to: toKey }], {
      open: itemPickOpen.value?.open
    })
  }

  // 工料多選控制
  const MulitItemDs = ref(false)
  const isMultiItem = ref(false)

  function onMulitItemPicks(rows) {
    formData.value.items = rows //全部資料
    formData.value.itemNosLimiteds = rows //只有工料編號
      .map((r) => String(r.itemno).trim())
      .filter(Boolean)
    isMultiItem.value = formData.value.itemNosLimiteds.length > 0
    formData.value.itemNoFrom = ''
    formData.value.itemNoTo = ''
    console.log(formData.value.items)
    console.log(formData.value.itemNosLimiteds)
    if (formData.value.itemNosLimiteds.length <= 0) {
      formData.value.itemNoFrom = ''
      formData.value.itemNoTo = ''
    }
  }

  //工程單選/多選控制
  const projectPickOpen = ref()
  const isMultiProt = ref(false) // 是否為多選狀態
  const MulitProtDs = ref(false) //多選視窗控制
  const openProjectPicked = (t) => {
    const toKey = t === 'from' ? 'projectNoFrom' : 'projectNoTo'
    storeProt.set(formData, [{ from: 'protno', to: toKey }], {
      open: projectPickOpen.value?.open
    })
  }
  // 如果是多選狀態的處理
  const onMulitProtPicks = (rows) => {
    formData.value.prot = rows // 全部資料
    formData.value.projectNosLimiteds = rows // 只有工程編號
      .map((r) => String(r.protno).trim())
      .filter(Boolean)

    isMultiProt.value = formData.value.projectNosLimiteds.length > 0

    // 多選時清空單選輸入
    formData.value.projectNoFrom = ''
    formData.value.projectNoTo = ''

    // 若清到 0 筆，仍保持單選清空
    if (formData.value.projectNosLimiteds.length <= 0) {
      formData.value.projectNoFrom = ''
      formData.value.projectNoTo = ''
    }
  }

  // 列印表單
  const printForm = ref({
    dates: { begin: '0870101', end: '1141231' },
    custNOs: { begin: '', end: '', limiteds: [''] },
    itemNOs: { begin: '', end: '', limiteds: [''] },
    protNOs: { begin: '', end: '', limiteds: [''] },
    pagination: { start: 0, length: 100, draw: 1 },
    descrip: '',
    sqtedetud: '',
    feetNo: '05',
    printType: ''
  })

  // 列印作業
  const handlePrint = async () => {
    try {
      printForm.value.descrip = (formData.value.remark || '').trim()
      printForm.value.dates.begin = formData.value.quotationDateFrom
      printForm.value.dates.end = formData.value.quotationDateTo
      printForm.value.custNOs.begin = formData.value.ownerNoFrom
      printForm.value.custNOs.end = formData.value.ownerNoTo
      printForm.value.custNOs.limiteds = formData.value.ownerNosLimiteds
      printForm.value.itemNOs.begin = formData.value.itemNoFrom
      printForm.value.itemNOs.end = formData.value.itemNoTo
      printForm.value.itemNOs.limiteds = formData.value.itemNosLimiteds
      printForm.value.protNOs.begin = formData.value.projectNoFrom
      printForm.value.protNOs.end = formData.value.projectNoTo
      printForm.value.protNOs.limiteds = formData.value.projectNosLimiteds
      console.log(printForm.value)
      const res = await callApi({
        method: 'POST',
        url: api.SqteBrow.Print,
        data: printForm.value
      })

      const path = String(res.data)
        .trim()
        .replace(/^["']|["']$/g, '') // 去掉首尾引號（若有）
        .replace(/\\/g, '/') // 反斜線→斜線
        .replace(/^\.?\//, '') // 去掉開頭 ./ 或 /
      if (typeof path === 'string' && path.startsWith('PDF')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        // 開新分頁；被阻擋就下載
        const w = window.open(fileURL)
        if (!w) {
          const a = document.createElement('a')
          a.href = fileURL
          // a.download = filePath.split('/').pop() || '報價單.pdf'
          a.target = '_blank'
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
      } else return console.warn('沒有取得檔名')
    } catch (err) {
      console.error(err)
    }
  }

  // EXCEL下載
  const handleExportExcel = async () => {
    try {
      printForm.value.descrip = (formData.value.remark || '').trim()
      printForm.value.dates.begin = formData.value.quotationDateFrom
      printForm.value.dates.end = formData.value.quotationDateTo
      printForm.value.custNOs.begin = formData.value.ownerNoFrom
      printForm.value.custNOs.end = formData.value.ownerNoTo
      printForm.value.custNOs.limiteds = formData.value.ownerNosLimiteds
      printForm.value.itemNOs.begin = formData.value.itemNoFrom
      printForm.value.itemNOs.end = formData.value.itemNoTo
      printForm.value.itemNOs.limiteds = formData.value.itemNosLimiteds
      printForm.value.protNOs.begin = formData.value.projectNoFrom
      printForm.value.protNOs.end = formData.value.projectNoTo
      printForm.value.protNOs.limiteds = formData.value.projectNosLimiteds
      const res = await callApi({
        method: 'POST',
        url: api.SqteBrow.Excel,
        data: printForm.value
      })
      console.log('excel res:', res)

      //Excel/報價作業_20250829_111901_173.xlsx
      const path = String(res)
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\/g, '/')
        .replace(/^\.?\//, '')

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

  // 共用過濾：只留英數，截到指定長度
  const alnumN = (v, n, toUpper = true) => {
    const s = String(v ?? '')
      .normalize('NFKC') // 全形 １２３ａｂｃ → 123abc
      .replace(/[^0-9a-z]/gi, '') // 移除非英數
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }
  // 共用過濾：只留數字，截到指定長度
  const digitsN = (v, n) =>
    String(v ?? '')
      .replace(/\D/g, '')
      .slice(0, n)

  // 業主 10 碼
  const ownerNoFromModel = computed({
    get: () => formData.value.ownerNoFrom,
    set: (val) => {
      formData.value.ownerNoFrom = alnumN(val, 10)
    }
  })
  const ownerNoToModel = computed({
    get: () => formData.value.ownerNoTo,
    set: (val) => {
      formData.value.ownerNoTo = alnumN(val, 10)
    }
  })

  // 工料 20 碼
  const itemNoFromModel = computed({
    get: () => formData.value.itemNoFrom,
    set: (val) => {
      formData.value.itemNoFrom = alnumN(val, 20)
    }
  })
  const itemNoToModel = computed({
    get: () => formData.value.itemNoTo,
    set: (val) => {
      formData.value.itemNoTo = alnumN(val, 20)
    }
  })

  // 工程 16 碼
  const projectNoFromModel = computed({
    get: () => formData.value.projectNoFrom,
    set: (val) => {
      formData.value.projectNoFrom = alnumN(val, 16)
    }
  })
  const projectNoToModel = computed({
    get: () => formData.value.projectNoTo,
    set: (val) => {
      formData.value.projectNoTo = alnumN(val, 16)
    }
  })
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0">
      <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="handlePrint">列印</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="create" icon="fa-solid fa-file-excel" @click="handleExportExcel">
          匯出Excel
        </c-button>
      </v-col>
    </v-row>
  </c-bread>

  <!-- 查詢表單 -->
  <v-card color="#1b2b36" rounded="lg" class="mt-4" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報價日期區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">報價日期</h5>
        </v-col>
        <v-col cols="12" md="10">
          <v-row align="center">
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="7">
                  <c-input
                    type="date"
                    v-model="formData.quotationDateFrom"
                    label="開始日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="1" class="text-center">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="7">
                  <c-input
                    type="date"
                    v-model="formData.quotationDateTo"
                    label="結束日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 業主編號區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">業主編號</h5>
        </v-col>
        <v-col cols="12" md="10">
          <v-row align="center">
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="8">
                  <c-input
                    v-model="ownerNoFromModel"
                    label="起始編號"
                    :disabled="isMultiOwner"
                    :maxlength="10"
                    density="compact"
                    @button="openOwnerPicker('from')"
                    @keydown="
                      (e) =>
                        storeCust.keyEnter(
                          e,
                          formData,
                          [{ from: 'custno', to: 'ownerNoFrom' }],
                          ownerNoFromModel,
                          { open: () => openOwnerPicker('from') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="1" class="text-center">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="8">
                  <c-input
                    v-model="ownerNoToModel"
                    label="結束編號"
                    :disabled="isMultiOwner"
                    :maxlength="10"
                    density="compact"
                    @button="openOwnerPicker('to')"
                    @keydown="
                      (e) =>
                        storeCust.keyEnter(
                          e,
                          formData,
                          [{ from: 'custno', to: 'ownerNoTo' }],
                          ownerNoToModel,
                          { open: () => openOwnerPicker('to') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="2" class="d-flex justify-end justify-sm-start">
              <c-button
                kind="search"
                icon="fa-solid fa-magnifying-glass"
                @click="MultiCustDs = true"
                width="60%"
              >
                多選式
              </c-button>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 工料編號區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">工料編號</h5>
        </v-col>
        <v-col cols="12" md="10">
          <v-row align="center">
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="11">
                  <c-input
                    v-model="itemNoFromModel"
                    label="起始編號"
                    :disabled="isMultiItem"
                    :maxlength="20"
                    density="compact"
                    @button="openItemPicker('from')"
                    @keydown="
                      (e) =>
                        storeItem.keyEnter(
                          e,
                          formData,
                          [{ from: 'itemno', to: 'itemNoFrom' }],
                          itemNoFromModel,
                          { open: () => openItemPicker('from') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="1" class="text-center">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="11">
                  <c-input
                    v-model="itemNoToModel"
                    label="結束編號"
                    :disabled="isMultiItem"
                    :maxlength="20"
                    density="compact"
                    @button="openItemPicker('to')"
                    @keydown="
                      (e) =>
                        storeItem.keyEnter(
                          e,
                          formData,
                          [{ from: 'itemno', to: 'itemNoTo' }],
                          itemNoToModel,
                          { open: () => openItemPicker('to') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="2" class="d-flex justify-end justify-sm-start">
              <c-button
                kind="search"
                icon="fa-solid fa-magnifying-glass"
                @click="MulitItemDs = true"
                width="60%"
              >
                多選式
              </c-button>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 工程編號區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">工程編號</h5>
        </v-col>
        <v-col cols="12" md="10">
          <v-row align="center">
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="10">
                  <c-input
                    v-model="projectNoFromModel"
                    label="起始編號"
                    :maxlength="16"
                    density="compact"
                    :disabled="isMultiProt"
                    @button="openProjectPicked('from')"
                    @keydown="
                      (e) =>
                        storeProt.keyEnter(
                          e,
                          formData,
                          [{ from: 'protno', to: 'projectNoFrom' }],
                          projectNoFromModel,
                          { open: () => openProjectPicked('from') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="1" class="text-center">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="12" sm="4">
              <v-row>
                <v-col cols="10">
                  <c-input
                    v-model="projectNoToModel"
                    label="結束編號"
                    :maxlength="16"
                    density="compact"
                    :disabled="isMultiProt"
                    @button="openProjectPicked('to')"
                    @keydown="
                      (e) =>
                        storeProt.keyEnter(
                          e,
                          formData,
                          [{ from: 'protno', to: 'projectNoTo' }],
                          projectNoToModel,
                          { open: () => openProjectPicked('to') }
                        )
                    "
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" sm="2" class="d-flex justify-end justify-sm-start">
              <c-button
                kind="search"
                icon="fa-solid fa-magnifying-glass"
                @click="MulitProtDs = true"
                width="60%"
              >
                多選式
              </c-button>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 其他欄位 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">說明</h5>
        </v-col>
        <v-col cols="12" md="6">
          <c-input v-model="formData.remark" label="說明" density="compact" />
        </v-col>
      </v-row>

      <v-row align="center" dense>
        <v-col cols="12" md="1" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium">報價自定一</h5>
        </v-col>
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="6">
              <c-input v-model="formData.custom1" label="報價自定一" density="compact" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- 彈窗元件 -->
  <!-- 業主單選視窗 -->
  <search-cust ref="ownerPickOpen" @pick="storeCust.pick" />

  <!-- 工料單選視窗 -->
  <search-item ref="itemPickOpen" @pick="storeItem.pick" />

  <!-- 工程單選視窗 -->
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />

  <!-- 業主多選彈窗 -->
  <Multi-cust v-model="MultiCustDs" @pick="onMultiOwnerPicks" :preselected="formData.owners" />

  <!-- 工料多選彈窗 -->
  <Multi-item v-model="MulitItemDs" @pick="onMulitItemPicks" :preselected="formData.items" />

  <!-- 工程多選彈窗 -->
  <Multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" :preselected="formData.prot" />
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cButton, cInput, cBread } from '@/components/Common' //匯入自定義的UI元件
  import { searchCust } from '@/components/SearchCust' //業主彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' //工程彈窗元件查詢
  import MultiCust from './Components/MultiCust.vue' //業主彈窗(多選)
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
    projectNosLimiteds: [], //工程多選
    owners: [],
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
    dates: { begin: '', end: '' },
    custNOs: { begin: '', end: '', limiteds: [''] },
    protNOs: { begin: '', end: '', limiteds: [''] }
  })

  // 列印作業
  const handlePrint = async () => {
    try {
      printForm.value.dates.begin = formData.value.quotationDateFrom
      printForm.value.dates.end = formData.value.quotationDateTo
      printForm.value.custNOs.begin = formData.value.ownerNoFrom
      printForm.value.custNOs.end = formData.value.ownerNoTo
      printForm.value.custNOs.limiteds = formData.value.ownerNosLimiteds
      printForm.value.protNOs.begin = formData.value.projectNoFrom
      printForm.value.protNOs.end = formData.value.projectNoTo
      printForm.value.protNOs.limiteds = formData.value.projectNosLimiteds
      console.log(printForm.value)
      const res = await callApi({
        method: 'POST',
        url: api.Billing.Print,
        data: printForm.value
      })
      const path = String(res).trim()

      if (typeof path === 'string' && path.startsWith('PDF')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        const w = window.open(fileURL)
      } else return console.warn('沒有取得檔名')
    } catch (err) {
      console.error(err)
    }
  }

  // EXCEL下載
  const handleExportExcel = async () => {
    try {
      printForm.value.dates.begin = formData.value.quotationDateFrom
      printForm.value.dates.end = formData.value.quotationDateTo
      printForm.value.custNOs.begin = formData.value.ownerNoFrom
      printForm.value.custNOs.end = formData.value.ownerNoTo
      printForm.value.custNOs.limiteds = formData.value.ownerNosLimiteds
      printForm.value.protNOs.begin = formData.value.projectNoFrom
      printForm.value.protNOs.end = formData.value.projectNoTo
      printForm.value.protNOs.limiteds = formData.value.projectNosLimiteds
      const res = await callApi({
        method: 'POST',
        url: api.Billing.Excel,
        data: printForm.value
      })

      const path = String(res).trim()

      if (typeof path === 'string' && path.startsWith('Excel')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        const a = document.createElement('a')
        a.href = fileURL
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
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }

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
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報價日期區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">報價日期</h5>
        </v-col>
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
                  <c-input
                    type="date"
                    v-model="formData.quotationDateFrom"
                    label="開始日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="auto">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
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
        <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">業主編號</h5>
        </v-col>
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-10ch">
                  <c-input
                    v-model="ownerNoFromModel"
                    label="起始編號"
                    :disabled="isMultiOwner"
                    :maxlength="10"
                    density="compact"
                    @button="openOwnerPicker('from')"
                    :length-auto-width="false"
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
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="auto">
              <v-row>
                <v-col cols="auto" class="u-wch w-10ch">
                  <c-input
                    v-model="ownerNoToModel"
                    label="結束編號"
                    :disabled="isMultiOwner"
                    :maxlength="10"
                    density="compact"
                    @button="openOwnerPicker('to')"
                    :length-auto-width="false"
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
            <v-col cols="auto">
              <div class="btn">
                <c-button
                  kind="search"
                  icon="fa-solid fa-magnifying-glass"
                  @click="MultiCustDs = true"
                >
                  多選式
                </c-button>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- 工程編號區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">工程編號</h5>
        </v-col>
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-16ch">
                  <c-input
                    v-model="projectNoFromModel"
                    label="起始編號"
                    :maxlength="16"
                    density="compact"
                    :disabled="isMultiProt"
                    @button="openProjectPicked('from')"
                    :length-auto-width="false"
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
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="auto">
              <v-row>
                <v-col cols="auto" class="u-wch w-16ch">
                  <c-input
                    v-model="projectNoToModel"
                    label="結束編號"
                    :maxlength="16"
                    density="compact"
                    :disabled="isMultiProt"
                    @button="openProjectPicked('to')"
                    :length-auto-width="false"
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
            <v-col cols="auto">
              <div class="btn">
                <c-button
                  kind="search"
                  icon="fa-solid fa-magnifying-glass"
                  @click="MulitProtDs = true"
                >
                  多選式
                </c-button>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- 彈窗元件 -->
  <!-- 業主單選視窗 -->
  <search-cust ref="ownerPickOpen" @pick="storeCust.pick" />
  <!-- 工程單選視窗 -->
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />
  <!-- 業主多選彈窗 -->
  <Multi-cust v-model="MultiCustDs" @pick="onMultiOwnerPicks" :preselected="formData.owners" />
  <!-- 工程多選彈窗 -->
  <Multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" :preselected="formData.prot" />
</template>
<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .sqte-form {
    --chpx: 16px;
    --from-slot-w: calc(20 * var(--chpx));
  }
  .w-7ch {
    --wch: calc(16 * var(--chpx));
  }
  .w-10ch {
    --wch: calc(20 * var(--chpx));
  }
  .w-16ch {
    --wch: calc(24 * var(--chpx));
  }
  .w-60ch {
    --wch: calc(50 * var(--chpx));
  }
  .w-20ch {
    --wch: calc(27 * var(--chpx));
  }
  /* 按鈕尺寸 */
  .btn {
    width: 150px;
  }
  /* ~的尺寸跟對齊 */
  .sep-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    /* 可選固定寬，對齊更穩（不想固定就拿掉下一行） */
    min-width: 24px;
    padding-inline: 8px;
  }
  .sep {
    line-height: 1;
    display: inline-block;
    font-size: 1.25rem;
  }
  .col4-min {
    min-width: 380px;
    flex: 1 1 380px;
  }
  .title-text {
    width: 120px;
  }
  @media (max-width: 1469.98px) {
    .stack-1470 {
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }
    .sep-1470 {
    }
  }
</style>

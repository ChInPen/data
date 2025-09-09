<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' //匯入自定義的UI元件
  import { searchCust } from '@/components/SearchCust' //業主彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' //工程彈窗元件查詢
  import MultiCust from '@/components/MultiCust/MultiCust.vue' //業主彈窗(多選)
  import MultiProt from '@/components/MultiProt/MultiProt.vue'
  import { message } from '@/components/Message/service' // 彈窗訊息
  import { useSearchCust } from '@/store/searchCust'
  const storeCust = useSearchCust()
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()
  import type { SearchData } from '@/components/SearchCust/type'
  import api from '@/api'
  import { callApi } from '@/utils/uapi'
  import config from '@/config/config' //統一呼叫路徑

  // 查詢的資料(結果)
  const formData = ref({
    dates: { begin: '', end: '' },
    custNOs: { begin: '', end: '', limiteds: [''] },
    protNOs: { begin: '', end: '', limiteds: [''] },
    feetNo: '05',
    printType: '0',
    customType: ''
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
  const printTypeDDL = ref({
    list: [
      { value: '0', title: '總額表' },
      { value: '1', title: '工程明細' },
      { value: '2', title: '報價明細' }
    ],
    value: 'value',
    title: 'title'
  })
  // 業主選單 / 多選控制
  const ownerPickOpen = ref() // 業主單選彈窗開關
  const MultiCustDs = ref(false) // 業主多選彈窗開關
  const isMultiOwner = ref(false) // 判斷業主是否為多選的狀態
  const selectedOwner = ref<SearchData[]>([]) //控制已選擇的多選
  const selectedOwnerOne = ref({ begin: '', end: '' }) //控制單選
  // 業主單選的資料
  const openOwnerPicker = (t) => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeCust.set(selectedOwnerOne, [{ from: 'custno', to: toKey }], {
      open: ownerPickOpen.value?.open
    })
  }

  const onMultiOwnerPicks = (rows) => {
    selectedOwner.value = rows //全部資料
      .map((r) => String(r.custno).trim())
      .filter(Boolean)
    isMultiOwner.value = selectedOwner.value.length > 0
    formData.value.custNOs.begin = ''
    formData.value.custNOs.end = ''
  }

  //工程單選/多選控制
  const projectPickOpen = ref()
  const isMultiProt = ref(false) // 是否為多選狀態
  const MulitProtDs = ref(false) //多選視窗控制
  const selectedProt = ref<SearchData[]>([]) //控制已選擇的多選
  const selectedProtOne = ref({ begin: '', end: '' }) //控制單選
  const openProjectPicked = (t) => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeProt.set(selectedProtOne, [{ from: 'protno', to: toKey }], {
      open: projectPickOpen.value?.open
    })
  }
  // 如果是多選狀態的處理
  const onMulitProtPicks = (rows) => {
    selectedProt.value = rows // 全部資料
    formData.value.custNOs.limiteds = rows // 只有工程編號
      .map((r) => String(r.protno).trim())
      .filter(Boolean)

    isMultiProt.value = formData.value.custNOs.limiteds.length > 0

    // 多選時清空單選輸入
    formData.value.custNOs.begin = ''
    formData.value.custNOs.end = ''
  }
  watch(
    [
      () => selectedOwnerOne.value.begin,
      () => selectedOwnerOne.value.end,
      () => selectedProtOne.value.begin,
      () => selectedProtOne.value.end
    ],
    ([val1, val2, val3, val4], [old1, old2, old3, old4]) => {
      if (val1 !== old1) formData.value.custNOs.begin = val1
      if (val2 !== old2) formData.value.custNOs.end = val2
      if (val3 !== old3) formData.value.protNOs.begin = val3
      if (val4 !== old4) formData.value.protNOs.end = val4
    }
  )
  // 列印+EXCEL表單
  const onSubmitPrint = async (t: string) => {
    const API = t === 'Print' ? api.Billing.Print : api.Billing.Excel
    try {
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value
      })
      console.log(res)
      if (t === 'Print') {
        if (typeof res === 'string' && res.startsWith('PDF')) {
          window.open(config.apiUri + '/' + res)
        } else {
          console.warn('沒有取得檔名', res)
        }
      } else {
        if (typeof res === 'string' && res.startsWith('Excel')) {
          window.open(config.apiUri + '/' + res)
        } else {
          console.warn('沒有取得檔名', res)
        }
      }
    } catch (error) {
      console.error('發生錯誤' + error)
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
    get: () => formData.value.custNOs.begin,
    set: (val) => {
      formData.value.custNOs.begin = alnumN(val, 10)
    }
  })
  const ownerNoToModel = computed({
    get: () => formData.value.custNOs.end,
    set: (val) => {
      formData.value.custNOs.end = alnumN(val, 10)
    }
  })

  // 工程 16 碼
  const projectNoFromModel = computed({
    get: () => formData.value.protNOs.begin,
    set: (val) => {
      formData.value.protNOs.begin = alnumN(val, 16)
    }
  })
  const projectNoToModel = computed({
    get: () => formData.value.protNOs.end,
    set: (val) => {
      formData.value.protNOs.end = alnumN(val, 16)
    }
  })
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0">
      <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="onSubmitPrint('Print')">
          列印
        </c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="create" icon="fa-solid fa-file-excel" @click="onSubmitPrint('Excel')">
          匯出Excel
        </c-button>
      </v-col>
    </v-row>
  </c-bread>

  <!-- 查詢表單 -->
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報表類別 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-20ch">
              <c-select
                v-model="formData.printType"
                label="報表內容"
                :items="printTypeDDL.list"
                :item-title="printTypeDDL.title"
                :item-value="printTypeDDL.value"
                hide-search
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- 報價日期區間 -->
      <v-row align="center" class="mb-3" dense>
        <!-- <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">報價日期</h5>
        </v-col> -->
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
                  <c-input
                    type="date"
                    v-model="formData.dates.begin"
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
                    v-model="formData.dates.end"
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
      <v-row align="center" class="mb-3" dense>
        <!-- <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">業主編號</h5>
        </v-col> -->
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-10ch">
                  <c-input
                    v-model="ownerNoFromModel"
                    label="業主編號"
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
                    label="業主編號"
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
      <v-row align="center" class="mb-3" dense>
        <!-- <v-col cols="auto" class="d-flex align-center">
          <h5 class="text-white mb-0 font-weight-medium title-text">工程編號</h5>
        </v-col> -->
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-16ch">
                  <c-input
                    v-model="projectNoFromModel"
                    label="工程編號"
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
                    label="工程編號"
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
      <!-- 其他欄位 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-7ch">
              <c-select
                v-model="formData.feetNo"
                label="單行註腳"
                :items="feetNoDDL.list"
                :item-title="feetNoDDL.title"
                :item-value="feetNoDDL.value"
                hide-search
              />
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
  <multi-cust v-model="MultiCustDs" @pick="onMultiOwnerPicks" :preselected="selectedOwner" />
  <!-- 工程多選彈窗 -->
  <multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" :preselected="selectedProt" />
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
  }
</style>

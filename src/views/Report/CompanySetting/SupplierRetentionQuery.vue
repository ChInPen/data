<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import type { SearchData } from './type/SearchDataType'
  import { searchSupp } from '@/components/SearchSupp' // 廠商彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' // 工程彈窗元件查詢
  import MultiProt from './Components/MultiProt.vue' // 工程彈窗(多選)
  import MultiSupp from './Components/MultiSupp.vue' // 廠商編號彈窗(多選)
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { useSearchSupp } from '@/store/searchSupp'
  const storeSupp = useSearchSupp()
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()
  // 表單/列印/EXCEL
  const formData = ref({
    intono: '1', //單別
    retaimonc: '1', //保留款餘額
    adate_s: '', //開始日期
    adate_e: '', //結束日期
    protno_s: '', //
    protno_e: '',
    protno_list: [],
    suppno_s: '',
    suppno_e: '',
    suppno_list: []
  })
  // 單別內容
  const intoNoDDL = ref({
    list: [
      { value: '1', title: '全部' },
      { value: '2', title: '採購' },
      { value: '3', title: '發包' }
    ],
    value: 'value',
    title: 'title'
  })
  // 保留款內容
  const retaimoncDDL = ref({
    list: [
      { value: '1', title: '全部' },
      { value: '2', title: '非零' }
    ],
    value: 'value',
    title: 'title'
  })
  // 廠商單選/多選控制
  const suppPickOpen = ref() //控制單選視窗開關
  const MultiSuppDs = ref(false) //控制多選視窗開關
  const isMultiSupp = ref(false) //控制是否為多選狀態
  const selectedSupp = ref<SearchData[]>([]) //控制多選
  const selectedSuppOne = ref({ begin: '', end: '' }) //控制單選
  const openSuppPicker = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeSupp.set(selectedSuppOne, [{ from: 'suppno', to: toKey }], {
      open: suppPickOpen.value?.open
    })
  }
  watch(
    [() => selectedSuppOne.value.begin, () => selectedSuppOne.value.end],
    ([val1, val2], [old1, old2]) => {
      if (val1 !== old1) formData.value.suppno_s = val1
      if (val2 !== old2) formData.value.suppno_e = val2
    }
  )
  const onMultiSuppPicks = (rows: any[]) => {
    selectedSupp.value = rows
    formData.value.suppno_list = rows.map((r) => String(r.suppno).trim()).filter(Boolean)
    isMultiSupp.value = formData.value.suppno_list.length > 0
    selectedSuppOne.value.begin = ''
    selectedSuppOne.value.end = ''
  }

  // 工程單選/多選控制
  const projectPickOpen = ref() //控制單選視窗開關
  const MulitProtDs = ref(false) //控制多選視窗開關
  const isMultiProt = ref(false) //控制是否為多選狀態
  const selectedProt = ref<SearchData[]>([]) //控制多選
  const selectedProtOne = ref({ begin: '', end: '' }) //控制單選
  const openProjectPicked = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeProt.set(selectedProtOne, [{ from: 'protno', to: toKey }], {
      open: projectPickOpen.value?.open
    })
  }
  watch(
    [() => selectedProtOne.value.begin, () => selectedProtOne.value.end],
    ([val1, val2], [old1, old2]) => {
      if (val1 !== old1) formData.value.protno_s = val1
      if (val2 !== old2) formData.value.protno_e = val2
    }
  )
  const onMulitProtPicks = (rows: any[]) => {
    selectedProt.value = rows
    formData.value.protno_list = rows.map((r) => String(r.protno).trim()).filter(Boolean)
    isMultiProt.value = formData.value.protno_list.length > 0
    selectedProtOne.value.begin = ''
    selectedProtOne.value.end = ''
  }

  // 共用過濾：只留英數，截到指定長度
  const alnumN = (v: string, n: number, toUpper = true) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }

  // 廠商 8 碼
  const suppNoFromModel = computed({
    get: () => formData.value.suppno_s,
    set: (val) => {
      formData.value.suppno_s = alnumN(val, 8)
    }
  })
  const suppNoToModel = computed({
    get: () => formData.value.suppno_e,
    set: (val) => {
      formData.value.suppno_e = alnumN(val, 8)
    }
  })

  // 工程 16 碼
  const projectNoFromModel = computed({
    get: () => formData.value.protno_s,
    set: (val) => {
      formData.value.protno_s = alnumN(val, 16)
    }
  })
  const projectNoToModel = computed({
    get: () => formData.value.protno_e,
    set: (val) => {
      formData.value.protno_e = alnumN(val, 16)
    }
  })

  // 呼叫API送出列印資料
  const onSubmitPrint = async (t) => {
    console.log(JSON.stringify(formData.value, null, 2))
    const API = api.SupplierRetentionQuery.Print
    const res = await callApi({
      method: 'POST',
      url: API,
      data: formData.value
    })
    console.log(res)
    if (typeof res === 'string' && res.startsWith('PDF')) {
      window.open(config.apiUri + '/' + res)
    } else {
      console.warn('沒有取得檔名', res)
    }
  }
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0" dense>
      <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="onSubmitPrint('Print')">
          列印
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
            <v-col cols="6" class="u-wch w-16ch">
              <c-select
                v-model="formData.intono"
                label="單別"
                :items="intoNoDDL.list"
                :item-title="intoNoDDL.title"
                :item-value="intoNoDDL.value"
                hide-search
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-16ch">
              <c-select
                v-model="formData.retaimonc"
                label="保留款餘額"
                :items="retaimoncDDL.list"
                :item-title="retaimoncDDL.title"
                :item-value="retaimoncDDL.value"
                hide-search
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- 報價日期區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
                  <c-input
                    type="date"
                    v-model="formData.adate_s"
                    label="開始日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1 sep-1470">～</span>
            </v-col>
            <v-col cols="auto">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
                  <c-input
                    type="date"
                    v-model="formData.adate_e"
                    label="結束日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- 廠商編號區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-8ch">
                  <c-input
                    v-model="suppNoFromModel"
                    label="廠商編號"
                    :disabled="isMultiSupp"
                    :maxlength="8"
                    density="compact"
                    @button="openSuppPicker('from')"
                    :length-auto-width="false"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1 sep-1470">～</span>
            </v-col>
            <v-col cols="auto">
              <v-row>
                <v-col cols="auto" class="u-wch w-8ch">
                  <c-input
                    v-model="suppNoToModel"
                    label="廠商編號"
                    :disabled="isMultiSupp"
                    :maxlength="8"
                    density="compact"
                    @button="openSuppPicker('to')"
                    :length-auto-width="false"
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="auto" class="stack-1470">
              <div class="btn">
                <c-button
                  kind="search"
                  icon="fa-solid fa-magnifying-glass"
                  @click="MultiSuppDs = true"
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
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
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
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="1" class="text-center d-none d-md-block">
              <span class="text-h5 text-grey-lighten-1 sep-1470">～</span>
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
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="auto" class="stack-1470">
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
  <search-supp ref="suppPickOpen" @pick="storeSupp.pick" />
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />
  <Multi-supp v-model="MultiSuppDs" @pick="onMultiSuppPicks" :preselected="selectedSupp" />
  <Multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" :preselected="selectedProt" />
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
  .w-8ch {
    --wch: calc(18 * var(--chpx));
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
    /* 想要大一點可調整大小 */
    font-size: 1.25rem;
  }
  /* < md：最小 432px，空間夠可拉寬；不夠就換行 */
  .col4-min {
    min-width: 400px;
    flex: 1 1 400px;
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
  @media (max-width: 1787.98px) {
    .stack-1787 {
      flex: 0 0 100% !important;
      max-width: 100% !important;
      /* 下面三行是關鍵：覆蓋 u-wch 的 width/min/max，否則仍是固定 w-60ch */
      width: 100% !important;
      min-width: 0 !important;
      /* 視需求：若想讓它可拉伸就用 none，若只想不小於行寬也可留 100% */
      /* max-width: none !important;  */
    }
  }
</style>

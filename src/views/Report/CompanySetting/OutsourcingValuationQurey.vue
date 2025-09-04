<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import type { SearchData } from './type/SearchDataType'
  import { searchSupp } from '@/components/SearchSupp' // 廠商彈窗元件查詢
  import { searchItem } from '@/components/SearchItem' // 工料彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' // 工程彈窗元件查詢
  import { searchPurPords } from '@/components/SearchPurPord' // 工程彈窗元件查詢
  import MultiItem from './Components/MultiItem.vue' // 工料彈窗(多選)
  import MultiProt from './Components/MultiProt.vue' // 工程彈窗(多選)
  import MultiSupp from './Components/MultiSupp.vue' // 廠商編號彈窗(多選)
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { useSearchSupp } from '@/store/searchSupp'
  const storeSupp = useSearchSupp()
  import { useSearchItem } from '@/store/searchItem'
  const storeItem = useSearchItem()
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()
  import { useSearchPurPord } from '@/store/searchPurPords'
  const storePurPord = useSearchPurPord()
  // 表單/列印/EXCEL
  const formData = ref({
    dates: {
      begin: '', // 開始時間
      end: '' // 結束時間
    },
    suppNOs: {
      begin: '', // 廠商編號開始
      end: '', // 廠商編號結束
      limiteds: [] as string[] // 廠商編號多選
    },
    puremitOno: '', //發包估驗單號
    itemNOs: {
      begin: '', // 工料編號開始
      end: '', // 工料編號結束
      limiteds: [] as string[] // 工料編號多選
    },
    protNOs: {
      begin: '', // 工程編號開始
      end: '', // 工程編號結束
      limiteds: [] as string[] // 工程編號多選
    },
    pagination: {
      start: 0,
      length: 10,
      draw: 1
    },
    feetNo: '20', // 表尾註腳編號
    printType: '內定報表' //內定報表
  })
  // 表尾註腳
  const feetNoDDL = ref({
    list: [
      { feetno: '01', feetname: '第一組' },
      { feetno: '02', feetname: '第二組' },
      { feetno: '03', feetname: '第三組' },
      { feetno: '04', feetname: '第四組' },
      { feetno: '05', feetname: '第五組' },
      { feetno: '20', feetname: '不列印' }
    ],
    value: 'feetno',
    title: 'feetname'
  })

  // 報表內容
  const printType = ref({
    list: [
      { value: '內定報表', title: '內定報表' },
      { value: '內定報表二', title: '內定報表二' }
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
      if (val1 !== old1) formData.value.suppNOs.begin = val1
      if (val2 !== old2) formData.value.suppNOs.end = val2
    }
  )
  const onMultiSuppPicks = (rows: any[]) => {
    selectedSupp.value = rows
    formData.value.suppNOs.limiteds = rows.map((r) => String(r.suppno).trim()).filter(Boolean)
    isMultiSupp.value = formData.value.suppNOs.limiteds.length > 0
    selectedSuppOne.value.begin = ''
    selectedSuppOne.value.end = ''
  }
  // 採估單號
  const purPordPickOpen = ref()
  const selectPurPordOno = ref({ puremitOno: '' }) // 存單選拿到的值
  const openPurPordPicker = () => {
    storePurPord.set(selectPurPordOno, [{ from: 'ono', to: 'puremitOno' }], {
      open: purPordPickOpen.value?.open
    })
    console.log(selectPurPordOno.value)
  }
  watch(
    () => selectPurPordOno.value.puremitOno,
    (val, old) => {
      if (val !== old) formData.value.puremitOno = val
    }
  )
  // 工料單選/多選控制
  const itemPickOpen = ref()
  const MulitItemDs = ref(false)
  const isMultiItem = ref(false)
  const selectedItems = ref<SearchData[]>([]) // 額外增加一個，專門給彈窗用
  const selectedItem = ref({ begin: '', end: '' }) // 存單選拿到的值
  const openItemPicker = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeItem.set(selectedItem, [{ from: 'itemno', to: toKey }], {
      open: itemPickOpen.value.open
    })
  }
  watch(
    [() => selectedItem.value.begin, () => selectedItem.value.end],
    ([val1, val2], [old1, old2]) => {
      if (val1 !== old1) formData.value.itemNOs.begin = val1
      if (val2 !== old2) formData.value.itemNOs.end = val2
    }
  )
  const onMulitItemPicks = (rows: any[]) => {
    selectedItems.value = rows // 存完整物件，方便彈窗 preselected
    formData.value.itemNOs.limiteds = rows.map((r) => String(r.itemno).trim()).filter(Boolean)
    isMultiItem.value = formData.value.itemNOs.limiteds.length > 0
    selectedItem.value.begin = ''
    selectedItem.value.end = ''
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
      if (val1 !== old1) formData.value.protNOs.begin = val1
      if (val2 !== old2) formData.value.protNOs.end = val2
    }
  )
  const onMulitProtPicks = (rows: any[]) => {
    selectedProt.value = rows
    formData.value.protNOs.limiteds = rows.map((r) => String(r.protno).trim()).filter(Boolean)
    isMultiProt.value = formData.value.protNOs.limiteds.length > 0
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
    get: () => formData.value.suppNOs.begin,
    set: (val) => {
      formData.value.suppNOs.begin = alnumN(val, 8)
    }
  })
  const suppNoToModel = computed({
    get: () => formData.value.suppNOs.end,
    set: (val) => {
      formData.value.suppNOs.end = alnumN(val, 8)
    }
  })
  const purPordOnoModel = computed({
    get: () => formData.value.puremitOno,
    set: (val) => {
      formData.value.puremitOno = alnumN(val, 11)
    }
  })
  // 工料 20 碼
  const itemNoFromModel = computed({
    get: () => formData.value.itemNOs.begin,
    set: (val) => {
      formData.value.itemNOs.begin = alnumN(val, 20)
    }
  })
  const itemNoToModel = computed({
    get: () => formData.value.itemNOs.end,
    set: (val) => {
      formData.value.itemNOs.end = alnumN(val, 20)
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

  // 呼叫API送出列印資料
  const onSubmitPrint = async (t) => {
    console.log(JSON.stringify(formData.value, null, 2))

    const API = t === 'Print' ? api.OutsourcingValuation.Print : api.OutsourcingValuation.Excel
    const res = await callApi({
      method: 'POST',
      url: API,
      data: formData.value
    })
    console.log(res)

    if (t === 'Print') {
      if (typeof res.data === 'string' && res.data.startsWith('PDF')) {
        window.open(config.apiUri + '/' + res.data)
      } else {
        console.warn('沒有取得檔名', res.data)
      }
    } else {
      if (typeof res === 'string' && res.startsWith('Excel')) {
        const a = document.createElement('a')
        a.href = config.apiUri + '/' + res
        a.download = decodeURIComponent(res.split('/').pop())
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        console.warn('沒有取得檔名', res)
      }
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
                :items="printType.list"
                :item-title="printType.title"
                :item-value="printType.value"
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
                    v-model="formData.dates.begin"
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
      <!-- 採估單號區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-16ch">
                  <c-input
                    v-model="purPordOnoModel"
                    label="發包估驗單號"
                    :maxlength="11"
                    density="compact"
                    @button="openPurPordPicker()"
                    :length-auto-width="false"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- 工料編號區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-20ch">
                  <c-input
                    v-model="itemNoFromModel"
                    label="工料編號"
                    :disabled="isMultiItem"
                    :maxlength="20"
                    density="compact"
                    @button="openItemPicker('from')"
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
                <v-col cols="auto" class="u-wch w-20ch">
                  <c-input
                    v-model="itemNoToModel"
                    label="工料編號"
                    :disabled="isMultiItem"
                    :maxlength="20"
                    density="compact"
                    @button="openItemPicker('to')"
                    :length-auto-width="false"
                  />
                </v-col>
              </v-row>
            </v-col>
            <!-- <v-col cols="auto" class="stack-1470">
              <div class="btn">
                <c-button
                  kind="search"
                  icon="fa-solid fa-magnifying-glass"
                  @click="MulitItemDs = true"
                >
                  多選式
                </c-button>
              </div>
            </v-col> -->
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
            <!-- <v-col cols="auto" class="stack-1470">
              <div class="btn">
                <c-button
                  kind="search"
                  icon="fa-solid fa-magnifying-glass"
                  @click="MulitProtDs = true"
                >
                  多選式
                </c-button>
              </div>
            </v-col> -->
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
  <search-pur-pords ref="purPordPickOpen" @pick="storePurPord.pick" />
  <search-supp ref="suppPickOpen" @pick="storeSupp.pick" />
  <search-item ref="itemPickOpen" @pick="storeItem.pick" />
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />
  <Multi-supp v-model="MultiSuppDs" @pick="onMultiSuppPicks" :preselected="selectedSupp" />
  <!-- <Multi-item v-model="MulitItemDs" @pick="onMulitItemPicks" :preselected="selectedItems" /> -->
  <!-- <Multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" :preselected="selectedProt" /> -->
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
    min-width: 432px;
    flex: 1 1 432px;
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

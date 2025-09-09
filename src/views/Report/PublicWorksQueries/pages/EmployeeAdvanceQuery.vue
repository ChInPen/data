<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import type { SearchData } from '../../shared/types/SearchDataType'
  import { searchEmp } from '@/components/SearchEmp'
  import { useSearchEmp } from '@/store/searchEmp'
  import MultiEmp from '../../../../components/MultiEmp/MultiEmp.vue'
  const storeEmp = useSearchEmp()
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  // 表單/列印/EXCEL
  const formData = ref({
    dates: {
      begin: '', // 開始時間
      end: '' // 結束時間
    },
    empNOs: {
      //員工編號
      begin: '',
      end: '',
      limiteds: ['']
    },
    pagination: { start: 0, length: 100, draw: 1 }, //排列筆數
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
  const printTypeDDL = ref({
    list: [{ valueOn: '內定報表', title: '內定報表' }],
    value: 'valueOn',
    title: 'title'
  })

  // 共用過濾：只留英數，截到指定長度
  const alnumN = (v: string, n: number, toUpper = true) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }

  // 員工 8 碼
  const suppNoFromModel = computed({
    get: () => formData.value.empNOs.begin,
    set: (val) => {
      formData.value.empNOs.begin = alnumN(val, 10)
    }
  })
  const suppNoToModel = computed({
    get: () => formData.value.empNOs.end,
    set: (val) => {
      formData.value.empNOs.end = alnumN(val, 10)
    }
  })
  // 員工單選/多選控制
  const EmpPickOpen = ref() //控制單選視窗開關
  const MultiEmpDs = ref(false) //控制多選視窗開關
  const isMultiEmp = ref(false) //控制是否為多選狀態
  const selectedEmp = ref<SearchData[]>([]) //控制多選
  const selectedEmpOne = ref({ begin: '', end: '' }) //控制單選
  const openSuppPicker = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeEmp.set(selectedEmpOne, [{ from: 'empno', to: toKey }], {
      open: EmpPickOpen.value?.open
    })
  }
  watch(
    [() => selectedEmpOne.value.begin, () => selectedEmpOne.value.end],
    ([val1, val2], [old1, old2]) => {
      if (val1 !== old1) formData.value.empNOs.begin = val1
      if (val2 !== old2) formData.value.empNOs.end = val2
    }
  )
  const onMultiEmpPicks = (rows: any[]) => {
    selectedEmp.value = rows
    formData.value.empNOs.limiteds = rows.map((r) => String(r.empno).trim()).filter(Boolean)
    isMultiEmp.value = formData.value.empNOs.limiteds.length > 0
    selectedEmpOne.value.begin = ''
    selectedEmpOne.value.end = ''
  }
  // 呼叫API送出列印資料
  const onSubmitPrint = async (t) => {
    console.log(JSON.stringify(formData.value, null, 2))

    const API = t === 'Print' ? api.EmployeeAdvanceQuery.Print : api.EmployeeAdvanceQuery.Excel
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
      <!-- <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-file-lines" @click="">明細資料</c-button>
      </v-col> -->
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
      <!-- 員工編號區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col cols="2" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-10ch">
                  <c-input
                    v-model="suppNoFromModel"
                    label="員工編號"
                    :disabled="isMultiEmp"
                    :maxlength="10"
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
                <v-col cols="auto" class="u-wch w-10ch">
                  <c-input
                    v-model="suppNoToModel"
                    label="員工編號"
                    :disabled="isMultiEmp"
                    :maxlength="10"
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
                  @click="MultiEmpDs = true"
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
  <!-- 員工單選 -->
  <search-emp ref="EmpPickOpen" @pick="storeEmp.pick" />
  <!-- 員工多選 -->
  <multi-emp v-model="MultiEmpDs" @pick="onMultiEmpPicks" :preselected="selectedEmp" />
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
    min-width: 300px;
    flex: 1 1 300px;
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

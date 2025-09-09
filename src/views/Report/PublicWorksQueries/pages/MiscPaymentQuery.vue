<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import type { SearchData } from '../../shared/types/SearchDataType'
  import { searchProt } from '@/components/SearchProt' // 工程彈窗元件查詢
  import MultiProt from '../../../../components/MultiProt/MultiProt.vue' // 工程彈窗(多選)
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()
  import { message } from '@/components/Message/service' // 彈窗訊息
  // 表單/列印/EXCEL
  const formData = ref({
    date1_s: '',
    date1_e: '',
    protno_s: '',
    protno_e: '',
    protno_list: [],
    start: 0,
    length: 10
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
  const loading = ref(false)
  const onSubmitPrint = async (t) => {
    if (loading.value) return
    loading.value = true
    try {
      console.log(JSON.stringify(formData.value, null, 2))
      if (!formData.value.date1_e || !formData.value.date1_s) {
        message.alert({
          type: 'error',
          message: '查詢日期不可為空！'
        })
        return
      }
      const API = api.MiscPaymentQuery.Print
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value,
        params: {
          FootNote_Data: '本報表僅供內部參考'
        },
        timeout: 120000 // 2分鐘
      })

      console.log('print res:', res)

      const path = typeof res === 'string' ? res : res?.data
      if (typeof path === 'string' && path.startsWith('PDF')) {
        window.open(config.apiUri + '/' + path)
      } else {
        console.warn('沒有取得檔名', res)
      }
    } catch (err) {
      if (err.response) {
        console.error('列印失敗:', err.response.status, err.response.data)
      } else {
        console.error('列印失敗:', err.message || err)
      }
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0" dense>
      <v-col cols="auto">
        <c-button
          kind="print"
          :icon="loading ? '' : 'fa-solid fa-print'"
          @click="onSubmitPrint('Print')"
          :disabled="loading"
        >
          <template v-if="loading">
            <i class="fa-solid fa-spinner fa-spin me-2"></i>
            列印中...
          </template>
          <template v-else>列印</template>
        </c-button>
      </v-col>
    </v-row>
  </c-bread>

  <!-- 查詢表單 -->

  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報價日期區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <v-row>
                <v-col cols="auto" class="u-wch w-7ch">
                  <c-input
                    type="date"
                    v-model="formData.date1_s"
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
                    v-model="formData.date1_e"
                    label="結束日期"
                    density="compact"
                  />
                </v-col>
              </v-row>
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
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />
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

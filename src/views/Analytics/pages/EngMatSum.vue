<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  import { cButton, cBread, cSelect } from '@/components/Common' // 共用元件
  import DateRange from '@/views/Report/composable/DateRange.vue' //日期選擇框
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtMultiBut from '../composable/Prot/ProtMultiBut.vue'
  import ItemStart from '../composable/Item/ItemStart.vue'
  import ItemEnd from '../composable/Item/ItemEnd.vue'
  import ItemMultiBut from '../composable/Item/ItemMultiBut.vue'

  const formData = ref({
    dates: {
      begin: '',
      end: ''
    },
    protno: {
      value: '',
      limiteds: [] as any[]
    },
    feetNo: '05'
  })

  const formDataDetail = ref({
    dates: {
      begin: '',
      end: ''
    },
    protno: {
      value: '',
      limiteds: []
    },
    itemnos: {
      begin: '',
      end: '',
      limiteds: []
    },
    feetNo: '05'
  })
  // 報表內容
  const reportData = ref('1')
  const printTypeDDL = ref({
    list: [
      { valueOn: '1', title: '彙總表' },
      { valueOn: '2', title: '明細表' }
    ],
    value: 'valueOn',
    title: 'title'
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

  // 是否為明細表
  const isDetail = computed(() => reportData.value === '2')

  // 切換成彙總表時，清空 itemnos
  watch(isDetail, (now) => {
    if (!now) {
      formDataDetail.value.itemnos = { begin: '', end: '', limiteds: [] }
    }
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  // 送出時依類型組裝 payload
  const onSubmitPrint = async (t: any) => {
    const hasDate = !!(formData.value.dates.begin && formData.value.dates.end)
    if (!hasDate) {
      message.alert({ type: 'error', message: '查詢日期不可為空！' })
      return
    }
    if (loadingPrint.value) return
    loadingPrint.value = true

    // 明細表帶 itemnos；彙總表不帶
    const payload = isDetail.value
      ? { ...formData.value, itemnos: formDataDetail.value.itemnos }
      : { ...formData.value }

    const API =
      reportData.value === '1'
        ? t === 'Print'
          ? api.EngMatSum.SummaryPrint
          : api.EngMatSum.SummaryExcel // 彙總表 API
        : t === 'Print'
          ? api.EngMatSum.DetailPrint
          : api.EngMatSum.DetailExcel // 明細表 API
    console.log(JSON.stringify(formData.value, null, 2))
    console.log(API)
    try {
      const res = await callApi({
        method: 'POST',
        url: API,
        data: payload,
        timeout: 120000
      })
      const path = typeof res === 'string' ? res : res?.data
      if (t === 'Print') {
        if (typeof path === 'string' && path.startsWith('PDF')) {
          window.open(config.apiUri + '/' + path)
        } else {
          console.warn('沒有取得檔名', res)
        }
      } else {
        if (typeof path === 'string' && path.startsWith('Excel')) {
          window.open(config.apiUri + '/' + path)
        } else {
          console.warn('沒有取得檔名', res)
        }
      }
    } catch (err: any) {
      if (err.response) {
        console.error('列印失敗:', err.response.status, err.response.data)
      } else {
        console.error('列印失敗:', err.message || err)
      }
    } finally {
      loadingPrint.value = false
    }
  }
  // ✅ 判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.protno.limiteds?.length ?? 0) > 0)
  const isMulti2 = computed(() => (formDataDetail.value.itemnos.limiteds?.length ?? 0) > 0)
  // ✅ 一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.protno.value = ''
    }
  })
  watch(isMulti2, (on) => {
    if (on) {
      formDataDetail.value.itemnos.begin = ''
      formDataDetail.value.itemnos.end = ''
    }
  })
</script>
<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0" dense>
      <v-col cols="auto">
        <c-button
          kind="print"
          :icon="loadingPrint ? '' : 'fa-solid fa-print'"
          @click="onSubmitPrint('Print')"
          :disabled="loadingPrint"
        >
          <template v-if="loadingPrint">
            <i class="fa-solid fa-spinner fa-spin me-2"></i>
            列印中...
          </template>
          <template v-else>列印</template>
        </c-button>
      </v-col>
      <v-col cols="auto">
        <c-button
          kind="create"
          :icon="loadingExcel ? '' : 'fa-solid fa-file-excel'"
          @click="onSubmitPrint('Excel')"
          :disabled="loadingExcel"
        >
          <template v-if="loadingExcel">
            <i class="fa-solid fa-spinner fa-spin me-2"></i>
            匯出中...
          </template>
          <template v-else>匯出Excel</template>
        </c-button>
      </v-col>
    </v-row>
  </c-bread>
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報表類別 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6">
              <c-select
                v-model="reportData"
                label="報表內容"
                :items="printTypeDDL.list"
                :item-title="printTypeDDL.title"
                :item-value="printTypeDDL.value"
                hide-search
                class="sheet"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!-- 日期區間 -->
      <v-row align="center" class="mb-3" dense>
        <v-col>
          <DateRange v-model="formData.dates" dense />
        </v-col>
      </v-row>
      <!-- 工程區塊 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="auto">
          <ProtStart v-model="formData.protno.value" :disabled="isMulti" dense />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protno.limiteds" dense />
        </v-col>
      </v-row>
      <!-- 只有明細表才出現 itemRange -->
      <!-- 工料區塊 -->
      <v-row align="center" v-if="isDetail" class="mb-3" dense>
        <v-col cols="auto">
          <ItemStart v-model="formDataDetail.itemnos.begin" :disabled="isMulti2" dense />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ItemEnd v-model="formDataDetail.itemnos.end" :disabled="isMulti2" dense />
        </v-col>
        <v-col cols="auto">
          <ItemMultiBut v-model="formDataDetail.itemnos.limiteds" dense />
        </v-col>
      </v-row>
      <!-- 其他欄位 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6">
              <c-select
                v-model="formData.feetNo"
                label="單行註腳"
                :items="feetNoDDL.list"
                :item-title="feetNoDDL.title"
                :item-value="feetNoDDL.value"
                hide-search
                class="sheet"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .sheet {
    width: 250px;
  }
</style>

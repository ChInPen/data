<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cDivider, cBread, cSelect } from '@/components/Common' //匯入自定義的UI元件
  import { message } from '@/components/Message/service' // 彈窗訊息
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import config from '@/config/config'
  // 日期區間
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 業主區間
  import CustStart from '@/views/Analytics/composable/Cust/CustStart.vue'
  import CustEnd from '@/views/Analytics/composable/Cust/CustEnd.vue'
  import CustMultiBut from '@/views/Analytics/composable/Cust/CustMultiBut.vue'
  // 工程區間
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  // 註腳
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  // 查詢的資料(結果)
  const formData = ref({
    dates: { begin: '', end: '' },
    custNOs: { begin: '', end: '', limiteds: [] },
    protNOs: { begin: '', end: '', limiteds: [] },
    feetNo: '20',
    printType: '0',
    customType: ''
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
  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.custNOs.limiteds?.length ?? 0) > 0)
  const isMulti2 = computed(() => (formData.value.protNOs.limiteds?.length ?? 0) > 0)
  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.custNOs.begin = ''
      formData.value.custNOs.end = ''
    }
  })
  watch(isMulti2, (on) => {
    if (on) {
      formData.value.protNOs.begin = ''
      formData.value.protNOs.end = ''
    }
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: any) => {
    if (loadingPrint.value || loadingExcel.value) return
    if (!formData.value.dates.begin || !formData.value.dates.end) {
      message.alert({
        type: 'error',
        message: '查詢日期不可為空！'
      })
      return
    }
    if (t === 'Print') {
      loadingPrint.value = true
    } else {
      loadingExcel.value = true
    }
    const API = t === 'Print' ? api.BillingQuery.Print : api.BillingQuery.Excel
    try {
      console.log(JSON.stringify(formData.value, null, 2))
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value,
        // params: {
        //   Print_Type: PrintType.value.PrintTypeRef
        // },
        timeout: 120000 // 2分鐘
      })
      console.log('print res:', res)
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
    } catch (err) {
      if (err.response) {
        console.error('列印失敗:', err.response.status, err.response.data)
      } else {
        console.error('列印失敗:', err.message || err)
      }
    } finally {
      loadingPrint.value = false
      loadingExcel.value = false
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

  <!-- 查詢表單 -->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <!-- 報表類別 -->
      <v-row :align="'center'" dense>
        <v-col cols="auto">
          <c-select
            v-model="formData.printType"
            label="報表內容"
            :items="printTypeDDL.list"
            :item-title="printTypeDDL.title"
            :item-value="printTypeDDL.value"
            hide-search
            width="240"
          />
        </v-col>
      </v-row>
      <!-- 日期區間 -->
      <v-row class="mt-2" :align="'center'">
        <DateRange
          v-model:from="formData.dates.begin"
          v-model:to="formData.dates.end"
          labelFrom="開始日期"
          labelTo="結束日期"
          dense
        />
      </v-row>
      <!-- 業主區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <CustStart v-model="formData.custNOs.begin" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <CustEnd v-model="formData.custNOs.end" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <CustMultiBut v-model="formData.custNOs.limiteds" />
        </v-col>
      </v-row>
      <!-- 工程區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <ProtStart v-model="formData.protNOs.begin" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="formData.protNOs.end" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protNOs.limiteds" />
        </v-col>
      </v-row>
      <!-- 註腳區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="formData.feetNo"
            label="單行註腳"
            :items="undefined"
            :dense="true"
            :hideSearch="true"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

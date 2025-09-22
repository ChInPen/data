<script lang="ts" setup>
  import { ref } from 'vue'
  import { cButton, cDivider, cBread, cSelect } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  // 訊息
  import { message } from '@/components/Message/service'
  // 日期區間
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 註腳
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    dates: {
      begin: '', // 開始時間
      end: '' // 結束時間
    },
    feetNo: '20', // 表尾註腳編號
    printType: '1' //內定報表
  })

  // 報表內容
  const printTypeDDL = ref({
    list: [
      { valueOn: '1', title: '明細表' },
      { valueOn: '2', title: '簡要表' },
      { valueOn: '3', title: '總額表' }
    ],
    value: 'valueOn',
    title: 'title'
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
    const API = api.ArReceivedByDateQuery.Print
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
            label="報表類別"
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

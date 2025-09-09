<script setup lang="ts">
  import { ref } from 'vue'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  import { cButton, cBread } from '@/components/Common' // 共用元件
  import ProtSingle from '@/views/Report/composable/ProtSingle.vue' //工程單選框
  import DateRange from '@/views/Report/composable/DateRange.vue' //日期選擇框

  const formData = ref({
    protno: '',
    dates: {
      begin: '',
      end: ''
    }
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: any) => {
    if (!formData.value.dates.begin || !formData.value.dates.end) {
      message.alert({
        type: 'error',
        message: '查詢日期不可為空！'
      })
      return
    }
    if (loadingPrint.value) return
    if (!loadingPrint.value) {
      loadingPrint.value = true
    }
    console.log('loadingPrint.value', loadingPrint.value)
    const API = api.EngLog.Excel
    console.log(JSON.stringify(formData.value, null, 2))
    try {
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value,
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
    }
  }
</script>
<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0" dense>
      <v-col cols="auto">
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
      </v-col>
    </v-row>
  </c-bread>
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <DateRange v-model="formData.dates" dense />
      <ProtSingle v-model="formData.protno" dense />
    </v-card-text>
  </v-card>
</template>

<style scoped></style>

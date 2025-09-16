<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  import { cButton, cBread } from '@/components/Common' // 共用元件
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  import DateRange from '@/views/Report/composable/DateRange.vue'
  const formData = ref({
    date1_s: '',
    date1_e: '',
    protno: '',
    footNote: '20'
  })

  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: string) => {
    if (!formData.value.date1_s || !formData.value.date1_e) {
      message.alert({
        type: 'error',
        message: '查詢日期不可為空！'
      })
      return
    }
    if (loadingPrint.value || loadingExcel.value) return
    if (t === 'Print') {
      loadingPrint.value = true
    } else {
      loadingExcel.value = true
    }
    const API = t === 'Print' ? api.SiteWorkerAttendance.Print : api.SiteWorkerAttendance.Print
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
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 日期 -->
      <DateRange
        v-model:from="formData.date1_s"
        v-model:to="formData.date1_e"
        labelFrom="開始日期"
        labelTo="結束日期"
        dense
      />
      <v-row align="center">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno" />
        </v-col>
      </v-row>
      <!-- 註腳區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="formData.footNote"
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

<style scoped>
  .sheet {
    width: 300px;
  }
</style>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'

  import { message } from '@/components/Message/service' // 彈窗訊息
  // 日期區間
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 工程區間
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    date1_s: '',
    date1_e: '',
    protno_s: '',
    protno_e: '',
    protno_list: [],
    start: 0,
    length: 1000000000
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
    value: '20',
    title: 'feetname'
  })
  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.protno_list?.length ?? 0) > 0)
  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.protno_s = ''
      formData.value.date1_e = ''
    }
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: any) => {
    if (loadingPrint.value || loadingExcel.value) return
    if (!formData.value.date1_e || !formData.value.date1_s) {
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
    const API = api.MiscPaymentQuery.Print
    try {
      console.log(JSON.stringify(formData.value, null, 2))
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value,
        params: {
          FootNote_Data: feetNoDDL.value.title
        },
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
      <!-- 日期區間 -->
      <v-row :align="'center'">
        <DateRange
          v-model:from="formData.date1_s"
          v-model:to="formData.date1_e"
          labelFrom="開始日期"
          labelTo="結束日期"
          dense
        />
      </v-row>

      <!-- 工程區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno_e" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="formData.protno_s" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protno_list" />
        </v-col>
      </v-row>
      <!-- 註腳區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="feetNoDDL.value"
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

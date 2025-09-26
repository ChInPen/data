<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  // 訊息
  import { message } from '@/components/Message/service'
  // 日期區間
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 註腳
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  // 人員區間
  import EmpStart from '@/views/Analytics/composable/Emp/EmpStart.vue'
  import EmpEnd from '@/views/Analytics/composable/Emp/EmpEnd.vue'
  import EmpMultiBut from '@/views/Analytics/composable/Emp/EmpMultiBut.vue'
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
      limiteds: []
    },
    pagination: { start: 0, length: 1000000000, draw: 1 }, //排列筆數
    feetNo: '20', // 表尾註腳編號
    printType: '內定報表' //內定報表
  })
  // 報表內容
  const printTypeDDL = ref({
    list: [{ valueOn: '內定報表', title: '內定報表' }],
    value: 'valueOn',
    title: 'title'
  })
  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.empNOs.limiteds?.length ?? 0) > 0)
  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.empNOs.begin = ''
      formData.value.empNOs.end = ''
    }
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: any) => {
    console.log(JSON.stringify(formData.value, null, 2))

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
    const API = t === 'Print' ? api.EmployeeAdvanceQuery.Print : api.EmployeeAdvanceQuery.Excel
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
      <!-- 日期區間 -->
      <v-row :align="'center'">
        <DateRange
          v-model:from="formData.dates.begin"
          v-model:to="formData.dates.end"
          labelFrom="開始日期"
          labelTo="結束日期"
          dense
        />
      </v-row>

      <!-- 人員區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <EmpStart v-model="formData.empNOs.begin" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <EmpEnd v-model="formData.empNOs.end" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <EmpMultiBut v-model="formData.empNOs.limiteds" />
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

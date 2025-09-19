<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cInput, cBread, cDivider } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  // 訊息
  import { message } from '@/components/Message/service'
  // 日期區間
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 註腳
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  // 廠商區間
  import SuppStart from '@/views/Analytics/composable/Supp/SuppStart.vue'
  import SuppEnd from '@/views/Analytics/composable/Supp/SuppEnd.vue'
  import SuppMultiBut from '@/views/Analytics/composable/Supp/SuppMultiBut.vue'
  // 工料區間
  import ItemStart from '@/views/Analytics/composable/Item/ItemStart.vue'
  import ItemEnd from '@/views/Analytics/composable/Item/ItemEnd.vue'
  import ItemMultiBut from '@/views/Analytics/composable/Item/ItemMultiBut.vue'
  // 工程區間
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    dates: {
      begin: '', // 開始時間
      end: '' // 結束時間
    },
    suppnoNOs: {
      begin: '', // 廠商編號開始
      end: '', // 廠商編號結束
      limiteds: [] as string[] // 廠商編號多選
    },
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
      length: 1000000000,
      draw: 1
    },
    descrip: '',
    porddetmo1: '',
    payment1: '',
    feetNo: '20', // 表尾註腳編號
    printType: ''
  })
  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.suppnoNOs.limiteds?.length ?? 0) > 0)
  const isMulti2 = computed(() => (formData.value.itemNOs.limiteds?.length ?? 0) > 0)
  const isMulti3 = computed(() => (formData.value.protNOs.limiteds?.length ?? 0) > 0)
  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.suppnoNOs.begin = ''
      formData.value.suppnoNOs.end = ''
    }
  })
  watch(isMulti2, (on) => {
    if (on) {
      formData.value.itemNOs.begin = ''
      formData.value.itemNOs.end = ''
    }
  })
  watch(isMulti3, (on) => {
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
    const API = t === 'Print' ? api.PordBrowQuery.Print : api.PordBrowQuery.Excel
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

      <!-- 廠商區間 -->

      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <SuppStart v-model="formData.suppnoNOs.begin" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <SuppEnd v-model="formData.suppnoNOs.end" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <SuppMultiBut v-model="formData.suppnoNOs.limiteds" />
        </v-col>
      </v-row>

      <!-- 工料區間 -->

      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <ItemStart v-model="formData.itemNOs.begin" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ItemEnd v-model="formData.itemNOs.end" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto">
          <ItemMultiBut v-model="formData.itemNOs.limiteds" />
        </v-col>
      </v-row>

      <!-- 工程區間 -->

      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <ProtStart v-model="formData.protNOs.begin" :disabled="isMulti3" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="formData.protNOs.end" :disabled="isMulti3" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protNOs.limiteds" />
        </v-col>
      </v-row>

      <!-- 其他欄位 -->
      <!-- 說明 -->

      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <c-input
            v-model="formData.descrip"
            label="說明"
            density="compact"
            :length-auto-width="false"
            width="700"
          />
        </v-col>
      </v-row>
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <c-input
            v-model="formData.porddetmo1"
            label="採購自定一"
            density="compact"
            :length-auto-width="false"
            width="700"
          />
        </v-col>
      </v-row>
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <c-input
            v-model="formData.payment1"
            label="付款條件"
            density="compact"
            :length-auto-width="false"
            width="700"
          />
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

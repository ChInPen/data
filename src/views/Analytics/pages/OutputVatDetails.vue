<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cBread, cSelect } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  import CustStart from '@/views/Analytics/composable/Cust/CustStart.vue'
  import CustEnd from '@/views/Analytics/composable/Cust/CustEnd.vue'
  import CustMultiBut from '@/views/Analytics/composable/Cust/CustMultiBut.vue'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    date1_s: '',
    date1_e: '',
    custno_s: '',
    custno_e: '',
    custno_list: [],
    protno_s: '',
    protno_e: '',
    order: '1',
    report_type: '1'
  })
  // 排序
  const orderNoDDL = ref({
    list: [
      { value: '1', title: '發票號碼' },
      { value: '2', title: '發票日期' },
      { value: '3', title: '工程編號' }
    ],
    title: 'title',
    value: 'value'
  })
  // 報表內容
  const printTypeDDL = ref({
    list: [
      { valueOn: '1', title: '內定表一' },
      { valueOn: '2', title: '內定彙總表' }
    ],
    value: 'valueOn',
    title: 'title'
  })

  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t: any) => {
    if (!formData.value.date1_e || !formData.value.date1_s) {
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
    const API = t === 'Print' ? api.OutputVatDetails.Print : api.OutputVatDetails.Excel
    try {
      console.log(JSON.stringify(formData.value, null, 2))
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
      loadingExcel.value = false
    }
  }
  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.custno_list?.length ?? 0) > 0)

  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.custno_s = ''
      formData.value.custno_e = ''
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

  <!-- 查詢表單 -->

  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報表類別 -->
      <v-row align="center">
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-20ch">
              <c-select
                v-model="formData.report_type"
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
      <v-row align="center">
        <v-col cols="auto">
          <DateRange
            v-model:from="formData.date1_s"
            v-model:to="formData.date1_e"
            labelFrom="開始日期"
            labelTo="結束日期"
            dense
          />
        </v-col>
      </v-row>
      <!-- 業主區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <CustStart v-model="formData.custno_s" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block p-3">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <CustEnd v-model="formData.custno_e" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <CustMultiBut v-model="formData.custno_list" />
        </v-col>
      </v-row>
      <!-- 工程區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno_s" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block p-3">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="formData.protno_e" />
        </v-col>
      </v-row>
      <!-- 排序區間 -->
      <v-row align="center">
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-7ch">
              <c-select
                v-model="formData.order"
                label="排序"
                :items="orderNoDDL.list"
                :item-title="orderNoDDL.title"
                :item-value="orderNoDDL.value"
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

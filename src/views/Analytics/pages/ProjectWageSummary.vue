<script lang="ts" setup>
  import { computed, ref, watch, watchEffect } from 'vue'
  import { cButton, cInput, cBread, cSelect } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  import DateRange from '@/views/Report/composable/DateRange.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    date1_s: '',
    date1_e: '',
    protno: '',
    protNo_List: [],
    footNote: '20'
  })
  const indata = ref({
    dates: {
      begin: '',
      end: ''
    }
  })
  // 排序
  const orderNoDDL = ref({
    list: [
      { value: '1', title: '彙總表' },
      { value: '2', title: '明細表' }
    ],
    title: 'title',
    value: 'value',
    initial: '1'
  })
  watchEffect(() => {
    formData.value.date1_s = indata.value.dates.begin
    formData.value.date1_e = indata.value.dates.end
  })
  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const onSubmitPrint = async (t: any) => {
    console.log(JSON.stringify(formData.value, null, 2))

    if (!formData.value.date1_e || !formData.value.date1_s) {
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
    const API =
      orderNoDDL.value.initial === '1'
        ? api.ProjectWageSummary.SummaryPrint
        : api.ProjectWageSummary.DetailPrint
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
  // 判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.protNo_List?.length ?? 0) > 0)
  // 進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.protno = ''
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
    </v-row>
  </c-bread>

  <!-- 查詢表單 -->

  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報表內容 -->
      <v-row align="center">
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-7ch">
              <c-select
                v-model="orderNoDDL.initial"
                label="報表內容"
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
      <!-- 日期區間 -->
      <v-row align="center">
        <v-col>
          <DateRange v-model="indata.dates" dense />
        </v-col>
      </v-row>
      <!-- 工程區塊 -->
      <v-row align="center">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protNo_List" />
        </v-col>
      </v-row>
      <!-- 註腳區塊 -->
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
    width: 250px;
  }
</style>

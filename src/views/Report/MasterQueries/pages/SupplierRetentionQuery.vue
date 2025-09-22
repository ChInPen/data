<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cBread, cSelect, cDivider } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import { message } from '@/components/Message/service'
  // ======================
  import DateRange from '@/views/Report/composable/DateRange.vue'
  import SuppStart from '@/views/Analytics/composable/Supp/SuppStart.vue'
  import SuppEnd from '@/views/Analytics/composable/Supp/SuppEnd.vue'
  import SuppMultiBut from '@/views/Analytics/composable/Supp/SuppMultiBut.vue'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'

  // 表單/列印/EXCEL
  const formData = ref({
    intono: '1', //單別
    retaimonc: '1', //保留款餘額
    adate_s: '', //開始日期
    adate_e: '', //結束日期
    protno_s: '', //
    protno_e: '',
    protno_list: [],
    suppno_s: '',
    suppno_e: '',
    suppno_list: []
  })
  // 單別內容
  const intoNoDDL = ref({
    list: [
      { value: '1', title: '全部' },
      { value: '2', title: '採購' },
      { value: '3', title: '發包' }
    ],
    value: 'value',
    title: 'title'
  })
  // 保留款內容
  const retaimoncDDL = ref({
    list: [
      { value: '1', title: '全部' },
      { value: '2', title: '非零' }
    ],
    value: 'value',
    title: 'title'
  })

  //判斷是否進入多選模式
  const isMulti = computed(() => (formData.value.suppno_list?.length ?? 0) > 0)
  const isMulti2 = computed(() => (formData.value.protno_list?.length ?? 0) > 0)

  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      formData.value.suppno_e = ''
      formData.value.suppno_s = ''
    }
  })
  watch(isMulti2, (on) => {
    if (on) {
      formData.value.protno_e = ''
      formData.value.protno_s = ''
    }
  })
  // 呼叫API送出列印資料
  const loading = ref(false)
  const onSubmitPrint = async (t) => {
    if (loading.value) return
    loading.value = true
    if (!formData.value.adate_s || !formData.value.adate_e) {
      message.alert({
        type: 'error',
        message: '查詢日期不可為空！'
      })
      return
    }
    console.log(JSON.stringify(formData.value, null, 2))
    try {
      const API = api.SupplierRetentionQuery.Print
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value
      })
      console.log(res)
      if (typeof res === 'string' && res.startsWith('PDF')) {
        window.open(config.apiUri + '/' + res)
      } else {
        console.warn('沒有取得檔名', res)
      }
    } catch (error) {
      console.error('發生錯誤' + error)
    } finally {
      loading.value = false
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
          :icon="loading ? '' : 'fa-solid fa-print'"
          @click="onSubmitPrint('Print')"
          :disabled="loading"
        >
          <template v-if="loading">
            <i class="fa-solid fa-spinner fa-spin me-2"></i>
            列印中...
          </template>
          <template v-else>列印</template>
        </c-button>
      </v-col>
    </v-row>
  </c-bread>

  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <!-- 報表類別 -->
      <v-row :align="'center'" dense>
        <v-col cols="auto">
          <c-select
            v-model="formData.intono"
            label="單別"
            :items="intoNoDDL.list"
            :item-title="intoNoDDL.title"
            :item-value="intoNoDDL.value"
            hide-search
            width="240"
          />
        </v-col>
        <!-- 保留款餘額 -->
        <v-col cols="2">
          <c-select
            v-model="formData.retaimonc"
            label="保留款餘額"
            :items="retaimoncDDL.list"
            :item-title="retaimoncDDL.title"
            :item-value="retaimoncDDL.value"
            hide-search
            width="240"
          />
        </v-col>
      </v-row>
      <!-- 日期 -->
      <v-row class="mt-2" :align="'center'">
        <DateRange
          v-model:from="formData.adate_s"
          v-model:to="formData.adate_e"
          labelFrom="開始日期"
          labelTo="結束日期"
          dense
        />
      </v-row>
      <!-- 廠商區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <SuppStart v-model="formData.suppno_s" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <SuppEnd v-model="formData.suppno_e" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <SuppMultiBut v-model="formData.suppno_list" />
        </v-col>
      </v-row>
      <!-- 工程區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno_s" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="formData.protno_e" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="formData.protno_list" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<style scoped></style>

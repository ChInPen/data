<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cButton, cBread, cDivider } from '@/components/Common' // 共用元件
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  // 廠商區間
  import SuppStart from '@/views/Analytics/composable/Supp/SuppStart.vue'
  import SuppEnd from '@/views/Analytics/composable/Supp/SuppEnd.vue'
  import SuppMultiBut from '@/views/Analytics/composable/Supp/SuppMultiBut.vue'
  // 工程區間
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  // 註腳
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  // 表單/列印/EXCEL
  const formData = ref({
    suppno_s: '',
    suppno_e: '',
    suppno_list: [],
    protno_s: '',
    protno_e: '',
    protno_list: [],
    footNote_Data: '20' //表尾註腳
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
    try {
      console.log(JSON.stringify(formData.value, null, 2))
      const API = api.VendorPrepaymentQuery.Print
      const res = await callApi({
        method: 'POST',
        url: API,
        data: formData.value,
        timeout: 120000 // 2分鐘
      })

      console.log('print res:', res)

      const path = typeof res === 'string' ? res : res?.data
      if (typeof path === 'string' && path.startsWith('PDF')) {
        window.open(config.apiUri + '/' + path)
      } else {
        console.warn('沒有取得檔名', res)
      }
    } catch (err) {
      if (err.response) {
        console.error('列印失敗:', err.response.status, err.response.data)
      } else {
        console.error('列印失敗:', err.message || err)
      }
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

  <!-- 查詢表單 -->

  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <!-- 廠商區間 -->
      <v-row :align="'center'">
        <v-col cols="auto">
          <SuppStart v-model="formData.suppno_e" :disabled="isMulti" />
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
      <!-- 註腳區間 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="formData.footNote_Data"
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
<style scoped></style>

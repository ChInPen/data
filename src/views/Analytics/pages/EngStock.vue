<script setup lang="ts">
  import { ref } from 'vue'
  import { cButton, cBread } from '@/components/Common'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  const formData = ref({
    protno: '',
    feetNo: '05'
  })

  // 呼叫API送出列印資料
  const loading = ref(false)
  const onSubmitPrint = async (t) => {
    if (loading.value) return
    loading.value = true
    console.log(JSON.stringify(formData.value, null, 2))
    try {
      const API = api.EngStock.Print
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
      <!-- 工程區塊 -->
      <v-row :align="'center'">
        <v-col cols="auto">
          <ProtStart v-model="formData.protno" />
        </v-col>
      </v-row>
      <!-- 註腳區塊 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <FeetNoDDL v-model="formData.feetNo" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { cButton, cBread } from '@/components/Common'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import ItemStart from '@/views/Analytics/composable/Item/ItemStart.vue'
  import ItemEnd from '@/views/Analytics/composable/Item/ItemEnd.vue'
  import ItemMultiBut from '@/views/Analytics/composable/Item/ItemMultiBut.vue'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  const fromDate = ref({
    begin: '',
    end: '',
    limiteds: [] as string[],
    feetNo: '05'
  })

  //  判斷是否進入多選模式
  const isMulti = computed(() => (fromDate.value.limiteds?.length ?? 0) > 0)
  // 一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      fromDate.value.begin = ''
      fromDate.value.end = ''
    }
  })
  // 送出資料
  const loading = ref(false)
  async function submitFrom() {
    if (loading.value) return
    loading.value = true

    console.log(JSON.stringify(fromDate.value, null, 2))
    try {
      const API = api.EngMatStock.Print
      const res = await callApi({
        method: 'POST',
        url: API,
        data: fromDate.value,
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
          @click="submitFrom"
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
      <!-- 工料區塊 -->
      <v-row :align="'center'">
        <v-col cols="auto">
          <ItemStart v-model="fromDate.begin" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block p-3">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ItemEnd v-model="fromDate.end" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <ItemMultiBut v-model="fromDate.limiteds" />
        </v-col>
      </v-row>
      <!-- 註腳區塊 -->
      <v-row class="mt-2" :align="'center'">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="fromDate.feetNo"
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

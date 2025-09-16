<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { cButton, cBread } from '@/components/Common'
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import config from '@/config/config'
  import DateRange from '@/views/Report/composable/DateRange.vue'
  import CustStart from '@/views/Analytics/composable/Cust/CustStart.vue'
  import CustEnd from '@/views/Analytics/composable/Cust/CustEnd.vue'
  import CustMultiBut from '@/views/Analytics/composable/Cust/CustMultiBut.vue'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import ProtEnd from '@/views/Analytics/composable/Prot/ProtEnd.vue'
  import ProtMultiBut from '@/views/Analytics/composable/Prot/ProtMultiBut.vue'
  import FeetNoDDL from '@/views/Analytics/composable/FeetNoDDL.vue'
  import ItemStart from '@/views/Analytics/composable/Item/ItemStart.vue'
  import ItemEnd from '@/views/Analytics/composable/Item/ItemEnd.vue'
  import ItemMultiBut from '@/views/Analytics/composable/Item/ItemMultiBut.vue'
  import SuppStart from '@/views/Analytics/composable/Supp/SuppStart.vue'
  import SuppEnd from '@/views/Analytics/composable/Supp/SuppEnd.vue'
  import SuppMultiBut from '@/views/Analytics/composable/Supp/SuppMultiBut.vue'
  import EmpStart from '@/views/Analytics/composable/Emp/EmpStart.vue'
  import EmpEnd from '@/views/Analytics/composable/Emp/EmpEnd.vue'
  import EmpMultiBut from '@/views/Analytics/composable/Emp/EmpMultiBut.vue'
  type SearchData = {
    custno: string
    custname: string
    custabbr: string
    con: string
    tel: string
    mobitel: string
    uniform: string
    ckindname: string
    akindc: string
    fax: string
    boss: string
    taxkindno: string
    taxkindc: string
    a_user: string
    m_user: string
    protno: string
    protabbr: string
    protname: string
    protaddr: string
    itemno: string
    itemname: string
    ikindname: string
    mkindname: string
    stkpurpc: number
    stksalpc: number
    suppno: string
    suppabbr: string
    suppname: string
    con1: string
    con2: string
    tel1: string
    tel2: string
    mobitel1: string
    mobitel2: string
    mobitel3: string
    compaddr: string
    [key: string]: any
  }

  const formData = ref<Record<string, any>>({})
  const model0 = ref('20') // 單選起
  const model = ref('') // 單選起
  const model2 = ref('') // 單選迄
  const model3 = ref({ begin: '', end: '' }) // 日期
  const model4 = ref<SearchData[]>([]) // 多選
  const model5 = ref('') // 單選起
  const model6 = ref('') // 單選迄
  const model7 = ref<SearchData[]>([]) // 多選
  const model8 = ref('')
  const model9 = ref('')
  const model10 = ref<SearchData[]>([]) // 多選
  const model11 = ref('')
  const model12 = ref('')
  const model13 = ref<SearchData[]>([]) // 多選
  const model14 = ref('')
  const model15 = ref('')
  const model16 = ref<SearchData[]>([]) // 多選

  //判斷是否進入多選模式
  const isMulti = computed(() => (model4.value?.length ?? 0) > 0)
  const isMulti2 = computed(() => (model7.value?.length ?? 0) > 0)
  const isMulti3 = computed(() => (model10.value?.length ?? 0) > 0)
  const isMulti4 = computed(() => (model13.value?.length ?? 0) > 0)
  const isMulti5 = computed(() => (model16.value?.length ?? 0) > 0)

  //一旦進入多選就清空單選，避免送出兩種條件
  watch(isMulti, (on) => {
    if (on) {
      model.value = ''
      model2.value = ''
    }
  })
  watch(isMulti2, (on) => {
    if (on) {
      model5.value = ''
      model6.value = ''
    }
  })
  watch(isMulti3, (on) => {
    if (on) {
      model8.value = ''
      model9.value = ''
    }
  })

  watch(isMulti4, (on) => {
    if (on) {
      model11.value = ''
      model12.value = ''
    }
  })

  // 呼叫API送出列印資料
  const loadingPrint = ref(false)
  const loadingExcel = ref(false)
  const onSubmitPrint = async (t) => {
    if (loadingPrint.value || loadingExcel.value) return
    if (t === 'Print') {
      loadingPrint.value = true
    } else {
      loadingExcel.value = true
    }
    const API = t === 'Print' ? api.PettyCashQuery.Print : api.PettyCashQuery.Excel
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

  // =================測試
  const form = ref({ email: '', phone: '' })
  const onSubmit = () => {
    /* form 驗證與送出 */
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

  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <DateRange
        v-model="model3"
        v-model:from="formData.date1_s"
        v-model:to="formData.date1_e"
        labelFrom="開始日期"
        labelTo="結束日期"
        dense
      />
      <!-- 業主區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <CustStart v-model="model" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <CustEnd v-model="model2" :disabled="isMulti" />
        </v-col>
        <v-col cols="auto">
          <CustMultiBut v-model="model4" />
        </v-col>
      </v-row>
      <!-- 工程區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <ProtStart v-model="model5" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ProtEnd v-model="model6" :disabled="isMulti2" />
        </v-col>
        <v-col cols="auto">
          <ProtMultiBut v-model="model7" />
        </v-col>
      </v-row>
      <!-- 工料區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <ItemStart v-model="model8" :disabled="isMulti3" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <ItemEnd v-model="model9" :disabled="isMulti3" />
        </v-col>
        <v-col cols="auto">
          <ItemMultiBut v-model="model10" />
        </v-col>
      </v-row>
      <!-- 廠商區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <SuppStart v-model="model11" :disabled="isMulti4" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <SuppEnd v-model="model12" :disabled="isMulti4" />
        </v-col>
        <v-col cols="auto">
          <SuppMultiBut v-model="model13" />
        </v-col>
      </v-row>
      <!-- 人員區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <EmpStart v-model="model14" :disabled="isMulti5" />
        </v-col>
        <v-col cols="auto" class="text-center d-none d-md-block">
          <span class="text-h5 text-grey-lighten-1">～</span>
        </v-col>
        <v-col cols="auto">
          <EmpEnd v-model="model15" :disabled="isMulti5" />
        </v-col>
        <v-col cols="auto">
          <EmpMultiBut v-model="model16" />
        </v-col>
      </v-row>
      <!-- 註腳區間 -->
      <v-row align="center">
        <v-col cols="auto">
          <FeetNoDDL
            v-model="model0"
            label="單行註腳"
            :items="undefined"
            :dense="true"
            :hideSearch="true"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- ================測試=================== -->

  <v-form ref="form" @submit.prevent="onSubmit">
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          variant="outlined"
          density="compact"
          color="primary"
          prepend-inner-icon="mdi-email"
          clearable
          :rules="[(v) => !!v || '必填', (v) => /.+@.+\..+/.test(v) || '格式不正確']"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="form.phone"
          label="手機"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-cellphone"
          :rules="[(v) => !!v || '必填']"
        />
      </v-col>
    </v-row>

    <v-btn type="submit" color="primary">送出</v-btn>
  </v-form>
</template>

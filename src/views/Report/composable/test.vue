<script lang="ts" setup>
  import { ref } from 'vue'
  import DateRangeField from './DateRange.vue'
  import SuppRange from './SuppRange.vue'
  import ProtRange from './ProtRange.vue'
  import ItemRange from './ItemRange.vue'
  import OwnerRange from './OwnerRange.vue'
  import ProtSingle from './ProtSingle.vue'
  import { cButton, cBread, cSelect } from '@/components/Common' // 共用元件

  const formData = ref({
    dates: { begin: '', end: '' },
    suppNOs: { begin: '', end: '', limiteds: [] as string[] },
    protNOs: { begin: '', end: '', limiteds: [] as string[] },
    itemNOs: { begin: '', end: '', limiteds: [] as string[] },
    Owner: { begin: '', end: '', limiteds: [] as string[] },
    protNO: ''
  })
  const print = () => {
    console.log(formData.value)
  }
  // 報表內容
  const printType = ref({
    list: [
      { value: '1', title: '內定報表' },
      { value: '2', title: '內定報表' }
    ],
    value: 'value',
    title: 'title'
  })
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0" dense>
      <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="print">列印</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="create" icon="fa-solid fa-file-excel">匯出Excel</c-button>
      </v-col>
    </v-row>
  </c-bread>
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 報表類別 -->
      <v-row align="center" class="mb-3" dense>
        <v-col cols="11">
          <v-row>
            <v-col cols="6" class="u-wch w-20ch">
              <c-select
                v-model="printType"
                label="報表內容"
                :items="printType.list"
                :item-title="printType.title"
                :item-value="printType.value"
                hide-search
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <DateRangeField v-model="formData.dates" dense />
      <SuppRange v-model="formData.suppNOs" dense />
      <ProtRange v-model="formData.protNOs" dense />
      <ItemRange v-model="formData.itemNOs" dense />
      <OwnerRange v-model="formData.Owner" dense />
      <ProtSingle v-model="formData.protNO" dense />
    </v-card-text>
  </v-card>
</template>
<style scoped>
  .sheet {
    width: 250px;
  }
</style>

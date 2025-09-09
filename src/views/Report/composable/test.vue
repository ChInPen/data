<script lang="ts" setup>
  import { ref } from 'vue'
  import DateRangeField from './DateRange.vue'
  import SuppRange from './SuppRange.vue'
  import ProtRange from './ProtRange.vue'
  import ItemRange from './ItemRange.vue'
  import OwnerRange from './OwnerRange.vue'
  import ProtSingle from './ProtSingle.vue'
  import { cButton, cBread } from '@/components/Common' // 共用元件

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
      <DateRangeField v-model="formData.dates" dense />
      <SuppRange v-model="formData.suppNOs" dense />
      <ProtRange v-model="formData.protNOs" dense />
      <ItemRange v-model="formData.itemNOs" dense />
      <OwnerRange v-model="formData.Owner" dense />
      <ProtSingle v-model="formData.protNO" dense />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { cSelect } from '@/components/Common'
  import type { formData } from './type'

  const formData = ref({ printType: 'A' })
  const printType = ref({
    list: [
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'C', label: 'C' }
    ],
    title: 'label',
    value: 'value'
  })
</script>
<template>
  <v-row align="center" class="mb-3" dense>
    <v-col cols="11">
      <v-row>
        <v-col cols="6" class="u-wch w-20ch">
          <c-select
            v-model="formData.printType"
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
</template>
<style></style>

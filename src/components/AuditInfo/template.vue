<script lang="ts" setup>
  import { cInput } from '@/components/Common'
  defineProps({
    a_user: {
      type: String,
      default: ''
    },
    a_date: {
      type: String,
      default: ''
    },
    m_user: {
      type: String,
      default: ''
    },
    m_date: {
      type: String,
      default: ''
    }
  })
</script>

<template>
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense justify="start">
        <v-col cols="auto" class="text-custom-2">操作人員</v-col>
      </v-row>
      <v-row dense class="mt-2">
        <v-col :cols="3" class="px-2">
          <c-input
            type="date"
            :modelValue="a_date"
            label="建檔日期"
            icon="fa-solid fa-calendar-day"
            disabled
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input :modelValue="a_user" label="建檔人員" icon="fa-solid fa-user-plus" disabled />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input
            type="date"
            :modelValue="m_date"
            label="修改日期"
            icon="fa-solid fa-calendar-day"
            disabled
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input :modelValue="m_user" label="修改人員" icon="fa-solid fa-user-pen" disabled />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

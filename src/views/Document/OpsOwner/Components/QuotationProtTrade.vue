<script lang="ts" setup>
  import { computed, ref, watch, nextTick } from 'vue'
  import { cButton, cInput, cDataTable, cDialog } from '@/components/Common' //共用元件
  import type { DataTableHeader } from 'vuetify'
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { numberFormat } from '@/utils/uformat'

  type ProtTrade = {
    protabbr: string
    qty: number
    unit: string
    price: number
    total: number
    descrip: string
    delidate1: string
    protno: string
    itemno: string
    itemname: string
    taxprice: number
    qno: string
  }

  const model = defineModel<boolean>({ default: false })
  const props = defineProps({
    title: String,
    itemno: String,
    protno: String
  })

  const tbData = ref<ProtTrade[]>([])
  const tableRef = ref()
  const headers: DataTableHeader[] = [
    { title: '工程簡稱', key: 'protabbr' },
    { title: '數量', key: 'qty' },
    { title: '單位', key: 'unit' },
    { title: '售價', key: 'price' },
    { title: '說明', key: 'descrip' }
  ]

  const search = () => {
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_Item,
      data: {
        itemno: props.itemno ?? '',
        protno: props.protno ?? ''
      }
    }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        if (data && Array.isArray(data)) {
          tbData.value = data
          if (tbData.value.length > 0) {
            tableRef.value?.handleRowSelect(tbData.value[0])
          }
        }
      }
    })
  }

  const selectedForm = computed(() => {
    const idx = tableRef.value?.selectIndex?.[0]
    if (typeof idx === 'number' && idx >= 0) {
      const { qno, protno, itemname, itemno } = tbData.value[idx]
      return { qno, protno, itemname, itemno }
    } else {
      return {
        qno: '',
        protno: '',
        itemname: '',
        itemno: ''
      }
    }
  })

  //Dialog 開啟時
  watch(
    () => model.value,
    (newVal) => {
      if (newVal) {
        search()
      }
    }
  )
  //Dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      tbData.value = []
    })
  }
</script>

<template>
  <c-dialog v-model="model" @afterLeave="handleDialogClose" title-divider width="1100">
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>{{ props.title ?? '' }}</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="model = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-row no-gutters>
      <v-col cols="auto" class="p-2">
        <c-input :model-value="selectedForm.qno" label="單號" disabled :maxlength="14" />
      </v-col>
      <v-col cols="auto" class="p-2">
        <c-input :model-value="selectedForm.protno" label="工程編號" disabled :maxlength="16" />
      </v-col>
      <v-responsive width="100%" />
      <v-col class="p-2">
        <c-input
          class="input-color-red"
          :model-value="selectedForm.itemname"
          label="工料名稱"
          disabled
          :maxlength="20"
          :length-auto-width="false"
        />
      </v-col>
      <v-col cols="auto" class="p-2">
        <c-input :model-value="selectedForm.itemno" label="工料編號" disabled :maxlength="20" />
      </v-col>
    </v-row>
    <c-data-table
      class="mt-2"
      ref="tableRef"
      v-model="tbData"
      :headers="headers"
      show-index
      striped="even"
      hover
      selectable
    >
      <template v-slot:item.qty="{ scope }">
        {{ numberFormat(scope.qty, { thousands: true }) }}
      </template>
      <template v-slot:item.price="{ scope }">
        {{ numberFormat(scope.price, { thousands: true }) }}
      </template>
    </c-data-table>
  </c-dialog>
</template>

<style scoped>
  .input-color-red {
    --input-disabled-text-color: red;
  }
</style>

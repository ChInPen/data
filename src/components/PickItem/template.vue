<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cInput, cSelect, cCheckbox, cDialog, cButton, cDataTable } from '@/components/Common'
  import type { DataTableHeader } from 'vuetify'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { usePickItem } from '@/store/pickItem'
  const store = usePickItem()
  import type { SearchData } from './type'

  const isOpen = defineModel({ default: false })
  defineProps({
    ikind: {
      type: Boolean,
      default: false
    }
  })
  const emits = defineEmits(['pick'])

  //查詢條件
  const filter = ref({
    itemno: '',
    itemname: '',
    mkindno: [],
    ikindno: '',
    ikindname: ''
  })
  //勾選框
  const mkindCheckbox = ref([
    { value: '1', label: '材料' },
    { value: '2', label: '工資' },
    { value: '3', label: '費用' },
    { value: '4', label: '外包' },
    { value: '6', label: '雜支' }
  ])
  // const filterDDL = [
  //   { name: 'itemno', label: '工料編號' },
  //   { name: 'itemname', label: '工料名稱' },
  //   { name: 'ikindno', label: '類別編號' },
  //   { name: 'ikindname', label: '類別名稱' },
  //   { name: 'stkpurpc', label: '進        價' },
  //   { name: 'stksalpc', label: '售        價' }
  // ]
  //表格資料
  const tbData = ref<SearchData[]>([])
  const selected = ref([])
  const itemTableRef = ref()
  //表格設定
  const headers: DataTableHeader[] = [
    { title: '工料編號', key: 'itemno', sortable: false, nowrap: true },
    { title: '工料名稱', key: 'itemname', sortable: false },
    { title: '數量', key: 'ibompqty', width: '150', sortable: false },
    { title: '單位', key: 'stkunit', sortable: false, align: 'center' }
  ]

  // 查詢
  const handleSearch = async () => {
    const { itemno, itemname, ikindno, mkindno } = filter.value
    await callApi({
      method: 'POST',
      url: api.Item.ItemNo_Data,
      data: {
        itemno: itemno ?? '',
        itemname: itemname ?? '',
        ikindno: ikindno ?? '',
        mkindno: mkindno ?? []
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? []
        if (data && Array.isArray(data)) tbData.value = data
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      itemno: '',
      itemname: '',
      mkindno: [],
      ikindno: '',
      ikindname: ''
    }
  }
  // 全部取消
  const handleCancelAll = () => {
    selected.value = []
  }
  // 取回
  const handleSend = () => {
    emits('pick', itemTableRef.value?.checked ?? [])
    isOpen.value = false
  }

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear() //清空查詢條件
      tbData.value = []
      store.clear()
    })
  }

  const open = () => {
    isOpen.value = true
  }
  defineExpose({
    open
  })
</script>

<template>
  <c-dialog v-model="isOpen" width="1100" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇工料</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3">
      <v-card-text>
        <v-row dense>
          <v-col :cols="4">
            <c-input v-model="filter.itemno" label="工料編號" />
          </v-col>
          <v-col :cols="8">
            <v-row dense :align="'center'" justify="end">
              <v-col cols="auto" class="fs-5">工料分類：</v-col>
              <v-col cols="auto" v-for="mkind in mkindCheckbox" :key="mkind.value">
                <c-checkbox
                  class="pe-3"
                  v-model="filter.mkindno"
                  density="compact"
                  size="3"
                  :value="mkind.value"
                  :label="mkind.label"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col :cols="7">
            <c-input v-model="filter.itemno" label="工料名稱" />
          </v-col>
          <v-col class="fs-5 fw-bold text-danger ps-2">請選擇工料分類...</v-col>
          <v-col cols="auto" class="mt-2">
            <c-button kind="clear" icon="fa-solid fa-eraser" @click="handleClear">清空</c-button>
          </v-col>
          <v-col cols="auto" class="mt-2">
            <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
              查詢
            </c-button>
          </v-col>
        </v-row>
        <v-row dense :align="'start'">
          <v-col :cols="4" v-if="ikind">
            <c-input v-model="filter.ikindno" label="工料類別" @button="" />
          </v-col>
          <v-col :cols="3" v-if="ikind">
            <c-input v-model="filter.ikindname" disabled />
          </v-col>
          <v-col></v-col>
          <v-col cols="auto">
            <c-button kind="delete" icon="mdi-close-box-multiple" @click="handleCancelAll">
              全部取消
            </c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSend">
              取回
            </c-button>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <c-data-table
      ref="itemTableRef"
      v-model="tbData"
      v-model:selected="selected"
      class="mt-3"
      :headers="headers"
      striped="even"
      height="500"
      fixed-header
      show-select
      item-value="itemno"
    >
      <template v-slot:item.ibompqty="{ scope }">
        <c-input type="number" v-model="scope.ibompqty" :format="{ thousands: true }" />
      </template>
    </c-data-table>
  </c-dialog>
</template>

<style scoped></style>

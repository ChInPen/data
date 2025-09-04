<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  import { useSearchSupp } from '@/store/searchSupp'
  const store = useSearchSupp()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const emits = defineEmits(['pick'])

  // dialog 開關
  const isOpen = ref(false)

  const filter = ref({
    type1: 'ono',
    type2: 'suppno',
    filter1: '',
    filter2: ''
  })
  const tbData = ref<SearchData[]>([])
  // 查詢
  const formData = ref({
    dates: { begin: '', end: '' },
    suppNOs: { begin: '', end: '', limiteds: [''] },
    purPordOno: '',
    protNOs: { begin: '', end: '', limiteds: [''] },
    itemNOs: { begin: '', end: '', limiteds: [''] },
    pagination: { start: 0, length: 100, draw: 1 },
    descrip: ''
  })
  const handleSearch = async () => {
    if (filter.value.type1 == filter.value.type2) {
      message.alert({
        type: 'warning',
        message: '查詢條件不可相同'
      })
      return
    }
    // 查詢前先清空表格
    tbData.value = []
    const payload = { ...formData.value }
    if (filter.value.filter1) {
      payload.purPordOno = filter.value.filter1
    } else {
      payload.purPordOno = ''
    }
    if (filter.value.filter2) {
      payload.suppNOs.begin = filter.value.filter2
      payload.suppNOs.end = filter.value.filter2
    } else {
      payload.suppNOs.begin = ''
      payload.suppNOs.end = ''
    }
    if (!payload.dates.begin) payload.dates.begin = '0000101' // 系統最小日期
    if (!payload.dates.end) payload.dates.end = '999991231' // 系統最大日期

    try {
      const res = await callApi({
        method: 'POST',
        url: api.PurPordBrow.Search,
        data: payload
      })

      if (res?.status === 200) {
        tbData.value = res?.data ?? []
      }
    } catch (err) {
      console.error('❌ 查詢失敗:', err)
    }
  }

  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      type1: 'ono',
      type2: 'suppno',
      filter1: '',
      filter2: ''
    }
  }
  // 選擇
  const handleChoose = (raw: SearchData) => {
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 開啟時 (父層控制)
  watch(
    () => model.value,
    async (newVal) => {
      if (newVal) {
        if (store.isSearch) {
          filter.value.filter1 = store.searchText
          await handleSearch()
          if (tbData.value.length == 1) {
            emits('pick', tbData.value[0])
            handleDialogClose()
            return
          }
        }
        isOpen.value = true
      } else {
        isOpen.value = false
      }
    }
  )

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear() //清空查詢條件
      tbData.value = []
      store.clear()
      model.value = false
    })
  }

  const open = () => {
    model.value = true
  }
  defineExpose({
    open
  })
</script>

<template>
  <c-dialog v-model="isOpen" width="1100" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇單號</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3" v-show="!store.isSearch">
      <v-card-text>
        <v-row dense>
          <v-col>
            <v-row dense>
              <v-col>
                <c-input
                  v-model="filter.filter1"
                  label="採購估驗單號"
                  icon="fa-solid fa-magnifying-glass"
                />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col>
                <c-input
                  v-model="filter.filter2"
                  label="廠商編號"
                  icon="fa-solid fa-magnifying-glass"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="auto">
            <div class="d-flex flex-column ms-4">
              <c-button kind="clear" icon="fa-solid fa-eraser" class="mb-2" @click="handleClear">
                清空
              </c-button>
              <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
                查詢
              </c-button>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <c-table
      v-model="tbData"
      class="mt-3"
      striped="even"
      height="520"
      fixed-header
      show-index
      hover
    >
      <template v-slot:head>
        <th class="text-center">採購估驗單號</th>
        <th class="text-center">採購估驗日期</th>
        <th class="text-center">廠商編號</th>
        <th class="text-center">廠商簡稱</th>
        <th class="text-center">營業稅</th>
        <th class="text-center">採購總額</th>
        <th class="text-center">採購人員</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.ono }}</td>
        <td class="text-center">{{ scope.date1 }}</td>
        <td class="text-center">{{ scope.suppno }}</td>
        <td class="text-center">{{ scope.suppabbr }}</td>
        <td class="text-center">{{ scope.tax }}</td>
        <td class="text-center">{{ scope.amount }}</td>
        <td class="text-center">{{ scope.empname }}</td>
        <td>
          <v-row dense justify="center">
            <v-col cols="auto">
              <c-button kind="choose" icon="fa-solid fa-check" @click="handleChoose(scope)">
                選擇
              </c-button>
            </v-col>
          </v-row>
        </td>
      </template>
    </c-table>
  </c-dialog>
</template>

<style scoped></style>

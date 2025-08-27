<script setup>
  import { ref } from 'vue'
  import { cButton, cInput, cBread } from '@/components/Common' //匯入自定義的UI元件
  import { searchCust } from '@/components/SearchCust' //業主彈窗元件查詢
  import { searchItem } from '@/components/SearchItem' //工料彈窗元件查詢
  import MultiCust from './Components/MultiCust.vue' //業主彈窗(多選)
  import MulitItem from './Components/MultiItem.vue' //工料彈窗(多選)
  // 查詢的資料(結果)
  const formData = ref({
    quotationDateFrom: '',
    quotationDateTo: '',
    ownerNoFrom: '',
    ownerNoTo: '',
    itemNoFrom: '',
    itemNoTo: '',
    projectNoFrom: '',
    projectNoTo: '',
    remark: '',
    custom1: '',
    ownerNosLimiteds: '',
    itemNosLimiteds: [],
    projectNosLimiteds: []
  })

  // 業主選單 / 多選控制
  const ownerPickOpen = ref(false)
  const ownerPickTarget = ref('') // 'from' | 'to'
  const isMultiOwner = ref(false)
  // 業主多選的彈窗開關
  const MultiCustDs = ref(false)
  const openOwnerPicker = (t) => {
    // 彈窗結束時關閉
    ownerPickTarget.value = t
    ownerPickOpen.value = true
  }
  const onOwnerPicked = (row) => {
    // 彈窗結束時的資料寫回
    const v = (row && row.custno) || ''
    if (ownerPickTarget.value === 'from') formData.value.ownerNoFrom = v
    if (ownerPickTarget.value === 'to') formData.value.ownerNoTo = v
    // 單選時關閉多選狀態
    isMultiOwner.value = false
    formData.value.ownerNosLimiteds = []
  }
  const onMultiOwnerPicks = (rows) => {
    formData.value.owners = rows //全部資料
    formData.value.ownerNosLimiteds = rows //只有業主編號
      .map((r) => String(r.custno).trim())
      .filter(Boolean)
    isMultiOwner.value = formData.value.ownerNosLimiteds.length > 0
    formData.value.ownerNoFrom = ''
    formData.value.ownerNoTo = ''
    console.log(formData.value.owners)
    console.log(formData.value.ownerNosLimiteds)
  }

  // 工料單選控制
  const itemPickOpen = ref(false)
  const itemPickTarget = ref('') // 'from' | 'to'
  const openItemPicker = (t) => {
    itemPickTarget.value = t
    itemPickOpen.value = true
  }
  const onItemPicked = (row) => {
    const v = row?.itemno || ''
    if (itemPickTarget.value === 'from') formData.value.itemNoFrom = v
    if (itemPickTarget.value === 'to') formData.value.itemNoTo = v
  }
  // 工料多選控制
  const MulitItemDs = ref(false)

  // 列印邏輯
  const handlePrint = () => {
    console.log('print', JSON.stringify(formData.value))
    console.log('print', { ...formData.value })
  }
  // EXCEL邏輯
  const handleExportExcel = () => {
    console.log('export excel', formData.value)
  }
</script>

<template>
  <c-bread>
    <div class="col-auto">
      <c-button kind="print" icon="fa-solid fa-print" @click="handlePrint">列印</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="create" icon="fa-solid fa-file-excel" @click="handleExportExcel">
        匯出Excel
      </c-button>
    </div>
  </c-bread>

  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense class="mt-2" align="center">
        <!-- 報價日期區間 -->
        <v-col cols="4" class="px-2">
          <c-input type="date" v-model="formData.quotationDateFrom" label="報價日期" />
        </v-col>
        <v-col cols="1" class="fs-2 text-center">~</v-col>
        <v-col cols="4" class="px-2">
          <c-input type="date" v-model="formData.quotationDateTo" label="報價日期" />
        </v-col>

        <v-col cols="12" class="pa-0" />

        <!-- 業主區間 -->
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick" @click="openOwnerPicker('from')">選擇業主</c-button>
            </v-col>
            <v-col>
              <c-input v-model="formData.ownerNoFrom" label="業主編號" :disabled="isMultiOwner" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1" class="fs-2 text-center">~</v-col>
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick" @click="openOwnerPicker('to')">選擇業主</c-button>
            </v-col>
            <v-col>
              <c-input v-model="formData.ownerNoTo" label="業主編號" :disabled="isMultiOwner" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1">
          <c-button
            :cols="3"
            kind="search"
            icon="fa-solid fa-magnifying-glass"
            @click="MultiCustDs = true"
          >
            多選式
          </c-button>
        </v-col>
        <v-col cols="12" class="pa-0" />

        <!-- 工料編號 -->
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick" @click="openItemPicker('from')">選擇工料</c-button>
            </v-col>
            <v-col>
              <c-input label="工料編號" v-model="formData.itemNoFrom" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1" class="fs-2 text-center">~</v-col>
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick" @click="openItemPicker('to')">選擇工料</c-button>
            </v-col>
            <v-col>
              <c-input label="工料編號" v-model="formData.itemNoTo" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1">
          <c-button
            :cols="3"
            kind="search"
            icon="fa-solid fa-magnifying-glass"
            @click="MulitItemDs = true"
          >
            多選式
          </c-button>
        </v-col>
        <v-col cols="12" class="pa-0" />

        <!-- 工程編號 -->
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick">選擇工程</c-button>
            </v-col>
            <v-col>
              <c-input label="工程編號" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1" class="fs-2 text-center">~</v-col>
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick">選擇工程</c-button>
            </v-col>
            <v-col>
              <c-input label="工程編號" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="1">
          <c-button :cols="3" kind="search" icon="fa-solid fa-magnifying-glass">多選式</c-button>
        </v-col>
        <v-col cols="12" class="pa-0" />
        <v-col cols="9" class="px-2">
          <c-input label="說明"></c-input>
        </v-col>
        <v-col cols="12" class="pa-0"></v-col>
        <v-col cols="9" class="px-2">
          <c-input label="報價自訂一"></c-input>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- 業主單選視窗 -->
  <search-cust v-model="ownerPickOpen" @pick="onOwnerPicked" />
  <!-- 工料單選視窗 -->
  <search-item v-model="itemPickOpen" @pick="onItemPicked" />

  <!-- 彈窗 -->
  <Multi-cust v-model="MultiCustDs" @pick="onMultiOwnerPicks" :preselected="formData.owners" />
  <Mulit-item v-model="MulitItemDs" />
</template>

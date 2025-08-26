<script setup>
  import { ref } from 'vue'
  import { cButton, cInput, cBread } from '@/components/Common'
  import { searchCust } from '@/components/SearchCust'
  import { searchItem } from '@/components/SearchItem'
  import MultiCust from './Components/MultiCust.vue'
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
    custom1: ''
  })

  const ownerPickOpen = ref(false)
  const ownerPickTarget = ref('') // 'from' | 'to'
  const openOwnerPicker = (t) => {
    ownerPickTarget.value = t
    ownerPickOpen.value = true
  }
  const onOwnerPicked = (row) => {
    const v = row?.custno || ''
    if (ownerPickTarget.value === 'from') formData.value.ownerNoFrom = v
    if (ownerPickTarget.value === 'to') formData.value.ownerNoTo = v
  }
  // 工料（新增這段）
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
  const handlePrint = () => {
    console.log('print', formData.value)
  }
  const handleExportExcel = () => {
    console.log('export excel', formData.value)
  }
  // 彈窗開關
  const MultiCustDs = ref(false)
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
              <c-input v-model="formData.ownerNoFrom" label="業主編號" />
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
              <c-input v-model="formData.ownerNoTo" label="業主編號" />
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
          <c-button :cols="3" kind="search" icon="fa-solid fa-magnifying-glass">多選式</c-button>
        </v-col>
        <v-col cols="12" class="pa-0" />

        <!-- 工程編號 -->
        <v-col cols="4" class="px-2">
          <v-row dense class="align-items-center">
            <v-col cols="auto">
              <c-button kind="pick">選擇工程</c-button>
            </v-col>
            <v-col>
              <c-input label="工程編號" v-model="formData.itemNoFrom" />
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
              <c-input label="工程編號" v-model="formData.itemNoTo" />
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
  <Multi-cust v-model="MultiCustDs" />
</template>

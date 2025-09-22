<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  import type { PickSetting } from '@/store/create'
  import { usePickPurEmit } from '@/store/pickPurEmit'
  const store = usePickPurEmit()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const formData2 = defineModel('form')
  const isEnter = defineModel('keyenter', { default: false })
  const props = defineProps({
    setting: Array as PropType<PickSetting<SearchData>[]>,
    row: Number,
    searchText: String
  })
  const emits = defineEmits(['pick'])

  // store 變數設置
  const storeSet = () => {
    if (formData2.value) store.target.value = formData2
    if (props.setting && props.setting.length > 0) store.pickSetting = [...props.setting]
    if (typeof props.row === 'number' && props.row >= 0) store.target.row = props.row
    if (isEnter.value) {
      store.isSearch = true
      store.searchText = props.searchText ?? ''
    }
  }

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
    ono: '',
    suppno: ''
  })
  const handleSearch = async () => {
    // 查詢前先清空表格
    tbData.value = []
    const payload = { ...formData.value }
    if (filter.value.filter1) {
      payload.ono = filter.value.filter1
    } else {
      payload.ono = ''
    }
    if (filter.value.filter2) {
      payload.suppno = filter.value.filter2
    } else {
      payload.suppno = ''
    }
    console.log('payload', payload)

    try {
      const res = await callApi({
        method: 'POST',
        url: api.PurEmitQuery.Searchone,
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
    store.pick(raw)
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 開啟時 (父層控制)
  watch(
    () => model.value,
    async (newVal) => {
      if (newVal) {
        storeSet()
        console.log('[PickPurPords] isSearch=', store.isSearch, 'searchText=', store.searchText)
        if (store.isSearch) {
          // 如果沒輸入就 return
          if (!store.searchText || !store.searchText?.trim()) {
            handleDialogClose()
            return
          }
          filter.value.filter1 = store.searchText
          await handleSearch()
          if (tbData.value.length == 1) {
            handleChoose(tbData.value[0])
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
      isEnter.value = false
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
                  label="發估單號"
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
        <th class="text-center">發包估驗單號</th>
        <th class="text-center">發包估驗日期</th>
        <th class="text-center">廠商編號</th>
        <th class="text-center">廠商簡稱</th>
        <th class="text-center">營業稅</th>
        <th class="text-center">發包總額</th>
        <th class="text-center">發包人員</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.ono }}</td>
        <td class="text-center">{{ scope.date1 }}</td>
        <td class="text-center">{{ scope.suppno }}</td>
        <td class="text-center">{{ scope.suppabbr }}</td>
        <td class="text-center">{{ scope.taxkindc }}</td>
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

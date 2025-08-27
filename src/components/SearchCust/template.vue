<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  import { useSearchCust } from '@/store/searchCust'
  const store = useSearchCust()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const emits = defineEmits(['pick'])

  // dialog 開關
  const isOpen = ref(false)

  const filter = ref({
    type1: 'custno',
    type2: 'custabbr',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'custno', label: '業主編號' },
    { name: 'custabbr', label: '業主簡稱' },
    { name: 'custname', label: '業主名稱' },
    { name: 'tel', label: '電    話' },
    { name: 'fax', label: '傳    真' },
    { name: 'con', label: '聯 絡 人' },
    { name: 'boss', label: '負 責 人' }
  ]
  const tbData = ref<SearchData[]>([])

  // 查詢
  const handleSearch = async () => {
    if (filter.value.type1 == filter.value.type2) {
      message.alert({
        type: 'warning',
        message: '查詢條件不可相同'
      })
      return
    }
    const obj: Record<string, any> = {
      custno: '',
      custabbr: '',
      custname: '',
      con: '',
      mobitel: '',
      tel: '',
      uniform: '',
      fax: '',
      boss: ''
    }
    if (filter.value?.type1) obj[filter.value.type1] = filter.value?.filter1 ?? ''
    if (filter.value?.type2) obj[filter.value.type2] = filter.value?.filter2 ?? ''
    await callApi({
      method: 'POST',
      url: api.Cust.Custlist,
      data: obj
    }).then((res: any) => {
      if (res?.status === 200) {
        const data: any[] = res?.data ?? []
        tbData.value = data
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      type1: 'custno',
      type2: 'custabbr',
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
            model.value = false
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
        <v-col>選擇業主</v-col>
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
              <v-col cols="3">
                <c-select
                  v-model="filter.type1"
                  :items="filterDDL"
                  item-title="label"
                  item-value="name"
                  hide-search
                />
              </v-col>
              <v-col>
                <c-input v-model="filter.filter1" icon="fa-solid fa-magnifying-glass" />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col cols="3">
                <c-select
                  v-model="filter.type2"
                  :items="filterDDL"
                  item-title="label"
                  item-value="name"
                  hide-search
                />
              </v-col>
              <v-col>
                <c-input v-model="filter.filter2" icon="fa-solid fa-magnifying-glass" />
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
        <th class="text-center">業主編號</th>
        <th class="text-center">業主簡稱</th>
        <th class="text-center">聯絡人</th>
        <th class="text-center">電話</th>
        <th class="text-center">行動電話</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.custno }}</td>
        <td class="text-center">{{ scope.custabbr }}</td>
        <td class="text-center">{{ scope.con }}</td>
        <td class="text-center">{{ scope.tel }}</td>
        <td class="text-center">{{ scope.mobitel }}</td>
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

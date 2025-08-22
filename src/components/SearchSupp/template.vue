<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'

  const isOpen = defineModel({ default: false })
  const emits = defineEmits(['pick'])

  type SearchData = {
    suppno: string
    suppname: string
    suppabbr: string
    con1: string
    tel1: string
    mobitel1: string
    [key: string]: any
  }

  const filter = ref({
    type1: 'suppno',
    type2: 'suppabbr',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'suppno', label: '廠商編號' },
    { name: 'suppabbr', label: '廠商簡稱' },
    { name: 'suppname', label: '廠商名稱' },
    { name: 'con1', label: '聯 絡 人1' },
    { name: 'con2', label: '聯 絡 人2' },
    { name: 'boss', label: '負 責 人' },
    { name: 'tel1', label: '電 話1' },
    { name: 'tel2', label: '電 話2' },
    { name: 'fax', label: '傳 真' },
    { name: 'mobitel1', label: '行動電話1' },
    { name: 'mobitel2', label: '行動電話2' },
    { name: 'mobitel3', label: '行動電話3' },
    { name: 'compaddr', label: '公司地址' }
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
    await callApi({
      method: 'POST',
      url: api.Supp.Supp_Brow,
      data: {
        query_project_name: filter.value.type1,
        query_project_value: filter.value.filter1 ?? '',
        query_project_name2: filter.value.type2,
        query_project_value2: filter.value.filter2 ?? ''
      }
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
      type1: 'suppno',
      type2: 'suppabbr',
      filter1: '',
      filter2: ''
    }
  }
  // 選擇
  const handleChoose = (raw: SearchData) => {
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear() //清空查詢條件
      tbData.value = []
    })
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="1100" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇人員</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3">
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
        <th class="text-center">廠商編號</th>
        <th class="text-center">廠商簡稱</th>
        <th class="text-center">聯絡人1</th>
        <th class="text-center">電話1</th>
        <th class="text-center">行動電話1</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.suppno }}</td>
        <td class="text-center">{{ scope.suppabbr }}</td>
        <td class="text-center">{{ scope.con1 }}</td>
        <td class="text-center">{{ scope.tel1 }}</td>
        <td class="text-center">{{ scope.mobitel1 }}</td>
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

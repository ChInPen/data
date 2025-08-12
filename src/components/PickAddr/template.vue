<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'

  const isOpen = defineModel({ default: false })
  const emits = defineEmits(['pick'])

  const cityDDL = ref<any[]>([])
  const townDDL = ref<any[]>([])
  const roadDDL = ref<any[]>([])
  const filter = ref({
    city: '',
    town: '',
    road: ''
  })
  const tbData = ref<{ rec: string; zipno: string; zipname: string }[]>([])

  const getCityList = async () => {
    //抓 縣市 下拉選項
    callApi({
      method: 'POST',
      url: api.Zip.GetZipCity
    }).then((res: any) => {
      if (res?.status === 200) {
        const list: any[] = res?.data ?? []
        cityDDL.value = list
      }
    })
  }
  const getTownList = async () => {
    //抓 鄉鎮市區 下拉選項
    await callApi({
      method: 'POST',
      url: api.Zip.GetZipTown,
      params: {
        city: filter.value.city
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const list: any[] = res?.data ?? []
        townDDL.value = list
      }
    })
  }
  const getRoadList = async () => {
    //抓 路名 下拉選項
    await callApi({
      method: 'POST',
      url: api.Zip.GetZipRoad,
      params: {
        city: filter.value.city,
        town: filter.value.town
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const list: any[] = res?.data ?? []
        roadDDL.value = list
      }
    })
  }

  // 查詢
  const handleSearch = async () => {
    if (!filter.value.city) {
      message.alert({
        type: 'warning',
        message: '請先選擇縣市再查詢'
      })
      return
    }
    await callApi({
      method: 'POST',
      url: api.Zip.GetZipBrow,
      params: {
        city: filter.value.city ?? '',
        town: filter.value.town ?? '',
        road: filter.value.road ?? ''
      },
      data: {
        pageNumber: 1,
        pageSize: 10000
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data: any[] = res?.data?.data ?? []
        tbData.value = data
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      city: '',
      town: '',
      road: ''
    }
  }
  // 選擇
  const handleChoose = (raw: { rec: string; zipno: string; zipname: string }) => {
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 開啟時
  const handleDialogOpen = () => {
    //抓 縣市 下拉選項
    getCityList()
  }
  // 縣市 select 資料改變時
  const handleCitySelected = () => {
    filter.value.town = ''
    filter.value.road = ''
    roadDDL.value = []
    //抓 鄉鎮市區 下拉選項
    getTownList()
  }
  // 鄉鎮市區 select 資料改變時
  const handleTownSelected = () => {
    filter.value.road = ''
    //抓 路名 下拉選項
    getRoadList()
  }
  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear() //清空查詢條件
      townDDL.value = []
      roadDDL.value = []
      tbData.value = []
    })
  }
</script>

<template>
  <c-dialog
    v-model="isOpen"
    width="1100"
    @afterEnter="handleDialogOpen"
    @afterLeave="handleDialogClose"
    title-divider
  >
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇地址</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3">
      <v-card-text>
        <v-row dense>
          <v-col :cols="3">
            <c-select
              v-model="filter.city"
              label="縣市"
              :items="cityDDL"
              @update:modelValue="handleCitySelected"
            />
          </v-col>
          <v-col :cols="3">
            <c-select
              v-model="filter.town"
              label="鄉鎮市區"
              :items="townDDL"
              @update:modelValue="handleTownSelected"
              no-data-text="無資料，請檢查縣市是否已選"
            />
          </v-col>
          <v-col :cols="6">
            <c-select
              v-model="filter.road"
              label="路名"
              :items="roadDDL"
              no-data-text="無資料，請檢查縣市、鄉鎮市區是否已選"
            />
          </v-col>
        </v-row>
        <v-row justify="end" dense>
          <v-col cols="auto">
            <c-button kind="clear" icon="fa-solid fa-eraser" @click="handleClear">清空</c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
              查詢
            </c-button>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <c-table v-model="tbData" class="mt-3" striped="even" height="520" fixed-header hover>
      <template v-slot:head>
        <th width="200" class="text-center">郵遞區號</th>
        <th class="text-center">地址</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.zipno }}</td>
        <td class="text-center">{{ scope.zipname }}</td>
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

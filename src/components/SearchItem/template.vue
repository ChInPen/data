<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  import type { PickSetting } from '@/store/create'
  import { useSearchItem } from '@/store/searchItem'
  const store = useSearchItem()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const formData = defineModel('form')
  const isEnter = defineModel('keyenter', { default: false })
  const props = defineProps({
    setting: Array as PropType<PickSetting<SearchData>[]>,
    row: Number,
    searchText: String
  })
  const emits = defineEmits(['pick'])

  // store 變數設置
  const storeSet = () => {
    if (formData.value) store.target.value = formData
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
    type1: 'itemno',
    type2: 'itemname',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'itemno', label: '工料編號' },
    { name: 'itemname', label: '工料名稱' },
    { name: 'ikindno', label: '類別編號' },
    { name: 'ikindname', label: '類別名稱' },
    { name: 'stkpurpc', label: '進        價' },
    { name: 'stksalpc', label: '售        價' }
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
      itemno: '',
      ikindno: '',
      itemname: '',
      mkindno: '',
      ikindname: '',
      stkpurpc: null,
      stksalpc: null
    }
    obj[filter.value.type1] = ['stkpurpc', 'stksalpc'].includes(filter.value.type1)
      ? Number(filter.value.filter1)
      : (filter.value.filter1 ?? '')
    obj[filter.value.type2] = ['stkpurpc', 'stksalpc'].includes(filter.value.type2)
      ? Number(filter.value.filter2)
      : (filter.value.filter2 ?? '')
    await callApi({
      method: 'POST',
      url: api.Item.Item_List,
      data: obj
    }).then((res: any) => {
      if (res?.status === 200) {
        const { _Lists } = res?.data ?? []
        if (_Lists && Array.isArray(_Lists)) {
          const list = _Lists as SearchData[]
          list.sort((x, y) => x.itemno.localeCompare(y.itemno))
          tbData.value = list
        }
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      type1: 'itemno',
      type2: 'itemname',
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
        <v-col>選擇工料</v-col>
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
        <th class="text-center">工料編號</th>
        <th class="text-center">工料名稱</th>
        <th class="text-center">工料分類</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.itemno }}</td>
        <td class="text-center">{{ scope.itemname }}</td>
        <td class="text-center">{{ scope.mkindname }}</td>
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

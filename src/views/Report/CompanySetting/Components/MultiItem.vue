<script lang="ts" setup>
  import { ref, nextTick, computed, watch } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  type SearchData = {
    itemno: string
    itemname: string
    ikindname: string
    mkindname: string
    stkpurpc: number
    stksalpc: number
    [key: string]: any
  }

  const isOpen = defineModel({ default: false })
  const emits = defineEmits<{
    (e: 'pick', value: SearchData[]): void
  }>()
  const tbData = ref<SearchData[]>([]) // 查詢結果
  const picked = ref<SearchData[]>([]) // 右側已選
  const leftChecked = ref<Set<string>>(new Set())
  const rightChecked = ref<Set<string>>(new Set())

  const filter = ref({
    type1: 'itemno',
    type2: 'itemname',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'itemno', label: '工料編號' },
    { name: 'itemname', label: '工料名稱' },
    { name: 'ikindname', label: '類別編號' },
    { name: 'mkindname', label: '類別分類' },
    { name: 'stkpurpc', label: '進        價' },
    { name: 'stksalpc', label: '售        價' }
  ]
  // 左側實際顯示：查詢結果扣掉已選，避免重覆
  const leftList = computed(() => {
    const chosen = new Set(picked.value.map((x) => x.itemno))
    return tbData.value.filter((x) => !chosen.has(x.itemno))
  })

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
      stkpurpc: 0,
      stksalpc: 0
    }
    obj[filter.value.type1] = filter.value.filter1 ?? ''
    obj[filter.value.type2] = filter.value.filter2 ?? ''
    await callApi({
      method: 'POST',
      url: api.Item.Item_List,
      data: obj
    }).then((res: any) => {
      if (res?.status === 200) {
        const { _Lists } = res?.data ?? []
        if (_Lists && Array.isArray(_Lists)) tbData.value = _Lists
      }
      console.log(tbData.value)
    })
  }

  // === 清空查詢條件 ===
  const handleClear = () => {
    // 只清空查詢條件
    filter.value = { type1: 'itemno', type2: 'itemname', filter1: '', filter2: '' }
  }
  const handleReset = () => {
    handleClear()
    picked.value = [] // 清空已選
    tbData.value = [] // 清空查詢結果
  }

  // === 單筆選擇===
  const handleChoose = (raw: SearchData) => {
    // 單筆加入右側（避免重覆）
    if (!picked.value.find((x) => x.itemno === raw.itemno)) {
      picked.value.push(raw)
      console.log('picked', picked.value)
    }
  }

  // === 確認回傳 ===
  const handleConfirm = () => {
    emits('pick', picked.value)
    isOpen.value = false
  }

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear()
      tbData.value = []
      leftChecked.value.clear()
      rightChecked.value.clear()
    })
  }
  // 刪除方法
  const handleRemove = (raw: SearchData) => {
    picked.value = picked.value.filter((x) => x.itemno !== raw.itemno)
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="85%" @afterLeave="handleDialogClose" title-divider>
    <template #title>
      <v-row dense align="center">
        <v-col>選擇工料（可多選）</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>

    <!-- 查詢區 -->
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
              <c-button kind="clear" icon="fa-solid fa-eraser" class="mb-2" @click="handleReset">
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

    <!-- 選擇區 -->
    <v-row dense class="mt-3">
      <!-- 左：查詢結果 -->
      <v-col>
        <div class="text-subtitle-2 mb-1">查詢結果（{{ leftList.length }}）</div>
        <c-table :model-value="leftList" striped="even" height="420" fixed-header hover>
          <template #head>
            <th class="text-center">工料編號</th>
            <th class="text-center">工料名稱</th>
            <th class="text-center">類別分類</th>
            <th class="text-center"></th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.itemno }}</td>
            <td class="text-center">{{ scope.itemname }}</td>
            <td class="text-center">{{ scope.mkindname }}</td>
            <td class="text-center">
              <c-button
                kind="choose"
                icon="fa-solid fa-check"
                size="sm"
                @click="handleChoose(scope)"
              >
                選擇
              </c-button>
            </td>
          </template>
        </c-table>
      </v-col>
      <!-- 右：已選清單 -->
      <v-col>
        <div class="text-subtitle-2 mb-1">已選清單（{{ picked.length }}）</div>
        <c-table :model-value="picked" striped="even" height="420" fixed-header hover>
          <template #head>
            <th class="text-center">工料編號</th>
            <th class="text-center">工料名稱</th>
            <th class="text-center">類別分類</th>
            <th class="text-center"></th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.itemno }}</td>
            <td class="text-center">{{ scope.itemname }}</td>
            <td class="text-center">{{ scope.mkindname }}</td>
            <td class="text-center">
              <c-button
                kind="cancel"
                icon="fa-solid fa-trash"
                size="sm"
                @click="handleRemove(scope)"
              >
                刪除
              </c-button>
            </td>
          </template>
        </c-table>
      </v-col>
    </v-row>

    <v-row dense justify="end" class="mt-3">
      <v-col cols="auto">
        <c-button kind="choose" icon="fa-solid fa-check" @click="handleConfirm">確認</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="cancel" class="me-2" @click="isOpen = false">取消</c-button>
      </v-col>
    </v-row>
  </c-dialog>
</template>

<style scoped></style>

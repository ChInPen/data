<script lang="ts" setup>
  import { ref, nextTick, computed } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'

  const isOpen = defineModel({ default: false })
  const emits = defineEmits<{
    (e: 'pick', value: SearchData[]): void
  }>()

  type SearchData = {
    custno: string
    custname: string
    custabbr: string
    con: string
    tel: string
    mobitel: string
    uniform: string
    ckindname: string
    akindc: string
    fax: string
    boss: string
    taxkindno: string
    taxkindc: string
    a_user: string
    m_user: string
  }

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

  const tbData = ref<SearchData[]>([]) // 查詢結果
  const picked = ref<SearchData[]>([]) // 右側已選
  const leftChecked = ref<Set<string>>(new Set())
  const rightChecked = ref<Set<string>>(new Set())

  // 左側實際顯示：查詢結果扣掉已選，避免重覆
  const leftList = computed(() => {
    const chosen = new Set(picked.value.map((x) => x.custno))
    return tbData.value.filter((x) => !chosen.has(x.custno))
  })

  // === 查詢 ===
  const handleSearch = async () => {
    if (filter.value.type1 === filter.value.type2) {
      message.alert({ type: 'warning', message: '查詢條件不可相同' })
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

    await callApi({ method: 'POST', url: api.Cust.Custlist, data: obj }).then((res: any) => {
      if (res?.status === 200) {
        const data: any[] = res?.data ?? []
        tbData.value = data
        leftChecked.value.clear()
        rightChecked.value.clear()
      }
    })
  }

  // === 清空查詢條件 ===
  const handleClear = () => {
    filter.value = { type1: 'custno', type2: 'custabbr', filter1: '', filter2: '' }
  }

  // === 單筆選擇===
  const handleChoose = (raw: SearchData) => {
    // 單筆加入右側（避免重覆）
    if (!picked.value.find((x) => x.custno === raw.custno)) {
      picked.value.push(raw)
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
      picked.value = []
      leftChecked.value.clear()
      rightChecked.value.clear()
    })
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="85%" @afterLeave="handleDialogClose" title-divider>
    <template #title>
      <v-row dense align="center">
        <v-col>選擇人員（可多選）</v-col>
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

    <!-- 選擇區 -->
    <v-row dense class="mt-3">
      <!-- 左：查詢結果 -->
      <v-col>
        <div class="text-subtitle-2 mb-1">查詢結果（{{ leftList.length }}）</div>
        <c-table :model-value="leftList" striped="even" height="420" fixed-header hover>
          <template #head>
            <th class="text-center">業主編號</th>
            <th class="text-center">業主簡稱</th>
            <th class="text-center">聯絡人</th>
            <th class="text-center">電話</th>
            <th class="text-center">行動電話</th>
            <th class="text-center"></th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.custno }}</td>
            <td class="text-center">{{ scope.custabbr }}</td>
            <td class="text-center">{{ scope.con }}</td>
            <td class="text-center">{{ scope.tel }}</td>
            <td class="text-center">{{ scope.mobitel }}</td>
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
            <th class="text-center">業主編號</th>
            <th class="text-center">業主簡稱</th>
            <th class="text-center">聯絡人</th>
            <th class="text-center">電話</th>
            <th class="text-center">行動電話</th>
            <th class="text-center"></th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.custno }}</td>
            <td class="text-center">{{ scope.custabbr }}</td>
            <td class="text-center">{{ scope.con }}</td>
            <td class="text-center">{{ scope.tel }}</td>
            <td class="text-center">{{ scope.mobitel }}</td>
            <td class="text-center">
              <c-button
                kind="cancel"
                icon="fa-solid fa-trash"
                size="sm"
                @click="picked = picked.filter((x) => x.custno !== scope.custno)"
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

<script lang="ts" setup>
  import { ref, nextTick, computed, watch } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'
  type SearchData = {
    taxkindno: string
    taxkindc: string
    protno: string
    protabbr: string
    protname: string
    custno: string
    custabbr: string
    protaddr: string
    [key: string]: any
  }
  const filter = ref({
    type1: 'protno',
    type2: 'protname',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'protno', label: '工程編號' },
    { name: 'protabbr', label: '工程簡稱' },
    { name: 'protname', label: '工程名稱' },
    { name: 'custno', label: '業主編號' },
    { name: 'custabbr', label: '業主簡稱' },
    { name: 'tel', label: '電        話' },
    { name: 'covesum', label: '合約金額' }
  ]
  const tbData = ref<SearchData[]>([]) // 查詢結果
  const isOpen = defineModel({ default: false })
  const emits = defineEmits<{
    (e: 'pick', value: SearchData[]): void
  }>()
  const picked = ref<SearchData[]>([]) // 右側已選
  const leftChecked = ref<Set<string>>(new Set())
  const rightChecked = ref<Set<string>>(new Set())

  // 左側實際顯示：查詢結果扣掉已選，避免重覆
  const leftList = computed(() => {
    const chosen = new Set(picked.value.map((x) => x.protno))
    return tbData.value.filter((x) => !chosen.has(x.protno))
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
      pageNumber: 1,
      pageSize: 1000,
      query_project_name_1st: filter.value.type1,
      query_project_value_1st: filter.value.filter1 ?? '',
      query_project_name_2nd: filter.value.type2,
      query_project_value_2nd: filter.value.filter2 ?? ''
    }
    obj[filter.value.type1] = filter.value.filter1 ?? ''
    obj[filter.value.type2] = filter.value.filter2 ?? ''
    await callApi({
      method: 'POST',
      url: api.Project.Projectlist,
      data: obj
    }).then((res: any) => {
      if (res?.status === 200) {
        const { data } = res?.data ?? []
        if (data && Array.isArray(data)) tbData.value = data
      }
      console.log(tbData.value)
    })
  }

  // === 清空查詢條件 ===
  const handleClear = () => {
    // 只清空查詢條件
    filter.value = { type1: 'protno', type2: 'protname', filter1: '', filter2: '' }
  }
  const handleReset = () => {
    handleClear()
    picked.value = [] // 清空已選
    tbData.value = [] // 清空查詢結果
  }

  // === 單筆選擇===
  const handleChoose = (raw: SearchData) => {
    // 單筆加入右側（避免重覆）
    if (!picked.value.find((x) => x.protno === raw.protno)) {
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
    picked.value = picked.value.filter((x) => x.protno !== raw.protno)
  }

  //  === 全選 ===
  const pushToPickedUniq = (rows: SearchData[]) => {
    const seen = new Set(picked.value.map((x) => x.protno))
    rows.forEach((r) => {
      if (!seen.has(r.protno)) {
        picked.value.push(r)
        seen.add(r.protno)
      }
    })
  }
  function handleSelectAllLeft() {
    pushToPickedUniq(leftList.value)
    // 清掉暫時的選取
    leftChecked.value.clear()
    // 取消表頭的打勾
    const el = document.getElementById('selectAllLeft') as HTMLInputElement | null
    if (el) el.checked = false
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="85%" @afterLeave="handleDialogClose" title-divider>
    <template #title>
      <v-row dense align="center">
        <v-col>選擇工程（可多選）</v-col>
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
            <th class="text-center">工程編號</th>
            <th class="text-center">工程簡稱</th>
            <th class="text-center">業主簡稱</th>
            <th class="text-center">
              <input
                type="Checkbox"
                id="selectAllLeft"
                class="me-2"
                @change="handleSelectAllLeft"
              />
              <label for="selectAllLeft" class="text-center">全選</label>
            </th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.protno }}</td>
            <td class="text-center">{{ scope.protabbr }}</td>
            <td class="text-center">{{ scope.custabbr }}</td>
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
            <th class="text-center">工程編號</th>
            <th class="text-center">工程簡稱</th>
            <th class="text-center">業主簡稱</th>
            <th class="text-center"></th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.protno }}</td>
            <td class="text-center">{{ scope.protabbr }}</td>
            <td class="text-center">{{ scope.custabbr }}</td>
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

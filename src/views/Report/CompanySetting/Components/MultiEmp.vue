<script lang="ts" setup>
  import { ref, nextTick, computed, watch } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { message } from '@/components/Message/service'

  // 資料庫進來的Cust
  type SearchData = {
    empno: string
    empname: string
    tel1: string
    mobitel: string
  }

  // 父層可傳入目前已選
  const props = defineProps<{ preselected?: SearchData[] }>()

  // 對話框控制
  const isOpen = defineModel({ default: false })
  const emits = defineEmits<{ (e: 'pick', value: SearchData[]): void }>()

  // 狀態
  const tbData = ref<SearchData[]>([]) // 查詢結果
  const picked = ref<SearchData[]>([]) // 對話框內的暫存已選
  const snapshot = ref<SearchData[]>([]) // picked快照
  const leftChecked = ref<Set<string>>(new Set())
  const rightChecked = ref<Set<string>>(new Set())

  const filter = ref({
    type1: 'empno',
    type2: 'empname',
    filter1: '',
    filter2: ''
  })
  const filterDDL = [
    { name: 'empno', label: '業主編號' },
    { name: 'empname', label: '業主簡稱' },
    { name: 'tel1', label: '電    話' },
    { name: 'mobitel', label: '傳    真' }
  ]

  // 拷貝
  const cloneArr = <T extends object>(arr: T[]) => arr.map((x) => ({ ...x }))

  // 開窗時
  watch(
    () => isOpen.value,
    (open) => {
      if (open) {
        const base = props.preselected ?? snapshot.value
        picked.value = cloneArr(base)
        snapshot.value = cloneArr(base)
        tbData.value = []
        leftChecked.value.clear()
        rightChecked.value.clear()
        handleClear()
      }
    }
  )

  // 左側實際顯示：查詢結果扣掉已選，避免重覆
  const leftList = computed(() => {
    const chosen = new Set(picked.value.map((x) => x.empno))
    return tbData.value.filter((x) => !chosen.has(x.empno))
  })

  // === 查詢 ===
  const handleSearch = async () => {
    if (filter.value.type1 === filter.value.type2) {
      message.alert({ type: 'warning', message: '查詢條件不可相同' })
      return
    }
    const obj: Record<string, any> = {
      empno: '',
      empname: '',
      custname: '',
      con: '',
      mobitel: '',
      tel1: '',
      uniform: '',
      boss: ''
    }
    if (filter.value?.type1) obj[filter.value.type1] = filter.value?.filter1 ?? ''
    if (filter.value?.type2) obj[filter.value.type2] = filter.value?.filter2 ?? ''

    const res: any = await callApi({
      method: 'POST',
      url: api.Emp.Emp_Search2,
      data: {
        pageNumber: 1,
        pageSize: 10000,
        query_project_name_1st: filter.value.type1,
        query_project_value_1st: filter.value.filter1 ?? '',
        query_project_name_2nd: filter.value.type2,
        query_project_value_2nd: filter.value.filter2 ?? ''
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data: any[] = res?.data?.data ?? []
        tbData.value = data
      }
    })
  }

  // === 清空查詢條件 ===
  const handleClear = () => {
    filter.value = { type1: 'empno', type2: 'empname', filter1: '', filter2: '' }
  }
  const handleReset = () => {
    handleClear()
    picked.value = []
    tbData.value = []
  }

  // === 單筆選擇 ===
  const handleChoose = (raw: SearchData) => {
    if (!picked.value.find((x) => x.empno === raw.empno)) {
      picked.value.push(raw)
    }
  }

  // === 全選 ===
  const pushToPickedUniq = (rows: SearchData[]) => {
    const seen = new Set(picked.value.map((x) => x.empno))
    rows.forEach((r) => {
      if (!seen.has(r.empno)) {
        picked.value.push(r)
        seen.add(r.empno)
      }
    })
  }
  function handleSelectAllLeft() {
    pushToPickedUniq(leftList.value)
    leftChecked.value.clear()
    const el = document.getElementById('selectAllLeft') as HTMLInputElement | null
    if (el) el.checked = false
  }
  // === 全刪 ===
  function handleSelectAllRight() {
    if (!picked.value.length) return
    picked.value = []
    rightChecked.value.clear()
    // 取消勾選
    const el = document.getElementById('selectAllRight') as HTMLInputElement | null
    if (el) el.checked = false
  }
  // === 確認回傳 ===
  const handleConfirm = () => {
    const out = cloneArr(picked.value)
    emits('pick', out) // 存回父層
    snapshot.value = cloneArr(out)
    isOpen.value = false
  }

  // 取消/關閉：不儲存、還原暫存為快照
  const isOpenOut = () => {
    picked.value = cloneArr(snapshot.value)
    isOpen.value = false
  }

  // dialog 關閉後：清理視圖狀態，並確保暫存回到快照
  const handleDialogClose = () => {
    nextTick(() => {
      picked.value = cloneArr(snapshot.value)
      handleClear()
      tbData.value = []
      leftChecked.value.clear()
      rightChecked.value.clear()
    })
  }

  // 刪除暫存選項
  const handleRemove = (raw: SearchData) => {
    picked.value = picked.value.filter((x) => x.empno !== raw.empno)
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="85%" @afterLeave="handleDialogClose" title-divider>
    <template #title>
      <v-row dense align="center">
        <v-col>選擇人員（可多選）</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpenOut">關閉</c-button>
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
        <c-table
          :model-value="leftList"
          striped="even"
          height="420"
          fixed-header
          hover
          class="equal-6"
        >
          <template #head>
            <th class="text-center">人員編號</th>
            <th class="text-center">人員名稱</th>
            <th class="text-center">電話</th>
            <th class="text-center">行動電話</th>
            <th class="text-center">
              <input
                type="checkbox"
                id="selectAllLeft"
                class="me-2"
                @change="handleSelectAllLeft"
              />
              <label for="selectAllLeft" class="text-center">全選</label>
            </th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.empno }}</td>
            <td class="text-center">{{ scope.empname }}</td>
            <td class="text-center">{{ scope.tel1 }}</td>
            <td class="text-center">{{ scope.mobitel }}</td>
            <td class="text-center">
              <c-button kind="choose" icon="fa-solid fa-check" @click="handleChoose(scope)">
                選擇
              </c-button>
            </td>
          </template>
        </c-table>
      </v-col>

      <!-- 右：已選清單（暫存） -->
      <v-col>
        <div class="text-subtitle-2 mb-1">已選清單（{{ picked.length }}）</div>
        <c-table
          :model-value="picked"
          striped="even"
          height="420"
          fixed-header
          hover
          class="equal-6"
        >
          <template #head>
            <th class="text-center">人員編號</th>
            <th class="text-center">人員名稱</th>
            <th class="text-center">電話</th>
            <th class="text-center">行動電話</th>
            <th class="text-center">
              <input
                type="checkbox"
                id="selectAllRight"
                class="me-2"
                @change="handleSelectAllRight"
              />
              <label for="selectAllRight" class="text-center">全刪</label>
            </th>
          </template>
          <template #body="{ scope }">
            <td class="text-center">{{ scope.empno }}</td>
            <td class="text-center">{{ scope.empname }}</td>
            <td class="text-center">{{ scope.tel1 }}</td>
            <td class="text-center">{{ scope.mobitel }}</td>
            <td class="text-center">
              <c-button kind="cancel" icon="fa-solid fa-trash" @click="handleRemove(scope)">
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
        <c-button kind="cancel" class="me-2" @click="isOpenOut">取消</c-button>
      </v-col>
    </v-row>
  </c-dialog>
</template>

<style scoped>
  /* 讓表格用固定佈局，欄寬才會照你設定 */
  .equal-6 :deep(.v-table__wrapper > table),
  .equal-6 :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
  /* 最後一欄（按鈕欄）固定 120px */
  .equal-6 :deep(th:last-child),
  .equal-6 :deep(td:last-child) {
    width: 105px;
  }
  /* 其餘 5 欄平均分配剩餘寬度 */
  .equal-6 :deep(th:not(:last-child)),
  .equal-6 :deep(td:not(:last-child)) {
    width: calc((100% - 120px) / 5);
  }
  /* 長字處理，避免撐寬 */
  .equal-6 :deep(td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue'
  import { cButton, cInput, cTable, cBread, cDialog, cSelect } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useRouter } from 'vue-router'
  const router = useRouter()
  import { searchEmp } from '@/components/SearchEmp'

  // 每一筆零用金資料
  type PettyCashRow = {
    empno: string
    empname: string
    date1: string // 日期
    date2: string
    date3: string
    deposa: number | null // 金額
    descrip: string // 說明
    m_date1: string //修改日期
    m_date2: string
    m_date3: string
    m_user: string //修改人員
  }
  //  後端查到的表格資料
  const tbData = ref<PettyCashRow[]>([])
  // 「工作集」= 畫面上可編輯的最終清單（儲存時送這個）
  const working = ref<PettyCashRow[]>([])
  //查詢條件
  const filter = ref({
    empno: '',
    empname: '',
    date1: '',
    date2: '',
    date3: '',
    deposa: null,
    descrip: '',
    m_date1: '',
    m_date2: '',
    m_date3: '',
    m_user: ''
  })
  //新增按鈕
  const isOpen = ref(false) //開啟編輯視窗
  const isedit = ref(false) //是否為編輯
  const isHandleAdd = ref(false) //是否為新增狀態
  const handleCreate = () => {
    isOpen.value = true
    isHandleAdd.value = true
    editForm.value = {
      empno: filter.value.empno,
      empname: filter.value.empname,
      date1: '',
      date2: '',
      date3: '',
      deposa: null,
      descrip: '',
      m_date1: '',
      m_date2: '',
      m_date3: '',
      m_user: ''
    }
  }

  //修改條件
  // 正在編輯哪一列（working 的索引）
  const editIndex = ref<number | null>(null)
  const editForm = ref<PettyCashRow>({
    empno: filter.value.empno,
    empname: filter.value.empname,
    date1: '',
    date2: '',
    date3: '',
    deposa: null,
    descrip: '',
    m_date1: '',
    m_date2: '',
    m_date3: '',
    m_user: ''
  })
  const toROCyyyymmdd = (d = new Date()) =>
    String(d.getFullYear() - 1911).padStart(3, '0') +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const handleEdit = (row: PettyCashRow, index: number) => {
    editIndex.value = index
    editForm.value = { ...row }
    isOpen.value = true
    isedit.value = true
  }
  const saveEdit = async () => {
    if (
      !editForm.value.date1 ||
      editForm.value.deposa == null ||
      !Number.isFinite(Number(editForm.value.deposa))
    ) {
      return message.alert({ type: 'error', message: '日期與金額不可為空，且金額需為數字！' })
    }

    if (isedit.value) {
      working.value.push({ ...editForm.value })
    }
    if (isHandleAdd.value) {
      editForm.value.m_date1 = toROCyyyymmdd()
      working.value.splice(editIndex.value, 1, { ...editForm.value })
    }
    if (isInsert.value) {
      working.value.splice(editIndex.value, 1, { ...editForm.value })
    }
    isOpen.value = false
    isHandleAdd.value = false
    isInsert.value = false
    isedit.value = false
    editIndex.value = null
    try {
      await callApi({
        method: 'POST',
        url: api.PettyCashDeposit.Save,
        data: working.value
      })
      message.alert({ type: 'success', message: '儲存成功！' })
      console.log('儲存成功', working.value)
    } catch (error) {
      console.error(error)
      message.alert({ type: 'error', message: '儲存失敗' })
    }
  }
  //查詢條件-清除按鈕
  const isClear = ref(false)
  const filterClear = () => {
    isClear.value = false
    filter.value.empno = ''
    working.value = []
    hasSearched.value = false
  }
  //查詢條件-查詢按鈕
  const searchRef = ref()
  const isEnter = ref(false)
  const pickSetting = ref()
  const searchText = ref('')
  const hasSearched = ref(false)
  const searchItemOpen = (to: 'empno') => {
    pickSetting.value = [{ from: 'empno', to }]
    searchRef.value?.open()
  }
  const searchItemEnter = (to: 'empno') => {
    pickSetting.value = [{ from: 'empno', to }]
    isEnter.value = true
    searchText.value = filter.value?.[to] ?? ''
    searchRef.value?.open()
  }

  const filterSearch = async () => {
    if (!filter.value.empno) {
      return message.alert({
        type: 'error',
        message: '人員編號不可為空!'
      })
    }
    isClear.value = true
    try {
      console.log(JSON.stringify(filter.value, null, 2))
      const res = await callApi({
        method: 'POST',
        url: api.PettyCashDeposit.Data,
        data: filter.value
      })
      if (res?.status === 200) {
        tbData.value = res.data
        working.value = res.data
        if (working.value.length <= 0) {
          console.log('查無資料')
        }
      }
    } catch (err) {
      console.error('查詢失敗:', err)
      isClear.value = false
    } finally {
      hasSearched.value = true
    }
  }
  const makeBlankRow = (empno: string, empname = ''): PettyCashRow => ({
    empno,
    empname,
    date1: '',
    date2: '',
    date3: '',
    deposa: 0,
    descrip: '',
    m_date1: toROCyyyymmdd(),
    m_date2: '',
    m_date3: '',
    m_user: ''
  })
  //表格-刪除按鈕
  const handleDelete = (row: PettyCashRow) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除？`,
      onConfirm: async () => {
        if (working.value.length === 1) {
          working.value[0] = makeBlankRow(filter.value.empno, filter.value.empname)
        } else {
          working.value.splice(working.value.indexOf(row), 1)
        }
        try {
          console.log(JSON.stringify(working.value, null, 2))
          const res = await callApi({
            method: 'POST',
            url: api.PettyCashDeposit.Save,
            data: working.value
          })
          message.alert({ type: 'success', message: '刪除成功！' })
        } catch (err) {
          working.value.splice(working.value.indexOf(row), 1)
          message.alert({ type: 'error', message: '刪除失敗，已還原' })
        }
      }
    })
  }

  type SortKey = 'date1' | 'deposa' | null
  const sort = ref<{ key: SortKey; asc: boolean }>({ key: null, asc: true })

  const parseDate1 = (v: string) => {
    if (!v) return NaN
    const s = String(v).trim()
    // 支援 2025-09-01 或 20250901、民國yyyMMdd
    if (s.includes('-')) return new Date(s).getTime()
    const d = s.replace(/\D/g, '')
    if (d.length === 7) {
      // 民國 1140901
      const y = +d.slice(0, 3) + 1911
      const m = +d.slice(3, 5) - 1
      const dd = +d.slice(5, 7)
      return new Date(y, m, dd).getTime()
    }
    if (d.length === 8) {
      // 西元 20250901
      const y = +d.slice(0, 4)
      const m = +d.slice(4, 6) - 1
      const dd = +d.slice(6, 8)
      return new Date(y, m, dd).getTime()
    }
    return NaN
  }

  // 專用比較：日期（無效日期排最後）
  const cmpDate = (a?: string, b?: string) => {
    const ta = parseDate1(a ?? '')
    const tb = parseDate1(b ?? '')
    const ia = Number.isNaN(ta),
      ib = Number.isNaN(tb)
    if (ia && ib) return 0
    if (ia) return 1 // 無效排後面
    if (ib) return -1
    return ta - tb
  }

  // 專用比較：數字（null/NaN 排最後）
  const cmpNumber = (a?: number | null, b?: number | null) => {
    const na = Number(a)
    const nb = Number(b)
    const ia = !Number.isFinite(na),
      ib = !Number.isFinite(nb)
    if (ia && ib) return 0
    if (ia) return 1
    if (ib) return -1
    return na - nb
  }

  const applySort = () => {
    const { key, asc } = sort.value
    if (!key) return
    const sign = asc ? 1 : -1

    // 重點：排序 working，不是 tbData
    working.value = [...working.value].sort((a, b) => {
      let diff = 0
      if (key === 'date1') {
        diff = cmpDate(a.date1, b.date1)
      } else if (key === 'deposa') {
        diff = cmpNumber(a.deposa, b.deposa)
      }
      return sign * diff
    })
  }

  const toggleSort = (key: Exclude<SortKey, null>) => {
    if (sort.value.key === key) sort.value.asc = !sort.value.asc
    else {
      sort.value.key = key
      sort.value.asc = true
    }
    applySort()
  }

  const sortIcon = (key: Exclude<SortKey, null>) => {
    if (sort.value.key !== key) return 'fa-solid fa-sort'
    return sort.value.asc ? 'fa-solid fa-arrow-down-wide-short' : 'fa-solid fa-arrow-up-wide-short'
  }

  // 插入邏輯
  const isInsert = ref(false)
  const handleInsert = (row: PettyCashRow, index: number) => {
    working.value.splice(index, 0, { ...editForm.value })
    working.value[index].empno = filter.value.empno
    working.value[index].empname = filter.value.empname
    editIndex.value = index
    console.log(working.value)
    isOpen.value = true
    isInsert.value = true
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate()">新增</c-button>
    </div>
  </c-bread>
  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto">
          <c-input
            v-model="filter.empno"
            label="員工編號"
            icon="fa-solid fa-user"
            :maxlength="10"
            @button="searchItemOpen('empno')"
            @keyEnter="searchItemEnter('empno')"
            :disabled="isClear || isOpen"
          />
        </v-col>
      </v-row>
      <v-row justify="end" dense>
        <v-col cols="auto">
          <c-button kind="clear" icon="fa-solid fa-eraser" @click="filterClear">清空</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="filterSearch">
            查詢
          </c-button>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!--查詢結果表格-->
  <c-table
    v-model="working"
    :columns="4"
    :show-index="true"
    :show-no-data="hasSearched"
    class="mt-3"
    striped="even"
    height="580"
    fixed-header
    hover
  >
    <template v-slot:head>
      <th class="th-sort">
        日期
        <button
          class="sort-btn"
          :aria-pressed="sort.key === 'date1'"
          @click.stop="toggleSort('date1')"
        >
          <i :class="sortIcon('date1')"></i>
        </button>
      </th>
      <th class="th-sort">
        金額
        <button
          class="sort-btn"
          :aria-pressed="sort.key === 'deposa'"
          @click.stop="toggleSort('deposa')"
        >
          <i :class="sortIcon('deposa')"></i>
        </button>
      </th>
      <th class="th-descrip">說明</th>
      <th></th>
    </template>
    <template #no-data>
      <div class="py-6 text-center text-grey-lighten-1">-- 暫無資料，請按「新增」 --</div>
    </template>
    <template v-slot:body="{ scope, index }">
      <td>{{ scope.date1 }}</td>
      <td>{{ scope.deposa }}</td>
      <td>{{ scope.descrip }}</td>
      <td>
        <v-row dense>
          <v-col cols="auto">
            <c-button icon="fa-solid fa-pen-to-square" @click="handleEdit(scope, index)">
              編輯
            </c-button>
          </v-col>
          <v-col cols="auto">
            <c-button
              kind="edit"
              icon="fa-solid fa-arrow-up-from-bracket"
              @click="handleInsert(scope, index)"
            >
              插入
            </c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="delete" icon="fa-solid fa-trash" @click="handleDelete(scope)">
              刪除
            </c-button>
          </v-col>
        </v-row>
      </td>
    </template>
  </c-table>

  <!--新增彈出視窗-->
  <c-dialog
    v-model="isOpen"
    :title="isHandleAdd ? '新增-零用金' : '編輯-零用金'"
    width="600"
    @afterLeave=""
  >
    <v-row dense>
      <v-col cols="auto">
        <c-input label="日期" type="date" v-model="editForm.date1" />
      </v-col>
      <v-col cols="auto">
        <c-input label="金額" v-model.number="editForm.deposa" type="number" width="200px" />
      </v-col>
      <v-col cols="auto">
        <c-input v-model="editForm.descrip" label="說明" :maxlength="30" width="530px" />
      </v-col>
    </v-row>
    <v-divider />
    <v-row justify="center">
      <v-col cols="auto">
        <c-input label="修改日期" v-model="editForm.m_date1" type="date" disabled width="230px" />
      </v-col>
      <v-col cols="auto">
        <c-input label="修改人員" v-model="editForm.m_user" disabled width="230px" />
      </v-col>
    </v-row>
    <template #buttons>
      <v-row no-gutters justify="center">
        <v-col cols="auto" class="mx-1">
          <c-button kind="print" icon="mdi-check-circle" @click="saveEdit">儲存</c-button>
        </v-col>
        <v-col cols="auto" class="mx-1">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">結束</c-button>
        </v-col>
      </v-row>
    </template>
  </c-dialog>

  <searchEmp
    ref="searchRef"
    v-model:form="filter"
    v-model:keyenter="isEnter"
    :setting="pickSetting"
    :search-text="searchText"
  />
</template>

<style scoped>
  .v-card-text {
    padding: 12px;
  }
  .th-sort {
    cursor: pointer;
    position: relative;
    width: 200px;
    font-size: 1.5rem;
  }
  .th-descrip {
    width: 600px;
    font-size: 1.5rem;
  }
</style>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue'
  import { cButton, cInput, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useEmpLoanStore } from '@/store/empLoan'
  import { useRouter } from 'vue-router'
  import print from '@/views/Base/Staff/Components/EmployeePrint.vue'
  import { searchEmp } from '@/components/SearchEmp'
  const store = useEmpLoanStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    date1: string
    bno: string
    empno: string
    empokno: string
    acno: string
    empname: string
    borrpr: string
    empokname: string
    empacname: string
    descrip: string
    empacno: string
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    date1: '',
    bno: '',
    empno: '',
    empokno: '',
    acno: ''
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      date1: '',
      bno: '',
      empno: '',
      empokno: '',
      acno: ''
    }
  }
  //查詢條件-查詢按鈕
  const searchRef = ref()
  const isEnter = ref(false)
  const pickSetting = ref()
  const searchText = ref('')
  const searchItemOpen = (to: 'empno' | 'empokno') => {
    pickSetting.value = [{ from: 'empno', to }]
    searchRef.value?.open()
  }
  const searchItemEnter = (to: 'empno' | 'empokno') => {
    pickSetting.value = [{ from: 'empno', to }]
    isEnter.value = true
    searchText.value = filter.value?.[to] ?? ''
    searchRef.value?.open()
  }
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.EmpLoan.Search,
      data: filter.value
    })
    if (res?.status === 200) {
      tbData.value = res.data
    }
  }
  //新增按鈕
  const handleCreate = () => {
    store.create(router)
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    store.edit(row.bno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    store.copy(row.bno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    store.browse(row.bno, router)
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.bno}」${row.empname}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'DELETE',
          url: api.EmpLoan.Delete,
          data: { bno: row.bno }
        }).then((res: any) => {
          if (res?.status === 200) {
            const data = res?.data
            if (data && data.state === 'success') {
              message.alert({
                type: 'success',
                message: '刪除成功!',
                autoClose: 2,
                onConfirm: () => {
                  filterSearch()
                }
              })
            }
          }
        })
      }
    })
  }
  //起始動作
  onMounted(() => {
    filterSearch()
  })
  watch(() => ({ ...filter.value }), filterSearch)
  //列印
  const printDS = ref(false)

  // 排序
  type SortKey = 'date1' | 'bno' | 'empname' | null
  const sort = ref<{ key: SortKey; asc: boolean }>({ key: null, asc: true })

  const parseDate1 = (v: string) => {
    if (!v) return NaN
    const s = String(v).trim()
    if (s.includes('-')) return new Date(s).getTime()
    const d = s.replace(/\D/g, '')
    if (d.length === 7) {
      const y = +d.slice(0, 3) + 1911,
        m = +d.slice(3, 5) - 1,
        dd = +d.slice(5, 7)
      return new Date(y, m, dd).getTime()
    }
    if (d.length === 8) {
      const y = +d.slice(0, 4),
        m = +d.slice(4, 6) - 1,
        dd = +d.slice(6, 8)
      return new Date(y, m, dd).getTime()
    }
    return NaN
  }
  const cmpStr = (a?: string, b?: string) => {
    const sa = (a ?? '').trim(),
      sb = (b ?? '').trim()
    if (!sa && !sb) return 0
    if (!sa) return 1
    if (!sb) return -1
    return sa.localeCompare(sb, 'zh-Hant')
  }
  const cmpBno = (a?: string, b?: string) => {
    const na = Number(a),
      nb = Number(b)
    return Number.isFinite(na) && Number.isFinite(nb) ? na - nb : cmpStr(a, b)
  }

  const applySort = () => {
    const { key, asc } = sort.value
    if (!key) return
    const sign = asc ? 1 : -1
    tbData.value = [...tbData.value].sort((a, b) => {
      let diff = 0
      if (key === 'date1') {
        const ta = parseDate1(a.date1),
          tb = parseDate1(b.date1)
        if (isNaN(ta) && isNaN(tb)) diff = 0
        else if (isNaN(ta)) diff = 1
        else if (isNaN(tb)) diff = -1
        else diff = ta - tb
      } else if (key === 'bno') {
        diff = cmpBno(a.bno, b.bno)
      } else if (key === 'empname') {
        diff = cmpStr(a.empname, b.empname)
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
    if (sort.value.key !== key) return 'fa-solid fa-sort' // 中性
    return sort.value.asc ? 'fa-solid fa-arrow-up-wide-short' : 'fa-solid fa-arrow-down-wide-short'
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate">新增</c-button>
    </div>
  </c-bread>
  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto">
          <c-input
            type="date"
            v-model="filter.date1"
            label="借支日期"
            icon="fa-solid fa-calendar-day"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.bno"
            label="借支單號"
            icon="fa-solid fa-file-lines"
            :maxlength="11"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.acno"
            label="傳票單號"
            icon="fa-solid fa-file-lines"
            :maxlength="11"
          />
        </v-col>
        <v-col cols="4"></v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.empno"
            label="員工編號"
            icon="fa-solid fa-user"
            :maxlength="10"
            @button="searchItemOpen('empno')"
            @keyEnter="searchItemEnter('empno')"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.empokno"
            label="核可人員編號"
            icon="fa-solid fa-user"
            :maxlength="10"
            @button="searchItemOpen('empokno')"
            @keyEnter="searchItemEnter('empokno')"
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
    v-model="tbData"
    :show-index="true"
    class="mt-3"
    striped="even"
    height="580"
    fixed-header
    hover
  >
    <template v-slot:head>
      <th class="th-sort">
        借支日期
        <button
          class="sort-btn"
          :aria-pressed="sort.key === 'date1'"
          @click.stop="toggleSort('date1')"
        >
          <i :class="sortIcon('date1')"></i>
        </button>
      </th>

      <th class="th-sort">
        借支單號
        <button class="sort-btn" :aria-pressed="sort.key === 'bno'" @click.stop="toggleSort('bno')">
          <i :class="sortIcon('bno')"></i>
        </button>
      </th>

      <th class="th-sort">
        員工名稱
        <button
          class="sort-btn"
          :aria-pressed="sort.key === 'empname'"
          @click.stop="toggleSort('empname')"
        >
          <i :class="sortIcon('empname')"></i>
        </button>
      </th>
      <th>借支金額</th>
      <th>核可人員</th>
      <th>出納人員</th>
      <th>借支原因</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.date1 }}</td>
      <td>{{ scope.bno }}</td>
      <td>{{ scope.empname }}</td>
      <td>{{ scope.borrpr }}</td>
      <td>{{ scope.empokname }}</td>
      <td>{{ scope.empacname }}</td>
      <td>{{ scope.descrip }}</td>
      <td>
        <v-row dense justify="end">
          <v-col cols="auto">
            <c-button kind="copy" icon="fa-solid fa-copy" @click="handleCopy(scope)">複製</c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="edit" icon="fa-solid fa-pen-to-square" @click="handleEdit(scope)">
              編輯
            </c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="browse" icon="fa-solid fa-eye" @click="handleBrowse(scope)">
              瀏覽
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

  <!--列印 彈出視窗-->
  <print v-model="printDS" />
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
</style>

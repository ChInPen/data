<script lang="ts" setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import { cInput, cDialog, cButton, cDataTable } from '@/components/Common'
  import type { PropType } from 'vue'
  import type { DataTableHeader } from 'vuetify'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { numberFormat } from '@/utils/uformat'
  import type { PickSetting } from '@/store/create'
  // import { usePickItem } from '@/store/pickItem'
  // const store = usePickItem()
  import type { HeadTbData, SearchData } from './type'
  import { searchProt } from '@/components/SearchProt'
  import { searchCust } from '@/components/SearchCust'

  const isOpen = defineModel({ default: false })
  const formData = defineModel('form')
  const props = defineProps({
    setting: Array as PropType<PickSetting<SearchData>[]>,
    row: Number,
    mode: String as PropType<'add' | 'insert'>,
    empty: Object
  })
  const emits = defineEmits(['pick'])

  // store 變數設置
  const storeSet = () => {
    // if (formData.value) store.target.value = formData
    // if (props.setting && props.setting.length > 0) store.pickSetting = [...props.setting]
    // if (typeof props.row === 'number' && props.row >= 0) store.target.row = props.row
    // if (['add', 'insert'].includes(props.mode)) store.mode = props.mode
    // if (props.empty) store.empty = { ...props.empty }
  }

  //查詢條件
  const filter = ref({
    qno: '',
    protno: '',
    protabbr: '',
    custno: '',
    custabbr: ''
  })
  // Dialog開啟時
  watch(
    () => isOpen.value,
    (newVal) => {
      if (newVal) {
        storeSet()
      }
    }
  )

  //表格資料
  const headTbData = ref<HeadTbData[]>([])
  const detTbData = ref<SearchData[]>([])
  const selected = ref([])
  const headTableRef = ref()
  const detTableRef = ref()
  //表格設定
  const headers: DataTableHeader[] = [
    { title: '報價單號', key: 'qno', sortable: false, align: 'center' },
    { title: '報價日期', key: 'date1', sortable: false },
    { title: '業主簡稱', key: 'custabbr', sortable: false },
    { title: '工程簡稱', key: 'custabbr', sortable: false },
    { title: '報價總額', key: 'amount', sortable: false },
    { title: '報價人員', key: 'empname', sortable: false }
  ]
  const detheaders: DataTableHeader[] = [
    { title: '工料編號', key: 'itemno', width: 200, sortable: false, align: 'center' },
    { title: '工料名稱', key: 'itemname', sortable: false },
    { title: '數量', key: 'qty', width: 200, sortable: false },
    { title: '單位', key: 'unit', width: 80, sortable: false },
    { title: '未轉數量', key: 'nqty', width: 130, sortable: false }
  ]

  // 查詢
  const handleSearch = async () => {
    await callApi({
      method: 'POST',
      url: api.Sqte.Sqte_List,
      data: {
        date1_start: '',
        date1_end: '',
        qno_start: filter.value.qno,
        qno_end: filter.value.qno,
        memo1: '',
        custno_start: filter.value.custno,
        custno_end: filter.value.custno,
        empno: '',
        itemno: '',
        pageNumber: 1,
        pageSize: 1000,
        top: 1000
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const { data } = res?.data ?? []
        if (data && Array.isArray(data)) headTbData.value = data
        if (headTbData.value.length > 0) {
          headTableRef.value?.handleRowSelect?.(headTbData.value[0])
        }
      }
    })
  }
  const handleDetSearch = async (data) => {
    if (data.index1) {
      await callApi({
        method: 'POST',
        url: api.Sqte.Sqte_Data,
        data: { index1: data.index1 }
      }).then((res: any) => {
        if (res?.status === 200) {
          const { sqtedet_chinesenum_list } = res?.data ?? []
          if (sqtedet_chinesenum_list && Array.isArray(sqtedet_chinesenum_list)) {
            detTbData.value = sqtedet_chinesenum_list
            handleCancelAll()
          }
        }
      })
    }
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      qno: '',
      protno: '',
      protabbr: '',
      custno: '',
      custabbr: ''
    }
  }
  // 全部取消
  const handleCancelAll = () => {
    selected.value = []
  }
  // 取回
  const handleSend = () => {
    // let checkList: any[] = itemTableRef.value?.checked ?? []
    // checkList = checkList.map((x) => ({
    //   ...x,
    //   ...filterHDS.value,
    //   mkindno1: getMKindno1(x.mkindno)
    // }))
    // store.pick(checkList)
    // emits('pick', checkList)
    isOpen.value = false
  }

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      //清空查詢條件
      handleClear()
      //清空表格資料和勾選
      handleCancelAll()
      headTbData.value = []
      detTbData.value = []
      // store.clear()
    })
  }

  const open = () => {
    isOpen.value = true
  }
  defineExpose({
    open
  })

  //查詢工程彈窗
  const searchProtDS = ref(false)
  const searchProtEnter = ref(false)
  const handleProtOpen = () => {
    searchProtDS.value = true
  }
  const handleProtKeyEnter = () => {
    searchProtEnter.value = true
    searchProtDS.value = true
  }
  //查詢業主彈窗
  const searchCustDS = ref(false)
  const searchCustEnter = ref(false)
  const handleCustOpen = () => {
    searchCustDS.value = true
  }
  const handleCustKeyEnter = () => {
    searchCustEnter.value = true
    searchCustDS.value = true
  }

  //輸入數量時自動選擇該行
  const handleSelected = (data) => {
    const find = selected.value.find((x) => x === data.itemno)
    if (!find) selected.value.push(data.itemno)
  }
</script>

<template>
  <c-dialog
    v-model="isOpen"
    v-bind="$attrs"
    width="1500"
    @afterLeave="handleDialogClose"
    title-divider
  >
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇報價明細</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3">
      <v-card-text>
        <div class="d-flex">
          <v-row dense class="w-75">
            <v-col :cols="4">
              <c-input v-model="filter.qno" label="報價單號" />
            </v-col>
            <v-col :cols="4">
              <c-input
                v-model="filter.protno"
                label="工程編號"
                @button="handleProtOpen"
                @keyEnter="handleProtKeyEnter"
              />
            </v-col>
            <v-col :cols="4">
              <c-input v-model="filter.protabbr" label="工程簡稱" disabled />
            </v-col>
            <v-col :cols="4" :offset="4">
              <c-input
                v-model="filter.custno"
                label="業主編號"
                @button="handleCustOpen"
                @keyEnter="handleCustKeyEnter"
              />
            </v-col>
            <v-col :cols="4">
              <c-input v-model="filter.custabbr" label="業主簡稱" disabled />
            </v-col>
          </v-row>
          <v-row dense justify="end" class="w-25">
            <v-col cols="auto" class="mt-2">
              <c-button kind="clear" icon="fa-solid fa-eraser" @click="handleClear">清空</c-button>
            </v-col>
            <v-col cols="auto" class="mt-2">
              <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
                查詢
              </c-button>
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto">
              <c-button kind="delete" icon="mdi-close-box-multiple" @click="handleCancelAll">
                全部取消
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSend">
                取回
              </c-button>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
    <c-data-table
      class="mt-3"
      ref="headTableRef"
      v-model="headTbData"
      :headers="headers"
      striped="even"
      height="280"
      fixed-header
      selectable
      :pagination="false"
      @rowselect="handleDetSearch"
    >
      <template v-slot:item.amount="{ scope }">
        {{ numberFormat(scope.amount, { thousands: true }) }}
      </template>
    </c-data-table>
    <c-data-table
      class="mt-3"
      ref="detTableRef"
      v-model="detTbData"
      v-model:selected="selected"
      :headers="detheaders"
      striped="even"
      show-select
      item-value="itemno"
    >
      <template v-slot:item.qty="{ scope }">
        <c-input
          type="number"
          v-model="scope.qty"
          :format="{ thousands: true, decimal: true, decAfterN: 3 }"
          :maxlength="10"
          @change="handleSelected(scope)"
        />
      </template>
    </c-data-table>
  </c-dialog>

  <search-prot
    v-model="searchProtDS"
    v-model:form="filter"
    v-model:keyenter="searchProtEnter"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }]"
    :search-text="filter.protno"
  />
  <search-cust
    v-model="searchCustDS"
    v-model:form="filter"
    v-model:keyenter="searchCustEnter"
    :setting="[{ from: 'custno' }, { from: 'custabbr' }]"
    :search-text="filter.custno"
  />
</template>

<style scoped></style>

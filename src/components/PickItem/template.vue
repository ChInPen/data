<script lang="ts" setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import {
    cInput,
    cSelect,
    cCheckbox,
    cDialog,
    cButton,
    cDataTable,
    cDivider
  } from '@/components/Common'
  import type { PropType } from 'vue'
  import type { DataTableHeader } from 'vuetify'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import type { PickSetting } from '@/store/create'
  import { usePickItem } from '@/store/pickItem'
  const store = usePickItem()
  import type { SearchData } from './type'
  import { pickIKind } from '@/components/PickIKind'

  const isOpen = defineModel({ default: false })
  const formData = defineModel('form')
  const props = defineProps({
    showIkind: {
      type: Boolean,
      default: false
    },
    showHds: {
      type: Boolean,
      default: false
    },
    headlist: {
      type: Array as PropType<iHeadItem[]>,
      default: []
    },
    detlist: {
      type: Array as PropType<iDetItem[]>,
      default: []
    },
    seclist: {
      type: Array as PropType<iSecItem[]>,
      default: []
    },
    mkind6: {
      type: Boolean,
      default: false
    },
    setting: Array as PropType<PickSetting<SearchData>[]>,
    row: Number,
    mode: String as PropType<'add' | 'insert'>,
    empty: Object
  })
  const emits = defineEmits(['pick'])

  // store 變數設置
  const storeSet = () => {
    if (formData.value) store.target.value = formData
    if (props.setting && props.setting.length > 0) store.pickSetting = [...props.setting]
    if (typeof props.row === 'number' && props.row >= 0) store.target.row = props.row
    if (['add', 'insert'].includes(props.mode)) store.mode = props.mode
    if (props.empty) store.empty = { ...props.empty }
  }

  //查詢條件
  const filter = ref({
    itemno: '',
    itemname: '',
    mkindno: [],
    ikindno: '',
    ikindname: ''
  })
  //勾選框
  const mkindCheckbox = ref([
    { value: '1', label: '材料' },
    { value: '2', label: '工資' },
    { value: '3', label: '費用' },
    { value: '4', label: '外包' },
    { value: '6', label: '雜支' }
  ])
  //大中小項目
  const filterHDS = ref({
    headitemno: '',
    headitemno1: '',
    headitem: '',
    detitemno: '',
    detitemno1: '',
    detitem: '',
    secitemno: '',
    secitemno1: '',
    secitem: ''
  })
  const detListDDL = computed(() => {
    const { headitemno } = filterHDS.value
    if (!headitemno) return []
    return props.detlist.filter((x) => x.headitemno === headitemno)
  })
  const secListDDL = computed(() => {
    const { headitemno, detitemno } = filterHDS.value
    if (!headitemno || !detitemno) return []
    return props.seclist.filter((x) => x.headitemno === headitemno && x.detitemno === detitemno)
  })
  //監聽
  watch(
    () => filterHDS.value.headitemno,
    (newVal) => {
      const item = props.headlist.find((x) => x.headitemno === newVal)
      if (item) {
        filterHDS.value.headitemno1 = item.headitemno1
        filterHDS.value.headitem = item.headitem
      }
      filterHDS.value = {
        ...filterHDS.value,
        detitemno: '',
        detitemno1: '',
        detitem: '',
        secitemno: '',
        secitemno1: '',
        secitem: ''
      }
    }
  )
  watch(
    () => filterHDS.value.detitemno,
    (newVal) => {
      const headitemno = filterHDS.value.headitemno
      const item = props.detlist.find((x) => x.headitemno === headitemno && x.detitemno === newVal)
      if (item) {
        filterHDS.value.detitemno1 = item.detitemno1
        filterHDS.value.detitem = item.detitem
      }
      filterHDS.value = {
        ...filterHDS.value,
        secitemno: '',
        secitemno1: '',
        secitem: ''
      }
    }
  )
  watch(
    () => filterHDS.value.secitemno,
    (newVal) => {
      const headitemno = filterHDS.value.headitemno
      const detitemno = filterHDS.value.detitemno
      const item = props.seclist.find(
        (x) => x.headitemno === headitemno && x.detitemno === detitemno && x.secitemno === newVal
      )
      if (item) {
        filterHDS.value.secitemno1 = item.secitemno1
        filterHDS.value.secitem = item.secitem
      }
    }
  )
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
  const tbData = ref<SearchData[]>([])
  const selected = ref([])
  const itemTableRef = ref()
  //表格設定
  const headers: DataTableHeader[] = [
    { title: '工料編號', key: 'itemno', sortable: false, nowrap: true },
    { title: '工料名稱', key: 'itemname', sortable: false },
    { title: '數量', key: 'ibompqty', width: '150', sortable: false },
    { title: '單位', key: 'stkunit', sortable: false, align: 'center' }
  ]

  // 查詢
  const handleSearch = async () => {
    const { itemno, itemname, ikindno, mkindno } = filter.value
    await callApi({
      method: 'POST',
      url: api.Item.ItemNo_Data,
      data: {
        itemno: itemno ?? '',
        itemname: itemname ?? '',
        ikindno: ikindno ?? '',
        mkindno: props.mkind6 ? ['6'] : (mkindno ?? [])
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? []
        if (data && Array.isArray(data)) tbData.value = data
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      itemno: '',
      itemname: '',
      mkindno: [],
      ikindno: '',
      ikindname: ''
    }
  }
  // 全部取消
  const handleCancelAll = () => {
    selected.value = []
  }
  // 取回
  const handleSend = () => {
    let checkList: any[] = itemTableRef.value?.checked ?? []
    checkList = checkList.map((x) => ({
      ...x,
      ...filterHDS.value,
      mkindno1:
        x.mkindno == '1'
          ? '材料'
          : x.mkindno == '2'
            ? '工資'
            : x.mkindno == '3'
              ? '費用'
              : x.mkindno == '4'
                ? '外包'
                : x.mkindno == '6'
                  ? '雜支'
                  : ''
    }))
    store.pick(checkList)
    emits('pick', checkList)
    isOpen.value = false
  }

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      //清空查詢條件
      handleClear()
      filterHDS.value = {
        headitemno: '',
        headitemno1: '',
        headitem: '',
        detitemno: '',
        detitemno1: '',
        detitem: '',
        secitemno: '',
        secitemno1: '',
        secitem: ''
      }
      //清空表格資料和勾選
      handleCancelAll()
      tbData.value = []
      store.clear()
    })
  }

  const open = () => {
    isOpen.value = true
  }
  defineExpose({
    open
  })

  //選擇工料類別彈窗
  const pickIKindRef = ref()
  const pickIKindEnter = ref(false)
  const handleIKindOpen = () => {
    pickIKindRef.value?.open()
  }
  const handleIKindKeyEnter = () => {
    pickIKindEnter.value = true
    pickIKindRef.value?.open()
  }
</script>

<template>
  <c-dialog
    v-model="isOpen"
    v-bind="$attrs"
    width="1100"
    @afterLeave="handleDialogClose"
    title-divider
  >
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇工料</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3">
      <v-card-text>
        <v-row dense v-if="showHds">
          <v-col :cols="4">
            <c-select
              v-model="filterHDS.headitemno"
              label="大項目"
              :items="headlist"
              :item-title="(item) => (item ? `${item.headitemno1} - ${item.headitem}` : '')"
              item-value="headitemno"
              hide-search
            />
          </v-col>
          <v-col :cols="4" class="px-2">
            <c-select
              v-model="filterHDS.detitemno"
              label="中項目"
              :items="detListDDL"
              :item-title="(item) => (item ? `${item.detitemno1} - ${item.detitem}` : '')"
              item-value="detitemno"
              hide-search
            />
          </v-col>
          <v-col :cols="4">
            <c-select
              v-model="filterHDS.secitemno"
              label="細項目"
              :items="secListDDL"
              :item-title="(item) => (item ? `${item.secitemno1} - ${item.secitem}` : '')"
              item-value="secitemno"
              hide-search
            />
          </v-col>
        </v-row>
        <c-divider v-if="showHds" />
        <v-row dense>
          <v-col :cols="4">
            <c-input v-model="filter.itemno" label="工料編號" />
          </v-col>
          <v-col :cols="8" v-if="!mkind6">
            <v-row dense :align="'center'" justify="end">
              <v-col cols="auto" class="fs-5">工料分類：</v-col>
              <v-col cols="auto" v-for="mkind in mkindCheckbox" :key="mkind.value">
                <c-checkbox
                  class="pe-3"
                  v-model="filter.mkindno"
                  density="compact"
                  size="3"
                  :value="mkind.value"
                  :label="mkind.label"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col :cols="7">
            <c-input v-model="filter.itemno" label="工料名稱" />
          </v-col>
          <v-col class="fs-5 fw-bold text-danger ps-2">
            {{ mkind6 ? '' : '請選擇工料分類...' }}
          </v-col>
          <v-col cols="auto" class="mt-2">
            <c-button kind="clear" icon="fa-solid fa-eraser" @click="handleClear">清空</c-button>
          </v-col>
          <v-col cols="auto" class="mt-2">
            <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
              查詢
            </c-button>
          </v-col>
        </v-row>
        <v-row dense :align="'start'">
          <v-col :cols="4" v-if="showIkind">
            <c-input
              v-model="filter.ikindno"
              label="工料類別"
              @button="handleIKindOpen"
              @keyEnter="handleIKindKeyEnter"
            />
          </v-col>
          <v-col :cols="3" v-if="showIkind">
            <c-input v-model="filter.ikindname" disabled />
          </v-col>
          <v-col></v-col>
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
      </v-card-text>
    </v-card>
    <c-data-table
      ref="itemTableRef"
      v-model="tbData"
      v-model:selected="selected"
      class="mt-3"
      :headers="headers"
      striped="even"
      :height="showHds ? '420' : '500'"
      fixed-header
      show-select
      item-value="itemno"
    >
      <template v-slot:item.ibompqty="{ scope }">
        <c-input type="number" v-model="scope.ibompqty" :format="{ thousands: true }" />
      </template>
    </c-data-table>
  </c-dialog>

  <pickIKind
    ref="pickIKindRef"
    v-model:form="filter"
    v-model:keyenter="pickIKindEnter"
    :setting="[{ from: 'ikindno' }, { from: 'ikindname' }]"
    :search-text="filter.ikindno"
  />
</template>

<style scoped></style>

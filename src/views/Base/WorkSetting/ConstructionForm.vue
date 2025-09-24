<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTable,
    cBread,
    cRadioGroup,
    cDataTable,
    cSelectInput
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useConstructionStore } from '@/store/construction'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import type { DataTableHeader } from 'vuetify'
  import { GenerateRec, deepClone } from '@/utils/ucommon'
  import { HDSno1, HDSsort } from '@/utils/uheaddetsec'
  import { projectType } from '@/components/ProjectType'
  import { pickIKind } from '@/components/PickIKind'
  import { usePickIKind } from '@/store/pickIKind'
  const pickIKindStore = usePickIKind()
  import { pickItem } from '@/components/PickItem'
  import { usePickItem } from '@/store/pickItem'
  const pickItemStore = usePickItem()
  import { searchCust } from '@/components/SearchCust'
  import { useSearchCust } from '@/store/searchCust'
  const searchCustStore = useSearchCust()
  import { searchItem } from '@/components/SearchItem'
  import { useSearchItem } from '@/store/searchItem'
  const searchItemStore = useSearchItem()
  // import hdsItem from './Components/ConstructionFormHDS.vue'
  import { hdsItem } from '@/components/HdsItem'
  import plle from './Components/ConstructionFormPlle.vue'
  import { boms } from '@/components/Boms'

  const store = useConstructionStore()
  const router = useRouter()

  //下拉選單
  const empDDL = ref<{ empno: string; empname: string }[]>([])
  const unitDDL = ref<{ content1: string }[]>([])
  //抓人員下拉選單資料
  const getEmpApi = async () => {
    callApi({
      method: 'POST',
      url: api.Emp.Emp_ListSimple
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data as any[] | undefined
        if (data && Array.isArray(data)) {
          empDDL.value = data.map(({ empno, empname }) => ({ empno, empname }))
        }
      }
    })
  }
  //抓單位下拉選單資料
  const getUnitApi = async () => {
    callApi({
      method: 'POST',
      url: api.Phr.UnitBrow,
      params: { indexValue: '' }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data
        if (data && Array.isArray(data)) {
          unitDDL.value = data
        }
      }
    })
  }

  //工程資料
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:protno，protname，protabbr, custno
    const requiredFields = [
      { key: 'protno', label: '工程編號' },
      { key: 'custno', label: '業主編號' },
      { key: 'protname', label: '工程名稱' },
      { key: 'protabbr', label: '工程簡稱' }
    ]
    let missing = requiredFields
      .filter((field) => !formData.value?.[field.key])
      .map((field) => field.label)
      .join('、')
    if (missing) missing = `${missing}不可為空白`
    //檢查合約明細
    let missingDet = protdetList.value
      .map((s, i) => (!s.itemno ? i + 1 : ''))
      .filter(Boolean)
      .join('、')
    if (missingDet) missingDet = `合約明細: 第${missingDet}筆工料編號不可為空白`
    //檢查工程類別預估
    let missingIKind = protIKindList.value
      .map((s, i) => (!s.ikindno ? i + 1 : ''))
      .filter(Boolean)
      .join('、')
    if (missingIKind) missingIKind = `工程類別預估: 第${missingIKind}筆工料類別編號不可為空白`
    const missing2 =
      missingDet && missingIKind ? `${missingDet}\n${missingIKind}` : missingDet || missingIKind
    return missing && missing2 ? `${missing}\n${missing2}` : missing || missing2
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    const create = { ...formData.value }
    const project = Object.fromEntries(
      Object.keys(create ?? {}).map((key) => [key, create?.[key] ?? ''])
    )
    project.inde = '1'
    //數字欄位
    project.covesum = formData.value?.covesum ?? 0
    project.estimsum = formData.value?.estimsum ?? 0
    project.execflag = 0
    project.chplusless = formData.value?.chplusless ?? 0
    //合約明細
    let projectdets = deepClone(protdetList.value)
    projectdets = projectdets.map((obj: any) => ({
      ...obj,
      protno: formData.value.protno ?? ''
    }))
    //追加減金額
    let plledets = deepClone(plledetList.value)
    plledets = plledets.map((obj: any) => ({
      ...obj,
      protno: formData.value.protno ?? '',
      protabbr: formData.value.protabbr ?? ''
    }))
    //工程類別預估
    let protIkinds = deepClone(protIKindList.value)
    protIkinds = protIkinds.map((obj: any) => ({
      ...obj,
      protno: formData.value.protno ?? '',
      protabbr: formData.value.protabbr ?? ''
    }))
    //大中細項目
    const headitems = headItemList.value.map(({ headitemno1, ...other }) => ({ ...other }))
    const detitems = detItemList.value.map(({ headitemno1, detitemno1, ...other }) => ({
      ...other
    }))
    const secitems = secItemList.value.map(({ headitemno1, detitemno1, secitemno1, ...other }) => ({
      ...other
    }))
    const headDetSecItem = { headitems, detitems, secitems }

    return { project, projectdets, plledets, protIkinds, headDetSecItem }
  }
  const callCreateApi = () => {
    callApi({
      method: 'POST',
      url: api.Project.Project_Create,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data.state === 'success') {
          message.alert({
            type: 'success',
            message: '存檔成功',
            autoClose: 2,
            onConfirm: () => {
              handleCancel()
            }
          })
        }
      }
    })
  }
  const callEditApi = () => {
    callApi({
      method: 'PUT',
      url: api.Project.Project_EDIT,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data.state === 'success') {
          message.alert({
            type: 'success',
            message: '存檔成功',
            autoClose: 2,
            onConfirm: () => {
              handleCancel()
            }
          })
        }
      }
    })
  }
  const handleSave = () => {
    const check = checkData()
    if (check) {
      message.alert({
        type: 'warning',
        message: check
      })
      return
    }
    message.confirm({
      type: 'question',
      message: `確定要送出工程資料？`,
      onConfirm: () => {
        if (store.action === 'edit') {
          callEditApi()
        } else {
          callCreateApi()
        }
      }
    })
  }

  //新增狀態呼叫 Renew api
  const getRenewApi = async () => {
    callApi({
      method: 'GET',
      url: api.Project.Project_ReNew
    }).then((res: any) => {
      if (res?.status == 200) {
        const { project, projectdets, plledets, protIkinds } = res?.data ?? {}
        if (project) {
          formData.value = { ...project }
        }
        if (protIkinds && Array.isArray(protIkinds)) {
          // protIKindList.value = protIkinds
        }
        if (projectdets && Array.isArray(projectdets)) {
          // protdetList.value = projectdets
        }
        if (plledets && Array.isArray(plledets)) {
          // plledetList.value = plledets
        }
      }
    })
  }
  //編輯、複製、瀏覽呼叫 api
  const getAllDataApi = async () => {
    //抓工程基本資料
    callApi({
      method: 'GET',
      url: api.Project.Project_Data,
      params: { protno: store.protno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const { project, projectdets, plledets, protIkinds } = res?.data ?? {}
        if (project) {
          formData.value = { ...project }
        }
        if (protIkinds && Array.isArray(protIkinds)) {
          protIKindList.value = protIkinds
        }
        if (projectdets && Array.isArray(projectdets)) {
          protdetList.value = projectdets
        }
        if (plledets && Array.isArray(plledets)) {
          plledetList.value = plledets
        }
      }
    })
    //抓大中細項
    callApi({
      method: 'POST',
      url: api.Project.Project_HeadDetSec,
      data: {
        protno: store.protno,
        headitemno: '',
        detitemno: ''
      }
    }).then((res: any) => {
      if (res?.status == 200) {
        const { headitems, detitems, secitems } = res?.data ?? {}
        if (headitems && Array.isArray(headitems)) {
          headItemList.value = HDSsort(HDSno1(headitems, 'head'), 'head')
        }
        if (detitems && Array.isArray(detitems)) {
          detItemList.value = HDSsort(HDSno1(detitems, 'det'), 'det')
        }
        if (secitems && Array.isArray(secitems)) {
          secItemList.value = HDSsort(HDSno1(secitems, 'sec'), 'sec')
        }
      }
    })
  }

  //大項目
  const headItemList = ref<iHeadItem[]>([])
  //中項目
  const detItemList = ref<iDetItem[]>([])
  //細項目
  const secItemList = ref<iSecItem[]>([])
  //合約明細
  const protdetList = ref<(typeof protdetEmpty)[]>([])
  const protdetTable = ref()
  const protdetEmpty = {
    headitemn1: '',
    detitemno1: '',
    secitemno1: '',
    headitem: '',
    detitem: '',
    secitem: '',
    mkindno1: '',
    projectdetboms: [],
    protno: '',
    rec1: '',
    itemno: '',
    itemname: '',
    qty: 0,
    unit: '',
    price: 0,
    total1: 0,
    formula1: '',
    formula2: '',
    mkindno: '',
    descrip: '',
    sqty: 0,
    nqty: 0,
    pjt1: '',
    pjt2: '',
    pjt3: '',
    pjt4: '',
    pjt5: '',
    pjt6: '',
    pjt7: '',
    pjt8: '',
    pjt9: '',
    pjt10: '',
    sysname1: '',
    headitemno: '',
    detitemno: '',
    secitemno: '',
    spqty: 0,
    npqty: 0
  }
  const countsQtyAndTotal = (mode: 'qty' | 'total' | 'all', index?: number) => {
    protdetList.value.forEach((item, idx) => {
      if (typeof index === 'number' && idx !== index) return // 等同 continue

      if (mode === 'qty' || mode === 'all') {
        //未轉數量
        if (item.qty > item.sqty) item.nqty = item.qty - item.sqty
        if (item.qty > item.spqty) item.npqty = item.qty - item.spqty
      }
      if (mode === 'total' || mode === 'all') {
        //總價
        if (item.qty && item.price) item.total1 = item.qty * item.price
      }
    })
  }
  const protdetAdd = () => {
    pickItemStore.set(
      protdetList,
      [
        { from: 'headitemno' },
        { from: 'headitem' },
        { from: 'headitemno1', to: 'headitemn1' },
        { from: 'detitemno' },
        { from: 'detitem' },
        { from: 'detitemno1' },
        { from: 'secitemno' },
        { from: 'secitem' },
        { from: 'secitemno1' },
        { from: 'itemno' },
        { from: 'itemname' },
        { from: 'ibompqty', to: 'qty', valueType: 'number' },
        { from: 'stkunit', to: 'unit' },
        { from: 'mkindno' },
        { from: 'mkindno1' }
      ],
      {
        mode: 'add',
        empty: { ...protdetEmpty }
      }
    )
    pickItemDS.value = true
  }
  const protdetItemnoSet = (index: number) => {
    pickItemStore.set(
      protdetList,
      [
        { from: 'headitemno' },
        { from: 'headitem' },
        { from: 'headitemno1', to: 'headitemn1' },
        { from: 'detitemno' },
        { from: 'detitem' },
        { from: 'detitemno1' },
        { from: 'secitemno' },
        { from: 'secitem' },
        { from: 'secitemno1' },
        { from: 'itemno' },
        { from: 'itemname' },
        { from: 'ibompqty', to: 'qty', valueType: 'number' },
        { from: 'stkunit', to: 'unit' },
        { from: 'mkindno' },
        { from: 'mkindno1' }
      ],
      {
        row: index,
        mode: 'insert',
        empty: { ...protdetEmpty }
      }
    )
    pickItemDS.value = true
  }
  const protdetInsert = () => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protdetList.value.splice(selectIndex, 0, { ...protdetEmpty })
    }
  }
  const protdetDelete = () => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protdetList.value.splice(selectIndex, 1)
    }
  }
  const protdetProType = () => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      projectTypeDS.value = true
    }
  }
  const protdetBoms = () => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const bom = protdetList.value[selectIndex].projectdetboms
      if (Array.isArray(bom)) {
        selectBomsList.value = deepClone(bom)
      }
      bomsDS.value = true
    }
  }

  //工程類別預估
  const protIKindEmpty = {
    protno: '',
    protabbr: '',
    ikindno: '',
    ikindname: '',
    pimoney: 0,
    rec1: ''
  }
  const protIKindList = ref<(typeof protIKindEmpty)[]>([])
  const protIKindHeaders: DataTableHeader[] = [
    { key: 'space_start' },
    { title: '編號', key: 'rec1', width: '80', align: 'center', sortable: false },
    { title: '類別編號', key: 'ikindno', width: '200', sortable: false },
    { title: '類別名稱', key: 'ikindname', width: '460', sortable: false },
    { title: '金額', key: 'pimoney', width: '240', sortable: false },
    { key: 'space_end' }
  ]
  const protIKindTable = ref()
  const protIKindAdd = () => {
    protIKindList.value.push({ ...protIKindEmpty })
    GenerateRec(protIKindList.value, 'rec1', 2)
  }
  const protIKindDel = () => {
    const selectRow = protIKindTable.value?.selectIndex?.[0]
    if (typeof selectRow === 'number' && selectRow >= 0) {
      protIKindList.value.splice(selectRow, 1)
      GenerateRec(protIKindList.value, 'rec1', 2)
    }
  }

  //起始動作
  onMounted(() => {
    //抓下拉選單資料
    getEmpApi()
    getUnitApi()
    //抓單筆資料
    if (store.action === 'create') {
      getRenewApi()
    } else if (store.protno) {
      getAllDataApi()
    }
  })

  //查詢業主彈窗
  const searchCustDS = ref(false)
  const searchCustOpen = () => {
    searchCustStore.set(formData, [{ from: 'custno' }, { from: 'custabbr' }])
    searchCustDS.value = true
  }
  const searchCustKeydown = (e: KeyboardEvent) => {
    searchCustStore.keyEnter(
      e,
      formData,
      [{ from: 'custno' }, { from: 'custabbr' }],
      formData.value.custno,
      { open: () => (searchCustDS.value = true) }
    )
  }

  //追加減金額彈窗
  const plledetList = ref<
    {
      protno: string
      protabbr: string
      rec1: string
      pdate1: string
      addorless: string
      momey: number
    }[]
  >([])
  const plleDS = ref(false)
  const handlePlleSave = (data: any[], total: number) => {
    if (data && Array.isArray(data)) {
      plledetList.value = [...data]
    }
    if (typeof total === 'number') formData.value.chplusless = total
  }

  //選擇工種彈窗
  const pickIKindDS = ref(false)
  const protIKindPick = (index: number) => {
    pickIKindStore.set(protIKindList, [{ from: 'ikindno' }, { from: 'ikindname' }], { row: index })
    pickIKindDS.value = true
  }
  const protIKindKeydown = (e: KeyboardEvent, index: number) => {
    pickIKindStore.keyEnter(
      e,
      protIKindList,
      [{ from: 'ikindno' }, { from: 'ikindname' }],
      protIKindList.value[index].ikindno,
      {
        row: index,
        open: () => {
          pickIKindDS.value = true
        }
      }
    )
  }

  //勾選工料彈窗
  const pickItemDS = ref(false)
  const handlePickItems = (data) => {
    pickItemStore.pick(data)
    protdetList.value.sort((a: any, b: any) => {
      const trans = (val: any) => (Number.isNaN(val) ? 0 : Number(val))
      return (
        trans(a.headitemno) - trans(b.headitemno) ||
        trans(a.detitemno) - trans(b.detitemno) ||
        trans(a.secitemno) - trans(b.secitemno)
      )
    })
    GenerateRec(protdetList.value, 'rec1', 4) //自動編號
    countsQtyAndTotal('all')
  }

  //查詢工料彈窗
  const searchItemRef = ref()
  const protdetItemnoKeyEnter = (e: KeyboardEvent, searchText: string, index: number) => {
    searchItemStore.keyEnter(
      e,
      protdetList,
      [
        { from: 'itemno' },
        { from: 'itemname' },
        { from: 'stkunit', to: 'unit' },
        { from: 'mkindno' },
        { from: 'mkindname', to: 'mkindno1' }
      ],
      searchText,
      {
        row: index,
        open: searchItemRef.value?.open
      }
    )
  }

  //規格說明彈窗
  const projectTypeDS = ref(false)
  const projectTypeItems = computed(() => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        protdetList.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protdetList.value[selectIndex].pjt1 = data.pjt1
      protdetList.value[selectIndex].pjt2 = data.pjt2
      protdetList.value[selectIndex].pjt3 = data.pjt3
      protdetList.value[selectIndex].pjt4 = data.pjt4
      protdetList.value[selectIndex].pjt5 = data.pjt5
      protdetList.value[selectIndex].pjt6 = data.pjt6
      protdetList.value[selectIndex].pjt7 = data.pjt7
      protdetList.value[selectIndex].pjt8 = data.pjt8
      protdetList.value[selectIndex].pjt9 = data.pjt9
      protdetList.value[selectIndex].pjt10 = data.pjt10
    }
  }

  //單價分析彈窗
  const bomsDS = ref(false)
  const emptyBoms = {
    protno: '',
    rec1: '',
    rec1_sys: '',
    itemno: '',
    itemname: '',
    unit: '',
    stkqty: 0,
    price: 0,
    amount: 0
  }
  const selectBomsList = ref<(typeof emptyBoms)[]>([])
  const handleBomsSave = (data: any[], _total: number) => {
    const selectIndex = protdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protdetList.value[selectIndex].projectdetboms = [...data]
    }
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread :title="store.actionName">
    <div class="col-auto" v-if="!store.isDetail">
      <c-button kind="cancel" icon="mdi-close-circle" @click="handleCancel">取消</c-button>
    </div>
    <div class="col-auto" v-if="!store.isDetail">
      <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSave">確認送出</c-button>
    </div>
    <div class="col-auto" v-else>
      <c-button kind="goback" icon="fa-solid fa-circle-left" @click="handleCancel">返回</c-button>
    </div>
  </c-bread>

  <!--資料-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto" class="text-custom-2">工程基本資料</v-col>
      </v-row>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protno"
            label="工程編號"
            :is-required="true"
            :disabled="store.keyDisabled"
            :maxlength="16"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custno"
            label="業主編號"
            :is-required="true"
            :disabled="store.isDetail"
            @button="searchCustOpen"
            @keydown="searchCustKeydown"
            :maxlength="10"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custabbr"
            label="業主簡稱"
            icon="fa-solid fa-building"
            :disabled="true"
            :maxlength="16"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protname"
            v-model:abbr="formData.protabbr"
            label="工程名稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="50"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protabbr"
            label="工程簡稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="16"
            condensed
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="mt-3">
    <v-tabs v-model="tabpage" class="c-tabs">
      <v-tab value="normal">一般資料</v-tab>
      <v-tab value="protdet">合約明細</v-tab>
      <v-tab value="sign">工程標示</v-tab>
      <v-tab value="protikind">工程類別預估</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protaddr"
                label="工程地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :maxlength="50"
                condensed
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.tel"
                label="電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="4" class="px-2">
              <c-input
                v-model="formData.coveno"
                label="合約編號"
                icon="fa-solid fa-file-contract"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.covesum"
                label="合約金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="9"
              />
            </v-col>
            <v-col cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.estimsum"
                label="預估成本"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="9"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.sdate1"
                label="簽約日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                type="date"
                v-model="formData.bdate1"
                label="開工日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.cdate1"
                label="合約完工"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.edate1"
                label="預估完工"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.tfate1"
                label="實際完工"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-radio-group
                v-model="formData.inde"
                label="損益計算："
                :items="[
                  { value: '1', label: '全部完工' },
                  { value: '3', label: '完工比例', disabled: true }
                ]"
                inline
                justify="around"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" offset="1" class="px-2">
              <c-input
                type="date"
                v-model="formData.wdate1"
                label="保固期限"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.wtime"
                label="保固期間"
                icon="fa-solid fa-shield-alt"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-select-input
                front="select"
                v-model="formData.con1empno"
                v-model:title="formData.con1"
                label="工地主任1"
                icon="fa-solid fa-user-tie"
                :items="empDDL"
                item-title="empname"
                item-value="empno"
                :item-columns="[
                  { column: 'empno', label: '人員編號' },
                  { column: 'empname', label: '人員名稱' }
                ]"
                :disabled="store.isDetail"
                width="376"
                :input-maxlength="16"
                condensed
              />
            </v-col>
            <!-- <v-col :cols="3" class="px-2">
              <c-select
                v-model="formData.con1empno"
                v-model:title="formData.con1"
                label="工地主任1"
                icon="fa-solid fa-user-tie"
                :items="empDDL"
                item-title="empname"
                item-value="empno"
                :item-columns="[
                  { column: 'empno', label: '人員編號' },
                  { column: 'empname', label: '人員名稱' }
                ]"
                also-show-value
                :disabled="store.isDetail"
              />
            </v-col> -->
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.period"
                label="工期"
                icon="fa-solid fa-calendar-days"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-select-input
                front="select"
                v-model="formData.con2empno"
                v-model:title="formData.con2"
                label="工地主任2"
                icon="fa-solid fa-user-tie"
                :items="empDDL"
                item-title="empname"
                item-value="empno"
                :item-columns="[
                  { column: 'empno', label: '人員編號' },
                  { column: 'empname', label: '人員名稱' }
                ]"
                :disabled="store.isDetail"
                width="376"
                :input-maxlength="16"
                condensed
              />
            </v-col>
            <!-- <v-col :cols="3" class="px-2">
              <c-select
                v-model="formData.con2empno"
                v-model:title="formData.con2"
                label="工地主任2"
                icon="fa-solid fa-user-tie"
                :items="empDDL"
                item-title="empname"
                item-value="empno"
                :item-columns="[
                  { column: 'empno', label: '人員編號' },
                  { column: 'empname', label: '人員名稱' }
                ]"
                also-show-value
                :disabled="store.isDetail"
              />
            </v-col> -->
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protud1"
                label="工程自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protud2"
                label="工程自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="68"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.protphoto"
                label="圖檔路徑"
                icon="fa-solid fa-file-image"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <v-row>
                <v-col cols="auto" class="px-2">
                  <c-button kind="photo" icon="fa-solid fa-images">上傳照片</c-button>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.chplusless"
                label="追加減金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true, minus: true }"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-button color="#d48833" icon="fa-solid fa-calculator" @click="plleDS = true">
                追加(減)
              </c-button>
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="protdet">
          <hdsItem
            v-model:head="headItemList"
            v-model:det="detItemList"
            v-model:sec="secItemList"
            :disabled="store.isDetail"
          >
            <v-row dense>
              <v-col cols="auto" v-if="!store.isDetail">
                <c-button kind="create" icon="mdi-plus-circle" @click="protdetAdd">新增</c-button>
              </v-col>
              <v-col cols="auto" v-if="!store.isDetail">
                <c-button kind="insert" icon="mdi-arrow-down-circle" @click="protdetInsert">
                  插入
                </c-button>
              </v-col>
              <v-col cols="auto" v-if="!store.isDetail">
                <c-button kind="delete" icon="fa-solid fa-trash" @click="protdetDelete">
                  刪除
                </c-button>
              </v-col>
              <v-col cols="auto">
                <c-button kind="photo" icon="fa-solid fa-images">看圖</c-button>
              </v-col>
              <v-col cols="auto">
                <c-button kind="boms" icon="fa-solid fa-search-dollar" @click="protdetBoms">
                  單價分析
                </c-button>
              </v-col>
              <v-col cols="auto">
                <c-button kind="protype" icon="fa-solid fa-clipboard-list" @click="protdetProType">
                  規格說明
                </c-button>
              </v-col>
            </v-row>
            <c-table
              class="mt-2"
              ref="protdetTable"
              v-model="protdetList"
              striped="even"
              hover
              selectable
              header-align="center"
            >
              <template v-slot:head>
                <th>序號</th>
                <th>大</th>
                <th>中</th>
                <th>細</th>
                <th>工料編號</th>
                <th>工料名稱</th>
                <th>數量A</th>
                <th>單位</th>
                <th>單價B</th>
                <th>複價C</th>
                <th>請款已轉D</th>
                <th>請款未轉</th>
                <th>採購已轉</th>
                <th>採購未轉</th>
                <th>比例設定(分子)</th>
                <th>比例設定(分母)</th>
                <th>說明</th>
                <th>類別</th>
              </template>
              <template v-slot:body="{ scope, index }">
                <td>
                  <div class="text-center w-rec">{{ scope.rec1 }}</div>
                </td>
                <td>
                  <div class="text-center nowrap">{{ scope.headitemn1 }}</div>
                </td>
                <td>
                  <div class="text-center nowrap">{{ scope.detitemno1 }}</div>
                </td>
                <td>
                  <div class="text-center nowrap">{{ scope.secitemno1 }}</div>
                </td>
                <td>
                  <c-input
                    v-model="scope.itemno"
                    :disabled="store.isDetail"
                    @button="protdetItemnoSet(index)"
                    @keydown="(e) => protdetItemnoKeyEnter(e, scope.itemno, index)"
                    :maxlength="20"
                    condensed
                  />
                </td>
                <td>
                  <c-input
                    v-model="scope.itemname"
                    :disabled="true"
                    :maxlength="100"
                    :length-auto-width="false"
                    condensed
                    width="380"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.qty"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                    @change="countsQtyAndTotal('all', index)"
                    :maxlength="9"
                  />
                </td>
                <td>
                  <c-select
                    v-model="scope.unit"
                    :items="unitDDL"
                    item-title="content1"
                    item-value="content1"
                    hide-search
                    :disabled="store.isDetail"
                    clearable
                    width="140"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.price"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                    @change="countsQtyAndTotal('total', index)"
                    :maxlength="10"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.total1"
                    :disabled="true"
                    :format="{ thousands: true }"
                    :maxlength="12"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.sqty"
                    :disabled="true"
                    :format="{ thousands: true }"
                    :maxlength="9"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.nqty"
                    :disabled="true"
                    :format="{ thousands: true }"
                    :maxlength="9"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.spqty"
                    :disabled="true"
                    :format="{ thousands: true }"
                    :maxlength="9"
                  />
                </td>
                <td>
                  <c-input
                    type="number"
                    v-model="scope.npqty"
                    :disabled="true"
                    :format="{ thousands: true }"
                    :maxlength="9"
                  />
                </td>
                <td>
                  <c-input
                    v-model="scope.formula1"
                    :disabled="store.isDetail"
                    :maxlength="254"
                    :length-auto-width="false"
                    condensed
                    width="200"
                  />
                </td>
                <td>
                  <c-input
                    v-model="scope.formula2"
                    :disabled="store.isDetail"
                    :maxlength="254"
                    :length-auto-width="false"
                    condensed
                    width="200"
                  />
                </td>
                <td>
                  <c-input
                    v-model="scope.descrip"
                    :disabled="store.isDetail"
                    :maxlength="20"
                    condensed
                  />
                </td>
                <td>
                  <div class="text-center w-mkindno1">{{ scope.mkindno1 }}</div>
                </td>
              </template>
            </c-table>
          </hdsItem>
        </v-tabs-window-item>
        <v-tabs-window-item value="sign">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.consT_NO"
                label="建造執照"
                icon="fa-solid fa-id-card"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.consT_BY"
                label="起造人"
                icon="fa-solid fa-person-digging"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.consT_MGR"
                label="承造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.dsgN_BY"
                label="設計人"
                icon="fa-solid fa-brush"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.dsgN_CNO"
                label="設計人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.insP_MGR"
                label="監造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.insP_NO"
                label="監造人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="5" class="px-2">
              <c-input
                v-model="formData.enG_EMP"
                label="專任工程人員"
                icon="fa-solid fa-user-tie"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.insP_TEL"
                label="監造人電話"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="5" class="px-2">
              <c-input
                v-model="formData.usE_PART"
                label="使用分區"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.consT_TEL"
                label="服務電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="5" class="px-2">
              <c-input
                v-model="formData.ctrL_NO"
                label="管制編號"
                icon="fa-solid fa-hashtag"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.pnP_TEL"
                label="公害陳情專線"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.enG_DESC"
                label="工程概要"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
                :maxlength="50"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="protikind">
          <v-row dense class="w-75 mx-auto">
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="protIKindAdd">新增</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="protIKindDel">刪除</c-button>
            </v-col>
            <v-col cols="12">
              <c-data-table
                ref="protIKindTable"
                v-model="protIKindList"
                :headers="protIKindHeaders"
                striped="even"
                hover
                :header-props="{ align: 'center' }"
                selectable
              >
                <template v-slot:item.ikindno="{ scope, index }">
                  <c-input
                    v-model="scope.ikindno"
                    :disabled="store.isDetail"
                    @button="protIKindPick(index)"
                    @keydown="(e: any) => protIKindKeydown(e, index)"
                    :maxlength="4"
                    :length-auto-width="false"
                  />
                </template>
                <template v-slot:item.ikindname="{ scope }">
                  <c-input
                    v-model="scope.ikindname"
                    :disabled="store.isDetail"
                    :maxlength="20"
                    :length-auto-width="false"
                  />
                </template>
                <template v-slot:item.pimoney="{ scope }">
                  <c-input
                    type="number"
                    v-model="scope.pimoney"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                    :maxlength="12"
                    :length-auto-width="false"
                  />
                </template>
              </c-data-table>
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <audit-info
    class="mt-2"
    v-if="store.action === 'edit' || store.action === 'detail'"
    :a_date="formData.a_date1"
    :a_user="formData.a_user"
    :m_date="formData.m_date1"
    :m_user="formData.m_user"
  />

  <project-type
    v-model="projectTypeDS"
    :items="projectTypeItems"
    @save="handlePJTsave"
    :disabled="store.isDetail"
  />
  <pickIKind v-model="pickIKindDS" @pick="pickIKindStore.pick" />
  <pick-item
    v-model="pickItemDS"
    :show-ikind="true"
    :show-hds="true"
    :headlist="headItemList"
    :detlist="detItemList"
    :seclist="secItemList"
    @pick="handlePickItems"
  />
  <search-cust v-model="searchCustDS" @pick="searchCustStore.pick" />
  <search-item ref="searchItemRef" @pick="searchItemStore.pick" />
  <plle v-model="plleDS" :items="plledetList" @save="handlePlleSave" :disabled="store.isDetail" />
  <boms
    v-model="bomsDS"
    :items="selectBomsList"
    :empty-data="emptyBoms"
    @save="handleBomsSave"
    :disabled="store.isDetail"
  />
</template>

<style scoped>
  .div-prot-ikind {
    border: 1px solid white;
    padding: 0;
  }
  .w-rec {
    width: 68px;
  }
  .w-mkindno1 {
    width: 60px;
  }
  .nowrap {
    white-space: nowrap;
  }
</style>

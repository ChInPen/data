<script lang="ts" setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTable,
    cBread,
    cDivider,
    cRadioGroup,
    cDataTable
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useConstructionStore } from '@/store/construction'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import type { DataTableHeader } from 'vuetify'
  import { GenerateRec } from '@/utils/ucommon'
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
  import { fa } from 'vuetify/locale'
  const searchItemStore = useSearchItem()

  const store = useConstructionStore()
  const router = useRouter()

  //下拉選單
  const empDDL = ref<{ empno: string; empname: string }[]>([])
  const taxkindDDL = ref<{ taxkind: string; taxkindc: string }[]>([])
  const invokindDDL = ref<{ invokindno: string; invokindna: string }[]>([])
  const akindDDL = ref<{ akindno: string; akindname: string }[]>([])
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
  //抓營業稅下拉選單資料
  const getTaxkindApi = async () => {
    callApi({
      method: 'POST',
      url: api.Taxkind.Taxkind_List,
      params: { indexValue: '' }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data as any[] | undefined
        if (data && Array.isArray(data)) {
          taxkindDDL.value = data
        }
      }
    })
  }
  //抓發票種類下拉選單資料
  const getInvokindApi = async () => {
    callApi({
      method: 'POST',
      url: api.Invokind.Invokind_List,
      params: { indexValue: '' }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data as any[] | undefined
        if (data && Array.isArray(data)) {
          invokindDDL.value = data
        }
      }
    })
  }
  //抓結帳類別下拉選單資料
  const getAkindApi = async () => {
    callApi({
      method: 'POST',
      url: api.Akind.Akind_List,
      data: {
        akindno: '',
        akindname: ''
      }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data as any[] | undefined
        if (data && Array.isArray(data)) {
          akindDDL.value = data.map(({ akindno, akindname }) => ({ akindno, akindname }))
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
    //必填:itemno，itemname，ikindno，mkindno
    // const requiredFields = [
    //   { key: 'itemno', label: '工料編號' },
    //   { key: 'ikindno', label: '工料類別' },
    //   { key: 'itemname', label: '工料名稱' },
    //   { key: 'mkindno', label: '工料分類' }
    // ]
    // let missing = requiredFields
    //   .filter((field) => !formData.value?.[field.key])
    //   .map((field) => field.label)
    //   .join('、')
    // if (missing) missing = `${missing}不可為空白`
    // //檢查工程分析
    // let missingE3 = e3DataList.value
    //   .map((s, i) => (!s.ibomno ? i + 1 : ''))
    //   .filter(Boolean)
    //   .join('、')
    // if (missingE3) missingE3 = `工程分析: 第${missingE3}筆工料編號不可為空白`
    // //檢查組裝組件建檔
    // let missingES = esDataList.value
    //   .map((s, i) => (!s.ibomno ? i + 1 : ''))
    //   .filter(Boolean)
    //   .join('、')
    // if (missingES) missingES = `組裝組件建檔: 第${missingES}筆工料編號不可為空白`
    // const missing2 = missingE3 && missingES ? `${missingE3}\n${missingES}` : missingE3 || missingES
    // return missing && missing2 ? `${missing}\n${missing2}` : missing || missing2
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    // const item = { ...formData.value }
    // delete item.a_USER
    // delete item.a_DATE1
    // delete item.m_USER
    // delete item.m_DATE1
    // //數字欄位
    // item.costcal = '1'
    // item.stkpurpc = formData.value?.stkpurpc ?? 0
    // item.stksalpc = formData.value?.stksalpc ?? 0
    // item.unitcost = formData.value?.unitcost ?? 0
    // item.pkgqty = formData.value?.pkgqty ?? 0
    // item.pkgpurpc = formData.value?.pkgpurpc ?? 0
    // item.pkgsalpc = formData.value?.pkgsalpc ?? 0
    // //工程分析
    // const e3List = e3DataList.value.map((obj: any) => ({
    //   ...obj,
    //   itemno: formData.value.itemno ?? ''
    // }))
    // //組裝組件建檔
    // const esList = esDataList.value.map((obj: any) => ({
    //   ...obj,
    //   itemno: formData.value.itemno ?? ''
    // }))
    // return {
    //   ...item,
    //   e3: e3List,
    //   es: esList
    // }
  }
  const callCreateApi = () => {
    // callApi({
    //   method: 'POST',
    //   url: api.Item.Item_Create,
    //   data: saveData()
    // }).then((res: any) => {
    //   if (res?.status === 200) {
    //     const data = res?.data
    //     if (data === '') {
    //       message.alert({
    //         type: 'success',
    //         message: '存檔成功',
    //         autoClose: 2,
    //         onConfirm: () => {
    //           handleCancel()
    //         }
    //       })
    //     }
    //   }
    // })
  }
  const callEditApi = () => {
    // callApi({
    //   method: 'POST',
    //   url: api.Item.Item_EDIT,
    //   data: saveData()
    // }).then((res: any) => {
    //   if (res?.status === 200) {
    //     const data = res?.data
    //     if (data === '') {
    //       message.alert({
    //         type: 'success',
    //         message: '存檔成功',
    //         autoClose: 2,
    //         onConfirm: () => {
    //           handleCancel()
    //         }
    //       })
    //     }
    //   }
    // })
  }
  const handleSave = () => {
    // const check = checkData()
    // if (check) {
    //   message.alert({
    //     type: 'warning',
    //     message: check
    //   })
    //   return
    // }
    // message.confirm({
    //   type: 'question',
    //   message: `確定要送出工料資料？`,
    //   onConfirm: () => {
    //     if (store.action === 'edit') {
    //       callEditApi()
    //     } else {
    //       callCreateApi()
    //     }
    //   }
    // })
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
          protIKindList.value = protIkinds
        }
      }
    })
  }
  //編輯、複製、瀏覽呼叫 api
  const getAllDataApi = async () => {
    //抓業主基本資料
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
      }
    })
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
    // getUnitApi()
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
        <v-col :cols="3" class="px-2">
          <c-input
            v-model="formData.protno"
            label="工程編號"
            :is-required="true"
            :disabled="store.keyDisabled"
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input
            v-model="formData.custno"
            label="業主編號"
            :is-required="true"
            :disabled="store.isDetail"
            @button="searchCustOpen"
            @keydown="searchCustKeydown"
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input
            v-model="formData.custabbr"
            label="業主簡稱"
            icon="fa-solid fa-building"
            :disabled="true"
          />
        </v-col>
        <v-responsive width="100%"></v-responsive>
        <v-col :cols="6" class="px-2">
          <c-input
            v-model="formData.protname"
            v-model:abbr="formData.protabbr"
            label="工程名稱"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input
            v-model="formData.protabbr"
            label="工程簡稱"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="mt-3">
    <v-tabs v-model="tabpage" bg-color="primary" class="c-tabs">
      <v-tab value="normal">一般資料</v-tab>
      <v-tab value="a">合約明細</v-tab>
      <v-tab value="sign">工程標示</v-tab>
      <v-tab value="protikind">工程類別預估</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense :align="'center'">
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.protaddr"
                label="工程地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.tel"
                label="電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :format="{ phone: true }"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.coveno"
                label="合約編號"
                icon="fa-solid fa-file-contract"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.covesum"
                label="合約金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.estimsum"
                label="預估成本"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.sdate1"
                label="簽約日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
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
            <v-col :cols="3" class="px-2">
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
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.wdate1"
                label="保固期限"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.wtime"
                label="保固期間"
                icon="fa-solid fa-shield-alt"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="3" class="px-2">
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
            </v-col>
            <v-col :cols="3" class="px-2">
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
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.period"
                label="工期"
                icon="fa-solid fa-calendar-days"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.protud1"
                label="工程自訂一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.protud2"
                label="工程自訂二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
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
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.chplusless"
                label="追加減金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true, minus: true }"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-button color="#d48833" icon="fa-solid fa-calculator">追加(減)</c-button>
            </v-col>
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="a"></v-tabs-window-item>
        <v-tabs-window-item value="sign">
          <v-row dense :align="'center'">
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.consT_NO"
                label="建造執照"
                icon="fa-solid fa-id-card"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_BY"
                label="起造人"
                icon="fa-solid fa-person-digging"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_MGR"
                label="承造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.dsgN_BY"
                label="設計人"
                icon="fa-solid fa-brush"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.dsgN_CNO"
                label="設計人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_MGR"
                label="監造人"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_NO"
                label="監造人開業證書字號"
                icon="fa-solid fa-certificate"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.enG_EMP"
                label="專任工程人員"
                icon="fa-solid fa-user-tie"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.insP_TEL"
                label="監造人電話"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.usE_PART"
                label="使用分區"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.consT_TEL"
                label="服務電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.ctrL_NO"
                label="管制編號"
                icon="fa-solid fa-hashtag"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.pnP_TEL"
                label="公害陳情專線"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.enG_DESC"
                label="工程概要"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
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
                  />
                </template>
                <template v-slot:item.ikindname="{ scope }">
                  <c-input v-model="scope.ikindname" :disabled="store.isDetail" />
                </template>
                <template v-slot:item.pimoney="{ scope }">
                  <c-input
                    type="number"
                    v-model="scope.pimoney"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
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

  <!-- <project-type v-model="projectTypeDS" :items="projectTypeItems" @save="handlePJTsave" /> -->
  <pickIKind v-model="pickIKindDS" @pick="pickIKindStore.pick" />
  <!-- <pick-item v-model="pickItemDS" @pick="handleItemPick" /> -->
  <search-cust v-model="searchCustDS" @pick="searchCustStore.pick" />
  <!-- <search-item ref="searchRef" @pick="searchItemPick" /> -->
</template>

<style scoped>
  .div-prot-ikind {
    border: 1px solid white;
    padding: 0;
  }
</style>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTextarea,
    cBread,
    cDivider,
    cDataTable
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useOwnerDataStore } from '@/store/ownerData'
  import { useRouter } from 'vue-router'
  import { pickAddr } from '@/components/PickAddr'
  import { auditInfo } from '@/components/AuditInfo'
  import { GenerateRec } from '@/utils/ucommon'
  import type { DataTableHeader } from 'vuetify'

  const store = useOwnerDataStore()
  const router = useRouter()

  //下拉選單
  const ckindDDL = ref<{ ckindno: string; ckindname: string }[]>([])
  const empDDL = ref<{ empno: string; empname: string }[]>([])
  const taxkindDDL = ref<{ taxkind: string; taxkindc: string }[]>([])
  const invokindDDL = ref<{ invokindno: string; invokindna: string }[]>([])
  const akindDDL = ref<{ akindno: string; akindname: string }[]>([])
  //抓業主類別下拉選單資料
  const getCkindApi = async () => {
    callApi({
      method: 'POST',
      url: api.CKind.CKindlist,
      data: {
        ckindno: '',
        ckindname: ''
      }
    }).then((res: any) => {
      if (res?.status == 200) {
        const { _Lists } = res?.data
        if (_Lists && Array.isArray(_Lists)) {
          ckindDDL.value = _Lists.map(({ ckindno, ckindname }) => ({ ckindno, ckindname }))
        }
      }
    })
  }
  //抓業務人員下拉選單資料
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

  //業主資料
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤
  //聯絡人表格設定
  const headers: DataTableHeader[] = [
    { title: '編號', key: 'rec1', width: '80', align: 'center', sortable: false },
    { title: '聯絡人', key: 'conname', width: '220' },
    { title: '部門', key: 'condepar', width: '220' },
    { title: '電話', key: 'contel', width: '280' },
    { title: '行動電話', key: 'conmob', width: '280' },
    { title: '說明', key: 'condescrip' },
    { title: '自訂一', key: 'conud1' }
  ]
  //聯絡人表格資料
  const emptyObj = {
    custno: '',
    rec1: '',
    conname: '',
    condepar: '',
    contel: '',
    conmob: '',
    condescrip: '',
    conud1: ''
  }
  const conList = ref<(typeof emptyObj)[]>([])
  const conTable = ref()
  //聯絡人表格-新增
  const conListAdd = () => {
    conList.value.push({ ...emptyObj })
    GenerateRec(conList.value) //自動編號
  }
  //聯絡人表格-插入
  const conListInsert = () => {
    const selectIndex = conTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      conList.value.splice(selectIndex, 0, { ...emptyObj })
      GenerateRec(conList.value) //自動編號
    }
  }
  //聯絡人表格-刪除
  const conListDelete = () => {
    const selectIndex = conTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      conList.value.splice(selectIndex, 1)
      GenerateRec(conList.value) //自動編號
    }
  }

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:custno, custname, custabbr, taxkindno, invokindno
    const requiredFields = [
      { key: 'custno', label: '業主編號' },
      { key: 'custname', label: '業主名稱' },
      { key: 'custabbr', label: '業主簡稱' },
      { key: 'taxkindno', label: '營業稅' },
      { key: 'invokindno', label: '發票種類' }
    ]
    const missing = requiredFields
      .filter((field) => !formData.value?.[field.key])
      .map((field) => field.label)
      .join('、')
    return missing ? `${missing}不可為空白` : ''
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    const cust = { ...formData.value }
    //數字欄位
    cust.custud3 = formData.value?.custud3 ?? 0
    cust.emckday = formData.value?.emckday ?? 25
    cust.afterck = formData.value?.afterck ?? 0
    //其他
    cust.m_user = ''
    cust.m_date1 = ''
    cust.m_date2 = ''
    cust.m_date3 = ''
    //聯絡人清單
    const list = conList.value.map((obj: any) => ({
      ...obj,
      custno: formData.value?.custno ?? ''
    }))
    return { cust, conList: list }
  }
  const callCreateApi = () => {
    callApi({
      method: 'POST',
      url: api.Cust.Cust_Add,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data && data.state === 'success') {
          message.alert({
            type: 'success',
            // message: data?.msg ?? '存檔成功',
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
      url: api.Cust.Cust_Upd,
      data: saveData()
    }).then((res: any) => {
      const data = res?.data
      if (data && data.state === 'success') {
        message.alert({
          type: 'success',
          // message: data?.msg ?? '存檔成功',
          message: '存檔成功',
          autoClose: 2,
          onConfirm: () => {
            handleCancel()
          }
        })
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
      message: `確定要送出業主資料？`,
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
      url: api.Cust.Cust_Renew
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data ?? {}
        const { cust, conList: list } = data
        if (cust) formData.value = { ...cust }
        if (list && Array.isArray(list)) conList.value = list
      }
    })
  }
  //編輯、複製、瀏覽呼叫 api
  const getAllDataApi = async () => {
    //抓業主基本資料
    callApi({
      method: 'POST',
      url: api.Cust.Cust_Data,
      data: { custno: store.custno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = (res?.data ?? []) as any[]
        if (data.length > 0) {
          formData.value = {
            ...data[0],
            custno: ['edit', 'detail'].includes(store.action) ? (data[0]?.custno ?? '') : ''
          }
        }
      }
    })
  }

  //起始動作
  onMounted(() => {
    //抓下拉選單資料
    getCkindApi()
    getEmpApi()
    getTaxkindApi()
    getInvokindApi()
    getAkindApi()
    //抓單筆資料
    if (store.action === 'create') {
      getRenewApi()
    } else if (store.custno) {
      getAllDataApi()
      //抓業主聯絡人資料
      callApi({
        method: 'GET',
        url: api.Con.Conlist,
        params: { custno: store.custno }
      }).then((res: any) => {
        if (res?.status == 200) {
          const data: any[] = res?.data ?? []
          conList.value = data
        }
      })
    }
  })

  //彈窗
  const pcikAddrDS = ref(false)
  const addrTarget = ref<'zip1' | 'zip2' | ''>('')
  const pickAdderComp = () => {
    addrTarget.value = 'zip1'
    pcikAddrDS.value = true
  }
  const pickAdderCust = () => {
    addrTarget.value = 'zip2'
    pcikAddrDS.value = true
  }
  const handlePickAddr = (data: any) => {
    if (addrTarget.value === 'zip1') {
      formData.value.comprec = data.rec
      formData.value.zip1 = data.zipno
      formData.value.compaddr = data.zipname
    } else if (addrTarget.value === 'zip2') {
      formData.value.custrec = data.rec
      formData.value.custzip = data.zipno
      formData.value.custaddr = data.zipname
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
        <v-col cols="auto" class="text-custom-2">業主基本資料</v-col>
      </v-row>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custno"
            label="業主編號"
            :is-required="true"
            :disabled="store.keyDisabled"
            :maxlength="10"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-select
            v-model="formData.ckindno"
            v-model:title="formData.ckindname"
            label="業主類別"
            icon="fa-solid fa-building"
            :items="ckindDDL"
            item-title="ckindname"
            item-value="ckindno"
            :item-columns="[
              { column: 'ckindno', label: '業主類別編號' },
              { column: 'ckindname', label: '業主類別' }
            ]"
            also-show-value
            :disabled="store.isDetail"
            width="340"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-select
            v-model="formData.empno"
            v-model:title="formData.empname"
            label="業務人員"
            icon="fa-solid fa-user"
            :items="empDDL"
            item-title="empname"
            item-value="empno"
            :item-columns="[
              { column: 'empno', label: '人員編號' },
              { column: 'empname', label: '人員名稱' }
            ]"
            also-show-value
            :disabled="store.isDetail"
            width="720"
          />
        </v-col>
        <v-responsive width="100%"></v-responsive>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custname"
            v-model:abbr="formData.custabbr"
            label="業主名稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="50"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custabbr"
            label="業主簡稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="16"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="mt-3">
    <v-tabs v-model="tabpage" bg-color="primary" class="c-tabs">
      <v-tab value="normal">一般資料</v-tab>
      <v-tab value="conlist">聯絡人</v-tab>
      <v-tab value="memo">備註</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <c-divider>一般資料</c-divider>
          <v-row dense class="mt-2" :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.con"
                label="聯絡人"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.boss"
                label="負責人"
                icon="fa-solid fa-user-tie"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.tel"
                label="電話"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.mobitel"
                label="行動電話"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.fax"
                label="傳真"
                icon="fa-solid fa-fax"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.zip1"
                label="郵遞區號"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :readonly="!store.isDetail"
                @button="pickAdderComp"
                :maxlength="6"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.compaddr"
                label="公司地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :maxlength="60"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.custzip"
                label="郵遞區號"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :readonly="!store.isDetail"
                @button="pickAdderCust"
                :maxlength="6"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.custaddr"
                label="發票地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :maxlength="60"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.email"
                label="E-MAIL"
                icon="fa-solid fa-envelope"
                :disabled="store.isDetail"
                :maxlength="60"
              />
            </v-col>
          </v-row>
          <c-divider class="mt-3">付款資訊</c-divider>
          <v-row dense class="mt-2">
            <v-col :cols="3" class="px-2">
              <c-select
                v-model="formData.taxkindno"
                v-model:title="formData.taxkindc"
                label="營業稅"
                :is-required="true"
                :items="taxkindDDL"
                item-title="taxkindc"
                item-value="taxkind"
                :item-columns="[
                  { column: 'taxkind', label: '編號' },
                  { column: 'taxkindc', label: '名稱' }
                ]"
                also-show-value
                hide-search
                :disabled="store.isDetail"
              />

              <c-select
                class="mt-2"
                v-model="formData.invokindno"
                v-model:title="formData.invokindna"
                label="發票種類"
                :is-required="true"
                :items="invokindDDL"
                item-title="invokindna"
                item-value="invokindno"
                :item-columns="[
                  { column: 'invokindno', label: '編號' },
                  { column: 'invokindna', label: '名稱' }
                ]"
                also-show-value
                hide-search
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-select
                v-model="formData.akindno"
                v-model:title="formData.akindc"
                label="結帳類別"
                icon="fa-solid fa-hand-holding-dollar"
                :items="akindDDL"
                item-title="akindname"
                item-value="akindno"
                :item-columns="[
                  { column: 'akindno', label: '編號' },
                  { column: 'akindname', label: '名稱' }
                ]"
                also-show-value
                hide-search
                :disabled="store.isDetail"
              />

              <c-input
                class="mt-2"
                v-model="formData.uniform"
                label="統一編號"
                icon="fa-solid fa-barcode"
                :disabled="store.isDetail"
                :format="{ number: true }"
              />
            </v-col>
            <v-col class="px-2">
              <v-row dense :align="'center'">
                <v-col cols="4" class="text-end text-custom-1">每月結帳</v-col>
                <v-col cols="2">
                  <c-input
                    v-model="formData.emckday"
                    :format="{ number: true }"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col class="text-start text-custom-1">日</v-col>
              </v-row>
              <v-row dense :align="'center'">
                <v-col cols="4" class="text-end text-custom-1">付款日：結帳後</v-col>
                <v-col cols="2">
                  <c-input
                    v-model="formData.afterck"
                    :format="{ number: true }"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col class="text-start text-custom-1">天</v-col>
              </v-row>
            </v-col>
          </v-row>
          <c-divider class="mt-3">其它資訊</c-divider>
          <v-row dense class="mt-2" :align="'center'">
            <v-col :cols="6" class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.custud1"
                label="客戶自訂1"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.custud2"
                label="客戶自訂2"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="4" class="px-2">
              <c-input
                v-model="formData.custud3"
                label="客戶自訂3"
                icon="fa-solid fa-pencil"
                :format="{ number: true }"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="conlist">
          <v-row dense>
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="conListAdd">新增</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="insert" icon="mdi-arrow-down-circle" @click="conListInsert">
                插入
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="conListDelete">
                刪除
              </c-button>
            </v-col>
          </v-row>
          <c-data-table
            ref="conTable"
            class="mt-2"
            v-model="conList"
            :headers="headers"
            striped="even"
            hover
            :header-props="{ align: 'center' }"
            selectable
          >
            <template v-slot:item.conname="{ scope }">
              <c-input v-model="scope.conname" :disabled="store.isDetail" />
            </template>
            <template v-slot:item.condepar="{ scope }">
              <c-input v-model="scope.condepar" :disabled="store.isDetail" />
            </template>
            <template v-slot:item.contel="{ scope }">
              <c-input
                v-model="scope.contel"
                :disabled="store.isDetail"
                :format="{ phone: true }"
              />
            </template>
            <template v-slot:item.conmob="{ scope }">
              <c-input
                v-model="scope.conmob"
                :disabled="store.isDetail"
                :format="{ phone: true }"
              />
            </template>
            <template v-slot:item.condescrip="{ scope }">
              <c-input v-model="scope.condescrip" :disabled="store.isDetail" />
            </template>
            <template v-slot:item.conud1="{ scope }">
              <c-input v-model="scope.conud1" :disabled="store.isDetail" />
            </template>
          </c-data-table>
        </v-tabs-window-item>

        <v-tabs-window-item value="memo">
          <c-textarea
            v-model="formData.memo"
            label="備註"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
            auto-grow
          />
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

  <pick-addr v-model="pcikAddrDS" @pick="handlePickAddr" />
</template>

<style scoped></style>

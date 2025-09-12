<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTextarea,
    cBread,
    cDivider,
    cSelectInput
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useManufacturerDataStore } from '@/store/manufacturerData'
  import { useRouter } from 'vue-router'
  import { pickAddr } from '@/components/PickAddr'
  import { auditInfo } from '@/components/AuditInfo'
  // import { pickSKind } from '@/components/PickSKind'
  // import { usePickSKind } from '@/store/pickSKind'
  // const pickskindStore = usePickSKind()

  const store = useManufacturerDataStore()
  const router = useRouter()

  //下拉選單
  const skindDDL = ref<{ skindno: string; skindname: string }[]>([])
  const empDDL = ref<{ empno: string; empname: string }[]>([])
  const taxkindDDL = ref<{ taxkindno: string; taxkindc: string }[]>([])
  const invokindDDL = ref<{ invokindno: string; invokindna: string }[]>([])
  const akindDDL = ref<{ akindno: string; akindna: string }[]>([])
  //抓各種下拉選單資料
  const getDDLApi = async () => {
    callApi({
      method: 'POST',
      url: api.Supp.Supp_List,
      data: {
        suppno: 'xxx', //隨便key參數不需要查出_Lists
        suppabbr: '',
        uniform: '',
        business: '',
        coN1: '',
        teL1: '',
        mobiteL1: ''
      }
    }).then((res: any) => {
      if (res?.status == 200) {
        const { sKindNo, tax, invoKind, aKind } = res?.data
        if (sKindNo && Array.isArray(sKindNo)) {
          skindDDL.value = sKindNo
        }
        if (tax && Array.isArray(tax)) {
          taxkindDDL.value = tax
        }
        if (invoKind && Array.isArray(invoKind)) {
          invokindDDL.value = invoKind
        }
        if (aKind && Array.isArray(aKind)) {
          akindDDL.value = aKind
        }
      }
    })
  }
  //抓採購人員下拉選單資料
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

  //廠商資料
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:suppno, suppname, suppabbr, taxkindno, invokindno
    const requiredFields = [
      { key: 'suppno', label: '廠商編號' },
      { key: 'suppname', label: '廠商名稱' },
      { key: 'suppabbr', label: '廠商簡稱' },
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
    const create = { ...formData.value }
    const data = Object.fromEntries(
      Object.keys(create ?? {}).map((key) => [key, create?.[key] ?? ''])
    )
    delete data.a_USER
    delete data.a_DATE1
    delete data.m_USER
    delete data.m_DATE1
    //數字欄位
    data.emckday = formData.value?.emckday ?? 25
    data.afterck = formData.value?.afterck ?? 0

    return data
  }
  const callCreateApi = () => {
    callApi({
      method: 'POST',
      url: api.Supp.Supp_Create,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data === '') {
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
      method: 'POST',
      url: api.Supp.Supp_EDIT,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data === '') {
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
      method: 'POST',
      url: api.Supp.Supp_ReNew
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data ?? {}
        formData.value = { ...data }
      }
    })
  }

  //起始動作
  onMounted(() => {
    //抓下拉選單資料
    getDDLApi()
    getEmpApi()
    //抓單筆資料
    if (store.action === 'create') {
      getRenewApi()
    } else if (store.suppno) {
      //抓廠商資料
      callApi({
        method: 'POST',
        url: api.Supp.Supp_Data,
        data: { suppno: store.suppno }
      }).then((res: any) => {
        if (res?.status == 200) {
          const data: any[] = res?.data ?? []
          if (Array.isArray(data) && data.length > 0) {
            formData.value = {
              ...data[0],
              suppno: ['edit', 'detail'].includes(store.action) ? (data[0]?.suppno ?? '') : ''
            }
          }
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
  const pickAdderFact = () => {
    addrTarget.value = 'zip2'
    pcikAddrDS.value = true
  }
  const handlePickAddr = (data: any) => {
    if (addrTarget.value === 'zip1') {
      formData.value.comprec = data.rec
      formData.value.ziP1 = data.zipno
      formData.value.compaddr = data.zipname
    } else if (addrTarget.value === 'zip2') {
      formData.value.factrec = data.rec
      formData.value.ziP2 = data.zipno
      formData.value.factaddr = data.zipname
    }
  }

  //廠商類別彈窗
  // const pickskindRef = ref()
  // const pickskindSet = () => {
  //   pickskindStore.set(formData, [{ from: 'skindno' }, { from: 'skindname' }])
  //   pickskindRef.value?.open()
  // }
  // const pickskindKeyEnter = (e: KeyboardEvent, searchText: string) => {
  //   pickskindStore.keyEnter(e, formData, [{ from: 'skindno' }, { from: 'skindname' }], searchText, {
  //     open: pickskindRef.value?.open
  //   })
  // }
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
        <v-col cols="auto" class="text-custom-2">廠商基本資料</v-col>
      </v-row>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.suppno"
            label="廠商編號"
            :is-required="true"
            :disabled="store.keyDisabled"
            :maxlength="8"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.suppname"
            v-model:abbr="formData.suppabbr"
            label="廠商名稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="40"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.suppabbr"
            label="廠商簡稱"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="10"
            condensed
          />
        </v-col>
        <!-- <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.skindno"
            label="廠商類別"
            icon="fa-solid fa-warehouse"
            :disabled="store.isDetail"
            @button="pickskindSet"
            @keydown="(e) => pickskindKeyEnter(e, formData.skindno)"
            :maxlength="4"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input v-model="formData.skindname" :disabled="true" :maxlength="20" condensed />
        </v-col> -->
        <v-col cols="auto" class="px-2">
          <c-select-input
            front="select"
            v-model="formData.skindno"
            v-model:title="formData.skindname"
            label="廠商類別"
            icon="fa-solid fa-warehouse"
            :items="skindDDL"
            item-title="skindname"
            item-value="skindno"
            :item-columns="[
              { column: 'skindno', label: '廠商類別編號' },
              { column: 'skindname', label: '廠商類別' }
            ]"
            :disabled="store.isDetail"
            :input-maxlength="20"
            width="240"
            :menu-props="{ width: 400 }"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <!-- <c-select
            v-model="formData.empno"
            v-model:title="formData.empname"
            label="採購人員"
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
          /> -->
          <c-select-input
            front="select"
            v-model="formData.empno"
            v-model:title="formData.empname"
            label="採購人員"
            icon="fa-solid fa-user"
            :items="empDDL"
            item-title="empname"
            item-value="empno"
            :item-columns="[
              { column: 'empno', label: '人員編號' },
              { column: 'empname', label: '人員名稱' }
            ]"
            :disabled="store.isDetail"
            width="366"
            :input-maxlength="16"
            condensed
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="mt-3">
    <v-tabs v-model="tabpage" bg-color="primary" class="c-tabs">
      <v-tab value="normal">一般資料</v-tab>
      <v-tab value="con">聯絡人</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <c-divider>一般資料</c-divider>
          <v-row dense class="mt-2" :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.coN1"
                label="聯絡人1"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.coN2"
                label="聯絡人2"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.boss"
                label="負責人"
                icon="fa-solid fa-user-tie"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-select
                v-model="formData.akindno"
                v-model:title="formData.akindname"
                label="結帳類別"
                icon="fa-solid fa-hand-holding-dollar"
                :items="akindDDL"
                item-title="akindna"
                item-value="akindno"
                :item-columns="[
                  { column: 'akindno', label: '編號' },
                  { column: 'akindna', label: '名稱' }
                ]"
                also-show-value
                hide-search
                :disabled="store.isDetail"
                width="500"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.teL1"
                label="電話1"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.teL2"
                label="電話2"
                icon="fa-solid fa-phone-volume"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.fax"
                label="傳真"
                icon="fa-solid fa-fax"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.mobiteL1"
                label="行動電話1"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.mobiteL2"
                label="行動電話2"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.mobiteL3"
                label="行動電話3"
                icon="fa-solid fa-mobile-button"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.ziP1"
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
                condensed
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.ziP2"
                label="郵遞區號"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :readonly="!store.isDetail"
                @button="pickAdderFact"
                :maxlength="6"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.factaddr"
                label="工廠地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :maxlength="60"
                condensed
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
          <!-- <c-divider class="mt-3">付款資訊</c-divider> -->
          <v-row dense class="mt-2">
            <v-col cols="auto" class="px-2">
              <c-select
                v-model="formData.taxkindno"
                v-model:title="formData.taxkindc"
                label="營業稅"
                :is-required="true"
                :items="taxkindDDL"
                item-title="taxkindc"
                item-value="taxkindno"
                :item-columns="[
                  { column: 'taxkindno', label: '編號' },
                  { column: 'taxkindc', label: '名稱' }
                ]"
                also-show-value
                hide-search
                :disabled="store.isDetail"
                width="258"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-select
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
                width="278"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.uniform"
                label="統一編號"
                icon="fa-solid fa-barcode"
                :disabled="store.isDetail"
                :format="{ number: true }"
                :maxlength="8"
              />
            </v-col>
            <v-col cols="auto" class="px-5 d-flex align-items-center">
              <span class="text-custom-1 pe-2">每月結帳</span>
              <c-input
                type="number"
                v-model="formData.emckday"
                :disabled="store.isDetail"
                :maxlength="2"
              />
              <span class="text-custom-1 ps-2">日</span>
            </v-col>
            <v-col cols="auto" class="px-5 d-flex align-items-center">
              <span class="text-custom-1 pe-2">付款日：結帳後</span>
              <c-input
                type="number"
                v-model="formData.afterck"
                :disabled="store.isDetail"
                :maxlength="2"
              />
              <span class="text-custom-1 ps-2">天</span>
            </v-col>
            <v-responsive width="100%"></v-responsive>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.rembank"
                label="匯款銀行"
                icon="fa-solid fa-university"
                :disabled="store.isDetail"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.remno"
                label="帳號"
                icon="fa-solid fa-money-check"
                :disabled="store.isDetail"
                :format="{ number: true }"
                :maxlength="26"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.remname"
                label="戶名"
                icon="fa-solid fa-circle-user"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
          </v-row>
          <c-divider class="mt-3">其它資訊</c-divider>
          <v-row dense class="mt-2" :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.business"
                label="營業項目"
                icon="fa-solid fa-shop"
                :disabled="store.isDetail"
                :maxlength="60"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.http"
                label="網址"
                icon="fa-solid fa-globe"
                :disabled="store.isDetail"
                :maxlength="60"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.suppuD1"
                label="廠商自訂1"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.suppuD2"
                label="廠商自訂2"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="con">
          <v-row dense>
            <v-col :cols="12" class="px-2">
              <c-textarea
                v-model="formData.memo"
                label="聯絡人"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                auto-grow
                :maxlength="500"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.memO1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="68"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <audit-info
    class="mt-2"
    v-if="store.action === 'edit' || store.action === 'detail'"
    :a_date="formData.a_DATE1"
    :a_user="formData.a_USER"
    :m_date="formData.m_DATE1"
    :m_user="formData.m_USER"
  />

  <pick-addr v-model="pcikAddrDS" @pick="handlePickAddr" />
  <!-- <pickSKind ref="pickskindRef" @pick="pickskindStore.pick" /> -->
</template>

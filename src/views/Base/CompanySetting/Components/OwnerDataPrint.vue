<script lang="ts" setup>
  import { ref, nextTick, onMounted } from 'vue'
  import { cButton, cInput, cSelect, cDialog, cDivider } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'
  import { searchCust } from '@/components/SearchCust'
  import { searchEmp } from '@/components/SearchEmp'

  const isOpen = defineModel({ default: false })

  //下拉選單
  const ckindDDL = ref<{ ckindno: string; ckindname: string }[]>([])
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

  //列印
  const filter = ref({
    custno: {
      begin: '',
      end: ''
    },
    ckindno: {
      begin: '',
      end: ''
    },
    tel: '',
    fax: '',
    empno: {
      begin: '',
      end: ''
    },
    akindno: {
      begin: '',
      end: ''
    },
    uniform: '',
    custud1: '',
    custud2: '',
    compaddr: ''
  })
  const printForm = ref({
    feetNo: '01',
    printType: '內定報表'
  })
  const feetNoDDL = ref({
    list: [
      { feetno: '01', feetname: '第一組' },
      { feetno: '02', feetname: '第二組' },
      { feetno: '03', feetname: '第三組' },
      { feetno: '04', feetname: '第四組' },
      { feetno: '05', feetname: '第五組' },
      { feetno: '00', feetname: '不列印' }
    ],
    value: 'feetno',
    title: 'feetname'
  })
  const handlePrintClose = () => {
    nextTick(() => {
      printForm.value = {
        feetNo: '01',
        printType: '內定報表'
      }
    })
  }
  const handlePreview = () => {
    callApi({
      method: 'POST',
      url: api.Cust.Cust_Print,
      data: { ...filter.value, ...printForm.value }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? ''
        window.open(config.apiUri + '/' + data)
      }
    })
  }

  //查詢業主彈窗
  //用 v-model 操控的方式
  const searchCustDS = ref(false)
  //用 ref實例的open() 操控的方式
  const searchRef = ref()
  const pickSetting = ref()
  const isEnter = ref(false)
  const searchText = ref('')
  const searchCustOpen = (to: 'begin' | 'end') => {
    pickSetting.value = [{ from: 'custno', to }]
    searchRef.value?.open()
  }
  const searchCustEnter = (to: 'begin' | 'end') => {
    pickSetting.value = [{ from: 'custno', to }]
    isEnter.value = true
    searchText.value = filter.value.custno?.[to] ?? ''
    searchRef.value?.open()
  }
  //查詢人員彈窗
  const searchEmpDS = ref(false)
  const pickEmpSetting = ref()
  const isEnterEmp = ref(false)
  const searchEmpText = ref('')
  const searchEmpOpen = (to: 'begin' | 'end') => {
    pickEmpSetting.value = [{ from: 'empno', to }]
    searchEmpDS.value = true
  }
  const searchEmpEnter = (to: 'begin' | 'end') => {
    pickEmpSetting.value = [{ from: 'empno', to }]
    isEnterEmp.value = true
    searchEmpText.value = filter.value.empno?.[to] ?? ''
    searchEmpDS.value = true
  }

  onMounted(() => {
    getCkindApi()
    getAkindApi()
  })
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="列印" width="1025" @afterLeave="handlePrintClose">
    <v-row dense justify="center" :align="'center'">
      <v-col cols="auto">
        <c-select
          v-model="printForm.printType"
          label="報表內容"
          :items="[
            { val: '內定報表' },
            { val: '自定一', disabled: true },
            { val: '自定二', disabled: true }
          ]"
          item-title="val"
          item-value="val"
          hide-search
          width="240"
        />
      </v-col>
      <v-col cols="auto">
        <c-select
          v-model="printForm.feetNo"
          label="單行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
          width="240"
        />
      </v-col>
    </v-row>
    <c-divider />
    <v-row dense :align="'center'">
      <!--業主編號起訖-->
      <v-col cols="auto">
        <c-input
          v-model="filter.custno.begin"
          label="業主編號"
          icon="fa-solid fa-building"
          :maxlength="10"
          condensed
          @button="searchCustOpen('begin')"
          @keyEnter="searchCustEnter('begin')"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input
          v-model="filter.custno.end"
          icon="fa-solid fa-building"
          :maxlength="10"
          condensed
          @button="searchCustOpen('end')"
          @keyEnter="searchCustEnter('end')"
        />
      </v-col>
      <v-responsive width="100%" />
      <!--業主類別起訖-->
      <v-col cols="auto">
        <c-select
          v-model="filter.ckindno.begin"
          label="業主類別"
          icon="fa-solid fa-building"
          :items="ckindDDL"
          item-title="ckindno"
          item-value="ckindno"
          :item-columns="[
            { column: 'ckindno', label: '業主類別編號' },
            { column: 'ckindname', label: '業主類別' }
          ]"
          width="260"
          clearable
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-select
          v-model="filter.ckindno.end"
          icon="fa-solid fa-building"
          :items="ckindDDL"
          item-title="ckindno"
          item-value="ckindno"
          :item-columns="[
            { column: 'ckindno', label: '業主類別編號' },
            { column: 'ckindname', label: '業主類別' }
          ]"
          width="180"
          clearable
        />
      </v-col>
      <v-responsive width="100%" />
      <!--電話1-->
      <v-col cols="12">
        <c-input
          v-model="filter.tel"
          label="電話1"
          icon="fa-solid fa-phone-volume"
          :maxlength="16"
        />
      </v-col>
      <!--傳真機-->
      <v-col cols="12">
        <c-input v-model="filter.fax" label="傳真機" icon="fa-solid fa-fax" :maxlength="16" />
      </v-col>
      <!--業務人員起訖-->
      <v-col cols="auto">
        <c-input
          v-model="filter.empno.begin"
          label="業務人員"
          icon="fa-solid fa-user"
          :maxlength="10"
          condensed
          @button="searchEmpOpen('begin')"
          @keyEnter="searchEmpEnter('begin')"
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-input
          v-model="filter.empno.end"
          icon="fa-solid fa-user"
          :maxlength="10"
          condensed
          @button="searchEmpOpen('end')"
          @keyEnter="searchEmpEnter('end')"
        />
      </v-col>
      <v-responsive width="100%" />
      <!--結帳類別起訖-->
      <v-col cols="auto">
        <c-select
          v-model="filter.akindno.begin"
          label="結帳類別"
          icon="fa-solid fa-hand-holding-dollar"
          :items="akindDDL"
          item-title="akindno"
          item-value="akindno"
          :item-columns="[
            { column: 'akindno', label: '編號' },
            { column: 'akindname', label: '名稱' }
          ]"
          hide-search
          width="260"
          :menu-props="{ width: 400 }"
          clearable
        />
      </v-col>
      <v-col cols="auto" class="fs-2 text-center px-3">~</v-col>
      <v-col cols="auto">
        <c-select
          v-model="filter.akindno.end"
          icon="fa-solid fa-hand-holding-dollar"
          :items="akindDDL"
          item-title="akindno"
          item-value="akindno"
          :item-columns="[
            { column: 'akindno', label: '編號' },
            { column: 'akindname', label: '名稱' }
          ]"
          hide-search
          width="180"
          :menu-props="{ width: 400 }"
          clearable
        />
      </v-col>
      <v-responsive width="100%" />
      <!--統一編號-->
      <v-col cols="12">
        <c-input
          v-model="filter.uniform"
          label="統一編號"
          icon="fa-solid fa-barcode"
          :format="{ number: true }"
          :maxlength="8"
        />
      </v-col>
      <!--客戶自定一-->
      <v-col cols="12">
        <c-input
          v-model="filter.custud1"
          label="客戶自定一"
          icon="fa-solid fa-pencil"
          :maxlength="20"
        />
      </v-col>
      <!--客戶自定二-->
      <v-col cols="12">
        <c-input
          v-model="filter.custud2"
          label="客戶自定二"
          icon="fa-solid fa-pencil"
          :maxlength="20"
        />
      </v-col>
      <!--公司地址-->
      <v-col cols="12">
        <c-input
          v-model="filter.compaddr"
          label="公司地址"
          icon="fa-solid fa-location-dot"
          :maxlength="60"
          :length-auto-width="false"
          condensed
        />
      </v-col>
    </v-row>
    <!-- <v-row dense justify="center" :align="'center'">
      <v-col cols="auto" class="fs-5 fw-bold text-danger">
        ※起始編號空白表示從第一筆列印
        <br />
        ※終止編號空白表示列印至最後一筆
        <br />
        ※兩者皆空白表示全部列印
      </v-col>
    </v-row> -->
    <template v-slot:buttons>
      <v-row no-gutters justify="center">
        <v-col cols="auto mx-1">
          <c-button kind="print" icon="fa-solid fa-file-pdf" @click="handlePreview">預覽</c-button>
        </v-col>
        <v-col cols="auto mx-1">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">結束</c-button>
        </v-col>
      </v-row>
    </template>
  </c-dialog>

  <search-cust
    ref="searchRef"
    v-model="searchCustDS"
    v-model:form="filter.custno"
    v-model:keyenter="isEnter"
    :setting="pickSetting"
    :search-text="searchText"
  />
  <search-emp
    v-model="searchEmpDS"
    v-model:form="filter.empno"
    v-model:keyenter="isEnterEmp"
    :setting="pickEmpSetting"
    :search-text="searchEmpText"
  />
</template>

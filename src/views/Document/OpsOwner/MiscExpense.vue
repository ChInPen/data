<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import { cButton, cInput, cSelect, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { getUnitDDL } from '@/api/ddl'
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { GenerateRec } from '@/utils/ucommon'
  import { useMiscExpenseStore } from '@/store/miscexpense'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import Filter from './Components/MiscExpenseFilter.vue'
  import Print from './Components/MiscExpensePrint.vue'
  import { searchEmp } from '@/components/SearchEmp'
  import { searchProt } from '@/components/SearchProt'
  import { pickItem } from '@/components/PickItem'
  import { projectType } from '@/components/ProjectType'
  import { searchItem } from '@/components/SearchItem'

  const store = useMiscExpenseStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤
  const exesdetList = ref<(typeof exesdetEmpty)[]>([])
  const exesdetEmpty = {
    ono: '',
    date1: '',
    protno: '',
    protabbr: '',
    rec1: '',
    itemno: '',
    itemname: '',
    qty: 0,
    unit: '',
    price: 0,
    total1: 0,
    descrip: '',
    desud1: '',
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
    exestno1: '',
    exestno2: '',
    exestno3: '',
    invono: '',
    taxprice: 0,
    invokind: ''
  }
  const taxRate = ref(5)
  const exesdetTable = ref()
  //零用金餘額
  const after_price = computed(() => {
    if (formData.value.before_price === 0) return 0
    if (!formData.value.before_price) return null
    return formData.value.before_price - 0
  })

  //下拉選單
  const unitDDL = ref<{ content1: string }[]>([])

  //抓單筆資料
  const getSingleData = () => {
    if (store.ono) {
      callApi({
        method: 'POST',
        url: api.Exes.Exes_Data,
        params: { ono: store.ono }
      }).then((res) => {
        if (res.status === 200) {
          const { head, body, before_price, taxrate } = res.data
          if (head && Array.isArray(head) && head.length > 0) {
            formData.value = { ...head[0] }
          }
          if (body && Array.isArray(body)) {
            exesdetList.value = [...body].sort((a, b) => a.rec1 - b.rec1)
          }
          if (typeof before_price === 'number') {
            //零用金
            formData.value.before_price = before_price
          }
          if (typeof taxrate === 'number') taxRate.value = taxrate
        }
      })
    }
  }
  //Renew
  const getRenewData = () => {
    callApi({
      method: 'POST',
      url: api.Exes.Exes_Renew
    }).then((res) => {
      if (res.status === 200) {
        const { head, taxrate } = res.data
        if (head && Array.isArray(head) && head.length > 0) {
          formData.value = { ...head[0] }
        }
        formData.value.before_price = null
        if (typeof taxrate === 'number') taxRate.value = taxrate
        formData.value.before_price = null
        exesdetList.value = []
      }
    })
  }

  //首筆/上一筆/下一筆/尾筆
  const onoChange = (type: 'first' | 'previous' | 'next' | 'last') => {
    if (['first', 'previous', 'next', 'last'].includes(type)) {
      store?.[type]?.()
      getSingleData()
    }
  }
  //新增
  const create = () => {
    getRenewData()
    store.create()
  }
  //編輯
  const edit = () => {
    store.edit()
  }
  //複製
  const copy = () => {
    formData.value.ono = ''
    store.copy()
  }
  //刪除
  const del = () => {
    if (store.ono) {
      message.confirm({
        type: 'question',
        message: `確定要刪除「${store.ono}」雜支單？`,
        onConfirm: () => {
          //刪除
          callApi({
            method: 'POST',
            url: api.Exes.Exes_Del,
            data: { ono: store.ono }
          }).then((res) => {
            if (res?.status === 200) {
              const data = res?.data
              if (data === '') {
                message.alert({
                  type: 'success',
                  message: '刪除成功',
                  autoClose: 2,
                  onConfirm: () => {
                    const val = store.ono as string
                    if (!store.isFirst) onoChange('previous')
                    else if (!store.isLast) onoChange('next')
                    store.delete(val)
                  }
                })
              } else {
                message.alert({
                  type: 'error',
                  message: `刪除失敗：${data}`
                })
              }
            }
          })
        }
      })
    }
  }
  //放棄
  const cancel = () => {
    getSingleData()
    store.cancel()
  }

  //檢查欄位規則
  const checkData = () => {
    //必填:protno, date1
    const requiredFields = [
      { key: 'protno', label: '工程編號' },
      { key: 'date1', label: '雜支日期' }
    ]
    let missing = requiredFields
      .filter((field) => !formData.value?.[field.key])
      .map((field) => field.label)
      .join('、')
    if (missing) missing = `${missing}不可為空白`
    return missing
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    const create = { ...formData.value }
    const item = Object.fromEntries(
      Object.keys(create ?? {}).map((key) => [key, create?.[key] ?? ''])
    )
    item.before_price = formData.value.before_price === 0 ? '0' : String(item.before_price)
    item.execflag = '0'
    //數字欄位
    item.amount = formData.value?.amount ?? 0
    item.sum1 = formData.value?.sum1 ?? 0
    item.tax = formData.value?.tax ?? 0
    item.exestmo3 = 0
    //日期 (因為 renew 或 data 的 api 傳過來有加斜線)
    item.date1 = (item.date1 as string).replaceAll('/', '')
    item.datea = (item.datea as string).replaceAll('/', '')
    item.a_date = (item.a_date as string).replaceAll('/', '')
    item.m_date = (item.m_date as string).replaceAll('/', '')
    //明細
    const exesdet = exesdetList.value.map((obj: any) => ({
      ...obj,
      ono: formData.value.ono ?? ''
    }))
    //轉成form-data type
    const formdata = new FormData()
    for (var key in item) {
      if (item.hasOwnProperty(key)) {
        // 過濾掉繼承屬性
        formdata.append(key, item[key])
      }
    }
    formdata.append('Exesdet', JSON.stringify(exesdet))

    return formdata
  }
  const callSaveApi = () => {
    // 新增和修改用同個api
    callApi({
      method: 'POST',
      url: api.Exes.Exes_Save + '?Action_Param=' + (store.action === 'edit' ? 'UPD' : 'ADD'),
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const { ono, msg } = res?.data
        if (msg === '') {
          message.alert({
            type: 'success',
            message: '存檔成功',
            autoClose: 2,
            onConfirm: () => {
              if (store.action === 'create' || store.action === 'copy') {
                store.list.push({ ono: ono })
                store.ono = ono
              }
              cancel()
            }
          })
        } else {
          message.alert({
            type: 'error',
            message: `存檔失敗：${msg ?? ''}`
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
      message: `確定要送出雜支單資料？`,
      onConfirm: () => {
        callSaveApi()
      }
    })
  }

  //表身表格-新增
  const exesdetAdd = () => {
    pickItemRow.value = undefined
    pickItemMode.value = 'add'
    pickItemDS.value = true
  }
  //表身表格-插入
  const exesdetIns = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      exesdetList.value.splice(selectIndex, 0, { ...exesdetEmpty })
    }
    GenerateRec(exesdetList.value)
  }
  //表身表格-刪除
  const exesdetDel = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      exesdetList.value.splice(selectIndex, 1)
    }
    GenerateRec(exesdetList.value)
    countSum()
  }
  //表身表格-規格說明
  const exesdetProType = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      pjtDS.value = true
    }
  }
  //表身表格-工料 button
  const exesdetPickItem = (row: number) => {
    if (typeof row === 'number' && row >= 0) {
      pickItemRow.value = row
      pickItemMode.value = 'insert'
      pickItemDS.value = true
    }
  }
  //表身表格-查詢工程彈窗
  const detProtDS = ref(false)
  const detKeyenterProt = ref(false)
  const detSearchProtRow = ref()
  const detSearchProtText = ref('')
  const detSearchProtOpen = (row: number, text: string) => {
    detSearchProtRow.value = row
    detSearchProtText.value = text
    detProtDS.value = true
  }
  const detSearchProtEnter = (row: number, text: string) => {
    detSearchProtRow.value = row
    detSearchProtText.value = text
    detKeyenterProt.value = true
    detProtDS.value = true
  }
  //表身表格-查詢工料彈窗
  const searcItemDS = ref(false)
  const detKeyenterItem = ref(false)
  const detSearchItemRow = ref()
  const detSearchItemText = ref('')
  const detSearchItemEnter = (row: number, text: string) => {
    detSearchItemRow.value = row
    detSearchItemText.value = text
    detKeyenterItem.value = true
    searcItemDS.value = true
  }

  //算 稅額 & 金額
  const taxRule = (det: typeof exesdetEmpty, isTaxprice: boolean = false) => {
    const qty = Number(det.qty) || 0
    const price = Number(det.price) || 0
    if (!isTaxprice) det.taxprice = qty * price * taxRate.value * 0.01
    det.total1 = qty * price + det.taxprice
  }
  const countTotal = () => {
    exesdetList.value.forEach((det) => {
      taxRule(det)
    })
    countSum()
  }
  const countSingleTotal = (det: typeof exesdetEmpty, isTaxprice: boolean = false) => {
    taxRule(det, isTaxprice)
    countSum()
  }
  // 算 稅前合計、營業稅額、雜支總額
  const countSum = () => {
    let priceSum = 0,
      taxpriceSum = 0,
      totalSum = 0
    exesdetList.value.forEach((det) => {
      const qty = Number(det.qty) || 0
      const price = Number(det.price) || 0
      priceSum += qty * price
      taxpriceSum += det.taxprice
      totalSum += det.total1
    })
    formData.value.sum1 = priceSum
    formData.value.tax = taxpriceSum
    formData.value.amount = totalSum
  }

  //查詢條件
  const filterDS = ref(false)
  const initSearch = () => {
    if (store.ono) getSingleData()
  }
  const handleSearch = (filter) => {
    store.search(router, filter)
  }

  //查詢人員彈窗
  const searchEmpDS = ref(false)
  const keyenterEmp = ref(false)
  const searchEmpOpen = () => {
    searchEmpDS.value = true
  }
  const searchEmpEnter = () => {
    keyenterEmp.value = true
    searchEmpDS.value = true
  }
  const searchEmpPick = () => {
    //取得人員的零用金
    callApi({
      method: 'POST',
      url: api.Exes.Exes_PettyCash,
      params: { empno: formData.value.empaccno }
    }).then((res) => {
      if (res.status === 200) {
        if (typeof res.data === 'number' && res.data > 0) {
          formData.value.before_price = res.data
        }
      }
    })
  }

  //查詢工程彈窗
  const searcProtDS = ref(false)
  const keyenterProt = ref(false)
  const searchProtOpen = () => {
    searcProtDS.value = true
  }
  const searchProtEnter = () => {
    keyenterProt.value = true
    searcProtDS.value = true
  }

  //勾選工料彈窗
  const pickItemDS = ref(false)
  const pickItemRow = ref()
  const pickItemMode = ref()
  const exesdetItemPick = () => {
    if (pickItemMode.value === 'insert') {
      const selectIndex = exesdetTable.value?.selectIndex?.[0]
      if (typeof selectIndex === 'number' && selectIndex >= 0) {
        exesdetList.value[selectIndex].protno = formData.value.protno ?? ''
        exesdetList.value[selectIndex].protabbr = formData.value.protabbr ?? ''
      }
    }
    GenerateRec(exesdetList.value)
    countTotal()
  }

  //規格說明彈窗
  const pjtDS = ref(false)
  const pjtItems = computed(() => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        exesdetList.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      exesdetList.value[selectIndex].pjt1 = data.pjt1
      exesdetList.value[selectIndex].pjt2 = data.pjt2
      exesdetList.value[selectIndex].pjt3 = data.pjt3
      exesdetList.value[selectIndex].pjt4 = data.pjt4
      exesdetList.value[selectIndex].pjt5 = data.pjt5
      exesdetList.value[selectIndex].pjt6 = data.pjt6
      exesdetList.value[selectIndex].pjt7 = data.pjt7
      exesdetList.value[selectIndex].pjt8 = data.pjt8
      exesdetList.value[selectIndex].pjt9 = data.pjt9
      exesdetList.value[selectIndex].pjt10 = data.pjt10
    }
  }

  //列印
  const printDS = ref(false)
  const printOpen = () => {
    if (store.ono) {
      printDS.value = true
    }
  }

  onMounted(async () => {
    //抓下拉選單
    unitDDL.value = await getUnitDDL()
  })
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <template v-if="!store.isDetail">
      <div class="col-auto">
        <c-button kind="cancel" icon="mdi-close-circle" @click="cancel">放棄</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="submit" icon="fa-solid fa-floppy-disk" @click="handleSave">儲存</c-button>
      </div>
    </template>
    <template v-else>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angles-left"
          :disabled="store.isFirst"
          @click="onoChange('first')"
        >
          首筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angle-left"
          :disabled="store.isFirst"
          @click="onoChange('previous')"
        >
          上一筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angle-right"
          :disabled="store.isLast"
          @click="onoChange('next')"
        >
          下一筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angles-right"
          :disabled="store.isLast"
          @click="onoChange('last')"
        >
          尾筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="printOpen">列印</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="browse" icon="fa-solid fa-eye" @click="store.browse(router)">瀏覽</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="filterDS = true">
          查詢
        </c-button>
      </div>
      <div class="col-auto">
        <c-button kind="copy" icon="fa-solid fa-copy" @click="copy">複製</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="delete" icon="fa-solid fa-trash" @click="del">刪除</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="edit" icon="fa-solid fa-pen-to-square" @click="edit">編輯</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="create" icon="mdi-plus-circle" @click="create">新增</c-button>
      </div>
    </template>
  </c-bread>

  <v-card class="mt-2">
    <v-tabs v-model="tabpage" class="c-tabs">
      <v-tab value="normal">雜支資料一</v-tab>
      <v-tab value="other">雜支資料二</v-tab>
      <v-tab value="image">圖片檔案</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.ono"
                label="雜支單號"
                icon="fa-solid fa-file-lines"
                :disabled="store.keyDisabled"
                :maxlength="14"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.date1"
                label="雜支日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.datea"
                label="帳款日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protno"
                label="工程編號"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :maxlength="16"
                @button="searchProtOpen"
                @keyEnter="searchProtEnter"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protabbr"
                label="工程簡稱"
                icon="fa-solid fa-helmet-safety"
                :disabled="true"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.con1"
                label="工地主任"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.empaccno"
                label="付款人員"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
                @button="searchEmpOpen"
                @keyEnter="searchEmpEnter"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.empaccname"
                icon="fa-solid fa-user"
                :disabled="true"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.before_price"
                label="零用金"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.sum1"
                label="稅前合計"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.tax"
                label="營業稅額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.amount"
                label="雜支總額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="after_price"
                label="零用金餘額"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="other">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.exesud1"
                label="雜支自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.exesud2"
                label="雜支自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col :cols="12" class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="68"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="image"></v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <v-card color="#1b2b36" rounded="3" class="mt-2">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="create" icon="mdi-plus-circle" @click="exesdetAdd">新增</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="insert" icon="mdi-arrow-down-circle" @click="exesdetIns">插入</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="delete" icon="fa-solid fa-trash" @click="exesdetDel">刪除</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="protype" icon="fa-solid fa-clipboard-list" @click="exesdetProType">
            規格說明
          </c-button>
        </v-col>
      </v-row>
      <c-table
        class="mt-2"
        ref="exesdetTable"
        v-model="exesdetList"
        striped="even"
        hover
        height="340"
        fixed-header
        selectable
        layout="fixed"
        header-align="center"
      >
        <template v-slot:head>
          <th width="68">序號</th>
          <th width="200">雜項編號</th>
          <th width="200">雜項名稱</th>
          <th width="200">工程編號</th>
          <th width="200">工程簡稱</th>
          <th width="150">數量</th>
          <th width="152">單位</th>
          <th width="150">單價</th>
          <th width="150">稅額</th>
          <th width="200">金額</th>
          <th width="200">類別</th>
          <th width="259">發票號碼</th>
          <th width="629">說明</th>
          <th width="629">說明自定一</th>
        </template>
        <template v-slot:body="{ scope, index }">
          <td class="text-center">{{ scope.rec1 }}</td>
          <td>
            <c-input
              v-model="scope.itemno"
              :disabled="store.isDetail"
              :maxlength="20"
              :length-auto-width="false"
              condensed
              @button="exesdetPickItem(index)"
              @keyEnter="detSearchItemEnter(index, scope.itemno)"
            />
          </td>
          <td>
            <c-input
              v-model="scope.itemname"
              :disabled="true"
              :maxlength="100"
              :length-auto-width="false"
              condensed
            />
          </td>
          <td>
            <c-input
              v-model="scope.protno"
              :disabled="store.isDetail"
              :maxlength="16"
              :length-auto-width="false"
              condensed
              @button="detSearchProtOpen(index, scope.protno)"
              @keyEnter="detSearchProtEnter(index, scope.protno)"
            />
          </td>
          <td>
            <c-input
              v-model="scope.protabbr"
              :disabled="true"
              :maxlength="16"
              :length-auto-width="false"
              condensed
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.qty"
              :disabled="store.isDetail"
              :format="{ thousands: true, decimal: true, decAfterN: 3 }"
              :maxlength="12"
              :length-auto-width="false"
              @change="countSingleTotal(scope)"
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
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.price"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="12"
              :length-auto-width="false"
              @change="countSingleTotal(scope)"
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.taxprice"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="12"
              :length-auto-width="false"
              @change="countSingleTotal(scope, true)"
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.total1"
              :disabled="true"
              :format="{ thousands: true }"
              :maxlength="15"
              :length-auto-width="false"
            />
          </td>
          <td>
            <c-select
              v-model="scope.invokind"
              :items="['三聯式', '二聯式', '電子發票', '收據', '無']"
              hide-search
              :disabled="store.isDetail"
              clearable
            />
          </td>
          <td>
            <c-input
              v-model="scope.invono"
              :disabled="store.isDetail"
              :format="{ number: true, english: true }"
              :maxlength="10"
            />
          </td>
          <td>
            <c-input v-model="scope.descrip" :disabled="store.isDetail" :maxlength="30" condensed />
          </td>
          <td>
            <c-input v-model="scope.desud1" :disabled="store.isDetail" :maxlength="30" condensed />
          </td>
        </template>
      </c-table>
    </v-card-text>
  </v-card>

  <audit-info
    class="mt-2"
    v-if="store.action === 'edit' || store.action === 'detail'"
    :a_date="formData.a_date"
    :a_user="formData.a_user"
    :m_date="formData.m_date"
    :m_user="formData.m_user"
  />

  <Filter v-model="filterDS" mode="detail" @init="initSearch" @search="handleSearch" />
  <search-emp
    v-model="searchEmpDS"
    v-model:form="formData"
    v-model:keyenter="keyenterEmp"
    :setting="[
      { from: 'empno', to: 'empaccno' },
      { from: 'empname', to: 'empaccname' }
    ]"
    :search-text="formData.empaccno"
    @pick="searchEmpPick"
  />
  <search-prot
    v-model="searcProtDS"
    v-model:form="formData"
    v-model:keyenter="keyenterProt"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }]"
    :search-text="formData.protno"
  />
  <search-prot
    v-model="detProtDS"
    v-model:form="exesdetList"
    v-model:keyenter="detKeyenterProt"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }]"
    :row="detSearchProtRow"
    :search-text="detSearchProtText"
  />
  <pickItem
    v-model="pickItemDS"
    v-model:form="exesdetList"
    :setting="[
      { from: 'itemno' },
      { from: 'itemname' },
      { from: 'ibompqty', to: 'qty' },
      { from: 'stkunit', to: 'unit' }
    ]"
    :row="pickItemRow"
    :mode="pickItemMode"
    :empty="{
      ...exesdetEmpty,
      protno: formData.protno ?? '',
      protabbr: formData.protabbr ?? ''
    }"
    show-ikind
    mkind6
    @pick="exesdetItemPick"
  />
  <project-type
    v-model="pjtDS"
    :items="pjtItems"
    @save="handlePJTsave"
    :disabled="store.isDetail"
  />
  <search-item
    v-model="searcItemDS"
    v-model:form="exesdetList"
    v-model:keyenter="detKeyenterItem"
    :setting="[{ from: 'itemno' }, { from: 'itemname' }, { from: 'stkunit', to: 'unit' }]"
    :row="detSearchItemRow"
    :search-text="detSearchItemText"
    :mkindno="[6]"
  />
  <Print v-model="printDS" :no="`${store.ono}`" />
</template>

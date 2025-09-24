<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import { cButton, cInput, cSelect, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { GenerateRec, deepClone } from '@/utils/ucommon'
  import { HDSno1, HDSsort } from '@/utils/uheaddetsec'
  import { getMKindno1 } from '@/utils/utransno1'
  import { useQuotationInvStore } from '@/store/quotationinv'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import Filter from './Components/QuotationInvFilter.vue'
  import Print from './Components/QuotationPrint.vue'
  import { searchProt } from '@/components/SearchProt'
  import { pickPayterm } from '@/components/PickPayterm'
  import { pickMemo } from '@/components/PickMemo'
  import { hdsItem } from '@/components/HdsItem'
  import { pickQuoitem } from '@/components/PickQuoitem'
  import { pickItem } from '@/components/PickItem'
  import { boms } from '@/components/Boms'
  import { projectType } from '@/components/ProjectType'
  import { searchItem } from '@/components/SearchItem'

  const store = useQuotationInvStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  //下拉選單
  const taxkindDDL = ref<{ taxkind: string; taxkindc: string }[]>([])
  const empDDL = ref<{ empno: string; empname: string }[]>([])
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
  //抓報價人員下拉選單資料
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

  //抓單筆資料
  const getSingleData = () => {
    if (store.ono) {
      callApi({
        method: 'POST',
        url: api.Bill2.Bill2_Data,
        data: { ono: store.ono }
      }).then((res) => {
        if (res.status === 200) {
          const { header_one, body_list, bill2_HeaderItem, bill2_DetailItem, bill2_SubSubItem } =
            res.data
          if (header_one) {
            formData.value = { ...header_one }
          }
          if (body_list && Array.isArray(body_list)) {
            billdetList.value = HDSno1(body_list, 'sec')
          }
          if (bill2_HeaderItem && Array.isArray(bill2_HeaderItem)) {
            headItemList.value = HDSsort(HDSno1(bill2_HeaderItem, 'head'), 'head')
          }
          if (bill2_DetailItem && Array.isArray(bill2_DetailItem)) {
            detItemList.value = HDSsort(HDSno1(bill2_DetailItem, 'det'), 'det')
          }
          if (bill2_SubSubItem && Array.isArray(bill2_SubSubItem)) {
            secItemList.value = HDSsort(HDSno1(bill2_SubSubItem, 'sec'), 'sec')
          }
        }
      })
    }
  }
  //Renew
  const getRenewData = () => {
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_Renew
    }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        if (data) {
          formData.value = { ...data }
          billdetList.value = []
          headItemList.value = []
          detItemList.value = []
          secItemList.value = []
        }
      }
    })
  }
  //檢查鎖定
  const checkExecApi = async (flag: 1 | 0) => {
    const qno = formData.value.qno
    const res = await callApi({
      method: 'POST',
      url: api.Sqte.Sqte_ExecChk,
      params: { flag, qno }
    })
    if (res.status === 200) {
      return res.data ?? ''
    } else {
      return 'error'
    }
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
  const edit = async () => {
    if (store.ono) {
      // const check = await checkExecApi(1)
      // if (check == '已有其他工作站修改中' || check == '單據已請款') {
      //   message.alert({
      //     type: 'error',
      //     message: `${check}不可修改,請確認`
      //   })
      // } else if (check == '無此單據號碼') {
      //   message.alert({
      //     type: 'error',
      //     message: check
      //   })
      // } else if (check == '成功') {
      store.edit()
      // }
    }
  }
  //刪除
  const del = async () => {
    if (store.index1) {
      const check = await checkExecApi(1)
      if (check == '已有其他工作站修改中' || check == '單據已請款') {
        message.alert({
          type: 'error',
          message: `${check}不可刪除,請確認`
        })
      } else if (check == '無此單據號碼') {
        message.alert({
          type: 'error',
          message: check
        })
        const val = store.index1 as string
        if (!store.isFirst) onoChange('previous')
        else if (!store.isLast) onoChange('next')
        store.delete(val)
      } else if (check == '成功') {
        message.confirm({
          type: 'question',
          message: `確定要刪除「${formData.value.qno}」報價單？`,
          onConfirm: () => {
            //刪除
            callApi({
              method: 'POST',
              url: api.Sqte.Sqte_DEL,
              params: { index1: store.index1 }
            }).then((res) => {
              if (res?.status === 200) {
                const data = res?.data
                if (data.success === true) {
                  message.alert({
                    type: 'success',
                    message: '刪除成功',
                    autoClose: 2,
                    onConfirm: () => {
                      const val = store.index1 as string
                      if (!store.isFirst) onoChange('previous')
                      else if (!store.isLast) onoChange('next')
                      store.delete(val)
                    }
                  })
                } else {
                  message.alert({
                    type: 'error',
                    message: `刪除失敗：${data.message}`
                  })
                  checkExecApi(0) //解除鎖定
                }
              }
            })
          },
          onCancel: () => {
            checkExecApi(0) //解除鎖定
          }
        })
      }
    }
  }
  //放棄
  const cancel = () => {
    if (store.action === 'edit') {
      checkExecApi(0) //解除鎖定
    }
    getSingleData()
    store.cancel()
  }

  //檢查欄位規則
  const checkData = () => {
    //必填:qno, date1, protno, protname, custno, custabbr, taxkind
    const requiredFields = [
      { key: 'date1', label: '報價日期' },
      { key: 'protname', label: '工程名稱' },
      { key: 'custno', label: '業主編號' },
      { key: 'custabbr', label: '業主簡稱' },
      { key: 'taxkind', label: '營業稅' }
    ]

    if (!formData.value.protno && !formData.value.protname) {
      requiredFields.splice(1, 0, { key: 'protno', label: '工程編號' })
    }
    if (store.action == 'edit') requiredFields.unshift({ key: 'qno', label: '報價單號' })

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
    const _sqte = Object.fromEntries(
      Object.keys(create ?? {}).map((key) => [key, create?.[key] ?? ''])
    )
    //數字欄位
    _sqte.sum1 = formData.value?.sum1 ?? 0
    _sqte.taxrate = formData.value?.taxrate ?? 5
    _sqte.tax = formData.value?.tax ?? 0
    _sqte.amount = formData.value?.amount ?? 0
    _sqte.execflag = 0
    _sqte.sqtememo1 = formData.value?.sqtememo1 ?? 0
    _sqte.retain = 0
    _sqte.remretain = formData.value?.remretain ?? 0
    //建檔資料 (因為 renew 會給要傳)
    _sqte.a_date1 = store.action === 'create' ? (formData.value?.a_date1 ?? '') : ''
    _sqte.a_date2 = store.action === 'create' ? (formData.value?.a_date2 ?? '') : ''
    _sqte.a_user = store.action === 'create' ? (formData.value?.a_user ?? '') : ''
    _sqte.m_date1 = store.action === 'create' ? (formData.value?.m_date1 ?? '') : ''
    _sqte.m_date2 = store.action === 'create' ? (formData.value?.m_date2 ?? '') : ''
    _sqte.m_user = store.action === 'create' ? (formData.value?.m_user ?? '') : ''

    //轉成form-data type
    const formdata = new FormData()
    for (const key in _sqte) {
      if (_sqte.hasOwnProperty(key)) {
        // 過濾掉繼承屬性
        formdata.append(`_sqte.${key}`, _sqte[key])
      }
    }
    //明細
    // sqtedetList.value.forEach((item, i) => {
    //   for (const key in item) {
    //     if (key !== 'listBom') {
    //       formdata.append(`_sqtedet[${i}].${key}`, item[key])
    //     } else {
    //       const listBom = item['listBom'] as any[]
    //       listBom.forEach((bom, j) => {
    //         for (const bomkey in bom) {
    //           formdata.append(`_sqtedet[${i}].listBom[${j}].${bomkey}`, bom[bomkey])
    //         }
    //       })
    //     }
    //   }
    // })
    headItemList.value.forEach((item, i) => {
      for (const key in item) {
        formdata.append(`_HeaderItems[${i}].${key}`, item[key])
      }
    })
    detItemList.value.forEach((item, i) => {
      for (const key in item) {
        formdata.append(`_DetailItem[${i}].${key}`, item[key])
      }
    })
    secItemList.value.forEach((item, i) => {
      for (const key in item) {
        formdata.append(`_SubSubItem[${i}].${key}`, item[key])
      }
    })

    return formdata
  }
  const callCreateApi = () => {
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_Create,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data && data.success === true) {
          message.alert({
            type: 'success',
            message: '存檔成功',
            autoClose: 2,
            onConfirm: () => {
              const index1 = data.message
              if (index1) {
                store.list.push({ index1: index1 })
                store.index1 = index1
              }
              cancel()
            }
          })
        }
      }
    })
  }
  const callEditApi = () => {
    callApi({
      method: 'POST',
      url: api.Sqte.Sqte_EDIT,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        console.log(res)
        const data = res?.data
        if (data && data.success === true) {
          message.alert({
            type: 'success',
            message: '存檔成功',
            autoClose: 2,
            onConfirm: () => {
              cancel()
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
      message: `確定要送出報價單資料？`,
      onConfirm: () => {
        if (store.action === 'edit') {
          callEditApi()
        } else {
          callCreateApi()
        }
      }
    })
  }

  //表身表格
  const billdetList = ref<(typeof billdetEmpty)[]>([])
  const billdetEmpty = {
    listBom: [],
    ono: '',
    rec1: '',
    itemno: '',
    itemname: '',
    qty: 0,
    unit: '',
    price: 0,
    taxprice: 0,
    total1: 0,
    ntotal1: 0,
    mkindno: '',
    descrip: '',
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
    phase: '',
    details: '',
    bdate1: '',
    billfiud1: '',
    sysname1: '',
    billdetmo1: '',
    billdetmo2: '',
    billdetmo3: 0,
    rec1_sys: '',
    headitem: '',
    detitem: '',
    secitem: '',
    headitemno: '',
    detitemno: '',
    secitemno: '',
    headitemno1: '',
    detitemno1: '',
    secitemno1: ''
  }
  const billdetTable = ref()
  //表身表格-刪除
  const billdetDel = () => {
    const selectIndex = billdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      billdetList.value.splice(selectIndex, 1)
    }
    GenerateRec(billdetList.value)
    countSum()
  }
  //表身表格-單價分析
  const billdetBom = () => {
    const selectIndex = billdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const bom = billdetList.value[selectIndex].listBom
      if (Array.isArray(bom)) {
        selectBomsList.value = deepClone(bom)
      }
      bomsDS.value = true
    }
  }
  //表身表格-規格說明
  const billdetProType = () => {
    const selectIndex = billdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      pjtDS.value = true
    }
  }

  //勾選報價工料彈窗
  const pickItemDS = ref(false)
  const pickItemRow = ref()
  const pickItemMode = ref()
  const sqtedetItemPick = () => {
    billdetList.value.sort((a: any, b: any) => {
      const trans = (val: any) => (Number.isNaN(val) ? 0 : Number(val))
      return (
        trans(a.headitemno) - trans(b.headitemno) ||
        trans(a.detitemno) - trans(b.detitemno) ||
        trans(a.secitemno) - trans(b.secitemno)
      )
    })
    GenerateRec(billdetList.value)
    countTotal()
  }

  //大項目
  const headItemList = ref<iHeadItem[]>([])
  //中項目
  const detItemList = ref<iDetItem[]>([])
  //細項目
  const secItemList = ref<iSecItem[]>([])

  //算 稅額 & 金額
  const taxRule = (det: typeof billdetEmpty) => {
    const taxrate = (formData.value.taxrate ?? 5) * 0.01
    const taxkind = formData.value.taxkind
    const qty = Number(det.qty) || 0
    const price = Number(det.price) || 0
    if (['1', '3', '4', '5'].includes(taxkind)) {
      //稅前進價
      det.taxprice = price
      //稅前金額
      det.total1 = qty * price
      //請款金額
      det.ntotal1 = det.total1
    } else if (taxkind === '2') {
      //稅前進價
      det.taxprice = price
      //稅前金額
      det.total1 = Math.round((price / (1 + taxrate)) * qty)
      //請款金額
      det.ntotal1 = det.total1
    }
  }
  const countTotal = () => {
    billdetList.value.forEach((det) => {
      taxRule(det)
    })
    countSum()
  }
  const countSingleTotal = (det: typeof billdetEmpty) => {
    taxRule(det)
    countSum()
  }
  // 算 稅前合計、營業稅額、報價總額
  const countSum = (useTax?: number) => {
    const taxrate = (formData.value.taxrate ?? 5) * 0.01
    const taxkind = formData.value.taxkind
    let sum1 = 0,
      tax = 0,
      amount = 0
    if (taxkind === '1') {
      //稅前合計
      sum1 = billdetList.value.reduce((sum, item) => sum + Number(item.total1), 0)
      //營業稅額
      tax = useTax ?? Math.round(sum1 * taxrate)
      //報價總額
      amount = Number(sum1) + Number(tax)
    } else if (taxkind === '2') {
      //報價總額
      amount = billdetList.value.reduce(
        (sum, item) => sum + Number(item.qty) * Number(item.price),
        0
      )
      //營業稅額
      tax = Math.round((amount / (1 + taxrate)) * taxrate)
      //稅前合計
      sum1 = Number(amount) - Number(tax)
      //如果有參數 useTax，將 稅前合計加上 useTax 再回填 報價總額
      if (typeof useTax === 'number') {
        tax = useTax
        amount = sum1 + tax
      }
    } else if (['3', '4', '5'].includes(taxkind)) {
      //稅前合計
      sum1 = billdetList.value.reduce((sum, item) => sum + Number(item.total1), 0)
      //營業稅額
      tax = useTax || 0
      //報價總額
      amount = Number(sum1) + Number(tax)
    }
    formData.value = { ...formData.value, sum1, tax, amount }
  }

  //查詢條件
  const filterDS = ref(false)
  const initSearch = (data) => {
    if (Array.isArray(data)) {
      store.init(data.map(({ ono }) => ({ ono })))
    }
    if (store.ono) getSingleData()
  }
  const handleSearch = (data) => {
    store.search(router, data)
  }

  //查詢工程彈窗
  const searchProtDS = ref(false)
  const searchProtIsEnter = ref(false)
  const searchProtOpen = () => {
    searchProtDS.value = true
  }
  const searchProtKeyEnter = () => {
    searchProtIsEnter.value = true
    searchProtDS.value = true
  }
  const searchProtPick = (data) => {
    if (data.taxkindno && data.taxkindc) {
      formData.value.taxkind = data.taxkindno
      formData.value.taxkindc = data.taxkindc
      countTotal()
    }
  }

  //選擇付款條件彈窗
  const pickPaytermDS = ref(false)
  //選擇說明彈窗
  const pickMemoDS = ref(false)

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
    // const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    // if (typeof selectIndex === 'number' && selectIndex >= 0) {
    //   sqtedetList.value[selectIndex].listBom = [...data]
    // }
  }
  //規格說明彈窗
  const pjtDS = ref(false)
  const pjtItems = computed(() => {
    const selectIndex = billdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        billdetList.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = billdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      billdetList.value[selectIndex].pjt1 = data.pjt1
      billdetList.value[selectIndex].pjt2 = data.pjt2
      billdetList.value[selectIndex].pjt3 = data.pjt3
      billdetList.value[selectIndex].pjt4 = data.pjt4
      billdetList.value[selectIndex].pjt5 = data.pjt5
      billdetList.value[selectIndex].pjt6 = data.pjt6
      billdetList.value[selectIndex].pjt7 = data.pjt7
      billdetList.value[selectIndex].pjt8 = data.pjt8
      billdetList.value[selectIndex].pjt9 = data.pjt9
      billdetList.value[selectIndex].pjt10 = data.pjt10
    }
  }

  //列印
  const printDS = ref(false)
  const printOpen = () => {
    if (store.index1) {
      printDS.value = true
    }
  }

  onMounted(() => {
    //抓下拉選單
    getTaxkindApi()
    getEmpApi()
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

  <!--資料-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.ono"
            label="請款單號"
            icon="fa-solid fa-file-lines"
            :disabled="store.keyDisabled"
            :maxlength="14"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.date1"
            label="請款日期"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.adate1"
            label="帳款日期"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.qno"
            label="報價單號"
            icon="fa-solid fa-file-lines"
            :disabled="store.isDetail"
            :maxlength="14"
            @button="pickItemDS = true"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protno"
            label="工程編號"
            :is-required="true"
            :disabled="store.isDetail"
            :format="{ number: true, english: true }"
            :maxlength="16"
            @button="searchProtOpen"
            @keyEnter="searchProtKeyEnter"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protabbr"
            label="工程簡稱"
            icon="fa-solid fa-helmet-safety"
            :disabled="true"
            :maxlength="16"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custabbr"
            label="業主簡稱"
            icon="fa-solid fa-user-tie"
            :disabled="true"
            :maxlength="16"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.ecdate"
            label="預結帳日"
            icon="fa-solid fa-calendar-day"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.etdate"
            label="預收款日"
            icon="fa-solid fa-calendar-day"
            :disabled="store.isDetail"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!--頁籤-->
  <v-card class="mt-2">
    <v-tabs v-model="tabpage" class="c-tabs">
      <v-tab value="det">明細</v-tab>
      <v-tab value="other">資料</v-tab>
      <v-tab value="memo">自訂及附檔</v-tab>
      <v-tab value="hds">項目</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="det">
          <v-row dense>
            <v-col cols="auto" v-if="!store.isDetail">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="billdetDel">刪除</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="boms" icon="fa-solid fa-search-dollar" @click="billdetBom">
                單價分析
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="protype" icon="fa-solid fa-clipboard-list" @click="billdetProType">
                規格說明
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="photo" icon="fa-solid fa-images">看圖</c-button>
            </v-col>
          </v-row>
          <c-table
            class="mt-2"
            ref="billdetTable"
            v-model="billdetList"
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
              <th>數量</th>
              <th>單位</th>
              <th>單價</th>
              <th>稅前進價</th>
              <th>稅前金額</th>
              <th>請款金額</th>
              <th>說明</th>
              <th>類別</th>
              <th>明細自定一</th>
            </template>
            <template v-slot:body="{ scope, index }">
              <td>
                <div class="text-center w-rec">{{ scope.rec1 }}</div>
              </td>
              <td>
                <div class="text-center nowrap">{{ scope.headitemno1 }}</div>
              </td>
              <td>
                <div class="text-center nowrap">{{ scope.detitemno1 }}</div>
              </td>
              <td>
                <div class="text-center nowrap">{{ scope.secitemno1 }}</div>
              </td>
              <td>
                <c-input v-model="scope.itemno" :disabled="true" :maxlength="20" condensed />
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
                  @change="countSingleTotal(scope)"
                  :maxlength="9"
                />
              </td>
              <td>
                <c-input v-model="scope.unit" :disabled="true" :maxlength="2" />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.price"
                  :disabled="true"
                  :format="{ thousands: true }"
                  :maxlength="10"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.taxprice"
                  :disabled="true"
                  :format="{ thousands: true }"
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
                  v-model="scope.ntotal1"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  :maxlength="8"
                />
              </td>
              <td>
                <c-input
                  v-model="scope.descrip"
                  :disabled="store.isDetail"
                  :maxlength="40"
                  condensed
                />
              </td>
              <td>
                <div class="text-center w-mkindno1">{{ getMKindno1(scope.mkindno) }}</div>
              </td>
              <td>
                <c-input
                  v-model="scope.billfiud1"
                  :disabled="store.isDetail"
                  :maxlength="40"
                  condensed
                />
              </td>
            </template>
          </c-table>
        </v-tabs-window-item>
        <v-tabs-window-item value="other">
          <v-row dense>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.sum1"
                label="請款合計"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.bsrcvpay"
                label="已收金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.invono"
                label="發票號碼"
                icon="fa-solid fa-file-invoice-dollar"
                :format="{ number: true, english: true }"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-select
                v-model="formData.taxkind"
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
                width="258"
                @update:model-value="countTotal"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.bsarpay"
                label="應收金額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.uniform"
                label="統一編號"
                icon="fa-solid fa-barcode"
                :format="{ number: true }"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.tax"
                label="營業稅額"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="12"
                @change="countSum(formData.tax)"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.retain"
                label="保留款"
                icon="fa-solid fa-dollar-sign"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col class="px-2">
              <c-input
                v-model="formData.invotitle"
                label="發票抬頭"
                icon="fa-solid fa-file-invoice-dollar"
                :disabled="store.isDetail"
                :maxlength="50"
                :length-auto-width="false"
                condensed
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.amount"
                label="請款總計"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.bretain"
                label="已收保留款"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.expdatE1"
                label="保留到期日"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.idate1"
                label="發票日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="memo">
          <v-row dense>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.billud1"
                label="請款自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
                condensed
              />
            </v-col>
            <v-col class="px-2">
              <c-input
                v-model="formData.billud2"
                label="請款自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="30"
                condensed
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col class="px-2">
              <c-input
                v-model="formData.payment1"
                label="付款條件"
                icon="fa-solid fa-money-check-alt"
                :disabled="store.isDetail"
                :maxlength="40"
                condensed
                @button="pickPaytermDS = true"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pen"
                :disabled="store.isDetail"
                :maxlength="50"
                condensed
                @button="pickMemoDS = true"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-button kind="photo" icon="fa-solid fa-images">上傳圖片</c-button>
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="hds">
          <hdsItem
            v-model:head="headItemList"
            v-model:det="detItemList"
            v-model:sec="secItemList"
            :disabled="store.isDetail"
            :tb-height="300"
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

  <Filter v-model="filterDS" @init="initSearch" @search="handleSearch" />
  <search-prot
    v-model="searchProtDS"
    v-model:form="formData"
    v-model:keyenter="searchProtIsEnter"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }, { from: 'custno' }, { from: 'custabbr' }]"
    :search-text="formData.protno"
    @pick="searchProtPick"
  />
  <pick-payterm
    v-model="pickPaytermDS"
    v-model:form="formData"
    :setting="[{ from: 'content1', to: 'payment1' }]"
  />
  <pick-memo
    v-model="pickMemoDS"
    v-model:form="formData"
    :setting="[{ from: 'content1', to: 'memo1' }]"
  />
  <pick-quoitem v-model="pickItemDS" />
  <!-- <pickItem
    v-model="pickItemDS"
    v-model:form="sqtedetList"
    :setting="[
      { from: 'headitemno' },
      { from: 'headitem' },
      { from: 'headitemno1' },
      { from: 'detitemno' },
      { from: 'detitem' },
      { from: 'detitemno1' },
      { from: 'secitemno' },
      { from: 'secitem' },
      { from: 'secitemno1' },
      { from: 'itemno' },
      { from: 'itemname' },
      { from: 'ibompqty', to: 'qty' },
      { from: 'stkunit', to: 'unit' },
      { from: 'stksalpc', to: 'price' },
      { from: 'mkindno' },
      { from: 'mkindno1' }
    ]"
    :row="pickItemRow"
    :mode="pickItemMode"
    :empty="{ ...sqtedetEmpty }"
    show-ikind
    @pick="sqtedetItemPick"
    :show-hds="true"
    :headlist="headItemList"
    :detlist="detItemList"
    :seclist="secItemList"
  /> -->
  <boms
    v-model="bomsDS"
    :items="selectBomsList"
    :empty-data="emptyBoms"
    @save="handleBomsSave"
    :disabled="store.isDetail"
  />
  <project-type
    v-model="pjtDS"
    :items="pjtItems"
    @save="handlePJTsave"
    :disabled="store.isDetail"
  />
  <Print v-model="printDS" :no="`${formData.qno}`" />
</template>

<style scoped>
  .w-rec {
    width: 60px;
  }
  .w-mkindno1 {
    width: 60px;
  }
  .nowrap {
    white-space: nowrap;
  }
</style>

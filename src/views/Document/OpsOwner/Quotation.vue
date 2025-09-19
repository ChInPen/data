<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTable,
    cBread,
    cSelectInput,
    cTextarea
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import {
    GenerateRec,
    deepClone,
    getHeadItemNo1,
    getDetItemNo1,
    getSecItemNo1
  } from '@/utils/ucommon'
  import { useQuotationStore } from '@/store/quotation'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import Filter from './Components/QuotationFilter.vue'
  import { searchCust } from '@/components/SearchCust'
  import { searchProt } from '@/components/SearchProt'
  import { pickPayterm } from '@/components/PickPayterm'
  import { pickHavedate } from '@/components/PickHavedate'
  import { pickMemo } from '@/components/PickMemo'
  import { hdsItem } from '@/components/HdsItem'
  import { pickItem } from '@/components/PickItem'
  import { boms } from '@/components/Boms'
  import { projectType } from '@/components/ProjectType'
  import protTrade from './Components/QuotationProtTrade.vue'
  import { searchItem } from '@/components/SearchItem'

  const store = useQuotationStore() // useMiscExpenseStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  //下拉選單
  const taxkindDDL = ref<{ taxkind: string; taxkindc: string }[]>([])
  const empDDL = ref<{ empno: string; empname: string }[]>([])
  const unitDDL = ref<{ content1: string }[]>([])
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

  //抓單筆資料
  const getSingleData = () => {
    if (store.index1) {
      callApi({
        method: 'POST',
        url: api.Sqte.Sqte_Data,
        data: { index1: store.index1 }
      }).then((res) => {
        if (res.status === 200) {
          const {
            sqte_one,
            sqtedet_chinesenum_list,
            sqte_HeaderItem,
            sqte_DetailItem,
            sqte_SubSubItem
          } = res.data

          if (sqte_one) {
            formData.value = { ...sqte_one }
          }
          if (sqtedet_chinesenum_list && Array.isArray(sqtedet_chinesenum_list)) {
            sqtedetList.value = sqtedet_chinesenum_list.map((x: any) => ({
              ...x,
              headitemno1: x.headitemno1 || getHeadItemNo1(x.headitemno) || '',
              detitemno1: x.detitemno1 || getDetItemNo1(x.detitemno) || '',
              secitemno1: x.secitemno1 || getSecItemNo1(x.secitemno) || ''
            }))
          }
          if (sqte_HeaderItem && Array.isArray(sqte_HeaderItem)) {
            headItemList.value = sqte_HeaderItem
              .map((x) => ({ ...x, headitemno1: x.headitemno1 ?? '' }))
              .sort((a, b) => Number(a.headitemno) - Number(b.headitemno))
          }
          if (sqte_DetailItem && Array.isArray(sqte_DetailItem)) {
            detItemList.value = sqte_DetailItem
              .map((item) => ({
                ...item,
                headitemno1:
                  Number(item.headitemno) == 0 ? '' : getHeadItemNo1(Number(item.headitemno)),
                detitemno1: item.detitemno1 ?? ''
              }))
              .sort(
                (a, b) =>
                  Number(a.headitemno) - Number(b.headitemno) ||
                  Number(a.detitemno) - Number(b.detitemno)
              )
          }
          if (sqte_SubSubItem && Array.isArray(sqte_SubSubItem)) {
            secItemList.value = sqte_SubSubItem
              .map((item) => ({
                ...item,
                headitemno1:
                  Number(item.headitemno) == 0 ? '' : getHeadItemNo1(Number(item.headitemno)),
                detitemno1:
                  Number(item.detitemno) == 0 ? '' : getDetItemNo1(Number(item.detitemno)),
                secitemno1: item.secitemno1 ?? ''
              }))
              .sort(
                (a, b) =>
                  Number(a.headitemno) - Number(b.headitemno) ||
                  Number(a.detitemno) - Number(b.detitemno) ||
                  Number(a.secitemno) - Number(b.secitemno)
              )
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
          sqtedetList.value = []
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
      } else if (check == '成功') {
        store.edit()
      }
    }
  }
  //複製
  const copy = () => {
    formData.value.qno = ''
    formData.value.index1 = ''
    store.copy()
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
    sqtedetList.value.forEach((item, i) => {
      for (const key in item) {
        if (key !== 'listBom') {
          formdata.append(`_sqtedet[${i}].${key}`, item[key])
        } else {
          const listBom = item['listBom'] as any[]
          listBom.forEach((bom, j) => {
            for (const bomkey in bom) {
              formdata.append(`_sqtedet[${i}].listBom[${j}].${bomkey}`, bom[bomkey])
            }
          })
        }
      }
    })
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
  const sqtedetList = ref<(typeof sqtedetEmpty)[]>([])
  const sqtedetTable = ref()
  const sqtedetEmpty = {
    listBom: [],
    sysname1: '',
    rec1: '',
    headitemno: '',
    headitemno1: '',
    headitem: '',
    detitemno: '',
    detitemno1: '',
    detitem: '',
    secitemno: '',
    secitemno1: '',
    secitem: '',
    itemno: '',
    itemname: '',
    qty: 0,
    unit: '',
    price: 0,
    taxprice: 0,
    ntotal1: 0,
    total1: 0,
    mkindno: '',
    mkindno1: '',
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
    sqtedetud1: '',
    sqtedetud2: '',
    sqtedetud3: 0,
    sqtedetud: '',
    delidate1: null,
    delidate2: null
  }
  //表身表格-新增
  const sqtedetAdd = () => {
    pickItemRow.value = undefined
    pickItemMode.value = 'add'
    pickItemDS.value = true
  }
  //表身表格-插入
  const sqtedetIns = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      sqtedetList.value.splice(selectIndex, 0, { ...sqtedetEmpty })
    }
    GenerateRec(sqtedetList.value)
  }
  //表身表格-刪除
  const sqtedetDel = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      sqtedetList.value.splice(selectIndex, 1)
    }
    GenerateRec(sqtedetList.value)
    countSum()
  }
  //表身表格-單價分析
  const sqtedetBom = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const bom = sqtedetList.value[selectIndex].listBom
      if (Array.isArray(bom)) {
        selectBomsList.value = deepClone(bom)
      }
      bomsDS.value = true
    }
  }
  //表身表格-規格說明
  const sqtedetProType = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      pjtDS.value = true
    }
  }
  //表身表格-工料 button
  const sqtedetPickItem = (row: number) => {
    if (typeof row === 'number' && row >= 0) {
      pickItemRow.value = row
      pickItemMode.value = 'insert'
      pickItemDS.value = true
    }
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
  //表身表格-工程交易彈窗
  const protTradeDS = ref(false)
  const protTradeTitle = ref('該工程交易')
  const protTradeItemno = ref('')
  const protTradeProtno = ref('')
  const protTradeCurrent = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protTradeTitle.value = '該工程交易'
      protTradeItemno.value = sqtedetList.value[selectIndex].itemno
      protTradeProtno.value = formData.value.protno
      protTradeDS.value = true
    }
  }
  const protTradeAll = () => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      protTradeTitle.value = '所有工程交易'
      protTradeItemno.value = sqtedetList.value[selectIndex].itemno
      protTradeProtno.value = ''
      protTradeDS.value = true
    }
  }

  //勾選工料彈窗
  const pickItemDS = ref(false)
  const pickItemRow = ref()
  const pickItemMode = ref()
  const sqtedetItemPick = () => {
    sqtedetList.value.sort((a: any, b: any) => {
      const trans = (val: any) => (Number.isNaN(val) ? 0 : Number(val))
      return (
        trans(a.headitemno) - trans(b.headitemno) ||
        trans(a.detitemno) - trans(b.detitemno) ||
        trans(a.secitemno) - trans(b.secitemno)
      )
    })
    GenerateRec(sqtedetList.value)
    countTotal()
  }

  //大項目
  const headItemList = ref<iHeadItem[]>([])
  //中項目
  const detItemList = ref<iDetItem[]>([])
  //細項目
  const secItemList = ref<iSecItem[]>([])

  //算 稅額 & 金額
  const taxRule = (det: typeof sqtedetEmpty, isTotal: boolean = false) => {
    const taxrate = (formData.value.taxrate ?? 5) * 0.01
    const taxkind = formData.value.taxkind
    const qty = Number(det.qty) || 0
    const price = Number(det.price) || 0
    const total1 = Number(det.total1) || 0
    if (['1', '3', '4', '5'].includes(taxkind)) {
      if (!isTotal) {
        //稅前售價
        det.taxprice = price
        //稅前金額
        det.total1 = qty * price
      } else {
        //稅前售價
        det.taxprice = Math.round(total1 / qty)
        //單價
        det.price = det.taxprice
      }
    } else if (taxkind === '2') {
      if (!isTotal) {
        //稅前售價
        det.taxprice = Math.round(price / (1 + taxrate))
        //稅前金額
        det.total1 = Math.round((price / (1 + taxrate)) * qty)
      } else {
        //稅前售價
        det.taxprice = Math.round(total1 / qty)
        //單價
        det.price = Math.round((total1 / qty) * (1 + taxrate))
      }
    }
  }
  const countTotal = () => {
    sqtedetList.value.forEach((det) => {
      taxRule(det)
    })
    countSum()
  }
  const countSingleTotal = (det: typeof sqtedetEmpty, isTotal: boolean = false) => {
    taxRule(det, isTotal)
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
      sum1 = sqtedetList.value.reduce((sum, item) => sum + Number(item.total1), 0)
      //營業稅額
      tax = useTax || Math.round(sum1 * taxrate)
      //報價總額
      amount = Number(sum1) + Number(tax)
    } else if (taxkind === '2') {
      //報價總額
      amount = sqtedetList.value.reduce(
        (sum, item) => sum + Number(item.qty) * Number(item.price),
        0
      )
      //營業稅額
      tax = useTax || Math.round((amount / (1 + taxrate)) * taxrate)
      //稅前合計
      sum1 = Number(amount) - Number(tax)
    } else if (['3', '4', '5'].includes(taxkind)) {
      //稅前合計
      sum1 = sqtedetList.value.reduce((sum, item) => sum + Number(item.total1), 0)
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
      store.init(data.map(({ index1 }) => ({ index1 })))
    }
    if (store.index1) getSingleData()
  }
  const handleSearch = (data) => {
    store.search(router, data)
  }

  //查詢人員彈窗
  const searchCustDS = ref(false)
  const searchCustIsEnter = ref(false)
  const searchCustOpen = () => {
    searchCustDS.value = true
  }
  const searchCustKeyEnter = () => {
    searchCustIsEnter.value = true
    searchCustDS.value = true
  }
  const searchCustPick = (data) => {
    if (data.taxkindno && data.taxkindc) {
      formData.value.taxkind = data.taxkindno
      formData.value.taxkindc = data.taxkindc
    }
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
    }
  }

  //選擇付款條件彈窗
  const pickPaytermDS = ref(false)
  //選擇有限期限彈窗
  const pickHavedateDS = ref(false)
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
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      sqtedetList.value[selectIndex].listBom = [...data]
    }
  }
  //規格說明彈窗
  const pjtDS = ref(false)
  const pjtItems = computed(() => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        sqtedetList.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = sqtedetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      sqtedetList.value[selectIndex].pjt1 = data.pjt1
      sqtedetList.value[selectIndex].pjt2 = data.pjt2
      sqtedetList.value[selectIndex].pjt3 = data.pjt3
      sqtedetList.value[selectIndex].pjt4 = data.pjt4
      sqtedetList.value[selectIndex].pjt5 = data.pjt5
      sqtedetList.value[selectIndex].pjt6 = data.pjt6
      sqtedetList.value[selectIndex].pjt7 = data.pjt7
      sqtedetList.value[selectIndex].pjt8 = data.pjt8
      sqtedetList.value[selectIndex].pjt9 = data.pjt9
      sqtedetList.value[selectIndex].pjt10 = data.pjt10
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
    getUnitApi()
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

  <!--資料-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.qno"
            label="報價單號"
            icon="fa-solid fa-file-lines"
            :disabled="store.keyDisabled"
            :maxlength="14"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.date1"
            label="報價日期"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.custno"
            label="業主編號"
            :is-required="true"
            :disabled="store.isDetail || Boolean(formData.protno)"
            :format="{ number: true, english: true }"
            :maxlength="10"
            @button="searchCustOpen"
            @keyEnter="searchCustKeyEnter"
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
            v-model="formData.protno"
            label="工程編號"
            icon="fa-solid fa-helmet-safety"
            :disabled="store.isDetail"
            :format="{ number: true, english: true }"
            :maxlength="16"
            @button="searchProtOpen"
            @keyEnter="searchProtKeyEnter"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protname"
            label="工程名稱"
            :is-required="true"
            :disabled="store.isDetail || Boolean(formData.protno)"
            :maxlength="50"
            condensed
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
            v-model="formData.amount"
            label="報價總額"
            icon="fa-solid fa-dollar-sign"
            :disabled="true"
            :format="{ thousands: true }"
            :maxlength="12"
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
              <c-button kind="create" icon="mdi-plus-circle" @click="sqtedetAdd">新增</c-button>
            </v-col>
            <v-col cols="auto" v-if="!store.isDetail">
              <c-button kind="insert" icon="mdi-arrow-down-circle" @click="sqtedetIns">
                插入
              </c-button>
            </v-col>
            <v-col cols="auto" v-if="!store.isDetail">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="sqtedetDel">刪除</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="boms" icon="fa-solid fa-search-dollar" @click="sqtedetBom">
                單價分析
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="protype" icon="fa-solid fa-clipboard-list" @click="sqtedetProType">
                規格說明
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="photo" icon="fa-solid fa-images">看圖</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button
                kind="trade"
                icon="fa-solid fa-file-invoice-dollar"
                @click="protTradeCurrent"
              >
                該工程交易
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="trade" icon="fa-solid fa-file-invoice-dollar" @click="protTradeAll">
                所有工程交易
              </c-button>
            </v-col>
          </v-row>
          <c-table
            class="mt-2"
            ref="sqtedetTable"
            v-model="sqtedetList"
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
              <th>稅前售價</th>
              <th>稅前金額</th>
              <th>說明</th>
              <th>類別</th>
              <th>報價自定一</th>
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
                <c-input
                  v-model="scope.itemno"
                  :disabled="store.isDetail"
                  @button="sqtedetPickItem(index)"
                  @keyEnter="detSearchItemEnter(index, scope.itemno)"
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
                  @change="countSingleTotal(scope)"
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
                  @change="countSingleTotal(scope)"
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
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="countSingleTotal(scope, true)"
                  :maxlength="12"
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
              <td>
                <c-input
                  v-model="scope.sqtedetud1"
                  :disabled="store.isDetail"
                  :maxlength="20"
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
                v-model="formData.con1"
                label="聯絡人"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.rdate1"
                label="到期日"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col class="px-2">
              <c-input
                v-model="formData.payment1"
                label="付款條件"
                icon="fa-solid fa-money-check-alt"
                :disabled="store.isDetail"
                :maxlength="50"
                :length-auto-width="false"
                condensed
                @button="pickPaytermDS = true"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.remretain"
                label="保留款餘額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.sqno"
                label="估算單號"
                icon="fa-solid fa-file-lines"
                :disabled="true"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.valdate"
                label="有限期限"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
                :maxlength="30"
                condensed
                @button="pickHavedateDS = true"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-select-input
                front="select"
                v-model="formData.empno"
                v-model:title="formData.empname"
                label="報價人員"
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
            <v-col class="px-2">
              <c-input
                v-model="formData.memo1"
                label="說明"
                icon="fa-solid fa-pen"
                :disabled="store.isDetail"
                :maxlength="68"
                :length-auto-width="false"
                condensed
                @button="pickMemoDS = true"
              />
            </v-col>
            <v-col cols="12" class="px-2">
              <c-input
                v-model="formData.protaddr"
                label="工程地址"
                icon="fa-solid fa-location-dot"
                :disabled="store.isDetail"
                :maxlength="60"
                condensed
              />
            </v-col>
            <v-col cols="12" class="px-2">
              <c-textarea
                v-model="formData.memo"
                label="備註1"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="12" class="px-2">
              <c-textarea
                v-model="formData.memo2"
                label="備註2"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="memo">
          <v-row dense>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.sqtememo1"
                label="報價自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-col class="px-2">
              <c-input
                v-model="formData.sqtememo2"
                label="報價自定三"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="68"
                :length-auto-width="false"
                condensed
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
  <search-cust
    v-model="searchCustDS"
    v-model:form="formData"
    v-model:keyenter="searchCustIsEnter"
    :setting="[{ from: 'custno' }, { from: 'custabbr' }, { from: 'con', to: 'con1' }]"
    :search-text="formData.custno"
    @pick="searchCustPick"
  />
  <search-prot
    v-model="searchProtDS"
    v-model:form="formData"
    v-model:keyenter="searchProtIsEnter"
    :setting="[
      { from: 'protno' },
      { from: 'protname' },
      { from: 'protabbr' },
      { from: 'protaddr' },
      { from: 'custno' },
      { from: 'custabbr' }
    ]"
    :search-text="formData.protno"
    @pick="searchProtPick"
  />
  <pick-payterm
    v-model="pickPaytermDS"
    v-model:form="formData"
    :setting="[{ from: 'content1', to: 'payment1' }]"
  />
  <pick-havedate
    v-model="pickHavedateDS"
    v-model:form="formData"
    :setting="[{ from: 'content1', to: 'valdate' }]"
  />
  <pick-memo
    v-model="pickMemoDS"
    v-model:form="formData"
    :setting="[{ from: 'content1', to: 'memo1' }]"
  />
  <pickItem
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
  />
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
  <search-item
    v-model="searcItemDS"
    v-model:form="sqtedetList"
    v-model:keyenter="detKeyenterItem"
    :setting="[
      { from: 'itemno' },
      { from: 'itemname' },
      { from: 'stkunit', to: 'unit' },
      { from: 'stksalpc', to: 'price' },
      { from: 'mkindname', to: 'mkindno1' }
    ]"
    :row="detSearchItemRow"
    :search-text="detSearchItemText"
    @pick="sqtedetItemPick"
  />
  <prot-trade
    v-model="protTradeDS"
    :title="protTradeTitle"
    :itemno="protTradeItemno"
    :protno="protTradeProtno"
  />
</template>

<style scoped>
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

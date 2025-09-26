<script lang="ts" setup>
  import { ref, onMounted, computed, toValue, watch } from 'vue'
  import { cButton, cInput, cSelect, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { GenerateRec } from '@/utils/ucommon'
  import { useMiscExpenseStore } from '@/store/miscexpense'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import Filter from './components/WorkLogEntryFilter.vue'
  import Print from './components/WorkLogEntryPrint.vue'
  import { projectType } from '@/components/ProjectType'
  import ProtStart from '@/views/Analytics/composable/Prot/ProtStart.vue'
  import SuppStart from '@/views/Analytics/composable/Supp/SuppStart.vue'
  import SkillStart from '@/views/Analytics/composable/Skill/SkillStart.vue'
  const store = useMiscExpenseStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const formDataHead = ref<Record<string, any>>({})
  const formDataBody = ref<any[]>([])
  const climate = ref([
    { value: 1, text: '晴天' },
    { value: 2, text: '雨天' },
    { value: 3, text: '陰天' },
    { value: 4, text: '颱風' }
  ])
  const tabpage = ref('normal') //頁籤
  // utils/keyno.ts
  const newKeyno = () =>
    typeof globalThis !== 'undefined' && (globalThis as any)?.crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
  // 當天日期
  const rocToday = (d = new Date()) => {
    if (store.action === 'create' || store.action === 'copy') {
      const y = d.getFullYear() - 1911
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${String(y).padStart(3, '0')}${m}${day}` // 例如 1140917
    } else {
      return ''
    }
  }
  // 乾淨的表頭
  const newHead = () => ({
    keyno: newKeyno(),
    dno: '',
    date1: rocToday(), // 顯示今天
    mclimate: null,
    aclimate: null,
    protno: '',
    protabbr: '',
    custno: '',
    custabbr: '',
    category: '',
    meeting1: '',
    meeting2: '',
    review1: '',
    review2: '',
    instrument: '',
    others: ''
  })

  // 乾淨的一筆明細（如果要預帶一列，留著；不想預帶就回傳空陣列）
  const newBodyRow = () => ({
    keyno: newKeyno(),
    rec1: '',
    suppno: '',
    suppabbr: '',
    recording: '',
    sno: '',
    ptotal: null,
    hjobs: 0,
    hovertime: 0,
    percentage: '',
    sysname1: '',
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
    species: '',
    speciesno: ''
  })

  const ensureKeynos = () => {
    if (!formDataHead.value?.keyno) formDataHead.value.keyno = newKeyno()
    const seen = new Set<string>()
    formDataBody.value = (Array.isArray(formDataBody.value) ? formDataBody.value : []).map((r) => {
      let k = r?.keyno
      if (!k || seen.has(k)) k = newKeyno() // 沒有或撞號就換一個
      seen.add(k)
      return { ...r, keyno: k }
    })
  }
  ensureKeynos()

  const exesdetTable = ref()
  //下拉選單
  const unitDDL = ref<{ content1: string }[]>([])
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
    if (store.dno) {
      callApi({
        method: 'GET',
        url: api.WorkLogEntry.SearchOne,
        params: { dno: store.dno }
      }).then((res) => {
        if (res.status === 200) {
          formDataHead.value = { ...res.data.head }
          formDataBody.value = Array.isArray(res.data.body) ? res.data.body : []
        }
      })
    }
  }
  //Renew
  const getRenewData = () => {
    formData.value = {} // 其他頭部/稽核欄位若有就視需要補
    formDataHead.value = newHead()
    formDataBody.value = [newBodyRow()] // 若想預帶一列： [newBodyRow()]
    // 如果有選取狀態/彈窗/暫存也一併清
    exesdetTable.value?.clearSelection?.()
    tabpage.value = 'normal'
  }

  //首筆/上一筆/下一筆/尾筆
  const dnoChange = (type: 'first' | 'previous' | 'next' | 'last') => {
    if (['first', 'previous', 'next', 'last'].includes(type)) {
      store?.[type]?.()
      getSingleData()
    }
  }
  //新增
  const create = () => {
    store.create()
    getRenewData()
  }
  //編輯
  const edit = () => {
    store.edit()
  }
  //複製
  const copy = () => {
    // 其他欄位沿用，keyno 換新
    formDataHead.value.keyno = newKeyno()
    // 每列明細也換新 keyno
    formDataBody.value = formDataBody.value.map((r) => ({ ...r, keyno: newKeyno() }))
    store.copy()
  }
  //刪除
  const del = () => {
    if (store.dno) {
      message.confirm({
        type: 'question',
        message: `確定要刪除「${store.dno}」雜支單？`,
        onConfirm: () => {
          //刪除
          callApi({
            method: 'POST',
            url: api.Exes.Exes_Del,
            data: { dno: store.dno }
          }).then((res) => {
            if (res?.status === 200) {
              const data = res?.data
              if (data === '') {
                message.alert({
                  type: 'success',
                  message: '刪除成功',
                  autoClose: 2,
                  onConfirm: () => {
                    const val = store.dno as string
                    if (!store.isFirst) dnoChange('previous')
                    else if (!store.isLast) dnoChange('next')
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
    const missing = []
    if (!String(formDataHead.value?.protno || '').trim()) missing.push('工程編號')
    if (!String(formDataHead.value?.date1 || '').trim()) missing.push('日誌日期(民國7碼)')
    return missing.length ? `${missing.join('、')} 不可為空白` : ''
  }

  //送出存檔
  const saveData = () => {
    const S = (v: any) => (v === undefined || v === null ? '' : String(v).trim())
    const N = (v: any) => (v === null ? null : Number.isFinite(+v) ? +v : null)

    const h = formDataHead.value || {}
    const head = {
      keyno: S(h.keyno),
      date1: S(h.date1),
      date2: S(h.date2) || '',
      date3: S(h.date3) || '',
      protno: S(h.protno),
      protabbr: S(h.protabbr),
      custno: S(h.custno),
      custabbr: S(h.custabbr),
      category: S(h.category),
      meeting1: S(h.meeting1),
      meeting2: S(h.meeting2),
      review1: S(h.review1),
      review2: S(h.review2),
      instrument: S(h.instrument),
      others: S(h.others),
      a_user: S(h.a_user),
      m_user: S(h.m_user),
      execflag: Boolean(h.execflag ?? false),
      mclimate: N(h.mclimate),
      aclimate: N(h.aclimate),

      pempno: S(h.pempno),
      pempabbr: S(h.pempabbr),
      bempno: S(h.bempno),
      bempabbr: S(h.bempabbr)
    }

    // ...其餘 body 組裝沿用你現在的版本
    const rows = Array.isArray(formDataBody.value) ? formDataBody.value : []
    const body = rows.map((r: any) => ({
      keyno: S(r?.keyno),
      rec1: S(r?.rec1),
      suppno: S(r?.suppno),
      suppabbr: S(r?.suppabbr),
      recording: S(r?.recording),
      sno: S(r?.sno),
      ptotal: r?.ptotal === null ? null : Number.isFinite(+r?.ptotal) ? +r.ptotal : null,
      hjobs: Number.isFinite(+r?.hjobs) ? +r.hjobs : 0,
      hovertime: Number.isFinite(+r?.hovertime) ? +r.hovertime : 0,
      percentage: S(r?.percentage),
      sysname1: S(r?.sysname1),
      pjt1: S(r?.pjt1),
      pjt2: S(r?.pjt2),
      pjt3: S(r?.pjt3),
      pjt4: S(r?.pjt4),
      pjt5: S(r?.pjt5),
      pjt6: S(r?.pjt6),
      pjt7: S(r?.pjt7),
      pjt8: S(r?.pjt8),
      pjt9: S(r?.pjt9),
      pjt10: S(r?.pjt10),
      species: S(r?.species),
      speciesno: S(r?.speciesno)
    }))

    const payload = { head, body }
    console.log('[payload]', JSON.stringify(payload, null, 2))
    return payload
  }

  // 新增or修改 邏輯
  const callSaveApi = async () => {
    const URL = store.action === 'create' ? api.WorkLogEntry.Add : api.WorkLogEntry.Set
    const payload = saveData()
    try {
      const res: any = await callApi({ method: 'POST', url: URL, data: payload })
      if (res?.status === 200) {
        // 從回傳拿 dno（有些後端是 res.data.data.head.dno）
        const dno = res?.data?.data?.head?.dno ?? res?.data?.head?.dno ?? res?.data?.dno ?? null
        if (dno) {
          store.dno = dno
          if (!store.list.some((x) => x.dno === dno)) store.list.push({ dno })
          await getSingleData()
          store.browse?.(router)
        }
        message.alert({ type: 'success', message: '存檔成功', autoClose: 2 })
      }
    } catch (e) {
      console.error(e)
      message.alert({ type: 'error', message: '存檔發生錯誤，請稍後再試' })
    }
  }

  const handleSave = () => {
    const warn = checkData()
    if (warn) {
      message.alert({ type: 'warning', message: warn })
      return
    }
    message.confirm({
      type: 'question',
      message: '確定要送出資料？',
      onConfirm: () => {
        callSaveApi()
      }
    })
  }
  // 表格新增
  const exesdetAdd = () => {
    formDataBody.value.push(newBodyRow())
  }
  // 表格插入
  const exesdetIns = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    const idx =
      typeof selectIndex === 'number' && selectIndex >= 0 ? selectIndex : formDataBody.value.length
    formDataBody.value.splice(idx, 0, newBodyRow())
    GenerateRec(formDataBody.value)
  }

  //表身表格-規格說明
  const exesdetProType = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      pjtDS.value = true
    }
  }

  //查詢條件
  const filterDS = ref(false)
  // 把陣列轉物件
  const toList = (arr: string[] | { dno?: string }[]) =>
    arr.map((x: any) => (typeof x === 'string' ? { dno: x } : { dno: x.dno ?? '' }))

  const initSearch = (data) => {
    if (Array.isArray(data)) {
      store.init(toList(data))
      store.dno = store.list[0]?.dno || ''
    }
    if (store.dno) getSingleData()
  }
  const handleSearch = (data) => {
    store.search(router, data)
  }

  //規格說明彈窗
  const pjtDS = ref(false)
  const pjtItems = computed(() => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        formDataBody.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      formDataBody.value[selectIndex].pjt1 = data.pjt1
      formDataBody.value[selectIndex].pjt2 = data.pjt2
      formDataBody.value[selectIndex].pjt3 = data.pjt3
      formDataBody.value[selectIndex].pjt4 = data.pjt4
      formDataBody.value[selectIndex].pjt5 = data.pjt5
      formDataBody.value[selectIndex].pjt6 = data.pjt6
      formDataBody.value[selectIndex].pjt7 = data.pjt7
      formDataBody.value[selectIndex].pjt8 = data.pjt8
      formDataBody.value[selectIndex].pjt9 = data.pjt9
      formDataBody.value[selectIndex].pjt10 = data.pjt10
    }
  }

  //列印
  const printDS = ref(false)
  const printOpen = () => {
    if (store.dno) {
      printDS.value = true
    }
  }

  onMounted(() => {
    //抓下拉選單
    getUnitApi()
  })

  // 新增模式-把抓到的值回填進業主編號/簡稱/工程簡稱
  const pickedProt = ref<any>(null)
  watch(pickedProt, (row) => {
    if (!row) return
    formDataHead.value.custno = row.custno
    formDataHead.value.custabbr = row.custabbr
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
          @click="dnoChange('first')"
        >
          首筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angle-left"
          :disabled="store.isFirst"
          @click="dnoChange('previous')"
        >
          上一筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angle-right"
          :disabled="store.isLast"
          @click="dnoChange('next')"
        >
          下一筆
        </c-button>
      </div>
      <div class="col-auto">
        <c-button
          kind="record"
          icon="fa-solid fa-angles-right"
          :disabled="store.isLast"
          @click="dnoChange('last')"
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
      <v-tab value="normal">日誌資料</v-tab>
      <v-tab value="image">圖片檔案</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formDataHead.dno"
                label="日誌單號"
                icon="fa-solid fa-file-lines"
                disabled
                :maxlength="14"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formDataHead.date1"
                label="日誌日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-select
                v-model="formDataHead.mclimate"
                :items="climate"
                item-title="text"
                label="上午天氣"
                icon="fa-solid fa-sun"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-select
                v-model="formDataHead.aclimate"
                :items="climate"
                item-title="text"
                label="下午天氣"
                icon="fa-solid fa-cloud-sun"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <ProtStart
                v-model="formDataHead.protno"
                v-model:abbr="formDataHead.protabbr"
                v-model:all="pickedProt"
                :disabled="store.isDetail"
                label="工程編號"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formDataHead.protabbr"
                label="工程簡稱"
                :disabled="true"
                icon="fa-solid fa-helmet-safety"
                width="600"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formDataHead.custno"
                :disabled="true"
                icon="fa-solid fa-user"
                label="業主編號"
                width="300"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formDataHead.custabbr"
                label="業主簡稱"
                icon="fa-solid fa-user"
                :disabled="true"
                width="445"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formDataHead.category"
                label="項目"
                icon="fa-solid fa-list-check"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.meeting1"
                label="會議內容"
                icon="fa-solid fa-handshake"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.meeting2"
                label="會議內容"
                icon="fa-solid fa-handshake"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.review1"
                label="圖面檢討"
                icon="fa-solid fa-file-pen"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.review2"
                label="圖面檢討"
                icon="fa-solid fa-file-pen"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.instrument"
                label="文書作業"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="text"
                v-model="formDataHead.others"
                label="其他"
                icon="fa-solid fa-ellipsis"
                :disabled="store.isDetail"
                :format="{ thousands: true }"
                :maxlength="30"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="image"></v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
  <!-- 底部建檔人員/日期/修改 -->
  <audit-info
    class="mt-2"
    v-if="store.action === 'edit' || store.action === 'detail'"
    :a_date="formDataHead.a_date1"
    :a_user="formDataHead.a_user"
    :m_date="formDataHead.m_date"
    :m_user="formDataHead.m_user"
  />
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
          <c-button kind="delete" icon="fa-solid fa-trash">刪除</c-button>
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
        v-model="formDataBody"
        striped="even"
        hover
        height="340"
        fixed-header
        selectable
        layout="fixed"
        header-align="center"
      >
        <template v-slot:head>
          <th width="240">廠商編號</th>
          <th>廠商簡稱</th>
          <th>出工內容記錄</th>
          <th>工種編號</th>
          <th>工種名稱</th>
          <th>人數</th>
          <th>說明</th>
        </template>
        <template v-slot:body="{ scope, index }">
          <td>
            <SuppStart
              v-model="scope.suppno"
              v-model:abbr="scope.suppabbr"
              :disabled="store.isDetail"
              label=""
              :width="230"
            />
          </td>
          <td>
            <c-input
              v-model="scope.suppabbr"
              :disabled="true"
              :maxlength="100"
              :length-auto-width="false"
              condensed
            />
          </td>
          <td>
            <c-input
              v-model="scope.recording"
              :disabled="store.isDetail"
              :maxlength="16"
              :length-auto-width="false"
              condensed
            />
          </td>
          <td>
            <SkillStart
              v-model="scope.speciesno"
              v-model:abbr="scope.species"
              :disabled="store.isDetail"
              label=""
              :width="230"
            />
          </td>
          <td>
            <c-input
              v-model="scope.species"
              :disabled="true"
              :format="{ thousands: true, decimal: true, decAfterN: 3 }"
              :maxlength="12"
              :length-auto-width="false"
            />
          </td>
          <td>
            <c-input
              v-model="scope.ptotal"
              :disabled="store.isDetail"
              :format="{ thousands: true, decimal: true, decAfterN: 3 }"
              :maxlength="12"
              :length-auto-width="false"
            />
          </td>
          <td>
            <c-input
              v-model="scope.sno"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="12"
              :length-auto-width="false"
            />
          </td>
        </template>
      </c-table>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" @init="initSearch" @search="handleSearch" />
  <project-type
    v-model="pjtDS"
    :items="pjtItems"
    @save="handlePJTsave"
    :disabled="store.isDetail"
  />
  <Print v-model="printDS" :no="`${store.dno}`" />
</template>

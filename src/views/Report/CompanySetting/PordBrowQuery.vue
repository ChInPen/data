<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cButton, cInput, cBread } from '@/components/Common' // 匯入自定義的UI元件
  import { searchSupp } from '@/components/SearchSupp' // 廠商彈窗元件查詢
  import { searchItem } from '@/components/SearchItem' // 工料彈窗元件查詢
  import { searchProt } from '@/components/SearchProt' // 工程彈窗元件查詢
  import MultiItem from './Components/MultiItem.vue' // 工料彈窗(多選)
  import MultiProt from './Components/MultiProt.vue' // 工程彈窗(多選)
  import { callApi } from '@/utils/uapi' // 呼叫api的方法
  import api from '@/api' // api清單
  import { useSearchSupp } from '@/store/searchSupp'
  const storeSupp = useSearchSupp()
  import { useSearchItem } from '@/store/searchItem'
  const storeItem = useSearchItem()
  import { useSearchProt } from '@/store/searchProt'
  const storeProt = useSearchProt()

  // 表單/列印/EXCEL
  const formData = ref({
    dates: {
      begin: '', // 開始時間
      end: '' // 結束
    },
    suppNOs: {
      begin: '', // 廠商編號開始
      end: '', // 廠商編號結束
      limiteds: [] as string[] // 廠商編號多選
    },
    itemNOs: {
      begin: '', // 工料編號開始
      end: '', // 工料編號結束
      limiteds: [] as string[] // 工料編號多選
    },
    protNOs: {
      begin: '', // 工程編號開始
      end: '', // 工程編號結束
      limiteds: [] as string[] // 工程編號多選
    },
    pagination: {
      start: 0,
      length: 10,
      draw: 1
    },
    descrip: '',
    porddetmo1: '', // 採購自定一
    payment1: '', // 付款條件
    feetNo: '05', // 表尾註腳編號
    printType: '' // 報表內容
  })

  // ===== 廠商選單 / 多選控制 =====
  const suppPickOpen = ref()
  const MultiSuppDs = ref(false)
  const isMultiSupp = ref(false)

  const openSuppPicker = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeSupp.set(formData.value.suppNOs, [{ from: 'suppno', to: toKey }], {
      open: suppPickOpen.value?.open
    })
  }

  const onMultiSuppPicks = (rows: any[]) => {
    formData.value.suppNOs.limiteds = rows.map((r) => String(r.suppno).trim()).filter(Boolean)
    isMultiSupp.value = formData.value.suppNOs.limiteds.length > 0
    formData.value.suppNOs.begin = ''
    formData.value.suppNOs.end = ''
  }

  // ===== 工料單選 / 多選控制 =====
  const itemPickOpen = ref()
  const MulitItemDs = ref(false)
  const isMultiItem = ref(false)

  const openItemPicker = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeItem.set(formData.value.itemNOs, [{ from: 'itemno', to: toKey }], {
      open: itemPickOpen.value?.open
    })
  }

  const onMulitItemPicks = (rows: any[]) => {
    formData.value.itemNOs.limiteds = rows.map((r) => String(r.itemno).trim()).filter(Boolean)
    isMultiItem.value = formData.value.itemNOs.limiteds.length > 0
    formData.value.itemNOs.begin = ''
    formData.value.itemNOs.end = ''
  }

  // ===== 工程單選 / 多選控制 =====
  const projectPickOpen = ref()
  const MulitProtDs = ref(false)
  const isMultiProt = ref(false)

  const openProjectPicked = (t: 'from' | 'to') => {
    const toKey = t === 'from' ? 'begin' : 'end'
    storeProt.set(formData.value.protNOs, [{ from: 'protno', to: toKey }], {
      open: projectPickOpen.value?.open
    })
  }

  const onMulitProtPicks = (rows: any[]) => {
    formData.value.protNOs.limiteds = rows.map((r) => String(r.protno).trim()).filter(Boolean)
    isMultiProt.value = formData.value.protNOs.limiteds.length > 0
    formData.value.protNOs.begin = ''
    formData.value.protNOs.end = ''
  }

  // ===== 列印作業 =====
  const handlePrint = async () => {
    try {
      const res = await callApi({
        method: 'POST',
        url: api.SqteBrow.Print,
        data: formData.value
      })

      if (res?.data?.state === 'fail' && res?.data?.msg === '查無資料') {
        alert('查無資料，請更換條件再試')
        return
      }

      const path = String(res.data).trim()
      if (typeof path === 'string' && path.startsWith('PDF')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        const w = window.open(fileURL)
        if (!w) {
          const link = document.createElement('a')
          link.href = fileURL
          link.download = path.split('/').pop() || 'download.pdf'
          link.click()
        }
      } else {
        console.warn('沒有取得檔名', res.data)
      }
    } catch (err) {
      console.error('列印失敗：', err)
    }
  }

  // ===== EXCEL下載 =====
  const handleExportExcel = async () => {
    try {
      const res = await callApi({
        method: 'POST',
        url: api.SqteBrow.Excel,
        data: formData.value
      })

      const path = String(res).trim()
      if (typeof path === 'string' && path.startsWith('Excel')) {
        const fileURL = new URL(path, 'http://192.168.0.107:8096/').href
        const filename = decodeURIComponent(path.split('/').pop() || 'download.xlsx')
        const a = document.createElement('a')
        a.href = fileURL
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        console.warn('沒有取得檔名')
      }
    } catch (err) {
      console.error('EXCEL下載失敗：', err)
    }
  }

  // ===== 共用過濾 =====
  const alnumN = (v: any, n: number, toUpper = true) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }

  // ===== v-model 綁定 =====
  // 廠商
  const suppNoFromModel = computed({
    get: () => formData.value.suppNOs.begin,
    set: (val) => (formData.value.suppNOs.begin = alnumN(val, 8))
  })
  const suppNoToModel = computed({
    get: () => formData.value.suppNOs.end,
    set: (val) => (formData.value.suppNOs.end = alnumN(val, 10))
  })
  // 工料
  const itemNoFromModel = computed({
    get: () => formData.value.itemNOs.begin,
    set: (val) => (formData.value.itemNOs.begin = alnumN(val, 20))
  })
  const itemNoToModel = computed({
    get: () => formData.value.itemNOs.end,
    set: (val) => (formData.value.itemNOs.end = alnumN(val, 20))
  })
  // 工程
  const projectNoFromModel = computed({
    get: () => formData.value.protNOs.begin,
    set: (val) => (formData.value.protNOs.begin = alnumN(val, 16))
  })
  const projectNoToModel = computed({
    get: () => formData.value.protNOs.end,
    set: (val) => (formData.value.protNOs.end = alnumN(val, 16))
  })
</script>

<template>
  <!-- 操作按鈕區 -->
  <c-bread>
    <v-row justify="end" class="ma-0">
      <v-col cols="auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="handlePrint">列印</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="create" icon="fa-solid fa-file-excel" @click="handleExportExcel">
          匯出Excel
        </c-button>
      </v-col>
    </v-row>
  </c-bread>

  <!-- 查詢表單 (只列廠商為例，其餘照你原本補齊) -->
  <v-card color="#1b2b36" rounded="lg" class="mt-4 sqte-form" elevation="2">
    <v-card-text class="pa-6">
      <!-- 廠商編號區間 -->
      <v-row align="center" class="mb-4" dense>
        <v-col cols="11">
          <v-row align="center">
            <v-col md="3" class="col4-min">
              <c-input
                v-model="suppNoFromModel"
                label="廠商編號"
                :disabled="isMultiSupp"
                :maxlength="8"
                density="compact"
                @button="openSuppPicker('from')"
              />
            </v-col>
            <v-col cols="1" class="text-center">
              <span class="text-h5 text-grey-lighten-1">～</span>
            </v-col>
            <v-col cols="auto">
              <c-input
                v-model="suppNoToModel"
                label="廠商編號"
                :disabled="isMultiSupp"
                :maxlength="10"
                density="compact"
                @button="openSuppPicker('to')"
              />
            </v-col>
            <v-col cols="auto">
              <c-button
                kind="search"
                icon="fa-solid fa-magnifying-glass"
                @click="MultiSuppDs = true"
              >
                多選式
              </c-button>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!-- 彈窗元件 -->
  <search-supp ref="suppPickOpen" @pick="storeSupp.pick" />
  <search-item ref="itemPickOpen" @pick="storeItem.pick" />
  <search-prot ref="projectPickOpen" @pick="storeProt.pick" />
  <Multi-supp v-model="MultiSuppDs" @pick="onMultiSuppPicks" />
  <Multi-item v-model="MulitItemDs" @pick="onMulitItemPicks" />
  <Multi-prot v-model="MulitProtDs" @pick="onMulitProtPicks" />
</template>

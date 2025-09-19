<script lang="ts" setup>
  import { ref, onMounted, watch, computed, watchEffect } from 'vue'
  import { cButton, cInput, cBread, cDivider } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useEmpLoanStore } from '@/store/empLoan'
  import { useRouter } from 'vue-router'
  import { message } from '@/components/Message/service'
  import { auditInfo } from '@/components/AuditInfo'
  import { searchEmp } from '@/components/SearchEmp'
  const store = useEmpLoanStore()
  const router = useRouter()
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
  const formData = ref<Record<string, any>>({
    bno: '',
    date1: '',
    empno: '',
    empname: '',
    borrpr: null,
    descrip: '',
    empokno: '',
    empokname: '',
    empacno: '',
    empacname: '',
    memo1: '',
    embud1: '',
    embud2: '',
    a_date: rocToday(),
    a_user: '', //這邊想要自動帶入建檔人員的名子，是要登入狀態的人
    m_date: '',
    m_user: '',
    emmo1: '',
    emmo2: '',
    emmo3: 0,
    execflag: 0,
    acno: '',
    ssno: ''
  })
  // 頁面載入後執行
  onMounted(() => {
    getEmpApi()
    if (store.action === 'edit' || store.action === 'copy' || store.action === 'detail') {
      getEmpSingleApi(store.bno) //要取得bno
    }
  })
  const getEmpSingleApi = async (bno: string) => {
    try {
      const res: any = await callApi({
        method: 'POST',
        url: api.EmpLoan.SearchOen,
        data: {
          bno: bno
        }
      })
      console.log(res.data)
      formData.value = res.data
      if (store.action === 'copy') {
        formData.value.bno = ''
      }
    } catch (error) {}
  }
  //取消&返回 按鈕
  const handleCancel = () => {
    router.push({ path: '/menu/EmpLoan' })
  }
  //人員資料
  // 抓取員工所有資料
  const employeeDDL = ref<{ empno: string; empname: string }[]>([])
  const getEmpApi = async () => {
    const res: any = await callApi({ method: 'POST', url: api.Emp.Emp_ListSimple })
    if (res?.status === 200 && Array.isArray(res?.data)) {
      employeeDDL.value = res.data.map(({ empno, empname }: any) => ({ empno, empname }))
    }
  }

  // 人員編號
  const searchRef = ref()
  const isEnter = ref(false)
  const pickSetting = ref()
  const searchText = ref('')
  // 人員編號挑選
  const searchItemOpen = (to: 'empno' | 'empokno' | 'empacno') => {
    if (to === 'empno') {
      pickSetting.value = [
        { from: 'empno', to: 'empno' },
        { from: 'empname', to: 'empname' }
      ]
    }
    if (to === 'empokno') {
      pickSetting.value = [
        { from: 'empno', to: 'empokno' },
        { from: 'empname', to: 'empokname' }
      ]
    }
    if (to === 'empacno') {
      pickSetting.value = [
        { from: 'empno', to: 'empacno' },
        { from: 'empname', to: 'empacname' }
      ]
    }
    searchRef.value?.open()
  }

  const searchItemEnter = (to: 'empno' | 'empokno' | 'empacno') => {
    if (to === 'empno') {
      pickSetting.value = [
        { from: 'empno', to: 'empno' },
        { from: 'empname', to: 'empname' }
      ]
    }
    if (to === 'empokno') {
      pickSetting.value = [
        { from: 'empno', to: 'empokno' },
        { from: 'empname', to: 'empokname' }
      ]
    }
    if (to === 'empacno') {
      pickSetting.value = [
        { from: 'empno', to: 'empacno' },
        { from: 'empname', to: 'empacname' }
      ]
    }
    isEnter.value = true
    searchText.value = formData.value?.[to] ?? ''
    searchRef.value?.open()
  }

  // 顯示用格式器（千分位）
  const nf = new Intl.NumberFormat('zh-TW')
  // 金額限制
  const MAX_AMOUNT = 1_000_000
  // 控制是否正在編輯金額
  const isAmtEditing = ref(false)
  // 借支金額
  const borrprIO = computed({
    get: () => {
      const v = formData.value.borrpr
      if (v === '' || v === null || v === undefined) return ''
      return isAmtEditing.value ? String(v) : nf.format(Number(v))
    },
    set: (raw) => {
      const digits = String(raw ?? '').replace(/\D/g, '')
      if (!digits) {
        formData.value.borrpr = ''
        return
      }
      const n = Math.min(Number(digits), MAX_AMOUNT)
      formData.value.borrpr = Number.isFinite(n) ? n : ''
    }
  })

  // 讓編號跟姓名跟著連動
  const linkCodeName = (codeKey: string, nameKey: string) => {
    watchEffect(() => {
      const code = String(formData.value?.[codeKey] ?? '').trim()
      if (!code) {
        formData.value[nameKey] = ''
        return
      }
      const hit = employeeDDL.value?.find?.((x) => x.empno === code)
      formData.value[nameKey] = hit?.empname ?? ''
    })
  }
  linkCodeName('empno', 'empname') // 主員工
  linkCodeName('empokno', 'empokname') // 核可人員
  linkCodeName('empacno', 'empacname') // 出納人員

  // ==============格式判斷==============

  // 判斷空白（字串會 trim）
  const isBlank = (v: any) =>
    v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

  // 必填欄位清單（想調整就改這個陣列）
  const REQUIRED_FIELDS = [
    { key: 'date1', label: '借支日期' },
    { key: 'empno', label: '員工編號' },
    { key: 'empname', label: '員工名稱' },
    { key: 'borrpr', label: '借支金額' },
    { key: 'descrip', label: '借支原因' },
    { key: 'empacno', label: '出納人員編號' },
    { key: 'empokname', label: '出納人員名稱' },
    { key: 'empokno', label: '核可人員編號' },
    { key: 'empacname', label: '核可人員名稱' }
  ] as const

  // 檢查必填 + 型別/格式
  const validateRequiredAndFormat = () => {
    // 1) 必填
    const missing = REQUIRED_FIELDS.filter(({ key }) =>
      isBlank(formData.value?.[key as string])
    ).map((x) => x.label)

    if (missing.length) {
      return `${missing.join('、')} 不可為空白`
    }

    // 2) 金額：大於 0 的整數
    const amt = formData.value?.borrpr
    if (!Number.isInteger(amt) || amt <= 0) {
      return '借支金額必須為大於 0 的整數'
    }
    return '' // 通過
  }
  // 確認員工編號是否存在
  const employeeExists = async (empno: string) => {
    const code = String(empno ?? '').trim()
    if (!code) return false
    if (employeeDDL.value.some((e) => e.empno === code)) return true
    try {
      const res: any = await callApi({
        method: 'POST',
        url: api.Emp.Emp_GetSingle,
        data: { empno: code }
      })
      return res?.status === 200 && !!res?.data?.empno
    } catch {
      return false
    }
  }

  // 送出表單
  const handleSave = async () => {
    console.log('json', JSON.stringify(formData.value, null, 2))
    const msg = validateRequiredAndFormat()
    if (msg) {
      message.alert({ type: 'warning', message: msg })
      return
    }
    const targets: Array<{ key: 'empno' | 'empokno' | 'empacno'; label: string }> = [
      { key: 'empno', label: '員工編號' },
      { key: 'empokno', label: '核可人員編號' },
      { key: 'empacno', label: '出納人員編號' }
    ]
    for (const { key, label } of targets) {
      const ok = await employeeExists(formData.value?.[key])
      if (!ok) {
        message.alert({
          type: 'warning',
          message: `${label}（${formData.value?.[key] || '未填'}）不存在，請重新選擇或確認`
        })
        return
      }
    }
    message.confirm({
      type: 'question',
      message: '確定要送出借支資料？',
      onConfirm: async () => {
        console.log('payload', JSON.stringify(formData.value, null, 2))
        if (store.action === 'edit') formData.value.m_date = rocToday()
        const apiUrl = store.action === 'edit' ? api.EmpLoan.UPDATE : api.EmpLoan.Add
        const method = store.action === 'edit' ? 'PUT' : 'POST'
        try {
          const res = await callApi({
            method: method,
            url: apiUrl,
            data: formData.value
          })
          console.log('res', res.status)
          if (res.status === 200) {
            message.alert({ type: 'success', message: '送出成功' })
            handleCancel()
          }
        } catch (error) {
          console.error(error)
        }
      }
    })
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
      <c-divider>基本資料</c-divider>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.date1"
            label="借支日期"
            icon="fa-solid fa-calendar-day"
            :disabled="store.keyDisabled"
            :maxlength="10"
            type="date"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.bno"
            label="借支單號"
            icon="fa-solid fa-receipt"
            :maxlength="16"
            disabled
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empno"
            label="員工編號"
            icon="fa-solid fa-user-tag"
            :disabled="store.isDetail"
            :maxlength="10"
            @button="searchItemOpen('empno')"
            @keyEnter="searchItemEnter('empno')"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empname"
            label="員工名稱"
            icon="fa-solid fa-user"
            disabled
            :maxlength="10"
          />
        </v-col>
      </v-row>
      <c-divider class="mt-3">金額</c-divider>
      <v-row dense class="mt-2">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="borrprIO"
            label="借支金額"
            icon="fa-solid fa-money-bill"
            :disabled="store.isDetail"
            :maxlength="12"
            type="text"
            @focus="isAmtEditing = true"
            @blur="isAmtEditing = false"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.descrip"
            label="借支原因"
            icon="fa-solid fa-note-sticky"
            :disabled="store.isDetail"
            width="600"
          />
        </v-col>
      </v-row>
      <c-divider class="mt-3">簽核</c-divider>
      <v-row dense class="mt-2">
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empokno"
            label="核可人員"
            icon="fa-solid fa-user-tag"
            :disabled="store.isDetail"
            :maxlength="10"
            @button="searchItemOpen('empokno')"
            @keyEnter="searchItemEnter('empokno')"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empokname"
            label="員工名稱"
            icon="fa-solid fa-user"
            disabled
            :maxlength="10"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empacno"
            label="出納人員"
            icon="fa-solid fa-user-tag"
            :disabled="store.isDetail"
            :maxlength="10"
            @button="searchItemOpen('empacno')"
            @keyEnter="searchItemEnter('empacno')"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empacname"
            label="員工名稱"
            icon="fa-solid fa-user"
            disabled
            :maxlength="10"
          />
        </v-col>
      </v-row>
      <v-responsive width="100%" />
      <c-divider class="mt-3">其他</c-divider>
      <v-row dense class="mt-2">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.memo1"
            label="備註"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
            width="1015"
          />
        </v-col>
        <v-responsive width="100%" />

        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.embud1"
            label="借支自訂一"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
            width="500"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.embud2"
            label="借支自訂二"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
            width="500"
          />
        </v-col>
        <v-col cols="1" class="px-2"></v-col>
      </v-row>
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
  <!-- 單選彈窗 -->
  <searchEmp
    ref="searchRef"
    v-model:form="formData"
    v-model:keyenter="isEnter"
    :setting="pickSetting"
    :search-text="searchText"
  />
</template>

<style scoped>
  .div-skill-table {
    width: 690px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
</style>

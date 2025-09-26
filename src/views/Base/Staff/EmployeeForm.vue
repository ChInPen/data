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
  import { DDL } from '@/api/ddl'
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useEmployeeStore } from '@/store/employee'
  import { useRouter } from 'vue-router'
  import { message } from '@/components/Message/service'
  import { pickAddr } from '@/components/PickAddr'
  import { auditInfo } from '@/components/AuditInfo'
  import webPermissions from './Components/EmployeeWeb.vue'

  const store = useEmployeeStore()
  const router = useRouter()
  import { nextTick, watch } from 'vue'
  nextTick(() => {
    watch(
      () => store.action,
      (nv, ov) => {
        if (nv !== ov) {
          console.log('[CHANGE] store.action:', ov, '→', nv)
          console.trace()
        }
      }
    )
  })

  type EmpSkill = {
    //人員工種
    empno: string
    skillno: string
    daytpr: number
    overtime: number
    skillname: string
  }

  //下拉選單
  const departDDL = ref<{ deparno: string; deparname: string }[]>([])
  const employeeDDL = ref<{ empno: string; empname: string }[]>([])
  const skillDDL = ref<{ skillno: string; skillname: string }[]>([])
  const empsexDDL = ref([
    {
      empsex: '1',
      empsexName: '男'
    },
    {
      empsex: '2',
      empsexName: '女'
    }
  ])
  const empmarrDDL = ref([
    {
      empmarr: '1',
      empmarrName: '已婚'
    },
    {
      empmarr: '2',
      empmarrName: '未婚'
    }
  ])

  //人員資料
  const formData = ref<Record<string, any>>({})
  const empSkills = ref<EmpSkill[]>([])

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:empno, empname
    const requiredFields = [
      { key: 'empno', label: '人員編號' },
      { key: 'empname', label: '人員姓名' }
    ]

    let missing = requiredFields
      .filter((field) => !formData.value?.[field.key])
      .map((field) => field.label)
      .join('、')
    if (missing) missing = `${missing}不可為空白`

    //檢查人員工種
    let missing2 = empSkills.value
      .map((s, i) => (!s.skillno ? i + 1 : ''))
      .filter(Boolean)
      .join('、')
    if (missing2) missing2 = `第${missing2}筆工種不可為空白`

    return missing && missing2 ? `${missing}\n${missing2}` : missing || missing2
  }
  //送出存檔
  const saveData = () => {
    const create = { ...formData.value }
    const item = Object.fromEntries(
      Object.keys(create ?? {}).map((key) => [key, create?.[key] ?? ''])
    )
    return {
      emp: item,
      data: empSkills.value.map((x) => ({ ...x, empno: formData.value.empno })),
      empwebparDatas: webPerData.value.map((x) => ({
        ...x,
        empno: formData.value.empno,
        empname: formData.value.empname
      })),
      updatePhotoPath: ''
    }
  }
  const callCreateApi = async () => {
    callApi({
      method: 'POST',
      url: api.Emp.Emp_ADD,
      data: saveData()
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data && data.state === 'success') {
          message.alert({
            type: 'success',
            message: data?.msg ?? '',
            autoClose: 2,
            onConfirm: () => {
              handleCancel()
            }
          })
        }
      }
    })
  }
  const callEditApi = async () => {
    callApi({
      method: 'PUT',
      url: api.Emp.Emp_EDIT,
      data: saveData()
    }).then((res: any) => {
      if (res?.state === 'success') {
        message.alert({
          type: 'success',
          message: res?.msg ?? '',
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
      message: `確定要送出人員資料？`,
      onConfirm: () => {
        if (store.action === 'edit') {
          callEditApi()
        } else {
          callCreateApi()
        }
      }
    })
  }
  //新增工種資料
  const empSkillAdd = () => {
    empSkills.value.push({
      empno: '',
      skillno: '',
      daytpr: 0,
      overtime: 0,
      skillname: ''
    })
  }
  //刪除工種資料
  const empSkillDel = (skill: EmpSkill) => {
    const find = empSkills.value.indexOf(skill)
    if (find >= 0) {
      empSkills.value.splice(find, 1)
    }
  }

  //新增狀態呼叫 Renew api
  const getRenewApi = async () => {
    callApi({
      method: 'GET',
      url: api.Emp.Emp_ReNew
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data ?? {}
        const { emp, empwebparDatas } = data
        if (emp) formData.value = { ...emp }
        if (empwebparDatas && Array.isArray(empwebparDatas)) webPerData.value = empwebparDatas
      }
    })
  }
  //編輯、複製、瀏覽呼叫 api
  const getAllDataApi = async () => {
    //抓人員基本資料
    callApi({
      method: 'POST',
      url: api.Emp.Emp_GetSingle,
      data: { empno: store.empno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data ?? {}
        formData.value = {
          ...data,
          empno: ['edit', 'detail'].includes(store.action) ? (data?.empno ?? '') : ''
        }
      }
    })
    //抓人員工種資料
    callApi({
      method: 'GET',
      url: api.Emp.EmpSkill_List,
      params: { empno: store.empno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data: any[] = res?.data ?? []
        empSkills.value = data
      }
    })
    //抓人員web權限資料
    callApi({
      method: 'GET',
      url: api.Emp.EmpWebPar_List,
      params: { empno: store.empno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data: any[] = res?.data ?? []
        webPerData.value = data
      }
    })
  }

  //起始動作
  onMounted(async () => {
    //抓下拉選單資料
    departDDL.value = await DDL.getDepartDDL()
    employeeDDL.value = await DDL.getEmpDDL()
    skillDDL.value = await DDL.getSkillDDL()
    //抓單筆資料
    if (store.action === 'create') {
      getRenewApi()
    } else if (store.empno) {
      getAllDataApi()
    }
  })

  //彈窗
  const pickAddrDS = ref(false)
  const addrTarget = ref<'zip1' | 'zip2' | ''>('')
  const pickAddr1 = () => {
    addrTarget.value = 'zip1'
    pickAddrDS.value = true
  }
  const pickAddr2 = () => {
    addrTarget.value = 'zip2'
    pickAddrDS.value = true
  }
  const handlePickAddr = (data: any) => {
    if (addrTarget.value === 'zip1') {
      formData.value.ziprec1 = data.rec
      formData.value.zip1 = data.zipno
      formData.value.empaddr1 = data.zipname
    } else if (addrTarget.value === 'zip2') {
      formData.value.ziprec2 = data.rec
      formData.value.zip2 = data.zipno
      formData.value.empaddr2 = data.zipname
    }
  }
  //web權限
  const webPerDs = ref(false)
  const webPerData = ref<any[]>([])
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
      <c-divider>人員基本資料</c-divider>
      <v-row dense class="mt-2" :align="'center'">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empno"
            label="人員編號"
            :is-required="true"
            :disabled="store.keyDisabled"
            :maxlength="10"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empname"
            label="人員姓名"
            :is-required="true"
            :disabled="store.isDetail"
            :maxlength="16"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-select
            v-model="formData.empsex"
            label="性別"
            icon="mdi-gender-male-female"
            :items="empsexDDL"
            item-title="empsexName"
            item-value="empsex"
            hide-search
            :disabled="store.isDetail"
            width="180"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-button color="#388e3c" @click="webPerDs = true">web權限</c-button>
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empidno"
            label="身分證號"
            icon="fa-solid fa-user"
            :disabled="store.isDetail"
            :format="{ number: true, english: true }"
            :maxlength="10"
            :length-auto-width="false"
            width="281"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.empbirth1"
            label="出生日期"
            icon="fa-solid fa-calendar-day"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-select
            v-model="formData.empmarr"
            label="婚姻狀況"
            icon="fa-solid fa-heart"
            :items="empmarrDDL"
            item-title="empmarrName"
            item-value="empmarr"
            hide-search
            :disabled="store.isDetail"
            width="230"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.password1"
            label="密碼"
            icon="fa-solid fa-unlock-keyhole"
            :disabled="store.isDetail"
            :format="{ number: true, english: true }"
            :maxlength="16"
          />
        </v-col>
      </v-row>
      <c-divider class="mt-3">聯絡資訊</c-divider>
      <v-row dense class="mt-2">
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.tel1"
            label="聯絡電話"
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
            type="date"
            v-model="formData.duedate1"
            label="到職日期"
            icon="fa-solid fa-calendar-day"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empper"
            label="緊急聯絡人"
            icon="fa-solid fa-user"
            :disabled="store.isDetail"
            :maxlength="16"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.tel2"
            label="緊急聯絡電話"
            icon="fa-solid fa-phone-volume"
            :disabled="store.isDetail"
            :maxlength="20"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="date"
            v-model="formData.resdate1"
            label="離職日期"
            icon="fa-solid fa-calendar-day"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.zip1"
            label="郵遞區號"
            icon="fa-solid fa-location-dot"
            :format="{ number: true }"
            :disabled="store.isDetail"
            :readonly="!store.isDetail"
            @button="pickAddr1"
            :maxlength="6"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empaddr1"
            label="戶籍地址"
            icon="fa-solid fa-location-dot"
            :disabled="store.isDetail"
            :maxlength="60"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.zip2"
            label="郵遞區號"
            icon="fa-solid fa-location-dot"
            :format="{ number: true }"
            :disabled="store.isDetail"
            :readonly="!store.isDetail"
            @button="pickAddr2"
            :maxlength="6"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.empaddr2"
            label="通訊地址"
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
            :maxlength="40"
          />
        </v-col>
      </v-row>
      <c-divider class="mt-3">公司資訊</c-divider>
      <v-row dense class="mt-2">
        <v-col cols="auto" class="px-2">
          <c-select-input
            front="select"
            v-model="formData.deparno"
            v-model:title="formData.deparname"
            label="部門"
            icon="fa-solid fa-building-user"
            :items="departDDL"
            item-title="deparname"
            item-value="deparno"
            :item-columns="[
              { column: 'deparno', label: '部門編號' },
              { column: 'deparname', label: '部門名稱' }
            ]"
            :disabled="store.isDetail"
            width="215"
            :input-maxlength="16"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-select-input
            front="select"
            v-model="formData.chiefno"
            v-model:title="formData.chiefname"
            label="主管"
            icon="fa-solid fa-user-tie"
            :items="employeeDDL"
            item-title="empname"
            item-value="empno"
            :item-columns="[
              { column: 'empno', label: '人員編號' },
              { column: 'empname', label: '人員名稱' }
            ]"
            :disabled="store.isDetail"
            width="326"
            :input-maxlength="16"
            condensed
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            type="number"
            v-model="formData.quotation"
            label="報價級距"
            :format="{ thousands: true }"
            icon="fa-solid fa-money-bill"
            :disabled="store.isDetail"
            :maxlength="9"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.memo1"
            label="說明"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
            :maxlength="67"
          />
        </v-col>
        <v-col cols="10" class="px-2">
          <c-textarea
            v-model="formData.memo"
            label="備註"
            icon="fa-solid fa-pencil"
            :disabled="store.isDetail"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card color="#1b2b36" rounded="3" class="mt-2">
    <v-card-text>
      <v-row dense justify="space-between">
        <v-col cols="auto" class="text-custom-2">工種資料</v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="create" icon="mdi-plus-circle" @click="empSkillAdd">新增工種</c-button>
        </v-col>
      </v-row>
      <v-row
        v-for="(skill, i) in empSkills"
        :key="i"
        dense
        class="align-items-center justify-content-center"
      >
        <v-col cols="auto" class="text-custom-1 fw-normal">
          {{ `${i + 1}`.padStart(2, '0') + '.' }}
        </v-col>
        <v-col cols="auto">
          <c-select
            v-model="skill.skillno"
            v-model:title="skill.skillname"
            label="工種"
            icon="fa-solid fa-briefcase"
            :items="skillDDL"
            item-title="skillname"
            item-value="skillno"
            :item-columns="[
              { column: 'skillno', label: '工種編號' },
              { column: 'skillname', label: '工種名稱' }
            ]"
            :disabled="store.isDetail"
            width="540"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            type="number"
            v-model="skill.daytpr"
            label="日薪"
            :format="{ thousands: true }"
            icon="fa-solid fa-sack-dollar"
            :disabled="store.isDetail"
            :maxlength="8"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            type="number"
            v-model="skill.overtime"
            label="加班"
            :format="{ thousands: true }"
            icon="fa-solid fa-sack-dollar"
            :disabled="store.isDetail"
            :maxlength="7"
          />
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="delete" icon="mdi-close-circle" @click="empSkillDel(skill)" />
        </v-col>
      </v-row>
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

  <pick-addr v-model="pickAddrDS" @pick="handlePickAddr" />
  <web-permissions v-model="webPerDs" v-model:data="webPerData" />
</template>

<style scoped>
  .div-skill-table {
    width: 690px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
</style>

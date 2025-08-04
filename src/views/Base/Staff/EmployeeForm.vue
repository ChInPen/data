<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import {
    cButton,
    cInput,
    cTextarea,
    cTable,
    cDialog,
    cBread,
    cDivider
  } from '@/components/common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useEmployeeStore } from '@/store/employee'
  import { useRouter } from 'vue-router'

  const store = useEmployeeStore()
  const router = useRouter()

  const formData = ref<Record<string, any>>({})

  //取消&返回 按鈕
  const handleCancel = () => {
    router.push('/menu/Employee')
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto" v-if="['edit', 'create', 'copy'].includes(store.action)">
      <c-button kind="cancel" icon="mdi-close-circle" @click="handleCancel">取消</c-button>
    </div>
    <div class="col-auto" v-if="['edit', 'create', 'copy'].includes(store.action)">
      <c-button kind="submit" icon="fa-solid fa-paper-plane">確認送出</c-button>
    </div>
    <div class="col-auto" v-else>
      <c-button kind="goback" icon="fa-solid fa-circle-left" @click="handleCancel">返回</c-button>
    </div>
  </c-bread>

  <!--資料-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <c-divider>人員基本資料</c-divider>
      <v-row dense class="mt-2">
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empno" label="人員編號" :is-required="true" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empname" label="人員姓名" :is-required="true" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empidno" label="身分證號" icon="fa-solid fa-user" />
        </v-col>
        <v-col :cols="2" class="px-2">
          <c-input v-model="formData.password1" label="密碼" icon="fa-solid fa-unlock-keyhole" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empsex" label="性別" icon="mdi-gender-male-female" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empbirth1" label="出生日期" icon="fa-solid fa-calendar-day" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empmarr" label="婚姻狀況" icon="fa-solid fa-heart" />
        </v-col>
      </v-row>
      <c-divider class="mt-3">聯絡資訊</c-divider>
      <v-row dense class="mt-2">
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.tel1" label="聯絡電話" icon="fa-solid fa-phone-volume" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.mobitel" label="行動電話" icon="fa-solid fa-mobile-button" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.empper" label="緊急聯絡人" icon="fa-solid fa-user" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.tel2" label="緊急聯絡電話" icon="fa-solid fa-phone-volume" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.zip1" label="郵遞區號" icon="fa-solid fa-location-dot" />
        </v-col>
        <v-col :cols="8" class="px-2">
          <c-input v-model="formData.empaddr1" label="戶籍地址" icon="fa-solid fa-location-dot" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.zip2" label="郵遞區號" icon="fa-solid fa-location-dot" />
        </v-col>
        <v-col :cols="8" class="px-2">
          <c-input v-model="formData.empaddr2" label="通訊地址" icon="fa-solid fa-location-dot" />
        </v-col>
        <v-col :cols="4" class="px-2">
          <c-input v-model="formData.email" label="E-MAIL" icon="fa-solid fa-envelope" />
        </v-col>
      </v-row>
      <c-divider class="mt-3">公司資訊</c-divider>
      <v-row dense class="mt-2">
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.deparno" label="部門" icon="fa-solid fa-building-user" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.chiefno" label="主管" icon="fa-solid fa-user-tie" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.duedate1" label="到職日期" icon="fa-solid fa-calendar-day" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.resdate1" label="離職日期" icon="fa-solid fa-calendar-day" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.quotation" label="報價級距" icon="fa-solid fa-money-bill" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.memo1" label="說明" icon="fa-solid fa-pencil" />
        </v-col>
        <v-col :cols="12" class="px-2">
          <c-textarea v-model="formData.memo" label="備註" icon="fa-solid fa-pencil" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card color="#1b2b36" rounded="3" class="mt-2">
    <v-card-text>
      <v-row dense class="mt-2" justify="space-between">
        <v-col cols="auto" class="text-custom-2">工種資料</v-col>
        <v-col cols="auto">
          <c-button kind="create" icon="mdi-plus-circle">新增工種</c-button>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card color="#1b2b36" rounded="3" class="mt-2">
    <v-card-text>
      <v-row dense class="mt-2" justify="start">
        <v-col cols="auto" class="text-custom-2">操作人員</v-col>
      </v-row>
      <v-row dense class="mt-2">
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.a_date1" label="建檔日期" icon="fa-solid fa-calendar-day" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.a_user" label="建檔人員" icon="fa-solid fa-user-plus" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.m_date1" label="修改日期" icon="fa-solid fa-calendar-day" />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-input v-model="formData.m_user" label="修改人員" icon="fa-solid fa-user-pen" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>

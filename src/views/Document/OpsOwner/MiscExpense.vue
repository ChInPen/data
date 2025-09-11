<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTextarea,
    cTable,
    cBread,
    cRadioGroup,
    cDataTable
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useMiscExpenseStore } from '@/store/miscexpense'
  import { useRouter } from 'vue-router'
  import Filter from './Components/MiscExpenseFilter.vue'

  const store = useMiscExpenseStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤

  const protdetList = ref<any[]>([])

  //抓單筆資料
  const getSingleData = () => {
    if (store.ono) {
      callApi({
        method: 'POST',
        url: api.Exes.Exes_Data,
        params: { ono: store.ono }
      }).then((res) => {
        console.log(res)
      })
    }
  }
  //Renew
  const getRenewData = () => {
    callApi({
      method: 'POST',
      url: api.Exes.Exes_Renew
    }).then((res) => {
      console.log(res)
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
  const del = () => {}
  //放棄
  const cancel = () => {
    getSingleData()
    store.browse()
  }

  //查詢條件
  const filterDS = ref(false)
  const initSearch = (data) => {
    if (Array.isArray(data)) {
      store.init(data)
      getSingleData()
    }
  }
  const handleSearch = (data) => {
    store.search(router, data)
  }

  onMounted(() => {
    getSingleData()
  })
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <template v-if="!store.isDetail">
      <div class="col-auto">
        <c-button kind="submit" icon="fa-solid fa-floppy-disk">儲存</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="cancel" icon="mdi-close-circle" @click="cancel">放棄</c-button>
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
        <c-button kind="print" icon="fa-solid fa-print">列印</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="browse" icon="fa-solid fa-eye" @click="store.search(router)">瀏覽</c-button>
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
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.ono"
                label="雜支單號"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.date1"
                label="雜支日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="date"
                v-model="formData.datea"
                label="帳款日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.protno"
                label="工程編號"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :readonly="!store.isDetail"
                @button=""
              />
            </v-col>
            <v-col :cols="8" class="px-2">
              <c-input
                v-model="formData.protabbr"
                label="工程名稱"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.con1"
                label="工地主任"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-select
                v-model="formData.empaccno"
                label="付款人員"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.con1"
                label="零用金"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.con1"
                label="零用金餘額"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.sum1"
                label="稅前合計"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.tax"
                label="營業稅額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                type="number"
                v-model="formData.amount"
                label="雜支總額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="other">
          <v-row dense :align="'center'">
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.exesud1"
                label="雜支自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="3" class="px-2">
              <c-input
                v-model="formData.exesud2"
                label="雜支自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col :cols="12" class="px-2">
              <c-textarea
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
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
          <c-button kind="create" icon="mdi-plus-circle">新增</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="insert" icon="mdi-arrow-down-circle">插入</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="delete" icon="fa-solid fa-trash">刪除</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="protype" icon="fa-solid fa-clipboard-list">規格說明</c-button>
        </v-col>
      </v-row>
      <c-table
        class="mt-2"
        ref="protdetTable"
        v-model="protdetList"
        striped="even"
        hover
        height="340"
        fixed-header
        selectable
        layout="fixed"
        header-align="center"
      >
        <template v-slot:head>
          <th width="80">序號</th>
          <th width="260">雜項編號</th>
          <th width="600">雜項名稱</th>
          <th width="150">工程編號</th>
          <th width="155">工程簡稱</th>
          <th width="155">數量</th>
          <th width="155">單位</th>
          <th width="200">單價</th>
          <th width="200">稅額</th>
          <th width="200">金額</th>
          <th width="125">類別</th>
          <th width="125">發票號碼</th>
          <th width="200">說明</th>
          <th width="200">說明自定一</th>
        </template>
        <template v-slot:body="{ scope, index }"></template>
      </c-table>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" @init="initSearch" @search="handleSearch" />
</template>

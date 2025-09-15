<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import { cButton, cInput, cSelect, cTable, cBread, cSelectInput } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { GenerateRec } from '@/utils/ucommon'
  import { useQuotationStore } from '@/store/quotation'
  import { useRouter } from 'vue-router'
  import Filter from './Components/QuotationFilter.vue'
  import { pickPayterm } from '@/components/PickPayterm'
  import { pickHavedate } from '@/components/PickHavedate'
  import { pickMemo } from '@/components/PickMemo'

  const store = useQuotationStore() // useMiscExpenseStore()
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
          // const { head, body, before_price, taxrate } = res.data
          // if (head && Array.isArray(head) && head.length > 0) {
          //   formData.value = { ...head[0] }
          // }
          // if (body && Array.isArray(body)) {
          //   exesdetList.value = [...body].sort((a, b) => a.rec1 - b.rec1)
          // }
          // if (typeof before_price === 'number') {
          //   //零用金
          //   formData.value.before_price = before_price
          // }
          // if (typeof taxrate === 'number') taxRate.value = taxrate
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
        }
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
    formData.value.qno = ''
    formData.value.index1 = ''
    store.copy()
  }
  //刪除
  const del = () => {
    if (store.index1) {
      message.confirm({
        type: 'question',
        message: `確定要刪除「${formData.value.qno}」報價單？`,
        onConfirm: () => {
          //刪除
          // callApi({
          //   method: 'POST',
          //   url: api.Sqte.Sqte_DEL,
          //   params: { index1: store.index1 }
          // }).then((res) => {
          //   if (res?.status === 200) {
          //     const data = res?.data
          //     if (data === '') {
          //       message.alert({
          //         type: 'success',
          //         message: '刪除成功',
          //         autoClose: 2,
          //         onConfirm: () => {
          //           if (!store.isFirst) onoChange('previous')
          //           else if (!store.isLast) onoChange('next')
          //         }
          //       })
          //     } else {
          //       message.alert({
          //         type: 'error',
          //         message: `刪除失敗：${data}`
          //       })
          //     }
          //   }
          // })
        }
      })
    }
  }
  //放棄
  const cancel = () => {
    getSingleData()
    store.browse()
  }

  //查詢條件
  const filterDS = ref(false)
  const initSearch = (data) => {
    if (Array.isArray(data)) {
      store.init(data.map(({ index1 }) => ({ index1 })))
      getSingleData()
    }
  }
  const handleSearch = (data) => {
    store.search(router, data)
  }

  //選擇付款條件彈窗
  const pickPaytermDS = ref(false)
  //選擇有限期限彈窗
  const pickHavedateDS = ref(false)
  //選擇說明彈窗
  const pickMemoDS = ref(false)

  onMounted(() => {
    getTaxkindApi()
    getEmpApi()
  })
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <template v-if="!store.isDetail">
      <!-- <div class="col-auto">
        <c-button kind="submit" icon="fa-solid fa-floppy-disk" @click="handleSave">儲存</c-button>
      </div> -->
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
      <!-- <div class="col-auto">
        <c-button kind="print" icon="fa-solid fa-print" @click="printOpen">列印</c-button>
      </div>
      <div class="col-auto">
        <c-button kind="browse" icon="fa-solid fa-eye" @click="store.search(router)">瀏覽</c-button>
      </div>-->
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
            :disabled="store.isDetail"
            :format="{ number: true, english: true }"
            :maxlength="10"
            @button=""
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
            @button=""
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-input
            v-model="formData.protname"
            label="工程名稱"
            :is-required="true"
            :disabled="store.isDetail"
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
        <v-tabs-window-item value="det">123</v-tabs-window-item>
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
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="memo">789</v-tabs-window-item>
        <v-tabs-window-item value="hds">123</v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" @init="initSearch" @search="handleSearch" />
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
</template>

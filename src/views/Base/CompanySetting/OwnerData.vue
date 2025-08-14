<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useOwnerDataStore } from '@/store/ownerData'
  import { useRouter } from 'vue-router'

  const store = useOwnerDataStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    custno: string
    custname: string
    custabbr: string
    con: string
    a_user: string
    m_user: string
    mobitel: string
    tel: string
    uniform: string
    ckindname: string
    akindc: string
    fax: string
    boss: string
    taxkindno: string
    taxkindc: string
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    custno: '',
    custabbr: '',
    uniform: '',
    con: '',
    tel: '',
    mobitel: ''
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      custno: '',
      custabbr: '',
      uniform: '',
      con: '',
      tel: '',
      mobitel: ''
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Cust.Custlist,
      data: {
        ...filter.value,
        custname: '',
        fax: '',
        boss: ''
      }
    })
    if (res?.status === 200) {
      const data = res?.data
      if (data && Array.isArray(data)) {
        tbData.value = data
      }
    }
  }
  //新增按鈕
  const handleCreate = () => {
    store.create(router)
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    store.edit(row.custno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    store.copy(row.custno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    store.browse(row.custno, router)
  }
  //起始動作
  onMounted(() => {
    filterSearch()
  })
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="print" icon="fa-solid fa-print">列印</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate">新增</c-button>
    </div>
  </c-bread>

  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col :cols="3">
          <c-input v-model="filter.custno" label="業主編號" icon="fa-solid fa-building" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.custabbr" label="業主簡稱" icon="fa-solid fa-building" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.uniform" label="統一編號" icon="fa-solid fa-barcode" />
        </v-col>
        <v-responsive width="100%"></v-responsive>
        <v-col :cols="3">
          <c-input v-model="filter.con" label="聯絡人" icon="fa-solid fa-user" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.tel" label="電話" icon="fa-solid fa-phone-volume" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.mobitel" label="行動電話" icon="fa-solid fa-mobile-button" />
        </v-col>
      </v-row>
      <v-row justify="end" dense>
        <v-col cols="auto">
          <c-button kind="clear" icon="fa-solid fa-eraser" @click="filterClear">清空</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="filterSearch">
            查詢
          </c-button>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <!--查詢結果表格-->
  <c-table
    v-model="tbData"
    :show-index="true"
    class="mt-3"
    striped="even"
    height="540"
    fixed-header
    hover
  >
    <template v-slot:head>
      <th>業主編號</th>
      <th>業主簡稱</th>
      <th>聯絡人</th>
      <th>電話1</th>
      <th>行動電話</th>
      <th>統一編號</th>
      <th>結帳類別</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.custno }}</td>
      <td>{{ scope.custabbr }}</td>
      <td>{{ scope.con }}</td>
      <td>{{ scope.tel }}</td>
      <td>{{ scope.mobitel }}</td>
      <td>{{ scope.uniform }}</td>
      <td>{{ scope.akindc }}</td>
      <td>
        <v-row dense>
          <v-col cols="auto">
            <c-button kind="copy" icon="fa-solid fa-copy" @click="handleCopy(scope)">複製</c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="edit" icon="fa-solid fa-pen-to-square" @click="handleEdit(scope)">
              編輯
            </c-button>
          </v-col>
          <v-col cols="auto">
            <c-button kind="browse" icon="fa-solid fa-eye" @click="handleBrowse(scope)">
              瀏覽
            </c-button>
          </v-col>
          <!-- <v-col cols="auto">
            <c-button kind="delete" icon="fa-solid fa-trash" @click="handleDelete(scope)">
              刪除
            </c-button>
          </v-col> -->
        </v-row>
      </td>
    </template>
  </c-table>
</template>

<style scoped></style>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useManufacturerDataStore } from '@/store/manufacturerData'
  import { useRouter } from 'vue-router'
  import print from './Components/ManufacturerDataPrint.vue'

  const store = useManufacturerDataStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    suppno: string
    suppabbr: string
    coN1: string
    teL1: string
    fax: string
    uniform: string
    mobiteL1: string
    compaddr: string
    empname: string
    business: string
    [key: string]: any //允許其他屬性
  }

  //查詢條件
  const filter = ref({
    suppno: '',
    suppabbr: '',
    uniform: '',
    business: '',
    coN1: '',
    teL1: '',
    mobiteL1: ''
  })

  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      suppno: '',
      suppabbr: '',
      uniform: '',
      business: '',
      coN1: '',
      teL1: '',
      mobiteL1: ''
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Supp.Supp_List,
      data: { ...filter.value }
    })
    if (res?.status === 200) {
      const { _Lists } = res?.data
      if (_Lists && Array.isArray(_Lists)) {
        tbData.value = _Lists
      }
    }
  }
  //新增按鈕
  const handleCreate = () => {
    store.create(router)
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    store.edit(row.suppno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    store.copy(row.suppno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    store.browse(row.suppno, router)
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.suppno}」${row.suppabbr}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'POST',
          url: api.Supp.Supp_DEL,
          data: { suppno: row.suppno }
        }).then((res: any) => {
          if (res?.status === 200) {
            const data = res?.data
            if (data === '') {
              message.alert({
                type: 'success',
                message: '刪除成功',
                autoClose: 2,
                onConfirm: () => {
                  filterSearch()
                }
              })
            }
          }
        })
      }
    })
  }
  //起始動作
  onMounted(() => {
    filterSearch()
  })

  //列印
  const printDS = ref(false)
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="print" icon="fa-solid fa-print" @click="printDS = true">列印</c-button>
    </div>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate">新增</c-button>
    </div>
  </c-bread>

  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col cols="auto">
          <c-input
            v-model="filter.suppno"
            label="廠商編號"
            icon="fa-solid fa-warehouse"
            :maxlength="8"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.suppabbr"
            label="廠商簡稱"
            icon="fa-solid fa-warehouse"
            :maxlength="10"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.uniform"
            label="統一編號"
            icon="fa-solid fa-barcode"
            :format="{ number: true }"
            :maxlength="8"
          />
        </v-col>
        <v-col :cols="3">
          <c-input
            v-model="filter.business"
            label="營業項目"
            icon="fa-solid fa-shop"
            :maxlength="60"
            :length-auto-width="false"
          />
        </v-col>
        <v-responsive width="100%" />
        <v-col cols="auto">
          <c-input v-model="filter.coN1" label="聯絡人1" icon="fa-solid fa-user" :maxlength="10" />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.teL1"
            label="電話1"
            icon="fa-solid fa-phone-volume"
            :maxlength="16"
          />
        </v-col>
        <v-col cols="auto">
          <c-input
            v-model="filter.mobiteL1"
            label="行動電話"
            icon="fa-solid fa-mobile-button"
            :maxlength="16"
          />
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
      <th>廠商編號</th>
      <th>廠商簡稱</th>
      <th>聯絡人1</th>
      <th>電話1</th>
      <th>行動電話</th>
      <th>統一編號</th>
      <th>營業項目</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.suppno }}</td>
      <td>{{ scope.suppabbr }}</td>
      <td>{{ scope.coN1 }}</td>
      <td>{{ scope.teL1 }}</td>
      <td>{{ scope.mobiteL1 }}</td>
      <td>{{ scope.uniform }}</td>
      <td>{{ scope.business }}</td>
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
          <v-col cols="auto">
            <c-button kind="delete" icon="fa-solid fa-trash" @click="handleDelete(scope)">
              刪除
            </c-button>
          </v-col>
        </v-row>
      </td>
    </template>
  </c-table>

  <!--列印 彈出視窗-->
  <print v-model="printDS" />
</template>

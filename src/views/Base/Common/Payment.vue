<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cTable, cDialog, cBread } from '@/components/common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import type { Method } from 'axios'

  //表格欄位
  interface iData {
    akindno: string
    akindname: string
    a_USER: string
    m_USER: string
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    akindno: '',
    akindname: ''
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      akindno: '',
      akindname: ''
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Akind.Akind_List,
      data: {
        akindno: filter.value.akindno ?? '',
        akindname: filter.value.akindname ?? '',
        data_Count: '1000',
        length: 1000
      }
    })
    if (res?.status === 200) {
      if (res?.data && Array.isArray(res?.data)) {
        tbData.value = res?.data
      }
    }
  }
  //新增按鈕
  const handleCreate = async () => {
    dialogAction.value = 'create'
    //Renew
    await callApi({
      method: 'POST',
      url: api.Akind.Akind_ReNew
    }).then((response: any) => {
      const data: any = response?.data
      dialogForm.value = {
        akindno: data?.akindno ?? '',
        akindname: data?.akindname ?? ''
      }
    })
    dialogOpen.value = true
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    dialogAction.value = 'edit'
    dialogForm.value = {
      akindno: row.akindno ?? '',
      akindname: row.akindname ?? ''
    }
    dialogOpen.value = true
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.akindno}」${row.akindname}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'POST',
          url: api.Akind.Akind_DEL,
          data: { akindno: row.akindno, akindname: row.akindname }
        }).then((response: any) => {
          if (response?.status === 200) {
            message.alert({
              type: 'success',
              message: '刪除成功',
              autoClose: 2
            })
            filterSearch()
          }
        })
      }
    })
  }
  //起始動作
  onMounted(() => {
    filterSearch()
  })

  //彈出視窗
  const dialogOpen = ref(false)
  const dialogAction = ref<'create' | 'edit'>('create')
  const dialogForm = ref({
    akindno: '',
    akindname: ''
  })
  const handleDialogClose = () => {
    dialogOpen.value = false
  }
  const handleDialogSubmit = () => {
    message.confirm({
      type: 'question',
      message: `確定要${dialogAction.value === 'create' ? '新增' : '編輯'}結帳類別？`,
      onConfirm: () => {
        let method = ''
        let url = ''
        if (dialogAction.value === 'create') {
          method = 'POST'
          url = api.Akind.Akind_Create
        }
        if (dialogAction.value === 'edit') {
          method = 'PUT'
          url = api.Akind.Akind_EDIT
        }
        callApi({
          method: method as Method,
          url: url,
          data: { ...dialogForm.value }
        }).then((response: any) => {
          if (response?.status === 200) {
            message.alert({
              type: 'success',
              message: '存檔成功',
              autoClose: 2
            })
            dialogOpen.value = false
            filterSearch()
          }
        })
      }
    })
  }
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate">新增</c-button>
    </div>
  </c-bread>

  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense>
        <v-col :cols="3">
          <c-input
            v-model="filter.akindno"
            label="結帳類別編號"
            icon="fa-solid fa-hand-holding-dollar"
          />
        </v-col>
        <v-col :cols="3">
          <c-input
            v-model="filter.akindname"
            label="結帳類別名稱"
            icon="fa-solid fa-hand-holding-dollar"
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
    height="580"
    fixed-header
    hover
  >
    <template v-slot:head>
      <th>結帳類別編號</th>
      <th>結帳類別名稱</th>
      <th>建立人員</th>
      <th>修改人員</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.akindno }}</td>
      <td>{{ scope.akindname }}</td>
      <td>{{ scope.a_user }}</td>
      <td>{{ scope.m_user }}</td>
      <td>
        <v-row dense>
          <v-col cols="auto">
            <c-button kind="edit" icon="fa-solid fa-pen-to-square" @click="handleEdit(scope)">
              編輯
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

  <!--新增 & 編輯 彈出視窗-->
  <c-dialog
    v-model="dialogOpen"
    :title="(dialogAction === 'create' ? '新增' : '編輯') + '結帳類別'"
  >
    <v-row>
      <v-col :cols="6">
        <!-- :is-required="true" 代表必填欄位 -->
        <c-input
          v-model="dialogForm.akindno"
          label="結帳類別編號"
          :is-required="true"
          :readonly="dialogAction === 'edit' ? true : false"
        />
      </v-col>
      <v-col :cols="6">
        <!-- :is-required="true" 代表必填欄位 -->
        <c-input v-model="dialogForm.akindname" label="結帳類別名稱" :is-required="true" />
      </v-col>
    </v-row>
    <template v-slot:buttons>
      <div class="col-auto">
        <c-button icon="mdi-close-circle" kind="cancel" @click="handleDialogClose">取消</c-button>
      </div>
      <div class="col-auto">
        <c-button icon="fa-solid fa-paper-plane" kind="submit" @click="handleDialogSubmit">
          確認送出
        </c-button>
      </div>
    </template>
  </c-dialog>
</template>

<style scoped>
  .v-card-text {
    padding: 12px;
  }
</style>

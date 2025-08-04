<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cTable, cBread } from '@/components/common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useEmployeeStore } from '@/store/employee'
  import { useRouter } from 'vue-router'

  const store = useEmployeeStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    empno: string
    empname: string
    mobitel: string
    a_user: string
    m_user: string
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    empno: '',
    empname: ''
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      empno: '',
      empname: ''
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Emp.Emp_Search,
      data: {
        empno: filter.value.empno ?? '',
        empname: filter.value.empname ?? '',
        data_Count: '1000',
        length: 1000
      }
    })
    if (res?.status === 200) {
      const { emps } = res?.data
      if (emps && Array.isArray(emps)) {
        tbData.value = emps
      }
    }
  }
  //新增按鈕
  const handleCreate = () => {
    // store.clear()
    // store.action = 'create'
    // router.push(store.path2)
    store.create(router)
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    // store.clear()
    // store.action = 'edit'
    // store.empno = row.empno
    // router.push(store.path2)
    store.edit(row.empno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    // store.clear()
    // store.action = 'copy'
    // store.empno = row.empno
    // router.push(store.path2)
    store.copy(row.empno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    // store.clear()
    // store.empno = row.empno
    // router.push(store.path2)
    store.browse(row.empno, router)
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.empno}」${row.empname}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'POST',
          url: api.Emp.Emp_DEL,
          data: { empNo: row.empno }
        }).then((response: any) => {
          console.log(response)
          // if (response?.status === 200) {
          //   message.alert({
          //     type: 'success',
          //     message: '刪除成功',
          //     autoClose: 2
          //   })
          //   filterSearch()
          // }
        })
      }
    })
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
          <c-input v-model="filter.empno" label="人員編號" icon="fa-solid fa-building-user" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.empname" label="人員名稱" icon="fa-solid fa-building-user" />
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
      <th>人員編號</th>
      <th>人員名稱</th>
      <th>行動電話</th>
      <th>建立人員</th>
      <th>修改人員</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.empno }}</td>
      <td>{{ scope.empname }}</td>
      <td>{{ scope.mobitel }}</td>
      <td>{{ scope.a_user }}</td>
      <td>{{ scope.m_user }}</td>
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

  <!--新增 & 編輯 彈出視窗-->
</template>

<style scoped>
  .v-card-text {
    padding: 12px;
  }
</style>

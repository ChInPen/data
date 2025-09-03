<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useConstructionStore } from '@/store/construction'
  import { useRouter } from 'vue-router'
  import print from './Components/ConstructionPrint.vue'

  const store = useConstructionStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    protno: string
    protabbr: string
    custno: string
    custabbr: string
    covesum: number
    chplusless: number
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    protno: '',
    custno: '',
    coveno: '',
    protabbr: '',
    custabbr: ''
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      protno: '',
      custno: '',
      coveno: '',
      protabbr: '',
      custabbr: ''
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Project.Project_List,
      data: {
        protno: filter.value.protno ?? '',
        protabbr: filter.value.protabbr ?? '',
        protname: '',
        custno: filter.value.custno ?? '',
        custabbr: filter.value.custabbr ?? '',
        tel: '',
        covesum: 0,
        coveno: filter.value.coveno ?? '',
        protaddr: '',
        data_Count: 1000,
        start: 0,
        length: 1000,
        draw: 1
      }
    })
    if (res?.status === 200) {
      const { projects } = res?.data
      if (projects && Array.isArray(projects)) {
        tbData.value = projects
      }
    }
  }
  //新增按鈕
  const handleCreate = () => {
    store.create(router)
  }
  //表格-編輯按鈕
  const handleEdit = (row: iData) => {
    store.edit(row.protno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    store.copy(row.protno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    store.browse(row.protno, router)
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.protno}」${row.protabbr}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'POST',
          url: api.Project.Project_DEL,
          params: { protno: row.protno }
        }).then((res: any) => {
          if (res?.status === 200) {
            const data = res?.data
            if (data && data.state === 'success') {
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
        <v-col :cols="3">
          <c-input v-model="filter.protno" label="工程編號" icon="fa-solid fa-helmet-safety" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.custno" label="業主編號" icon="fa-solid fa-building" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.coveno" label="合約編號" icon="fa-solid fa-file-contract" />
        </v-col>
        <v-responsive width="100%" />
        <v-col :cols="3">
          <c-input v-model="filter.protabbr" label="工程簡稱" icon="fa-solid fa-helmet-safety" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.custabbr" label="業主簡稱" icon="fa-solid fa-building" />
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
      <th>工程編號</th>
      <th>工程簡稱</th>
      <th>業主編號</th>
      <th>業主簡稱</th>
      <th>合約金額</th>
      <th>追加減金額</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.protno }}</td>
      <td>{{ scope.protabbr }}</td>
      <td>{{ scope.custno }}</td>
      <td>{{ scope.custabbr }}</td>
      <td>{{ scope.covesum }}</td>
      <td>{{ scope.chplusless }}</td>
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

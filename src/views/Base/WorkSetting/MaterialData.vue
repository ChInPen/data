<script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { cButton, cInput, cSelect, cCheckbox, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useMaterialDataStore } from '@/store/materialData'
  import { useRouter } from 'vue-router'

  const store = useMaterialDataStore()
  const router = useRouter()

  //表格欄位
  interface iData {
    itemno: string
    itemname: string
    stksalpc: number
    stkpurpc: number
    ikindname: string
    mkindname: string
    [key: string]: any //允許其他屬性
  }
  //查詢條件
  const filter = ref({
    itemno: '',
    itemname: '',
    ikindno: '',
    ikindname: '',
    mkindno: []
  })
  //表格資料
  const tbData = ref<iData[]>([])
  //下拉選單
  const ikindDDL = ref<{ ikindno: string; ikindname: string }[]>([])
  //勾選框
  const mkindCheckbox = ref([
    { value: '1', label: '材料' },
    { value: '2', label: '工資' },
    { value: '3', label: '費用' },
    { value: '4', label: '外包' },
    { value: '6', label: '雜支' }
  ])
  //查詢條件-清除按鈕
  const filterClear = () => {
    filter.value = {
      itemno: '',
      itemname: '',
      ikindno: '',
      ikindname: '',
      mkindno: []
    }
  }
  //查詢條件-查詢按鈕
  const filterSearch = async () => {
    const res = await callApi({
      method: 'POST',
      url: api.Item.Item_List,
      data: {
        ...filter.value,
        mkindno: filter.value.mkindno.join(','),
        stkpurpc: 0,
        stksalpc: 0
      }
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
    store.edit(row.itemno, router)
  }
  //表格-複製按鈕
  const handleCopy = (row: iData) => {
    store.copy(row.itemno, router)
  }
  //表格-瀏覽按鈕
  const handleBrowse = (row: iData) => {
    store.browse(row.itemno, router)
  }
  //表格-刪除按鈕
  const handleDelete = (row: iData) => {
    message.confirm({
      type: 'question',
      message: `確定要刪除「${row.itemno}」${row.itemname}？`,
      onConfirm: () => {
        //刪除
        callApi({
          method: 'POST',
          url: api.Item.Item_DEL,
          data: { itemno: row.itemno }
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
    //抓下拉選單
    callApi({
      method: 'POST',
      url: api.Ikind.Ikind_List,
      data: {
        ikindno: '',
        ikindname: ''
      }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data
        if (data && Array.isArray(data)) {
          ikindDDL.value = data.map(({ ikindno, ikindname }) => ({ ikindno, ikindname }))
        }
      }
    })
    filterSearch()
  })
</script>

<template>
  <!--頂部 title & 按鈕區-->
  <c-bread>
    <div class="col-auto">
      <!-- <c-button kind="print" icon="fa-solid fa-print" @click="printDS = true">列印</c-button> -->
    </div>
    <div class="col-auto">
      <c-button kind="create" icon="mdi-plus-circle" @click="handleCreate">新增</c-button>
    </div>
  </c-bread>

  <!--查詢條件-->
  <v-card color="#1b2b36" rounded="3">
    <v-card-text>
      <v-row dense :align="'center'">
        <v-col :cols="3">
          <c-input v-model="filter.itemno" label="工料編號" icon="fa-solid fa-wrench" />
        </v-col>
        <v-col :cols="3">
          <c-input v-model="filter.itemname" label="工料名稱" icon="fa-solid fa-wrench" />
        </v-col>
        <v-col :cols="3">
          <c-select
            v-model="filter.ikindno"
            v-model:title="filter.ikindname"
            label="工料類別"
            icon="fa-solid fa-wrench"
            :items="ikindDDL"
            item-title="ikindname"
            item-value="ikindno"
            :item-columns="[
              { column: 'ikindno', label: '工料類別編號' },
              { column: 'ikindname', label: '工料類別' }
            ]"
            also-show-value
          />
        </v-col>
        <v-responsive width="100%"></v-responsive>
        <v-col cols="auto" class="fs-5">工料分類：</v-col>
        <v-col cols="auto" v-for="mkind in mkindCheckbox" :key="mkind.value">
          <c-checkbox
            class="pe-3"
            v-model="filter.mkindno"
            size="3"
            :value="mkind.value"
            :label="mkind.label"
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
      <th>工料編號</th>
      <th>工料名稱</th>
      <th width="225">工料類別</th>
      <th width="140">工料分類</th>
      <th></th>
    </template>
    <template v-slot:body="{ scope }">
      <td>{{ scope.itemno }}</td>
      <td>{{ scope.itemname }}</td>
      <td>{{ scope.ikindname }}</td>
      <td>{{ scope.mkindname }}</td>
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
</template>

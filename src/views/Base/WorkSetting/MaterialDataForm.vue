<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import {
    cButton,
    cInput,
    cSelect,
    cTable,
    cBread,
    cDivider,
    cRadioGroup
  } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { message } from '@/components/Message/service' //訊息窗元件
  import { useMaterialDataStore } from '@/store/materialData'
  import { useRouter } from 'vue-router'
  import { auditInfo } from '@/components/AuditInfo'
  import { GenerateRec } from '@/utils/ucommon'
  import { projectType } from '@/components/ProjectType'

  const store = useMaterialDataStore()
  const router = useRouter()

  //下拉選單
  const ikindDDL = ref<{ ikindno: string; ikindname: string }[]>([])
  const unitDDL = ref<{ content1: string }[]>([])
  //抓業主類別下拉選單資料
  const getIkindApi = async () => {
    callApi({
      method: 'POST',
      url: api.Ikind.Ikind_List,
      data: {
        ikindno: '',
        ikindname: ''
      }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data
        if (data && Array.isArray(data)) {
          ikindDDL.value = data.map(({ ikindno, ikindname }) => ({ ikindno, ikindname }))
        }
      }
    })
  }
  //抓單位下拉選單資料
  const getUnitApi = async () => {
    callApi({
      method: 'POST',
      url: api.Phr.UnitBrow,
      params: { indexValue: '' }
    }).then((res: any) => {
      if (res?.status == 200) {
        const data = res?.data
        if (data && Array.isArray(data)) {
          unitDDL.value = data
        }
      }
    })
  }
  //工料資料
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤
  //工程分析表格
  const e3DataList = ref<(typeof e3Empty)[]>([])
  const e3Table = ref()
  const e3Empty = {
    ibomrec: '',
    itemno: '',
    ibomno: '',
    ibomname: '',
    ibomunit: '',
    ibomsqty: 0,
    ibomsalpc: 0,
    ibomsalto: 0,
    ibommemo: '',
    //隱藏欄位
    ibommo1: '',
    ibommo2: '',
    ibommo3: 0
  }
  //工程分析表格-新增
  const e3ListAdd = () => {
    e3DataList.value.push({ ...e3Empty })
    GenerateRec(e3DataList.value, 'ibomrec') //自動編號
  }
  //工程分析表格-插入
  const e3ListInsert = () => {
    const selectIndex = e3Table.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      e3DataList.value.splice(selectIndex, 0, { ...e3Empty })
      GenerateRec(e3DataList.value, 'ibomrec') //自動編號
    }
  }
  //工程分析表格-刪除
  const e3ListDelete = () => {
    const selectIndex = e3Table.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      e3DataList.value.splice(selectIndex, 1)
      GenerateRec(e3DataList.value, 'ibomrec') //自動編號
    }
  }
  //組裝組件建檔表格
  const esDataList = ref<(typeof esEmpty)[]>([])
  const esTable = ref()
  const esEmpty = {
    ibomrec: '',
    itemno: '',
    ibomno: '',
    ibomname: '',
    ibomunit: '',
    ibomsqty: 0,
    ibomsalpc: 0,
    ibomsalto: 0,
    ibommemo: '',
    ibomcpc: 0,
    ibomcto: 0,
    //隱藏欄位
    ibommo1: '',
    ibommo2: '',
    ibommo3: 0
  }
  //組裝組件建檔表格-新增
  const esListAdd = () => {
    esDataList.value.push({ ...esEmpty })
    GenerateRec(esDataList.value, 'ibomrec') //自動編號
  }
  //組裝組件建檔表格-插入
  const esListInsert = () => {
    const selectIndex = esTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      esDataList.value.splice(selectIndex, 0, { ...esEmpty })
      GenerateRec(esDataList.value, 'ibomrec') //自動編號
    }
  }
  //組裝組件建檔表格-刪除
  const esListDelete = () => {
    const selectIndex = esTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      esDataList.value.splice(selectIndex, 1)
      GenerateRec(esDataList.value, 'ibomrec') //自動編號
    }
  }

  //單選項、頁籤的 disabled 控制
  const mkind2_6Dis = computed(() => formData.value.kindno === '1')
  const kind1Dis = computed(() => formData.value.mkindno !== '1')
  const tab2Dis = computed(() => formData.value.mkindno !== '4')
  const tab3Dis = computed(() => formData.value.kindno !== '1')

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:custno, custname, custabbr, taxkindno, invokindno
    // const requiredFields = [
    //   { key: 'custno', label: '業主編號' },
    //   { key: 'custname', label: '業主名稱' },
    //   { key: 'custabbr', label: '業主簡稱' },
    //   { key: 'taxkindno', label: '營業稅' },
    //   { key: 'invokindno', label: '發票種類' }
    // ]
    // const missing = requiredFields
    //   .filter((field) => !formData.value?.[field.key])
    //   .map((field) => field.label)
    //   .join('、')
    // return missing ? `${missing}不可為空白` : ''
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    // const cust = { ...formData.value }
    // //數字欄位
    // cust.custud3 = formData.value?.custud3 ?? 0
    // cust.emckday = formData.value?.emckday ?? 25
    // cust.afterck = formData.value?.afterck ?? 0
    // //其他
    // cust.m_user = ''
    // cust.m_date1 = ''
    // cust.m_date2 = ''
    // cust.m_date3 = ''
    // //聯絡人清單
    // const list = conList.value.map((obj: any) => ({
    //   ...obj,
    //   custno: formData.value?.custno ?? ''
    // }))
    // return { cust, conList: list }
  }
  const callCreateApi = () => {
    // callApi({
    //   method: 'POST',
    //   url: api.Cust.Cust_Add,
    //   data: saveData()
    // }).then((res: any) => {
    //   if (res?.status === 200) {
    //     const data = res?.data
    //     if (data && data.state === 'success') {
    //       message.alert({
    //         type: 'success',
    //         // message: data?.msg ?? '存檔成功',
    //         message: '存檔成功',
    //         autoClose: 2,
    //         onConfirm: () => {
    //           handleCancel()
    //         }
    //       })
    //     }
    //   }
    // })
  }
  const callEditApi = () => {
    // callApi({
    //   method: 'PUT',
    //   url: api.Cust.Cust_Upd,
    //   data: saveData()
    // }).then((res: any) => {
    //   const data = res?.data
    //   if (data && data.state === 'success') {
    //     message.alert({
    //       type: 'success',
    //       // message: data?.msg ?? '存檔成功',
    //       message: '存檔成功',
    //       autoClose: 2,
    //       onConfirm: () => {
    //         handleCancel()
    //       }
    //     })
    //   }
    // })
  }
  const handleSave = () => {
    // const check = checkData()
    // if (check) {
    //   message.alert({
    //     type: 'warning',
    //     message: check
    //   })
    //   return
    // }
    // message.confirm({
    //   type: 'question',
    //   message: `確定要送出業主資料？`,
    //   onConfirm: () => {
    //     if (store.action === 'edit') {
    //       callEditApi()
    //     } else {
    //       callCreateApi()
    //     }
    //   }
    // })
  }

  //新增狀態呼叫 Renew api
  const getRenewApi = async () => {
    callApi({
      method: 'POST',
      url: api.Item.Item_ReNew
    }).then((res: any) => {
      if (res?.status == 200) {
        const { e3, es, ...data } = res?.data ?? {}
        if (data) {
          formData.value = { ...data }
        }
      }
    })
  }
  //編輯、複製、瀏覽呼叫 api
  const getAllDataApi = async () => {
    //抓業主基本資料
    callApi({
      method: 'POST',
      url: api.Item.Item_Data,
      data: { itemno: store.itemno }
    }).then((res: any) => {
      if (res?.status == 200) {
        const { item, e3, es } = res?.data
        if (item && Array.isArray(item) && item.length > 0) {
          formData.value = {
            ...item[0],
            itemno: ['edit', 'detail'].includes(store.action) ? (item[0]?.itemno ?? '') : ''
          }
        }
      }
    })
  }

  //欄位金額計算
  const handleE3totalCount = (row: typeof e3Empty) => {
    const qty = typeof row.ibomsqty === 'number' ? row.ibomsqty : 0
    const price = typeof row.ibomsalpc === 'number' ? row.ibomsalpc : 0
    row.ibomsalto = qty * price
  }
  const handleEStotalCount = (row: typeof esEmpty) => {
    const qty = typeof row.ibomsqty === 'number' ? row.ibomsqty : 0
    const price = typeof row.ibomsalpc === 'number' ? row.ibomsalpc : 0
    const cprice = typeof row.ibomcpc === 'number' ? row.ibomcpc : 0
    row.ibomsalto = qty * price
    row.ibomcto = qty * cprice
  }

  //起始動作
  onMounted(() => {
    //抓下拉選單資料
    getIkindApi()
    getUnitApi()
    //抓單筆資料
    if (store.action === 'create') {
      getRenewApi()
    } else if (store.itemno) {
      getAllDataApi()
    }
  })

  //規格說明彈窗
  const projectTypeDS = ref(false)
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
      <v-row dense>
        <v-col cols="auto" class="text-custom-2">業主基本資料</v-col>
      </v-row>
      <v-row dense class="mt-2" :align="'center'">
        <v-col :cols="3" class="px-2">
          <c-input
            v-model="formData.itemno"
            label="工料編號"
            :is-required="true"
            :disabled="store.keyDisabled"
          />
        </v-col>
        <v-col :cols="3" class="px-2">
          <c-select
            v-model="formData.ikindno"
            v-model:title="formData.ikindname"
            label="工料類別"
            :is-required="true"
            :items="ikindDDL"
            item-title="ikindname"
            item-value="ikindno"
            :item-columns="[
              { column: 'ikindno', label: '工料類別編號' },
              { column: 'ikindname', label: '工料類別' }
            ]"
            also-show-value
            :disabled="store.isDetail"
          />
        </v-col>
        <v-col cols="auto" class="px-2">
          <c-radio-group
            v-model="formData.mkindno"
            :items="[
              { value: '1', label: '材料' },
              { value: '2', label: '工資', disabled: mkind2_6Dis },
              { value: '3', label: '費用', disabled: mkind2_6Dis },
              { value: '4', label: '外包', disabled: mkind2_6Dis },
              { value: '6', label: '雜支', disabled: mkind2_6Dis }
            ]"
            inline
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
        <v-responsive width="100%"></v-responsive>
        <v-col :cols="6" class="px-2">
          <c-input
            v-model="formData.itemname"
            label="工料名稱"
            :is-required="true"
            :disabled="store.isDetail"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card class="mt-3">
    <v-tabs v-model="tabpage" bg-color="primary" class="c-tabs">
      <v-tab value="normal">一般資料</v-tab>
      <v-tab value="e3" :disabled="tab2Dis">工程分析</v-tab>
      <v-tab value="es" :disabled="tab3Dis">組裝組件建檔</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpage">
        <v-tabs-window-item value="normal">
          <v-row dense>
            <v-col :cols="7">
              <c-divider>工程專用</c-divider>
              <v-row dense class="mt-2" :align="'center'">
                <v-col :cols="3" class="px-2">
                  <c-select
                    v-model="formData.stkunit"
                    label="單位"
                    icon="fa-solid fa-balance-scale"
                    :items="unitDDL"
                    item-title="content1"
                    item-value="content1"
                    hide-search
                    :disabled="store.isDetail"
                    clearable
                  />
                </v-col>
                <v-col :cols="5" :offset="3" class="px-2">
                  <c-radio-group
                    v-model="formData.kindno"
                    :items="[
                      { value: '1', label: '組裝品', disabled: kind1Dis },
                      { value: '3', label: '單一商品' }
                    ]"
                    inline
                    justify="around"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col :cols="5" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.stkpurpc"
                    label="進價"
                    icon="fa-solid fa-dollar-sign"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                  />
                </v-col>
                <v-col :cols="5" :offset="1" class="px-2">
                  <c-input
                    v-model="formData.itemuD1"
                    label="產品自訂1"
                    icon="fa-solid fa-pencil"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col :cols="5" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.stksalpc"
                    label="售價"
                    icon="fa-solid fa-dollar-sign"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                  />
                </v-col>
                <v-col :cols="5" :offset="1" class="px-2">
                  <c-input
                    v-model="formData.itemuD2"
                    label="產品自訂2"
                    icon="fa-solid fa-pencil"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col :cols="5" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.unitcost"
                    label="標準成本"
                    icon="fa-solid fa-dollar-sign"
                    :disabled="store.isDetail"
                    :format="{ thousands: true }"
                  />
                </v-col>
                <v-col :cols="5" :offset="1" class="px-2">
                  <c-input
                    v-model="formData.itemuD3"
                    label="產品自訂3"
                    icon="fa-solid fa-pencil"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col :cols="8" class="px-2">
                  <c-input
                    v-model="formData.itemphoto"
                    icon="fa-solid fa-file-image"
                    :disabled="store.isDetail"
                  />
                </v-col>
                <v-col cols="auto" class="px-2">
                  <c-button kind="photo" icon="fa-solid fa-images">上傳照片</c-button>
                </v-col>
                <v-col :cols="5" class="px-2">
                  <c-input
                    v-model="formData.subjno"
                    label="科目編號"
                    icon="fa-solid fa-bookmark"
                    :disabled="true"
                  />
                </v-col>
                <v-col :cols="6" :offset="1" class="px-2">
                  <c-input
                    v-model="formData.subjname"
                    label="科目名稱"
                    icon="fa-solid fa-bookmark"
                    :disabled="true"
                  />
                </v-col>
                <v-col cols="auto" class="my-1 px-2">
                  <c-button
                    kind="protype"
                    icon="fa-solid fa-clipboard-list"
                    @click="projectTypeDS = true"
                  >
                    規格說明
                  </c-button>
                </v-col>
              </v-row>
            </v-col>
            <v-col :offset="1">
              <c-divider>ERP進銷存專用</c-divider>
              <v-row dense class="mt-2" :align="'center'">
                <v-col :cols="5" class="px-2">
                  <c-select
                    v-model="formData.pkgunit"
                    label="包裝單位"
                    icon="fa-solid fa-inbox"
                    :items="unitDDL"
                    item-title="content1"
                    item-value="content1"
                    hide-search
                    :disabled="true"
                    clearable
                  />
                </v-col>
                <v-col :cols="10" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.pkgqty"
                    label="包裝數量"
                    icon="fa-solid fa-inbox"
                    :disabled="true"
                    :format="{ thousands: true }"
                  />
                </v-col>
                <v-col :cols="10" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.pkgpurpc"
                    label="包裝進價"
                    icon="fa-solid fa-dollar-sign"
                    :disabled="true"
                    :format="{ thousands: true }"
                  />
                </v-col>
                <v-col :cols="10" class="px-2">
                  <c-input
                    type="number"
                    v-model="formData.pkgsalpc"
                    label="包裝售價"
                    icon="fa-solid fa-dollar-sign"
                    :disabled="true"
                    :format="{ thousands: true }"
                  />
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-tabs-window-item>

        <v-tabs-window-item value="e3">
          <v-row dense>
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="e3ListAdd">新增</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="insert" icon="mdi-arrow-down-circle" @click="e3ListInsert">
                插入
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="e3ListDelete">刪除</c-button>
            </v-col>
          </v-row>
          <c-table ref="e3Table" class="mt-2" v-model="e3DataList" striped="even" hover selectable>
            <template v-slot:head>
              <th width="80">序號</th>
              <th width="200">工料編號</th>
              <th>工料名稱</th>
              <th width="160">單位</th>
              <th width="150">數量</th>
              <th width="200">售價</th>
              <th width="200">售價小計</th>
              <th width="200">說明</th>
            </template>
            <template v-slot:body="{ scope }">
              <td>{{ scope.ibomrec }}</td>
              <td><c-input v-model="scope.ibomno" :disabled="store.isDetail" /></td>
              <td><c-input v-model="scope.ibomname" :disabled="true" /></td>
              <td>
                <c-select
                  v-model="scope.ibomunit"
                  :items="unitDDL"
                  item-title="content1"
                  item-value="content1"
                  hide-search
                  :disabled="store.isDetail"
                  clearable
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsqty"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="handleE3totalCount(scope)"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsalpc"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="handleE3totalCount(scope)"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsalto"
                  :disabled="true"
                  :format="{ thousands: true }"
                />
              </td>
              <td><c-input v-model="scope.ibommemo" :disabled="store.isDetail" /></td>
            </template>
          </c-table>
        </v-tabs-window-item>

        <v-tabs-window-item value="es">
          <v-row dense>
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="esListAdd">新增</c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="insert" icon="mdi-arrow-down-circle" @click="esListInsert">
                插入
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="esListDelete">刪除</c-button>
            </v-col>
          </v-row>
          <c-table ref="esTable" class="mt-2" v-model="esDataList" striped="even" hover selectable>
            <template v-slot:head>
              <th width="80">序號</th>
              <th width="200">工料編號</th>
              <th width="400">工料名稱</th>
              <th width="160">單位</th>
              <th width="150">數量</th>
              <th width="200">售價</th>
              <th width="200">售價小計</th>
              <th width="200">成本</th>
              <th width="200">成本小計</th>
              <th width="200">說明</th>
            </template>
            <template v-slot:body="{ scope }">
              <td>{{ scope.ibomrec }}</td>
              <td><c-input v-model="scope.ibomno" :disabled="store.isDetail" /></td>
              <td><c-input v-model="scope.ibomname" :disabled="true" /></td>
              <td>
                <c-select
                  v-model="scope.ibomunit"
                  :items="unitDDL"
                  item-title="content1"
                  item-value="content1"
                  hide-search
                  :disabled="store.isDetail"
                  clearable
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsqty"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="handleEStotalCount(scope)"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsalpc"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="handleEStotalCount(scope)"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomsalto"
                  :disabled="true"
                  :format="{ thousands: true }"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomcpc"
                  :disabled="store.isDetail"
                  :format="{ thousands: true }"
                  @change="handleEStotalCount(scope)"
                />
              </td>
              <td>
                <c-input
                  type="number"
                  v-model="scope.ibomcto"
                  :disabled="true"
                  :format="{ thousands: true }"
                />
              </td>
              <td><c-input v-model="scope.ibommemo" :disabled="store.isDetail" /></td>
            </template>
          </c-table>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <audit-info
    class="mt-2"
    v-if="store.action === 'edit' || store.action === 'detail'"
    :a_date="formData.a_DATE1"
    :a_user="formData.a_USER"
    :m_date="formData.m_DATE1"
    :m_user="formData.m_USER"
  />

  <project-type v-model="projectTypeDS" />
</template>

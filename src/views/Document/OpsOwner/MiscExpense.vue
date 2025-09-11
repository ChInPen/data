<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import { cButton, cInput, cSelect, cTable, cBread } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { useMiscExpenseStore } from '@/store/miscexpense'
  import { useRouter } from 'vue-router'
  import Filter from './Components/MiscExpenseFilter.vue'
  import { searchEmp } from '@/components/SearchEmp'
  import { searchProt } from '@/components/SearchProt'
  import { pickItem } from '@/components/PickItem'
  import { projectType } from '@/components/ProjectType'

  const store = useMiscExpenseStore()
  const router = useRouter()
  const formData = ref<Record<string, any>>({})
  const tabpage = ref('normal') //頁籤
  const exesdetList = ref<(typeof exesdetEmpty)[]>([])
  const exesdetEmpty = {
    ono: '',
    date1: '',
    protno: '',
    protabbr: '',
    rec1: '',
    itemno: '',
    itemname: '',
    qty: 0,
    unit: '',
    price: 0,
    total1: 0,
    descrip: '',
    desud1: '',
    pjt1: '',
    pjt2: '',
    pjt3: '',
    pjt4: '',
    pjt5: '',
    pjt6: '',
    pjt7: '',
    pjt8: '',
    pjt9: '',
    pjt10: '',
    exestno1: '',
    exestno2: '',
    exestno3: '',
    invono: '',
    taxprice: 0,
    invokind: ''
  }
  const taxRate = ref(5)
  const exesdetTable = ref()
  //零用金餘額
  const after_price = computed(() => {
    if (formData.value.before_price === 0) return 0
    if (!formData.value.before_price) return null
    return formData.value.before_price - 0
  })

  //下拉選單
  const unitDDL = ref<{ content1: string }[]>([])
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

  //抓單筆資料
  const getSingleData = () => {
    if (store.ono) {
      callApi({
        method: 'POST',
        url: api.Exes.Exes_Data,
        params: { ono: store.ono }
      }).then((res) => {
        if (res.status === 200) {
          const { head, body, before_price, taxrate } = res.data
          if (head && Array.isArray(head) && head.length > 0) {
            formData.value = { ...head[0] }
          }
          if (body && Array.isArray(body)) {
            exesdetList.value = [...body].sort((a, b) => a.rec1 - b.rec1)
          }
          if (typeof before_price === 'number') {
            //零用金
            formData.value.before_price = before_price
          }
          if (typeof taxrate === 'number') taxRate.value = taxrate
        }
      })
    }
  }
  //Renew
  const getRenewData = () => {
    callApi({
      method: 'POST',
      url: api.Exes.Exes_Renew
    }).then((res) => {
      if (res.status === 200) {
        const { head, taxrate } = res.data
        if (head && Array.isArray(head) && head.length > 0) {
          formData.value = { ...head[0] }
        }
        formData.value.before_price = null
        if (typeof taxrate === 'number') taxRate.value = taxrate
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

  //表身表格-規格說明
  const exesdetProType = () => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      pjtDS.value = true
    }
  }
  //表身表格-查詢工程彈窗
  const detProtDS = ref(false)
  const detKeyenterProt = ref(false)
  const detSearchProtRow = ref()
  const detSearchProtText = ref('')
  const detSearchProtOpen = (row: number, text: string) => {
    detSearchProtRow.value = row
    detSearchProtText.value = text
    detProtDS.value = true
  }
  const detSearchProtEnter = (row: number, text: string) => {
    detSearchProtRow.value = row
    detSearchProtText.value = text
    detKeyenterProt.value = true
    detProtDS.value = true
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

  //查詢人員彈窗
  const searchEmpDS = ref(false)
  const keyenterEmp = ref(false)
  const searchEmpOpen = () => {
    searchEmpDS.value = true
  }
  const searchEmpEnter = () => {
    keyenterEmp.value = true
    searchEmpDS.value = true
  }

  //查詢工程彈窗
  const searcProtDS = ref(false)
  const keyenterProt = ref(false)
  const searchProtOpen = () => {
    searcProtDS.value = true
  }
  const searchProtEnter = () => {
    keyenterProt.value = true
    searcProtDS.value = true
  }

  //勾選工料彈窗
  const pickItemDS = ref(false)

  //規格說明彈窗
  const pjtDS = ref(false)
  const pjtItems = computed(() => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      const { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 } =
        exesdetList.value[selectIndex]
      return { pjt1, pjt2, pjt3, pjt4, pjt5, pjt6, pjt7, pjt8, pjt9, pjt10 }
    }
    return {}
  })
  const handlePJTsave = (data: iPJT) => {
    const selectIndex = exesdetTable.value?.selectIndex?.[0]
    if (typeof selectIndex === 'number' && selectIndex >= 0) {
      exesdetList.value[selectIndex].pjt1 = data.pjt1
      exesdetList.value[selectIndex].pjt2 = data.pjt2
      exesdetList.value[selectIndex].pjt3 = data.pjt3
      exesdetList.value[selectIndex].pjt4 = data.pjt4
      exesdetList.value[selectIndex].pjt5 = data.pjt5
      exesdetList.value[selectIndex].pjt6 = data.pjt6
      exesdetList.value[selectIndex].pjt7 = data.pjt7
      exesdetList.value[selectIndex].pjt8 = data.pjt8
      exesdetList.value[selectIndex].pjt9 = data.pjt9
      exesdetList.value[selectIndex].pjt10 = data.pjt10
    }
  }

  onMounted(() => {
    getSingleData()
    getUnitApi()
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
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.ono"
                label="雜支單號"
                icon="fa-solid fa-file-lines"
                :disabled="store.isDetail"
                :maxlength="14"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.date1"
                label="雜支日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="date"
                v-model="formData.datea"
                label="帳款日期"
                icon="fa-solid fa-calendar-day"
                :disabled="store.isDetail"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protno"
                label="工程編號"
                icon="fa-solid fa-helmet-safety"
                :disabled="store.isDetail"
                :maxlength="16"
                @button="searchProtOpen"
                @keyEnter="searchProtEnter"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.protabbr"
                label="工程簡稱"
                icon="fa-solid fa-helmet-safety"
                :disabled="true"
                :maxlength="16"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.con1"
                label="工地主任"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.empaccno"
                label="付款人員"
                icon="fa-solid fa-user"
                :disabled="store.isDetail"
                :maxlength="10"
                @button="searchEmpOpen"
                @keyEnter="searchEmpEnter"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.empaccname"
                icon="fa-solid fa-user"
                :disabled="true"
                :maxlength="16"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="formData.before_price"
                label="零用金"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
            <v-responsive width="100%" />
            <v-col cols="auto" class="px-2">
              <c-input
                type="number"
                v-model="after_price"
                label="零用金餘額"
                icon="fa-solid fa-hand-holding-dollar"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
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
                label="雜支總額"
                icon="fa-solid fa-dollar-sign"
                :disabled="true"
                :format="{ thousands: true }"
                :maxlength="12"
              />
            </v-col>
          </v-row>
        </v-tabs-window-item>
        <v-tabs-window-item value="other">
          <v-row dense :align="'center'">
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.exesud1"
                label="雜支自定一"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="20"
              />
            </v-col>
            <v-col cols="auto" class="px-2">
              <c-input
                v-model="formData.exesud2"
                label="雜支自定二"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="30"
              />
            </v-col>
            <v-col :cols="12" class="px-2">
              <c-input
                v-model="formData.memo1"
                label="備註"
                icon="fa-solid fa-pencil"
                :disabled="store.isDetail"
                :maxlength="68"
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
          <c-button kind="create" icon="mdi-plus-circle" @click="pickItemDS = true">新增</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="insert" icon="mdi-arrow-down-circle">插入</c-button>
        </v-col>
        <v-col cols="auto" v-if="!store.isDetail">
          <c-button kind="delete" icon="fa-solid fa-trash">刪除</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="protype" icon="fa-solid fa-clipboard-list" @click="exesdetProType">
            規格說明
          </c-button>
        </v-col>
      </v-row>
      <c-table
        class="mt-2"
        ref="exesdetTable"
        v-model="exesdetList"
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
          <th width="478">雜項編號</th>
          <th width="380">雜項名稱</th>
          <th width="402">工程編號</th>
          <th width="362">工程簡稱</th>
          <th width="222">數量</th>
          <th width="152">單位</th>
          <th width="222">單價</th>
          <th width="233">稅額</th>
          <th width="281">金額</th>
          <th width="200">類別</th>
          <th width="259">發票號碼</th>
          <th width="629">說明</th>
          <th width="629">說明自定一</th>
        </template>
        <template v-slot:body="{ scope, index }">
          <td class="text-center">{{ scope.rec1 }}</td>
          <td>
            <c-input
              v-model="scope.itemno"
              :disabled="store.isDetail"
              :maxlength="20"
              condensed
              @button=""
            />
          </td>
          <td>
            <c-input
              v-model="scope.itemname"
              :disabled="true"
              :maxlength="100"
              :length-auto-width="false"
              condensed
            />
          </td>
          <td>
            <c-input
              v-model="scope.protno"
              :disabled="store.isDetail"
              :maxlength="16"
              condensed
              @button="detSearchProtOpen(index, scope.protno)"
              @keyEnter="detSearchProtEnter(index, scope.protno)"
            />
          </td>
          <td>
            <c-input v-model="scope.protabbr" :disabled="true" :maxlength="16" condensed />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.qty"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="11"
            />
          </td>
          <td>
            <c-select
              v-model="scope.unit"
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
              v-model="scope.price"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="11"
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.taxprice"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="12"
            />
          </td>
          <td>
            <c-input
              type="number"
              v-model="scope.total1"
              :disabled="store.isDetail"
              :format="{ thousands: true }"
              :maxlength="15"
            />
          </td>
          <td>
            <c-select
              v-model="scope.invokind"
              :items="['三聯式', '二聯式', '電子發票', '收據', '無']"
              hide-search
              :disabled="store.isDetail"
              clearable
            />
          </td>
          <td>
            <c-input
              v-model="scope.total1"
              :disabled="store.isDetail"
              :format="{ number: true, english: true }"
              :maxlength="10"
            />
          </td>
          <td>
            <c-input v-model="scope.descrip" :disabled="store.isDetail" :maxlength="30" condensed />
          </td>
          <td>
            <c-input v-model="scope.desud1" :disabled="store.isDetail" :maxlength="30" condensed />
          </td>
        </template>
      </c-table>
    </v-card-text>
  </v-card>

  <Filter v-model="filterDS" @init="initSearch" @search="handleSearch" />
  <search-emp
    v-model="searchEmpDS"
    v-model:form="formData"
    v-model:keyenter="keyenterEmp"
    :setting="[
      { from: 'empno', to: 'empaccno' },
      { from: 'empname', to: 'empaccname' }
    ]"
    :search-text="formData.empaccno"
  />
  <search-prot
    v-model="searcProtDS"
    v-model:form="formData"
    v-model:keyenter="keyenterProt"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }]"
    :search-text="formData.protno"
  />
  <search-prot
    v-model="detProtDS"
    v-model:form="exesdetList"
    v-model:keyenter="detKeyenterProt"
    :setting="[{ from: 'protno' }, { from: 'protabbr' }]"
    :row="detSearchProtRow"
    :search-text="detSearchProtText"
  />
  <pickItem v-model="pickItemDS" show-ikind mkind6 />
  <project-type
    v-model="pjtDS"
    :items="pjtItems"
    @save="handlePJTsave"
    :disabled="store.isDetail"
  />
</template>

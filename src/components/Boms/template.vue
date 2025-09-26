<script lang="ts" setup>
  import { ref, computed, watch, onMounted, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cSelect, cDialog, cButton, cTable } from '@/components/Common'
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import { GenerateRec, deepClone } from '@/utils/ucommon'
  import { pickItem } from '@/components/PickItem'
  import { usePickItem } from '@/store/pickItem'
  const pickItemStore = usePickItem()
  import { searchItem } from '@/components/SearchItem'
  import { useSearchItem } from '@/store/searchItem'
  const searchItemStore = useSearchItem()

  type tableData = {
    rec1: string
    stkqty: number
    price: number
    amount: number
    [key: string]: any
  }

  const model = defineModel({ default: false })
  const props = defineProps({
    items: {
      type: Array as PropType<Record<string, any>[]>,
      default: []
    },
    emptyData: Object as PropType<tableData>,
    disabled: Boolean,
    addWithPick: {
      type: Boolean,
      default: true
    }
  })
  const emit = defineEmits(['save'])

  const isOpen = ref(false)
  const tbData = ref<tableData[]>([])
  const bomsTable = ref()

  // 建立一個 computed，計算總金額
  const total = computed(() => {
    if (tbData.value.length <= 0) return 0
    return tbData.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  })

  //單位下拉選單
  const unitDDL = ref<{ content1: string }[]>([])

  const handleAdd = () => {
    if (props.addWithPick) {
      if (props.emptyData) {
        pickItemStore.set(
          tbData,
          [
            { from: 'itemno' },
            { from: 'itemname' },
            { from: 'stkunit', to: 'unit' },
            { from: 'ibompqty', to: 'stkqty' }
          ],
          { mode: 'add', empty: { ...props.emptyData } }
        )
        pickitemRef.value?.open()
      }
    } else {
      tbData.value.push({ ...props.emptyData })
      GenerateRec(tbData.value)
    }
  }
  const handleIns = () => {
    const selectRow = bomsTable.value?.selectIndex?.[0]
    if (typeof selectRow === 'number' && selectRow >= 0) {
      if (props.emptyData) {
        tbData.value.splice(selectRow, 0, { ...props.emptyData })
        GenerateRec(tbData.value)
      }
    }
  }
  const handleDel = () => {
    const selectRow = bomsTable.value?.selectIndex?.[0]
    if (typeof selectRow === 'number' && selectRow >= 0) {
      tbData.value.splice(selectRow, 1)
      GenerateRec(tbData.value)
    }
  }
  const handleSave = () => {
    emit('save', [...tbData.value], total.value)
    model.value = false
  }

  //數量或單價改變時算總價
  const countTotal = (index?: number) => {
    tbData.value.forEach((item, idx) => {
      if (typeof index === 'number' && index !== idx) return // 等同 continue
      if (item.stkqty && item.price) item.amount = item.stkqty * item.price
    })
  }

  //起始動作
  onMounted(() => {
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
  })

  // dialog 開啟時
  watch(
    () => model.value,
    (newVal) => {
      if (newVal) {
        if (props.items && Array.isArray(props.items)) {
          tbData.value = deepClone(props.items as tableData[])
          tbData.value.sort((a, b) => Number(a.rec1) - Number(b.rec1))
        }
        isOpen.value = true
      } else {
        isOpen.value = false
      }
    }
  )

  // dialog 關閉時
  const handleDialogClose = () => {
    model.value = false
    nextTick(() => {
      tbData.value = []
    })
  }

  //勾選工料彈窗
  const pickitemRef = ref()
  const bomsItemSet = (index: number) => {
    if (props.addWithPick) {
      if (props.emptyData) {
        pickItemStore.set(
          tbData,
          [
            { from: 'itemno' },
            { from: 'itemname' },
            { from: 'stkunit', to: 'unit' },
            { from: 'ibompqty', to: 'stkqty' }
          ],
          { row: index, mode: 'insert', empty: { ...props.emptyData } }
        )
        pickitemRef.value?.open()
      }
    } else {
      searchitemRow.value = index
      searchitemRef.value?.open()
    }
  }
  const pickitemPick = () => {
    GenerateRec(tbData.value)
    countTotal()
  }

  //查詢工料彈窗
  const searchitemRef = ref()
  const searchitemKeyEnter = ref(false)
  const searchitemRow = ref()
  const searchitemText = ref('')
  const bomsItemKeyEnter = (searchText: string, index: number) => {
    searchitemKeyEnter.value = true
    searchitemRow.value = index
    searchitemText.value = searchText
    searchitemRef.value?.open()
  }
</script>

<template>
  <c-dialog
    v-model="isOpen"
    v-bind="$attrs"
    width="1723"
    @afterLeave="handleDialogClose"
    title-divider
  >
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>單價分析</v-col>
        <v-col cols="auto" v-if="!disabled">
          <c-button kind="cancel" icon="mdi-close-circle" @click="model = false">放棄</c-button>
        </v-col>
        <v-col cols="auto" v-if="!disabled">
          <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSave">取回</c-button>
        </v-col>
        <v-col cols="auto" v-if="disabled">
          <c-button kind="goback" icon="fa-solid fa-circle-left" @click="model = false">
            返回
          </c-button>
        </v-col>
      </v-row>
    </template>
    <v-row dense :align="'end'" v-if="!disabled">
      <v-col cols="auto">
        <c-button kind="create" icon="mdi-plus-circle" @click="handleAdd">新增</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="insert" icon="mdi-arrow-down-circle" @click="handleIns">插入</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="delete" icon="fa-solid fa-trash" @click="handleDel">刪除</c-button>
      </v-col>
      <v-col />
      <v-col cols="auto">
        <c-input
          type="number"
          :model-value="total"
          label="總金額"
          icon="fa-solid fa-dollar-sign"
          :format="{ thousands: true }"
          :maxlength="12"
          :disabled="true"
        />
      </v-col>
    </v-row>
    <c-table
      class="mt-2"
      ref="bomsTable"
      v-model="tbData"
      striped="even"
      height="470"
      fixed-header
      hover
      selectable
      header-align="center"
    >
      <template v-slot:head>
        <th>項次</th>
        <th>工料編號</th>
        <th>工料名稱</th>
        <th>數量</th>
        <th>單位</th>
        <th>單價</th>
        <th>金額</th>
      </template>
      <template v-slot:body="{ scope, index }">
        <td>
          <div class="text-center w-rec">{{ scope.rec1 }}</div>
        </td>
        <td>
          <c-input
            v-model="scope.itemno"
            :disabled="disabled"
            @button="bomsItemSet(index)"
            @keyEnter="bomsItemKeyEnter(scope.itemno, index)"
            :maxlength="20"
            condensed
          />
        </td>
        <td>
          <c-input
            v-model="scope.itemname"
            :disabled="true"
            :maxlength="100"
            :length-auto-width="false"
            condensed
            width="380"
          />
        </td>
        <td>
          <c-input
            type="number"
            v-model="scope.stkqty"
            :format="{ thousands: true }"
            :disabled="disabled"
            @change="countTotal(index)"
            :maxlength="8"
          />
        </td>
        <td>
          <c-select
            v-model="scope.unit"
            :items="unitDDL"
            item-title="content1"
            item-value="content1"
            hide-search
            :disabled="disabled"
            clearable
            width="140"
          />
        </td>
        <td>
          <c-input
            type="number"
            v-model="scope.price"
            :format="{ thousands: true }"
            :disabled="disabled"
            @change="countTotal(index)"
            :maxlength="8"
          />
        </td>
        <td>
          <c-input
            type="number"
            v-model="scope.amount"
            :format="{ thousands: true }"
            :disabled="true"
            :maxlength="12"
          />
        </td>
      </template>
    </c-table>
  </c-dialog>

  <pick-item ref="pickitemRef" :show-ikind="true" @pick="pickitemPick" />
  <search-item
    ref="searchitemRef"
    v-bind:form="tbData"
    v-model:keyenter="searchitemKeyEnter"
    :row="searchitemRow"
    :setting="[{ from: 'itemno' }, { from: 'itemname' }, { from: 'stkunit', to: 'unit' }]"
    :search-text="searchitemText"
  />
</template>

<style>
  .w-rec {
    width: 60px;
  }
</style>

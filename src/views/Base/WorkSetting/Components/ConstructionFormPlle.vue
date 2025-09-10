<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cButton, cInput, cSelect, cDialog, cTable } from '@/components/Common'
  import { message } from '@/components/Message/service' //訊息窗元件
  import { GenerateRec, deepClone } from '@/utils/ucommon'

  const model = defineModel({ default: false })
  const props = defineProps({
    items: {
      type: Array as PropType<Record<string, any>[]>,
      default: []
    },
    disabled: Boolean
  })
  const emit = defineEmits(['save'])

  const isOpen = ref(false)
  const tbData = ref<(typeof empty)[]>([])
  const empty = {
    protno: '',
    protabbr: '',
    rec1: '',
    pdate1: '',
    addorless: '加',
    momey: 0
  }
  const plleTable = ref()

  const handleAdd = () => {
    tbData.value.push({ ...empty })
    GenerateRec(tbData.value)
  }
  const handleIns = () => {
    const selectRow = plleTable.value?.selectIndex?.[0]
    if (typeof selectRow === 'number' && selectRow >= 0) {
      tbData.value.splice(selectRow, 0, { ...empty })
      GenerateRec(tbData.value)
    }
  }
  const handleDel = () => {
    const selectRow = plleTable.value?.selectIndex?.[0]
    if (typeof selectRow === 'number' && selectRow >= 0) {
      tbData.value.splice(selectRow, 1)
      GenerateRec(tbData.value)
    }
  }
  const handleSave = () => {
    const checkMinus = tbData.value
      .filter((x) => x.addorless == '減' && x.momey >= 0)
      .map((_, idx) => idx + 1)
      .join('、')
    if (checkMinus) {
      message.alert({
        type: 'warning',
        message: `第${checkMinus}筆: 追減金額需為負數`
      })
      return
    }
    const total = tbData.value.reduce((sum, item) => sum + Number(item.momey || 0), 0)
    emit('save', [...tbData.value], total)
    model.value = false
  }

  //監聽(dialog開啟時)
  watch(
    () => model.value,
    (newVal) => {
      if (newVal) {
        if (props.items && Array.isArray(props.items)) {
          tbData.value = deepClone(props.items as (typeof empty)[])
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
</script>

<template>
  <c-dialog v-model="isOpen" width="602" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>追加(減)金額</v-col>
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
    <v-row dense v-if="!disabled">
      <v-col cols="auto">
        <c-button kind="create" icon="mdi-plus-circle" @click="handleAdd">新增</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="insert" icon="mdi-arrow-down-circle" @click="handleIns">插入</c-button>
      </v-col>
      <v-col cols="auto">
        <c-button kind="delete" icon="fa-solid fa-trash" @click="handleDel">刪除</c-button>
      </v-col>
    </v-row>
    <c-table
      class="mt-3"
      ref="plleTable"
      v-model="tbData"
      striped="even"
      height="470"
      fixed-header
      hover
      selectable
      header-align="center"
    >
      <template v-slot:head>
        <th width="80">序號</th>
        <th width="160">日期</th>
        <th width="140">追加(減)</th>
        <th>金額</th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.rec1 }}</td>
        <td><c-input type="date" v-model="scope.pdate1" :disabled="disabled" /></td>
        <td>
          <c-select
            v-model="scope.addorless"
            :items="[
              { label: '追加', value: '加' },
              { label: '追減', value: '減' }
            ]"
            item-title="label"
            item-value="value"
            hide-search
            :disabled="disabled"
          />
        </td>
        <td>
          <c-input
            type="number"
            v-model="scope.momey"
            :format="{ thousands: true, minus: true }"
            :disabled="disabled"
            :maxlength="8"
          />
        </td>
      </template>
    </c-table>
  </c-dialog>
</template>

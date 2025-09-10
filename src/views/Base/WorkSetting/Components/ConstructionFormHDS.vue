<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import { cButton, cInput, cSelect, cDataTable, cDialog } from '@/components/Common' //共用元件
  import type { DataTableHeader } from 'vuetify'
  import { message } from '@/components/Message/service' //訊息窗元件
  import { getHeadItemNo1, getDetItemNo1, getSecItemNo1 } from '@/utils/ucommon' //數字轉中文

  defineProps({
    disabled: Boolean
  })

  const tabpageHDS = ref('protdet') //頁籤(大中細項目)

  //大項目
  const headList = defineModel<any[]>('head', { default: [] })
  const headHeaders: DataTableHeader[] = [
    { title: '編號', key: 'headitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '大項目', key: 'headitem', sortable: false }
  ]
  const headTable = ref()
  //新增大項目彈窗
  const headItemDS = ref(false)
  const headForm = ref({
    headitemno: '',
    headitemno1: '',
    headitem: ''
  })
  const headItemHandler = {
    add: () => {
      headItemDS.value = true
    },
    del: () => {
      const selectRow = headTable.value?.selectIndex?.[0]
      if (typeof selectRow === 'number' && selectRow >= 0) {
        headList.value.splice(selectRow, 1)
        //重新編號
        headList.value = headList.value.map((item, i) => ({
          ...item,
          headitemno: (i + 1).toString().padStart(3, '0'),
          headitemno1: getHeadItemNo1(i + 1)
        }))
      }
    },
    cancel: () => {
      headItemDS.value = false
    },
    close: () => {
      headForm.value = {
        headitemno: '',
        headitemno1: '',
        headitem: ''
      }
    },
    submit: () => {
      const len = headList.value.length
      headList.value.push({
        ...headForm.value,
        headitemno: (len + 1).toString().padStart(3, '0'),
        headitemno1: getHeadItemNo1(len + 1)
      })
      headItemDS.value = false
    }
  }
  //中項目
  const detList = defineModel<any[]>('det', { default: [] })
  const detHeaders: DataTableHeader[] = [
    { title: '大項目', key: 'headitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '編號', key: 'detitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '中項目', key: 'detitem', sortable: false }
  ]
  const detTable = ref()
  //新增中項目彈窗
  const detItemDS = ref(false)
  const detForm = ref({
    headitemno: '',
    headitemno1: '',
    detitemno: '',
    detitemno1: '',
    detitem: ''
  })
  const detItemHandler = {
    add: () => {
      if (headList.value.length > 0) {
        detForm.value.headitemno = headList.value[0].headitemno
        detForm.value.headitemno1 = headList.value[0].headitemno1
      }
      detItemDS.value = true
    },
    del: () => {
      const selectRow = detTable.value?.selectIndex?.[0]
      if (typeof selectRow === 'number' && selectRow >= 0) {
        const headitemno = detList.value[selectRow].headitemno
        detList.value.splice(selectRow, 1)
        //重新編號
        detList.value.forEach((item, i) => {
          if (i >= selectRow && item.headitemno === headitemno) {
            const xno = Number(item.detitemno)
            item.detitemno = (xno - 1).toString().padStart(3, '0')
            item.detitemno1 = getDetItemNo1(xno - 1)
          }
        })
      }
    },
    cancel: () => {
      detItemDS.value = false
    },
    close: () => {
      detForm.value = {
        headitemno: '',
        headitemno1: '',
        detitemno: '',
        detitemno1: '',
        detitem: ''
      }
    },
    submit: () => {
      if (!detForm.value.headitemno) {
        message.alert({ type: 'warning', message: '必須選擇大項目' })
        return
      }
      const filters = detList.value.filter((x) => x.headitemno == detForm.value.headitemno)
      detList.value.push({
        ...detForm.value,
        detitemno: (filters.length + 1).toString().padStart(3, '0'),
        detitemno1: getDetItemNo1(filters.length + 1)
      })
      //排序
      detList.value.sort((a, b) => {
        return (
          Number(a.headitemno) - Number(b.headitemno) || Number(a.detitemno) - Number(b.detitemno)
        )
      })
      detItemDS.value = false
    }
  }
  //細項目
  const secList = defineModel<any[]>('sec', { default: [] })
  const secHeaders: DataTableHeader[] = [
    { title: '大項目', key: 'headitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '中項目', key: 'detitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '編號', key: 'secitemno1', width: '150px', sortable: false, align: 'center' },
    { title: '細項目', key: 'secitem', sortable: false }
  ]
  const secTable = ref()
  //新增細項目彈窗
  const secItemDS = ref(false)
  const secForm = ref({
    headitemno: '',
    headitemno1: '',
    detitemno: '',
    detitemno1: '',
    secitemno: '',
    secitemno1: '',
    secitem: ''
  })
  const detListDDL = computed(() => {
    if (!secForm.value.headitemno) return []
    return detList.value.filter((x) => x.headitemno === secForm.value.headitemno)
  })
  const secItemHandler = {
    add: () => {
      if (headList.value.length > 0) {
        secForm.value.headitemno = headList.value[0].headitemno
        secForm.value.headitemno1 = headList.value[0].headitemno1
      }
      secItemDS.value = true
    },
    del: () => {
      const selectRow = secTable.value?.selectIndex?.[0]
      if (typeof selectRow === 'number' && selectRow >= 0) {
        const headitemno = secList.value[selectRow].headitemno
        const detitemno = secList.value[selectRow].detitemno
        secList.value.splice(selectRow, 1)
        //重新編號
        secList.value.forEach((item, i) => {
          if (i >= selectRow && item.headitemno === headitemno && item.detitemno === detitemno) {
            const xno = Number(item.secitemno)
            item.secitemno = (xno - 1).toString().padStart(3, '0')
            item.secitemno1 = getSecItemNo1(xno - 1)
          }
        })
      }
    },
    cancel: () => {
      secItemDS.value = false
    },
    close: () => {
      secForm.value = {
        headitemno: '',
        headitemno1: '',
        detitemno: '',
        detitemno1: '',
        secitemno: '',
        secitemno1: '',
        secitem: ''
      }
    },
    submit: () => {
      if (!secForm.value.headitemno) {
        message.alert({ type: 'warning', message: '必須選擇大項目' })
        return
      }
      if (!secForm.value.detitemno) {
        message.alert({ type: 'warning', message: '必須選擇中項目' })
        return
      }
      const filters = secList.value.filter(
        (x) => x.headitemno == secForm.value.headitemno && x.detitemno == secForm.value.detitemno
      )
      secList.value.push({
        ...secForm.value,
        secitemno: (filters.length + 1).toString().padStart(3, '0'),
        secitemno1: getSecItemNo1(filters.length + 1)
      })
      //排序
      secList.value.sort((a, b) => {
        return (
          Number(a.headitemno) - Number(b.headitemno) ||
          Number(a.detitemno) - Number(b.detitemno) ||
          Number(a.secitemno) - Number(b.secitemno)
        )
      })
      secItemDS.value = false
    }
  }
  //監聽
  watch(
    () => secForm.value.headitemno,
    () => {
      secForm.value.detitemno = ''
      secForm.value.detitemno1 = ''
    }
  )
</script>

<template>
  <v-card>
    <v-tabs v-model="tabpageHDS" class="c-sub-tabs">
      <v-tab value="protdet">明細</v-tab>
      <v-tab value="head">大項目</v-tab>
      <v-tab value="det">中項目</v-tab>
      <v-tab value="sec">細項目</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tabpageHDS">
        <v-tabs-window-item value="protdet">
          <slot></slot>
        </v-tabs-window-item>
        <v-tabs-window-item value="head">
          <v-row dense v-if="!disabled">
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="headItemHandler.add">
                新增
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="headItemHandler.del">
                刪除
              </c-button>
            </v-col>
          </v-row>
          <c-data-table
            class="mt-2"
            ref="headTable"
            v-model="headList"
            :headers="headHeaders"
            striped="even"
            hover
            selectable
            :pagination="false"
            height="380"
            fixed-header
          >
            <template v-slot:item.headitem="{ scope }">
              <c-input v-model="scope.headitem" :disabled="disabled" :maxlength="40" />
            </template>
          </c-data-table>
        </v-tabs-window-item>
        <v-tabs-window-item value="det">
          <v-row dense v-if="!disabled">
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="detItemHandler.add">
                新增
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="detItemHandler.del">
                刪除
              </c-button>
            </v-col>
          </v-row>
          <c-data-table
            class="mt-2"
            ref="detTable"
            v-model="detList"
            :headers="detHeaders"
            striped="even"
            hover
            selectable
            :pagination="false"
            height="380"
            fixed-header
          >
            <template v-slot:item.detitem="{ scope }">
              <c-input v-model="scope.detitem" :disabled="disabled" :maxlength="40" />
            </template>
          </c-data-table>
        </v-tabs-window-item>
        <v-tabs-window-item value="sec">
          <v-row dense v-if="!disabled">
            <v-col cols="auto">
              <c-button kind="create" icon="mdi-plus-circle" @click="secItemHandler.add">
                新增
              </c-button>
            </v-col>
            <v-col cols="auto">
              <c-button kind="delete" icon="fa-solid fa-trash" @click="secItemHandler.del">
                刪除
              </c-button>
            </v-col>
          </v-row>
          <c-data-table
            class="mt-2"
            ref="secTable"
            v-model="secList"
            :headers="secHeaders"
            striped="even"
            hover
            selectable
            :pagination="false"
            height="380"
            fixed-header
          >
            <template v-slot:item.secitem="{ scope }">
              <c-input v-model="scope.secitem" :disabled="disabled" :maxlength="40" />
            </template>
          </c-data-table>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>

  <c-dialog
    v-model="headItemDS"
    @afterLeave="headItemHandler.close"
    title="新增大項目"
    title-divider
    width="auto"
  >
    <div class="d-flex flex-column gap-3">
      <c-input v-model="headForm.headitem" label="大項目" :maxlength="40" />
    </div>
    <template v-slot:buttons>
      <div class="col-auto">
        <c-button icon="mdi-close-circle" kind="cancel" @click="headItemHandler.cancel">
          取消
        </c-button>
      </div>
      <div class="col-auto">
        <c-button icon="fa-solid fa-paper-plane" kind="submit" @click="headItemHandler.submit">
          確認送出
        </c-button>
      </div>
    </template>
  </c-dialog>

  <c-dialog
    v-model="detItemDS"
    @afterLeave="detItemHandler.close"
    title="新增中項目"
    title-divider
    width="auto"
  >
    <div class="d-flex flex-column gap-3">
      <c-select
        v-model="detForm.headitemno"
        v-model:title="detForm.headitemno1"
        label="大項目"
        :items="headList"
        item-title="headitemno1"
        item-value="headitemno"
        hide-search
        width="250"
      />
      <c-input v-model="detForm.detitem" label="中項目" :maxlength="40" />
    </div>
    <template v-slot:buttons>
      <div class="col-auto">
        <c-button icon="mdi-close-circle" kind="cancel" @click="detItemHandler.cancel">
          取消
        </c-button>
      </div>
      <div class="col-auto">
        <c-button icon="fa-solid fa-paper-plane" kind="submit" @click="detItemHandler.submit">
          確認送出
        </c-button>
      </div>
    </template>
  </c-dialog>

  <c-dialog
    v-model="secItemDS"
    @afterLeave="secItemHandler.close"
    title="新增細項目"
    title-divider
    width="auto"
  >
    <v-row no-gutters>
      <v-col cols="auto">
        <c-select
          v-model="secForm.headitemno"
          v-model:title="secForm.headitemno1"
          label="大項目"
          :items="headList"
          item-title="headitemno1"
          item-value="headitemno"
          hide-search
          width="250"
        />
      </v-col>
      <v-col cols="auto" class="ms-4">
        <c-select
          v-model="secForm.detitemno"
          v-model:title="secForm.detitemno1"
          label="中項目"
          :items="detListDDL"
          item-title="detitemno1"
          item-value="detitemno"
          hide-search
          width="300"
        />
      </v-col>
    </v-row>
    <div class="d-flex mt-4">
      <c-input v-model="secForm.secitem" label="細項目" :maxlength="40" />
    </div>
    <template v-slot:buttons>
      <div class="col-auto">
        <c-button icon="mdi-close-circle" kind="cancel" @click="secItemHandler.cancel">
          取消
        </c-button>
      </div>
      <div class="col-auto">
        <c-button icon="fa-solid fa-paper-plane" kind="submit" @click="secItemHandler.submit">
          確認送出
        </c-button>
      </div>
    </template>
  </c-dialog>
</template>

<style scoped></style>

<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import type { PickSetting } from '@/store/create'
  import { usePickPayterm } from '@/store/pickPayterm'
  const store = usePickPayterm()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const formData = defineModel('form')
  // const isEnter = defineModel('keyenter', { default: false })
  const props = defineProps({
    setting: Array as PropType<PickSetting<SearchData>[]>,
    row: Number
    // searchText: String
  })
  const emits = defineEmits(['pick'])

  // store 變數設置
  const storeSet = () => {
    if (formData.value) store.target.value = formData
    if (props.setting && props.setting.length > 0) store.pickSetting = [...props.setting]
    if (typeof props.row === 'number' && props.row >= 0) store.target.row = props.row
    // if (isEnter.value) {
    //   store.isSearch = true
    //   store.searchText = props.searchText ?? ''
    // }
  }

  // dialog 開關
  const isOpen = ref(false)
  //表格資料
  const tbData = ref<SearchData[]>([])

  // 查詢
  const handleSearch = async () => {
    await callApi({
      method: 'POST',
      url: api.Phr.HavedateBrow,
      params: { indexValue: '' }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? []
        if (data && Array.isArray(data)) tbData.value = data
      }
    })
  }

  // 選擇
  const handleChoose = (raw: SearchData) => {
    store.pick(raw)
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 開啟時 (父層控制)
  watch(
    () => model.value,
    async (newVal) => {
      if (newVal) {
        storeSet()
        handleSearch()
        isOpen.value = true
      } else {
        isOpen.value = false
      }
    }
  )

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      tbData.value = []
      // isEnter.value = false
      store.clear()
      model.value = false
    })
  }

  const open = () => {
    model.value = true
  }
  defineExpose({
    open
  })
</script>

<template>
  <c-dialog v-model="isOpen" width="700" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>選擇有效日期</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <c-table v-model="tbData" class="mt-3" striped="even" height="520" fixed-header hover>
      <template v-slot:head>
        <th class="text-center">有效日期</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.content1 }}</td>
        <td>
          <v-row dense justify="center">
            <v-col cols="auto">
              <c-button kind="choose" icon="fa-solid fa-check" @click="handleChoose(scope)">
                選擇
              </c-button>
            </v-col>
          </v-row>
        </td>
      </template>
    </c-table>
  </c-dialog>
</template>

<style scoped></style>

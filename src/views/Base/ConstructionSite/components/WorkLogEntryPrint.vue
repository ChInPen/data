<script lang="ts" setup>
  import { ref, onMounted, nextTick } from 'vue'
  import { cButton, cInput, cSelect, cTextarea, cDialog } from '@/components/Common' //共用元件
  import api from '@/api' //api路徑設定檔
  import { callApi } from '@/utils/uapi' //呼叫api的方法
  import config from '@/config/config'

  const isOpen = defineModel({ default: false })
  const props = defineProps({
    no: String
  })

  //列印
  const printForm = ref({
    print_Style: '1',
    footNote_Option: '1',
    footNote_Data: ''
  })
  const feetNoDDL = ref({
    list: [
      { feetno: '1', feetname: '第一組' },
      { feetno: '2', feetname: '第二組' },
      { feetno: '3', feetname: '第三組' },
      { feetno: '4', feetname: '第四組' },
      { feetno: '5', feetname: '第五組' },
      { feetno: '6', feetname: '不列印' }
    ],
    value: 'feetno',
    title: 'feetname'
  })
  const feetContent = ref<{ groupNumber: number; content: string }[]>([])
  const handlePrintClose = () => {
    nextTick(() => {
      printForm.value = {
        print_Style: '1',
        footNote_Option: '1',
        footNote_Data: ''
      }
      feetoptionChange()
    })
  }
  const handlePreview = () => {
    callApi({
      method: 'POST',
      url: api.Exes.Exes_Print,
      data: { ...printForm.value, ono: props.no }
    }).then((res: any) => {
      if (typeof res === 'string' && res.startsWith('PDF')) {
        window.open(config.apiUri + '/' + res)
      }
    })
  }
  const feetoptionChange = () => {
    const find = feetContent.value.find(
      (x) => x.groupNumber.toString() == printForm.value.footNote_Option
    )
    if (find) printForm.value.footNote_Data = find.content
  }
  onMounted(() => {
    //抓註腳api
    callApi({
      method: 'POST',
      url: api.Exes.Exes_FootNote
    }).then((res) => {
      if (res.status === 200) {
        const data = res.data
        if (data && Array.isArray(data)) {
          feetContent.value = data
          feetoptionChange()
        }
      }
    })
  })
</script>

<template>
  <!--列印 彈出視窗-->
  <c-dialog v-model="isOpen" title="列印" width="1000" @afterLeave="handlePrintClose">
    <v-row dense justify="center" :align="'center'">
      <v-col cols="4">
        <c-input :model-value="no" label="雜支單號" :disabled="true" />
      </v-col>
      <v-col cols="4">
        <c-select
          v-model="printForm.print_Style"
          label="報表內容"
          :items="[
            { label: '簡要表', value: '1' },
            { label: '簡要自定ㄧ', disabled: true },
            { label: '簡要自定二', disabled: true }
          ]"
          item-title="label"
          item-value="value"
          hide-search
        />
      </v-col>
      <v-col cols="4">
        <c-select
          v-model="printForm.footNote_Option"
          label="三行註腳"
          :items="feetNoDDL.list"
          :item-title="feetNoDDL.title"
          :item-value="feetNoDDL.value"
          hide-search
          @update:modelValue="feetoptionChange"
        />
      </v-col>
      <v-col cols="12">
        <c-textarea
          class="feetnote-data"
          v-model="printForm.footNote_Data"
          label="表尾註腳內容"
          :input-max-rows="3"
        />
      </v-col>
      <v-col cols="12"></v-col>
    </v-row>
    <template v-slot:buttons>
      <v-row no-gutters justify="center">
        <v-col cols="auto mx-1">
          <c-button kind="print" icon="fa-solid fa-file-pdf" @click="handlePreview">預覽</c-button>
        </v-col>
        <v-col cols="auto mx-1">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">結束</c-button>
        </v-col>
      </v-row>
    </template>
  </c-dialog>
</template>

<style scoped>
  .feetnote-data {
    height: 126px;
  }
  .feetnote-data :deep(textarea) {
    white-space: pre; /* 不自動換行 */
    overflow-x: auto; /* 超過寬度時顯示水平捲軸 */
  }
</style>

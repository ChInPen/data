<script lang="ts" setup>
  import { ref, onMounted, computed, watch } from 'vue'
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
  import { useConstructionStore } from '@/store/construction'
  import { useRouter } from 'vue-router'

  const store = useConstructionStore()
  const router = useRouter()

  //取消&返回 按鈕
  const handleCancel = () => {
    store.clear(router)
  }
  //檢查欄位規則
  const checkData = () => {
    //必填:itemno，itemname，ikindno，mkindno
    // const requiredFields = [
    //   { key: 'itemno', label: '工料編號' },
    //   { key: 'ikindno', label: '工料類別' },
    //   { key: 'itemname', label: '工料名稱' },
    //   { key: 'mkindno', label: '工料分類' }
    // ]
    // let missing = requiredFields
    //   .filter((field) => !formData.value?.[field.key])
    //   .map((field) => field.label)
    //   .join('、')
    // if (missing) missing = `${missing}不可為空白`
    // //檢查工程分析
    // let missingE3 = e3DataList.value
    //   .map((s, i) => (!s.ibomno ? i + 1 : ''))
    //   .filter(Boolean)
    //   .join('、')
    // if (missingE3) missingE3 = `工程分析: 第${missingE3}筆工料編號不可為空白`
    // //檢查組裝組件建檔
    // let missingES = esDataList.value
    //   .map((s, i) => (!s.ibomno ? i + 1 : ''))
    //   .filter(Boolean)
    //   .join('、')
    // if (missingES) missingES = `組裝組件建檔: 第${missingES}筆工料編號不可為空白`
    // const missing2 = missingE3 && missingES ? `${missingE3}\n${missingES}` : missingE3 || missingES
    // return missing && missing2 ? `${missing}\n${missing2}` : missing || missing2
  }
  //送出存檔
  const saveData = () => {
    //存檔需要的欄位
    // const item = { ...formData.value }
    // delete item.a_USER
    // delete item.a_DATE1
    // delete item.m_USER
    // delete item.m_DATE1
    // //數字欄位
    // item.costcal = '1'
    // item.stkpurpc = formData.value?.stkpurpc ?? 0
    // item.stksalpc = formData.value?.stksalpc ?? 0
    // item.unitcost = formData.value?.unitcost ?? 0
    // item.pkgqty = formData.value?.pkgqty ?? 0
    // item.pkgpurpc = formData.value?.pkgpurpc ?? 0
    // item.pkgsalpc = formData.value?.pkgsalpc ?? 0
    // //工程分析
    // const e3List = e3DataList.value.map((obj: any) => ({
    //   ...obj,
    //   itemno: formData.value.itemno ?? ''
    // }))
    // //組裝組件建檔
    // const esList = esDataList.value.map((obj: any) => ({
    //   ...obj,
    //   itemno: formData.value.itemno ?? ''
    // }))
    // return {
    //   ...item,
    //   e3: e3List,
    //   es: esList
    // }
  }
  const callCreateApi = () => {
    // callApi({
    //   method: 'POST',
    //   url: api.Item.Item_Create,
    //   data: saveData()
    // }).then((res: any) => {
    //   if (res?.status === 200) {
    //     const data = res?.data
    //     if (data === '') {
    //       message.alert({
    //         type: 'success',
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
    //   method: 'POST',
    //   url: api.Item.Item_EDIT,
    //   data: saveData()
    // }).then((res: any) => {
    //   if (res?.status === 200) {
    //     const data = res?.data
    //     if (data === '') {
    //       message.alert({
    //         type: 'success',
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
    //   message: `確定要送出工料資料？`,
    //   onConfirm: () => {
    //     if (store.action === 'edit') {
    //       callEditApi()
    //     } else {
    //       callCreateApi()
    //     }
    //   }
    // })
  }
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
</template>

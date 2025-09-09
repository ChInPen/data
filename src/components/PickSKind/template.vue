<script lang="ts" setup>
  import { ref, watch, nextTick } from 'vue'
  import { cInput, cDialog, cButton, cTable } from '@/components/Common'
  import { callApi } from '@/utils/uapi'
  import api from '@/api'
  import { usePickSKind } from '@/store/pickSKind'
  const store = usePickSKind()
  import type { SearchData } from './type'

  const model = defineModel({ default: false })
  const emits = defineEmits(['pick'])

  // dialog 開關
  const isOpen = ref(false)

  //查詢條件
  const filter = ref({
    skindno: '',
    skindname: ''
  })
  //表格資料
  const tbData = ref<SearchData[]>([])

  // 查詢
  const handleSearch = async () => {
    await callApi({
      method: 'POST',
      url: api.Skind.Skind_List,
      data: { ...filter.value }
    }).then((res: any) => {
      if (res?.status === 200) {
        const data = res?.data ?? []
        if (data && Array.isArray(data)) tbData.value = data
      }
    })
  }
  // 清空查詢條件
  const handleClear = () => {
    filter.value = {
      skindno: '',
      skindname: ''
    }
  }
  // 選擇
  const handleChoose = (raw: SearchData) => {
    emits('pick', raw)
    isOpen.value = false
  }

  // dialog 開啟時 (父層控制)
  watch(
    () => model.value,
    async (newVal) => {
      if (newVal) {
        if (store.isSearch) {
          filter.value.skindno = store.searchText
          await handleSearch()
          if (tbData.value.length == 1) {
            emits('pick', tbData.value[0])
            handleDialogClose()
            return
          }
        }
        isOpen.value = true
      } else {
        isOpen.value = false
      }
    }
  )

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      handleClear() //清空查詢條件
      tbData.value = []
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
        <v-col>選擇廠商類別</v-col>
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
      </v-row>
    </template>
    <v-card color="#1b2b36" rounded="3" v-show="!store.isSearch">
      <v-card-text>
        <v-row dense>
          <v-col>
            <v-row dense>
              <v-col>
                <c-input
                  v-model="filter.skindno"
                  label="類別編號"
                  icon="fa-solid fa-magnifying-glass"
                />
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col>
                <c-input
                  v-model="filter.skindname"
                  label="類別名稱"
                  icon="fa-solid fa-magnifying-glass"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="auto">
            <div class="d-flex flex-column ms-4">
              <c-button kind="clear" icon="fa-solid fa-eraser" class="mb-2" @click="handleClear">
                清空
              </c-button>
              <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="handleSearch">
                查詢
              </c-button>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <c-table v-model="tbData" class="mt-3" striped="even" height="520" fixed-header hover>
      <template v-slot:head>
        <th class="text-center">廠商類別編號</th>
        <th class="text-center">廠商類別名稱</th>
        <th></th>
      </template>
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.skindno }}</td>
        <td class="text-center">{{ scope.skindname }}</td>
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

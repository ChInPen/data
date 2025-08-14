<script lang="ts" setup>
  import { cButton, cCheckbox, cDialog, cTable } from '@/components/Common' //共用元件

  interface iWebPer {
    empno: string //員工編號
    empname: string //員工姓名
    csyname: string //網頁中文名稱
    cssname: string //網頁英文名稱
    csn: boolean //新增
    csr: boolean //修改
    csc: boolean //複製
    csd: boolean //刪除
    csb: boolean //瀏覽
    csp: boolean //列印
    csa: boolean //全部開放
    cso: boolean //無權限
  }

  const isOpen = defineModel({ default: false })
  const tbData = defineModel<iWebPer[]>('data')

  const selectAll = (newVal: boolean, index: number) => {
    if (newVal && tbData.value) {
      tbData.value[index].csn = true
      tbData.value[index].csr = true
      tbData.value[index].csc = true
      tbData.value[index].csd = true
      tbData.value[index].csb = true
      tbData.value[index].csp = true
      tbData.value[index].cso = false
    }
  }
  const cancelAll = (newVal: boolean, index: number) => {
    if (newVal && tbData.value) {
      tbData.value[index].csn = false
      tbData.value[index].csr = false
      tbData.value[index].csc = false
      tbData.value[index].csd = false
      tbData.value[index].csb = false
      tbData.value[index].csp = false
      tbData.value[index].csa = false
    }
  }
  const back = () => {
    isOpen.value = false
  }
</script>

<template>
  <c-dialog v-model="isOpen" title="web權限" width="1100">
    <c-table v-model="tbData" striped="even" height="680" :pagination="false" fixed-header>
      <template v-slot:head>
        <th class="text-center" width="150">網頁</th>
        <th class="text-center">新增</th>
        <th class="text-center">修改</th>
        <th class="text-center">複製</th>
        <th class="text-center">刪除</th>
        <th class="text-center">瀏覽</th>
        <th class="text-center">列印</th>
        <th class="text-center">全部開放</th>
        <th class="text-center">無權限</th>
      </template>
      <template v-slot:body="{ scope, index }">
        <td class="text-center">{{ scope.csyname }}</td>
        <td class="text-center">
          <c-checkbox v-model="scope.csn" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.csr" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.csc" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.csd" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.csb" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.csp" size="5" icon-justify="center" density="compact" />
        </td>
        <td class="text-center">
          <c-checkbox
            v-model="scope.csa"
            size="5"
            icon-justify="center"
            density="compact"
            @update:modelValue="selectAll($event, index)"
          />
        </td>
        <td class="text-center">
          <c-checkbox
            v-model="scope.cso"
            size="5"
            icon-justify="center"
            density="compact"
            @update:modelValue="cancelAll($event, index)"
          />
        </td>
      </template>
    </c-table>
    <template v-slot:buttons>
      <v-row no-gutters justify="center">
        <v-col cols="auto mx-1">
          <c-button kind="goback" icon="fa-solid fa-circle-left" @click="back">返回</c-button>
        </v-col>
      </v-row>
    </template>
  </c-dialog>
</template>

<style scoped>
  td {
    --v-table-row-height: 48px;
  }
  th:not(:last-child),
  td:not(:last-child) {
    border-right: rgba(165, 165, 165, 0.15) 1px solid;
  }
</style>

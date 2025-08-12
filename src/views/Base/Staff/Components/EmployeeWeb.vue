<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cButton, cCheckbox, cDialog, cTable } from '@/components/Common' //共用元件

  const isOpen = defineModel({ default: false })

  const tbData = ref<
    {
      a: string
      b: boolean
      c: boolean
      d: boolean
      e: boolean
      f: boolean
      g: boolean
      h: boolean
      i: boolean
    }[]
  >([
    {
      a: '工程點工',
      b: true,
      c: true,
      d: true,
      e: true,
      f: false,
      g: false,
      h: false,
      i: false
    }
  ])

  const back = () => {
    isOpen.value = false
  }

  const handlePrintClose = () => {
    nextTick(() => {
      // printForm.value = {
      //   initNo: '',
      //   finalNo: '',
      //   feetNo: '01'
      // }
    })
  }
</script>

<template>
  <c-dialog v-model="isOpen" title="web權限" width="1200" @afterLeave="handlePrintClose">
    <c-table v-model="tbData" striped="even" height="700" :pagination="false">
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
      <template v-slot:body="{ scope }">
        <td class="text-center">{{ scope.a }}</td>
        <td class="text-center">
          <c-checkbox v-model="scope.b" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.c" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.d" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.e" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.f" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.g" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.h" size="5" icon-justify="center" />
        </td>
        <td class="text-center">
          <c-checkbox v-model="scope.i" size="5" icon-justify="center" />
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

<style scoped></style>

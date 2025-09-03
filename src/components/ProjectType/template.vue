<script lang="ts" setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cDialog, cButton } from '@/components/Common'

  const isOpen = defineModel({ default: false })
  const props = defineProps({
    items: {
      type: Object as PropType<Record<string, string>>,
      default: {}
    },
    disabled: Boolean
  })
  const emit = defineEmits(['save'])

  const data = ref<iPJT>({
    pjt1: '',
    pjt2: '',
    pjt3: '',
    pjt4: '',
    pjt5: '',
    pjt6: '',
    pjt7: '',
    pjt8: '',
    pjt9: '',
    pjt10: ''
  })

  // 建立一個 computed，把 key 全部轉小寫
  const lowerObj = computed(() =>
    Object.fromEntries(Object.entries(props.items).map(([k, v]) => [k.toLowerCase(), v]))
  )

  const handleSave = () => {
    emit('save', data.value)
    isOpen.value = false
  }

  // dialog 開啟時
  watch(
    () => isOpen.value,
    (newVal) => {
      if (newVal) {
        for (const key in data.value) {
          if (key in lowerObj.value) {
            data.value[key as keyof typeof data.value] = lowerObj.value[key]!
          }
        }
      }
    }
  )

  // dialog 關閉時
  const handleDialogClose = () => {
    nextTick(() => {
      data.value = {
        pjt1: '',
        pjt2: '',
        pjt3: '',
        pjt4: '',
        pjt5: '',
        pjt6: '',
        pjt7: '',
        pjt8: '',
        pjt9: '',
        pjt10: ''
      }
    })
  }
</script>

<template>
  <c-dialog v-model="isOpen" width="900" @afterLeave="handleDialogClose" title-divider>
    <template v-slot:title>
      <v-row dense :align="'center'">
        <v-col>規格說明</v-col>
        <v-col cols="auto" v-if="!disabled">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">放棄</c-button>
        </v-col>
        <v-col cols="auto" v-if="!disabled">
          <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSave">取回</c-button>
        </v-col>
        <v-col cols="auto" v-if="disabled">
          <c-button kind="goback" icon="fa-solid fa-circle-left" @click="isOpen = false">
            返回
          </c-button>
        </v-col>
      </v-row>
    </template>
    <v-row dense>
      <v-col cols="12">
        <c-input label="1" v-model="data.pjt1" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="2" v-model="data.pjt2" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="3" v-model="data.pjt3" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="4" v-model="data.pjt4" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="5" v-model="data.pjt5" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="6" v-model="data.pjt6" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="7" v-model="data.pjt7" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="8" v-model="data.pjt8" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="9" v-model="data.pjt9" :disabled="disabled" />
      </v-col>
      <v-col cols="12">
        <c-input label="10" v-model="data.pjt10" :disabled="disabled" />
      </v-col>
    </v-row>
  </c-dialog>
</template>

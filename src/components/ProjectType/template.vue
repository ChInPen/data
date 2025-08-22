<script lang="ts" setup>
  import { ref, nextTick } from 'vue'
  import { cInput, cDialog, cButton } from '@/components/Common'

  const isOpen = defineModel({ default: false })
  const pjt1 = defineModel('pjt1', { default: '' })
  const pjt2 = defineModel('pjt2', { default: '' })
  const pjt3 = defineModel('pjt3', { default: '' })
  const pjt4 = defineModel('pjt4', { default: '' })
  const pjt5 = defineModel('pjt5', { default: '' })
  const pjt6 = defineModel('pjt6', { default: '' })
  const pjt7 = defineModel('pjt7', { default: '' })
  const pjt8 = defineModel('pjt8', { default: '' })
  const pjt9 = defineModel('pjt9', { default: '' })
  const pjt10 = defineModel('pjt10', { default: '' })
  const emit = defineEmits(['save'])

  const data = ref({
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

  const handleSave = () => {
    emit('save', data.value)
    isOpen.value = false
  }

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
        <v-col cols="auto">
          <c-button kind="cancel" icon="mdi-close-circle" @click="isOpen = false">關閉</c-button>
        </v-col>
        <v-col cols="auto">
          <c-button kind="submit" icon="fa-solid fa-paper-plane" @click="handleSave">取回</c-button>
        </v-col>
      </v-row>
    </template>
    <v-row dense>
      <v-col cols="12">
        <c-input label="1" v-model="data.pjt1" />
      </v-col>
      <v-col cols="12">
        <c-input label="2" v-model="data.pjt2" />
      </v-col>
      <v-col cols="12">
        <c-input label="3" v-model="data.pjt3" />
      </v-col>
      <v-col cols="12">
        <c-input label="4" v-model="data.pjt4" />
      </v-col>
      <v-col cols="12">
        <c-input label="5" v-model="data.pjt5" />
      </v-col>
      <v-col cols="12">
        <c-input label="6" v-model="data.pjt6" />
      </v-col>
      <v-col cols="12">
        <c-input label="7" v-model="data.pjt7" />
      </v-col>
      <v-col cols="12">
        <c-input label="8" v-model="data.pjt8" />
      </v-col>
      <v-col cols="12">
        <c-input label="9" v-model="data.pjt9" />
      </v-col>
      <v-col cols="12">
        <c-input label="10" v-model="data.pjt10" />
      </v-col>
    </v-row>
  </c-dialog>
</template>

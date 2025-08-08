<script setup lang="ts">
  import { onMounted } from 'vue'
  import type { PropType } from 'vue'
  import type { DialogType, DialogMode } from './type'
  import { cButton, cIcon, cDialog } from '@/components/common'

  //計時器
  let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

  const isOpen = defineModel({ default: false })
  const props = defineProps({
    type: String as PropType<DialogType>,
    mode: {
      type: String as PropType<DialogMode>,
      default: 'alert'
    },
    message: {
      type: String,
      default: ''
    },
    autoClose: Number
  })
  const emit = defineEmits(['mounted', 'confirm', 'cancel'])

  //關閉彈出視窗 & 清除 Timer
  const closeDialog = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }
    isOpen.value = false
  }

  //確認按鈕
  const onConfirm = () => {
    closeDialog()
    emit('confirm')
  }

  //取消按鈕
  const onCancel = () => {
    closeDialog()
    emit('cancel')
  }

  onMounted(() => {
    emit('mounted')

    // 只有在 alert 模式下才會自動關閉
    if (props.mode === 'alert' && props.autoClose && typeof props.autoClose === 'number') {
      autoCloseTimer = setTimeout(() => {
        if (isOpen.value) {
          onConfirm() // 模擬按下確認按鈕
        }
      }, props.autoClose * 1000)
    }
  })
</script>

<template>
  <c-dialog v-model="isOpen" persistent max-width="780px">
    <template v-slot:title>
      <div class="title-icon">
        <!-- info備選顏色 #b0bec5 --->
        <c-icon
          v-show="type === 'info'"
          color="#64b5f6"
          size="3.6rem"
          icon="fa-solid fa-circle-info"
        />
        <c-icon
          v-show="type === 'success'"
          color="#81c784"
          size="3.6rem"
          icon="fa-solid fa-circle-check"
        />
        <c-icon
          v-show="type === 'warning'"
          color="#ffd54f"
          size="3.6rem"
          icon="fa-solid fa-triangle-exclamation"
        />
        <c-icon
          v-show="type === 'error'"
          color="#e57373"
          size="3.6rem"
          icon="fa-solid fa-circle-xmark"
        />
        <c-icon
          v-show="type === 'question'"
          color="#f0f4f8"
          size="3.6rem"
          icon="fa-solid fa-circle-question"
        />
      </div>
    </template>
    <div class="msg-area">{{ message }}</div>
    <template v-slot:buttons>
      <div class="col-auto">
        <c-button
          v-if="mode === 'confirm'"
          value="取消"
          icon="mdi-close-circle"
          kind="cancel"
          @click="onCancel"
        />
      </div>
      <div class="col-auto">
        <c-button value="確認" icon="mdi-check-circle" kind="confirm" @click="onConfirm" />
      </div>
    </template>
  </c-dialog>
</template>

<style scoped>
  .title-icon {
    padding-top: 5px;
    padding-bottom: 5px;
    text-align: center;
  }
  .msg-area {
    font-size: 28px;
    font-weight: bold;
    text-align: center;
    white-space: pre-wrap;
  }
</style>

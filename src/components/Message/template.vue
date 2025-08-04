<script setup lang="ts">
  import { ref } from 'vue'
  import msgDialog from './dialog.vue'
  import type { MsgDialogOptions } from './type'

  interface MessageOptions extends MsgDialogOptions {
    isOpen: boolean
  }

  const queue = ref<MessageOptions[]>([]) //佇列

  const show = (options: MsgDialogOptions) => {
    if (!options.message) {
      console.warn('message is need for alert or confirm')
    }

    const queueItem = {
      isOpen: false,
      ...options
    }
    queue.value.push(queueItem)
  }

  const queueRemove = (item: MessageOptions, fnc: Function | undefined | null) => {
    const index = queue.value.indexOf(item)
    if (index > -1) queue.value.splice(index, 1)
    if (fnc) fnc()
  }

  defineExpose({ show })
</script>

<template>
  <msg-dialog
    v-for="(item, index) in queue"
    v-model="item.isOpen"
    :key="`msg-${index}-${item.message}`"
    :type="item?.type"
    :mode="item?.mode"
    :message="item.message"
    :auto-close="item?.autoClose"
    @confirm="queueRemove(item, item?.onConfirm)"
    @cancel="queueRemove(item, item?.onCancel)"
    @mounted="item.isOpen = true"
  />
</template>

<style scoped></style>

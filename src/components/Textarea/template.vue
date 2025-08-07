<script lang="ts" setup>
  import { computed, useAttrs } from 'vue'
  import { cIcon } from '@/components/common'
  const attr = useAttrs()

  const model = defineModel({ default: '' })
  const props = defineProps({
    label: {
      type: String
    },
    icon: {
      type: String
    },
    isRequired: {
      type: Boolean,
      default: false
    }
  })

  const redicon = computed(() => {
    const disabled = attr?.disabled ?? false
    return props.isRequired && disabled === false
  })
</script>

<template>
  <v-textarea
    v-bind="$attrs"
    v-model="model"
    hide-details="auto"
    density="compact"
    rounded="1"
    rows="3"
    no-resize
  >
    <template v-slot:prepend-inner>
      <div class="prepend-inner-content">
        <c-icon
          v-if="icon || isRequired"
          :icon="isRequired && !icon ? 'fa-solid fa-asterisk' : icon"
          size="24"
          :color="redicon ? 'red' : '#4b4b4b'"
          class="me-1"
        />
        <span class="fixed-label" v-if="label">{{ props.label }}</span>
      </div>
    </template>
    <template v-slot:clear>
      <div class="clear-content" v-if="$attrs.clearable || $attrs.clearable === ''">
        <c-icon
          icon="mdi-close-circle"
          size="18"
          class="mx-1"
          color="#4b4b4b"
          @click="model = ''"
        />
      </div>
    </template>
  </v-textarea>
</template>

<style scoped>
  .fixed-label {
    white-space: nowrap; /* 不允許換行 */
    overflow: hidden; /* 超出裁切 */
    text-overflow: ellipsis; /* 顯示省略符號 */
    display: inline-block;
    min-width: 2em; /* 視需要設寬度 */
    color: #000; /* 或 color: black */
    font-weight: bold;
    font-size: 20px;
  }
  /* 左側 icon 和 label 區塊置中 */
  .prepend-inner-content {
    display: flex;
    align-items: center;
  }
  /* 輸入框背景色 */
  :deep(.v-field) {
    background-color: var(--input-bg-color);
  }
  /* 輸入框選中時背景色 */
  :deep(.v-field--focused) {
    background-color: rgba(255, 250, 205, 0.83); /* #fffacd + 0.83透明 */
  }
  /* 輸入文字顏色和大小 */
  :deep(.v-field__input) {
    color: var(--input-text-color);
    caret-color: var(--input-text-color);
    font-size: 20px;
  }
  /* placeholder 文字顏色 */
  :deep(.v-field__input::placeholder) {
    color: #aaa;
    opacity: 1;
  }
  /* 隱藏底線 */
  :deep(.v-field__outline) {
    display: none;
  }
  /* 禁用時底色 */
  /* 禁用時底色和文字顏色  */
  :deep(.v-field--disabled) {
    opacity: var(--input-disabled-opacity);

    :deep(.v-field__input) {
      color: var(--input-disabled-text-color);
    }
  }
</style>

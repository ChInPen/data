<script lang="ts" setup>
  import { ref, computed } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon } from '@/components/common'
  import { numberFormat, numberFormatValue } from '@/utils/uformat'

  type NumberFormat = {
    minus?: boolean
    decimal?: boolean
    decAfterN?: number
    thousands?: boolean
  }

  const model = defineModel<string | number>({ default: '' })
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
    },
    type: {
      type: String,
      default: 'text'
    },
    numberFormat: Object as PropType<NumberFormat>
  })

  const inputValue = computed<string | number>({
    get: () => {
      switch (props.type) {
        case 'number':
          return numberFormat(model.value, {
            minus: props.numberFormat?.minus ?? false,
            decimal: props.numberFormat?.decimal ?? false,
            decAfterN: props.numberFormat?.decAfterN,
            thousands: props.numberFormat?.thousands ?? false
          })
        default:
          return model.value
      }
    },
    set: (newVal) => {
      switch (props.type) {
        case 'number':
          const numberValue = numberFormatValue(newVal, {
            minus: props.numberFormat?.minus ?? false,
            decimal: props.numberFormat?.decimal ?? false,
            decAfterN: props.numberFormat?.decAfterN
          })
          model.value = numberValue
          break
        default:
          model.value = newVal
          break
      }
    }
  })

  //密碼用(type="password")
  const lookPass = ref(false)

  //輸入框 type
  const inputType = computed(() => {
    //數字類型
    if (props.type === 'number') return 'text'
    //密碼類型
    if (props.type === 'password' && lookPass.value) return 'text'
    return props.type || 'text' //預設 'text'
  })
</script>

<template>
  <v-text-field
    ref="input"
    v-bind="$attrs"
    v-model="inputValue"
    :type="inputType"
    hide-details="auto"
    density="compact"
    rounded="1"
  >
    <template v-slot:prepend-inner>
      <div class="prepend-inner-content">
        <c-icon
          v-if="icon || isRequired"
          :icon="isRequired && !icon ? 'fa-solid fa-asterisk' : icon"
          size="24"
          :color="isRequired ? 'red' : '#4b4b4b'"
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
    <template v-slot:append-inner v-if="props.type === 'password'">
      <div>
        <c-icon
          v-if="lookPass"
          icon="fa-solid fa-eye-slash"
          size="20"
          class="mx-1"
          color="#4b4b4b"
          @click="lookPass = false"
        />
        <c-icon
          v-else
          icon="fa-solid fa-eye"
          size="20"
          class="mx-1"
          color="#4b4b4b"
          @click="lookPass = true"
        />
      </div>
    </template>
  </v-text-field>
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
  /* clearable icon 區塊置中 */
  .clear-content {
    height: 100%;
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
</style>

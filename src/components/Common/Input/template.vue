<script lang="ts" setup>
  import { ref, computed, useAttrs } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon } from '@/components/Common'
  import { numberFormat, numberFormatValue, digitFormat, digitFormatValue } from '@/utils/uformat'
  const attr = useAttrs()

  type DigitFormat = {
    phone?: boolean
    english?: boolean
  }

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
    digitFormat: Object as PropType<DigitFormat>,
    numberFormat: Object as PropType<NumberFormat>
  })

  const isComposing = ref(false) //中文輸入法組字中判斷用 flag
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
        case 'date':
          return digitFormat(model.value, { dateTW: true })
        default:
          return model.value
      }
    },
    set: (newVal) => {
      switch (props.type) {
        case 'number':
        case 'date':
          if (!isComposing.value) {
            setInput(newVal)
          }
          break
        default:
          if (props.digitFormat) {
            model.value = digitFormatValue(newVal, { ...props.digitFormat })
          } else {
            model.value = newVal
          }
          break
      }
    }
  })
  const setInput = (newVal: string | number) => {
    //將 computed set 邏輯拆出來重複使用
    if (props.type === 'number') {
      const numberValue = numberFormatValue(newVal, {
        minus: props.numberFormat?.minus ?? false,
        decimal: props.numberFormat?.decimal ?? false,
        decAfterN: props.numberFormat?.decAfterN
      })
      model.value = numberValue
    }
    if (props.type === 'date') {
      model.value = digitFormatValue(newVal, { dateTW: true })
    }
  }
  const redicon = computed(() => {
    const disabled = attr?.disabled ?? false
    return props.isRequired && disabled === false
  })

  //密碼用(type="password")
  const lookPass = ref(false)

  //輸入框 type
  const inputType = computed(() => {
    //數字類型
    if (props.type === 'number') return 'text'
    //日期類型
    if (props.type === 'date') return 'text'
    //密碼類型
    if (props.type === 'password' && lookPass.value) return 'text'
    return props.type || 'text' //預設 'text'
  })

  // 處理 IME 組字事件
  // 如果沒處理，中文輸入法使用數字鍵會重複輸入
  const onCompositionStart = () => {
    isComposing.value = true
  }
  const onCompositionEnd = (e: Event) => {
    isComposing.value = false
    // 組字結束後馬上做一次格式化
    if (props.type === 'number' || props.type === 'date') {
      const target = e.target as HTMLInputElement
      setInput(target.value)
    }
  }

  const inputRef = ref()
  defineExpose({
    inputRef // 暴露 inputRef 實例
  })
</script>

<template>
  <v-text-field
    ref="inputRef"
    v-bind="$attrs"
    v-model="inputValue"
    :type="inputType"
    hide-details="auto"
    density="compact"
    rounded="1"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
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
        <span class="fixed-label" v-if="label">
          {{ props.label }}
        </span>
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
  /* 禁用時底色和文字顏色  */
  :deep(.v-field--disabled) {
    opacity: var(--input-disabled-opacity);

    :deep(.v-field__input) {
      color: var(--input-disabled-text-color);
    }
  }
</style>

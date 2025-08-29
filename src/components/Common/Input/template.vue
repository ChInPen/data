<script lang="ts" setup>
  import { ref, computed, useAttrs, getCurrentInstance } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon, cButton } from '@/components/Common'
  import {
    numberFormat,
    numberFormatValue,
    dateFormat,
    dateFormatValue,
    Format
  } from '@/utils/uformat'
  const attr = useAttrs()

  type tFormat = {
    minus?: boolean
    decimal?: boolean
    decAfterN?: number
    thousands?: boolean
    number?: boolean
    english?: boolean
    phone?: boolean
  }

  const model = defineModel<string | number>({ default: '' })
  const abbr = defineModel<string>('abbr')
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
    format: Object as PropType<tFormat>,
    maxlength: Number,
    lengthAutoWidth: {
      type: Boolean,
      default: true
    }
  })
  const emit = defineEmits(['change', 'button'])

  const numberFormatOptions = computed(() => {
    const { minus, decimal, decAfterN } = props.format ?? {}
    return {
      minus: minus ?? false,
      decimal: decimal ?? false,
      decAfterN: decAfterN
    }
  })
  const formatOptions = computed(() => {
    if (props.format) {
      const { number, english, phone } = props.format
      if (number === true || english === true || phone === true) {
        return { digit: number, english, phone }
      }
    }
    return null
  })

  const isComposing = ref(false) //中文輸入法組字中判斷用 flag
  const inputValue = computed<string | number>({
    get: () => {
      switch (props.type) {
        case 'number':
          return numberFormat(model.value, {
            ...numberFormatOptions.value,
            thousands: props.format?.thousands ?? false
          })
        case 'date':
          return dateFormat(model.value, { dateTW: true })
        default:
          if (props.type === 'text' && formatOptions.value) {
            return Format(model.value, formatOptions.value)
          }
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
          if (props.type === 'text' && formatOptions.value) {
            model.value = Format(newVal, formatOptions.value)
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
      const numberValue = numberFormatValue(newVal, numberFormatOptions.value)
      model.value = numberValue
    }
    if (props.type === 'date') {
      model.value = dateFormatValue(newVal, { dateTW: true })
    }
  }
  const disabled = computed(() => attr?.disabled ?? false)
  const redicon = computed(() => props.isRequired && disabled.value === false)
  //自動計算輸入框寬度
  const lengthWidth = computed(() => {
    const padding = 24
    const icon = props.icon || props.isRequired ? 28.01 : 0
    const label = props.label ? props.label.length * 20.3 : 0
    const password = props.type === 'password' ? 28 : 0
    const btn = hasButtonEvent.value ? 40 : 0
    const clear = attr.clearable || attr.clearable == '' ? 34 : 8
    if (props.lengthAutoWidth && props.maxlength) {
      return props.maxlength * 20.3 + 12 + padding + icon + label + password + btn + clear
    } else {
      return undefined
    }
  })
  //輸入框限制字數
  const maxLength = computed(() => {
    if (!props.maxlength) return undefined

    if (props.type === 'number' && props.format?.thousands) {
      return props.maxlength + Math.floor((model.value.toString().length - 1) / 3)
    }
    return props.maxlength
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

  //名稱取5碼帶入簡稱
  const nameChange = () => {
    emit('change')
    //簡稱不為空白就return
    if (abbr.value === undefined || abbr.value !== '') return
    //取5碼帶入
    const modelvalue = typeof model.value === 'number' ? String(model.value) : (model.value ?? '')
    abbr.value = modelvalue.substring(0, 5)
  }

  //數字欄位時自動反白內容
  const handleFocusin = (event: FocusEvent) => {
    if (props.type === 'number' || props.format?.number === true) {
      //自動選取文字
      const target = event.target
      if (target instanceof HTMLInputElement && target.type === 'text') {
        target.select()
      }
    }
  }

  //控制輸入框內的按鈕要不要顯示
  const instance = getCurrentInstance()
  const hasButtonEvent = computed(() => {
    // 注意 defineEmits 對應到 template 裡是 onButton
    return !!instance?.vnode.props?.onButton
  })

  //每次渲染一個輸入框就 random 一個 name，避免觸發瀏覽器 autocomplete
  const randomName = ref('field_' + Math.random().toString(36).slice(2, 11))

  const inputRef = ref()
  defineExpose({
    inputRef // 暴露 inputRef 實例
  })
</script>

<template>
  <v-text-field
    ref="inputRef"
    :name="randomName"
    v-bind="$attrs"
    v-model="inputValue"
    :type="inputType"
    hide-details="auto"
    density="compact"
    rounded="1"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    @change="nameChange"
    :class="{
      'input-text-end': type === 'number' || format?.number === true
    }"
    @focusin="handleFocusin"
    :width="lengthWidth"
    :maxlength="maxLength"
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
    <template v-slot:append-inner v-if="(props.type === 'password' || hasButtonEvent) && !disabled">
      <div class="d-flex align-items-center">
        <c-icon
          v-if="props.type === 'password' && lookPass"
          icon="fa-solid fa-eye-slash"
          size="20"
          class="mx-1"
          color="#4b4b4b"
          @click="lookPass = false"
        />
        <c-icon
          v-if="props.type === 'password' && !lookPass"
          icon="fa-solid fa-eye"
          size="20"
          class="mx-1"
          color="#4b4b4b"
          @click="lookPass = true"
        />
        <c-button
          v-if="hasButtonEvent"
          kind="pick"
          class="p-0"
          width="40px"
          density="comfortable"
          @click="emit('button')"
        >
          ...
        </c-button>
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
  /* 數字欄位的文字要置右 */
  .v-input.input-text-end :deep(input) {
    text-align: end;
  }
</style>

<script lang="ts" setup>
  import { ref, computed, useAttrs } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon } from '@/components/Common'

  type Justify = 'start' | 'center' | 'end' | 'around' | 'between' | 'evenly'

  const model = defineModel<any>({ default: '' })
  const props = defineProps({
    items: {
      type: Array as PropType<{ value: any; label: string; color?: string; disabled?: boolean }[]>,
      default: []
    },
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
    rounded: {
      type: [String, Number],
      default: '1'
    },
    justify: String as PropType<Justify>,
    disabled: {
      type: Boolean,
      default: false
    }
  })

  const radiusClass = computed(() => {
    if (props.rounded == 1) return 'radius-1'
    else if (props.rounded == 2) return 'radius-2'
    else if (props.rounded == 3) return 'radius-3'
    else if (props.rounded == 4) return 'radius-4'
    return ''
  })
  const flexClass = computed(() => {
    return props.justify ? `radio-justify-${props.justify}` : ''
  })
  const disabledClass = computed(() => {
    return props.disabled ? 'radio-group-disabled' : ''
  })
  const redicon = computed(() => {
    const disabled = props?.disabled ?? false
    return props.isRequired && disabled === false
  })
</script>

<template>
  <v-radio-group
    :class="['c-radio-group', radiusClass, flexClass, disabledClass]"
    v-model="model"
    hide-details="auto"
  >
    <template v-slot:prepend v-if="label || icon || isRequired">
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
    <template v-slot:default>
      <slot name="default">
        <template v-if="!$slots.default">
          <v-radio
            class="text-black fw-bold"
            v-for="item in items"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :color="item?.color ?? 'primary'"
            :disabled="props.disabled === false ? (item?.disabled ?? false) : true"
          />
        </template>
      </slot>
    </template>
  </v-radio-group>
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
  .c-radio-group {
    &.v-input {
      background-color: var(--input-bg-color);
      padding: 3px 12px;

      &.radio-group-disabled {
        opacity: var(--input-disabled-opacity);
      }
    }
    &.radius-1 {
      border-radius: 0.25rem;
    }
    &.radius-2 {
      border-radius: 0.375rem;
    }
    &.radius-3 {
      border-radius: 0.5rem;
    }
    &.radius-4 {
      border-radius: 1rem;
    }

    .v-input__control {
      width: 100%;
    }

    &.radio-justify-start :deep(.v-selection-control-group--inline) {
      justify-content: start;
    }
    &.radio-justify-center :deep(.v-selection-control-group--inline) {
      justify-content: center;
    }
    &.radio-justify-end :deep(.v-selection-control-group--inline) {
      justify-content: end;
    }
    &.radio-justify-around :deep(.v-selection-control-group--inline) {
      justify-content: space-around;
    }
    &.radio-justify-between :deep(.v-selection-control-group--inline) {
      justify-content: space-between;
    }
    &.radio-justify-evenly :deep(.v-selection-control-group--inline) {
      justify-content: space-evenly;
    }

    :deep(.v-label) {
      font-size: 1.1rem;
    }
  }
</style>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { cIcon } from '@/components/Common'

  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    icon: {
      type: String
    },
    color: String,
    kind: String,
    value: String, // 作為 slot fallback
    width: [Number, String]
  })

  const emit = defineEmits(['click'])

  //按鈕顏色
  const colorStyle = computed(() => {
    const kindColor = `var(--btn-bg-${props.kind ?? 'default'})`
    return {
      'background-color': props.color ?? kindColor
    }
  })
  //寬度
  const widthStyle = computed(() => {
    if (!props.width) return { width: '100%' }

    // 如果是數字，補上 px
    if (typeof props.width === 'number') return { width: `${props.width}px`, 'min-width': 0 }
    // 只允許數字 + %, px, em, rem
    if (/^\d+(px|%|em|rem)?$/.test(props.width)) return { width: props.width, 'min-width': 0 }

    return { width: '100%' }
  })
</script>

<template>
  <v-btn
    v-bind="$attrs"
    class="c-btn"
    :style="[colorStyle, widthStyle]"
    @click="$emit('click', $event)"
  >
    <template v-slot:default>
      <div class="d-flex align-items-center">
        <c-icon
          v-if="props.icon"
          :class="!!props.value || !!$slots.default ? 'btn-icon-margin' : ''"
          :icon="props.icon"
          size="21"
          color="#f0f4f8"
        />
        <span class="btn-text">
          <slot>{{ value }}</slot>
        </span>
      </div>
    </template>
  </v-btn>
</template>

<style scoped>
  .c-btn {
    /* width: 100%; 改用computed計算 */
    padding: 0 12px;
  }

  .btn-text {
    color: var(--input-bg-color);
    font-size: 1.1rem;
    font-weight: bold;
  }

  .btn-icon-margin {
    margin-right: 5px;
  }
</style>

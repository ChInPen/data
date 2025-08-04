<script lang="ts" setup>
  import { computed } from 'vue'
  import { cIcon } from '@/components/common'

  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    icon: {
      type: String
    },
    color: String,
    kind: String,
    value: String // 作為 slot fallback
  })

  const emit = defineEmits(['click'])

  //按鈕顏色
  const colorStyle = computed(() => {
    const kindColor = `var(--btn-bg-${props.kind ?? 'default'})`
    return {
      'background-color': props.color ?? kindColor
    }
  })
</script>

<template>
  <v-btn v-bind="$attrs" class="c-btn" :style="colorStyle" @click="$emit('click', $event)">
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
    width: 100%;
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

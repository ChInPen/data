<script lang="ts" setup>
  import { computed } from 'vue'
  import { cInput } from '@/components/Common'

  const props = defineProps<{
    modelValue: string
    label?: string
    maxLength?: number
    dense?: boolean
    alnumUpper?: boolean
    width?: string
    disabled?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void
    (e: 'open'): void
  }>()

  const norm = (v: string) =>
    String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
      [props.alnumUpper ? 'toUpperCase' : 'toString']()

  const m = computed({
    get: () => props.modelValue,
    set: (val: string) => {
      const out = norm(val).slice(0, props.maxLength ?? 999)
      emit('update:modelValue', out)
    }
  })
</script>

<template>
  <div :class="['u-wch', width]">
    <c-input
      :label="label || '代碼(起)'"
      v-model="m"
      :maxlength="maxLength"
      :density="dense ? 'compact' : undefined"
      :disabled="disabled"
      :length-auto-width="false"
      @button="$emit('open')"
    />
  </div>
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
</style>

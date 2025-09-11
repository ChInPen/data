<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cInput } from '@/components/Common'

  type Range = { begin: string; end: string }

  // 命名 v-model（扁平）
  const from = defineModel<string>('from', { default: '' })
  const to = defineModel<string>('to', { default: '' })

  // 巢狀 v-model（物件）
  const props = withDefaults(
    defineProps<{
      modelValue?: Range
      mode?: 'object' | 'flat' | 'auto'
      labelFrom?: string
      labelTo?: string
      dense?: boolean
      disabled?: boolean
    }>(),
    {
      mode: 'auto',
      labelFrom: '開始日期',
      labelTo: '結束日期',
      dense: false,
      disabled: false
    }
  )

  const emit = defineEmits<{ (e: 'update:modelValue', v: Range): void }>()

  const syncing = ref(false)

  // 統一的 range（同你原本邏輯）
  const range = computed<Range>({
    get() {
      if (props.mode === 'object') {
        return { begin: props.modelValue?.begin ?? '', end: props.modelValue?.end ?? '' }
      }
      if (props.mode === 'flat') {
        return { begin: from.value, end: to.value }
      }
      const hasObject = props.modelValue !== undefined
      return hasObject
        ? { begin: props.modelValue?.begin ?? '', end: props.modelValue?.end ?? '' }
        : { begin: from.value, end: to.value }
    },
    set(v) {
      if (syncing.value) return
      syncing.value = true
      try {
        if (props.mode === 'object' || (props.mode === 'auto' && props.modelValue !== undefined)) {
          emit('update:modelValue', { begin: v.begin ?? '', end: v.end ?? '' })
        } else {
          from.value = v.begin ?? ''
          to.value = v.end ?? ''
        }
      } finally {
        syncing.value = false
      }
    }
  })

  /** ✅ 兩個可寫 computed，給 v-model 綁定 */
  const beginProxy = computed({
    get: () => range.value.begin,
    set: (val: string) => {
      range.value = { ...range.value, begin: val }
    }
  })
  const endProxy = computed({
    get: () => range.value.end,
    set: (val: string) => {
      range.value = { ...range.value, end: val }
    }
  })

  defineOptions({ inheritAttrs: false })
</script>

<template>
  <v-row align="center" v-bind="$attrs">
    <v-col cols="auto">
      <c-input
        type="date"
        :label="labelFrom"
        :density="dense ? 'compact' : undefined"
        :disabled="disabled"
        v-model="beginProxy"
        class="pad"
      />
    </v-col>
    <v-col cols="auto" class="text-center d-none d-md-block">
      <span class="text-h5 text-grey-lighten-1">～</span>
    </v-col>
    <v-col cols="auto">
      <c-input
        type="date"
        :label="labelTo"
        :density="dense ? 'compact' : undefined"
        :disabled="disabled"
        v-model="endProxy"
        class="pad-end"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
  .pad {
    margin: 0 12px 0 0;
    padding: 0;
  }
  .pad-end {
    margin: 0 0 0 12px;
  }
</style>

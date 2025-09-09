<script lang="ts" setup>
  import { computed } from 'vue'
  import { cInput } from '@/components/Common'

  type Range = { begin: string; end: string }

  const props = defineProps<{
    modelValue: Range
    labelFrom?: string
    labelTo?: string
    dense?: boolean
  }>()

  const emit = defineEmits<{ (e: 'update:modelValue', v: Range): void }>()

  const m = computed({
    get: () => props.modelValue,
    set: (v: Range) => emit('update:modelValue', v)
  })
</script>

<template>
  <v-row align="center" dense>
    <v-col md="3" class="mb-3">
      <c-input
        type="date"
        :label="labelFrom ?? '開始日期'"
        :density="dense ? 'compact' : undefined"
        v-model="m.begin"
      />
    </v-col>
    <v-col cols="1" class="text-center d-none d-md-block">
      <span class="text-h5 text-grey-lighten-1">～</span>
    </v-col>
    <v-col cols="auto" class="u-wch w-7ch mb-3">
      <c-input
        type="date"
        :label="labelTo ?? '結束日期'"
        :density="dense ? 'compact' : undefined"
        v-model="m.end"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }

  .sqte-form {
    --chpx: 16px;
    --from-slot-w: calc(20 * var(--chpx));
  }
  .w-7ch {
    --wch: calc(16 * var(--chpx));
  }
  .w-8ch {
    --wch: calc(18 * var(--chpx));
  }
  .w-10ch {
    --wch: calc(20 * var(--chpx));
  }
  .w-16ch {
    --wch: calc(24 * var(--chpx));
  }
  .w-60ch {
    --wch: calc(50 * var(--chpx));
  }
  .w-20ch {
    --wch: calc(27 * var(--chpx));
  }
</style>

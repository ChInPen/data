<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import CodeFromField from '@/views/Analytics/composable/CustStart.vue'
  import CodeToField from '@/views/Analytics/composable/CustEnd.vue'
  import CodeMultiSelect from '@/views/Analytics/composable/CustMultiBut.vue'
  import { useSearchSupp } from '@/store/searchSupp'
  import { searchSupp } from '@/components/SearchSupp' // 單選彈窗
  import MultiSupp from '@/components/MultiSupp/MultiSupp.vue' // 多選彈窗

  type Model = { begin: string; end: string; limiteds: string[] }

  const props = defineProps<{
    modelValue: Model
    dense?: boolean
    widthFrom?: string
    widthTo?: string
  }>()
  const emit = defineEmits<{ (e: 'update:modelValue', v: Model): void }>()

  const m = computed<Model>({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })

  const isMulti = computed(() => (m.value.limiteds?.length ?? 0) > 0)
  const multiCount = computed(() => m.value.limiteds?.length ?? 0)

  // 單選 Dialog
  const store = useSearchSupp()
  const singleRef = ref<any>()
  const selectedOne = ref({ begin: '', end: '' })

  const openPicker = (side: 'from' | 'to') => {
    const toKey = side === 'from' ? 'begin' : 'end'
    store.set(selectedOne, [{ from: 'suppno', to: toKey }], { open: singleRef.value?.open })
  }

  // 回填單選
  watch([() => selectedOne.value.begin, () => selectedOne.value.end], ([b, e], [ob, oe]) => {
    const next = { ...m.value }
    if (b !== ob) next.begin = b
    if (e !== oe) next.end = e
    emit('update:modelValue', next)
  })

  // 多選 Dialog
  const multiOpen = ref(false)
  const selectedRows = ref<any[]>([])

  const onMultiPicks = (rows: any[]) => {
    selectedRows.value = rows
    const ids = rows.map((r) => String(r.suppno).trim()).filter(Boolean)
    emit('update:modelValue', { begin: '', end: '', limiteds: ids })
  }

  const clearMulti = () => {
    emit('update:modelValue', { ...m.value, limiteds: [] })
  }
</script>

<template>
  <v-row align="center" dense class="gap-y-2">
    <v-col cols="12" md="3">
      <CodeFromField
        :label="'廠商編號(起)'"
        :maxLength="8"
        :alnumUpper="true"
        :dense="dense"
        :width="widthFrom || 'w-8ch'"
        :model-value="m.begin"
        :disabled="isMulti"
        @update:modelValue="(v) => emit('update:modelValue', { ...m, begin: v })"
        @open="openPicker('from')"
      />
    </v-col>

    <v-col cols="12" md="1" class="text-center d-none d-md-block">
      <span class="text-h5 text-grey-lighten-1">～</span>
    </v-col>

    <v-col cols="12" md="3">
      <CodeToField
        :label="'廠商編號(迄)'"
        :maxLength="8"
        :alnumUpper="true"
        :dense="dense"
        :width="widthTo || 'w-8ch'"
        :model-value="m.end"
        :disabled="isMulti"
        @update:modelValue="(v) => emit('update:modelValue', { ...m, end: v })"
        @open="openPicker('to')"
      />
    </v-col>

    <v-col cols="12" md="auto">
      <CodeMultiSelect
        :count="multiCount"
        :showClear="isMulti"
        @open="multiOpen = true"
        @clear="clearMulti"
      />
    </v-col>
  </v-row>

  <!-- 單選 -->
  <search-supp ref="singleRef" @pick="store.pick" />

  <!-- 多選 -->
  <multi-supp v-model="multiOpen" @pick="onMultiPicks" :preselected="selectedRows" />
</template>

<style scoped>
  /* 跟你原本的 w-?ch 一致，方便沿用 */
  :root {
    --chpx: 16px;
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
  .w-20ch {
    --wch: calc(27 * var(--chpx));
  }
  .w-60ch {
    --wch: calc(50 * var(--chpx));
  }
</style>

<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import CodeRangeField from './CodeRangeField.vue'
  import { useSearchProt } from '@/store/searchProt'
  import { searchProt } from '@/components/SearchProt' // 單選彈窗
  import MultiProt from '@/components/MultiProt/MultiProt.vue' // 多選彈窗

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

  const store = useSearchProt()
  const singleRef = ref<any>()
  const multiOpen = ref(false)
  const selectedOne = ref({ begin: '', end: '' })

  const openPicker = (side: 'from' | 'to') => {
    const toKey = side === 'from' ? 'begin' : 'end'
    store.set(selectedOne, [{ from: 'protno', to: toKey }], { open: singleRef.value?.open })
  }

  watch([() => selectedOne.value.begin, () => selectedOne.value.end], ([b, e], [ob, oe]) => {
    const next = { ...m.value }
    if (b !== ob) next.begin = b
    if (e !== oe) next.end = e
    emit('update:modelValue', next)
  })

  const selectedRows = ref<any[]>([])
  const onMultiPicks = (rows: any[]) => {
    selectedRows.value = rows
    const ids = rows.map((r) => String(r.protno).trim()).filter(Boolean)
    emit('update:modelValue', { begin: '', end: '', limiteds: ids })
  }
</script>

<template>
  <CodeRangeField
    v-model="m as any"
    label="工程編號"
    :maxLength="16"
    :alnumUpper="true"
    :dense="dense"
    :widthFrom="widthFrom || 'w-16ch'"
    :widthTo="widthTo || 'w-16ch'"
    @open:from="openPicker('from')"
    @open:to="openPicker('to')"
    @open:multi="multiOpen = true"
  />

  <search-prot ref="singleRef" @pick="store.pick" />
  <multi-prot v-model="multiOpen" @pick="onMultiPicks" :preselected="selectedRows" />
</template>

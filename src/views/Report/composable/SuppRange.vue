<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import CodeRangeField from './CodeRangeField.vue' // 你剛做的那顆 UI 元件
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

  // v-model 橋接
  const m = computed<Model>({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })

  // stores & dialogs
  const store = useSearchSupp()
  const singleRef = ref<any>()
  const multiOpen = ref(false)

  // 單選暫存（由 store.set 寫入）
  const selectedOne = ref({ begin: '', end: '' })

  // 單選：開啟 picker
  const openPicker = (side: 'from' | 'to') => {
    const toKey = side === 'from' ? 'begin' : 'end'
    store.set(selectedOne, [{ from: 'suppno', to: toKey }], { open: singleRef.value?.open })
  }

  // 單選：回填到父層 v-model
  watch([() => selectedOne.value.begin, () => selectedOne.value.end], ([b, e], [ob, oe]) => {
    const next = { ...m.value }
    if (b !== ob) next.begin = b
    if (e !== oe) next.end = e
    emit('update:modelValue', next)
  })

  // 多選：rows 轉 limiteds，並清空單選
  const selectedRows = ref<any[]>([])
  const onMultiPicks = (rows: any[]) => {
    selectedRows.value = rows
    const ids = rows.map((r) => String(r.suppno).trim()).filter(Boolean)
    emit('update:modelValue', { begin: '', end: '', limiteds: ids })
  }
</script>

<template>
  <CodeRangeField
    v-model="m as any"
    label="廠商編號"
    :maxLength="8"
    :alnumUpper="true"
    :dense="dense"
    :widthFrom="widthFrom || 'w-8ch'"
    :widthTo="widthTo || 'w-8ch'"
    @open:from="openPicker('from')"
    @open:to="openPicker('to')"
    @open:multi="multiOpen = true"
  />

  <!-- 單選彈窗 -->
  <search-supp ref="singleRef" @pick="store.pick" />

  <!-- 多選彈窗 -->
  <multi-supp v-model="multiOpen" @pick="onMultiPicks" :preselected="selectedRows" />
</template>

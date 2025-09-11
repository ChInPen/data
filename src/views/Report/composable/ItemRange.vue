<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import CodeRangeField from './CodeRangeField.vue'
  import { useSearchItem } from '@/store/searchItem'
  import { searchItem } from '@/components/SearchItem' // 單選彈窗
  import MultiItem from '@/components/MultiItem/MultiItem.vue' // 多選彈窗

  type Model = { begin: string; end: string; limiteds: string[] }

  const props = defineProps<{
    modelValue: Model
    dense?: boolean
    widthFrom?: string
    widthTo?: string
    /** 是否顯示外部標題（預設 true） */
    showTitle?: boolean
    /** 外部標題文字（預設：工料編號） */
    title?: string
  }>()

  const emit = defineEmits<{ (e: 'update:modelValue', v: Model): void }>()
  // v-model 橋接
  const m = computed<Model>({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
  })
  // stores & dialogs
  const store = useSearchItem()
  const singleRef = ref<any>()
  const multiOpen = ref(false)
  // 單選暫存（由 store.set 寫入）
  const selectedOne = ref({ begin: '', end: '' })
  // 單選：開啟 picker
  const openPicker = (side: 'from' | 'to') => {
    const toKey = side === 'from' ? 'begin' : 'end'
    store.set(selectedOne, [{ from: 'itemno', to: toKey }], { open: singleRef.value?.open })
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
    const ids = rows.map((r) => String(r.itemno).trim()).filter(Boolean)
    emit('update:modelValue', { begin: '', end: '', limiteds: ids })
    // 清空單選暫存，避免畫面殘留
    selectedOne.value.begin = ''
    selectedOne.value.end = ''
  }
  // 預設值
  const showTitle = computed(() => props.showTitle ?? true)
  const titleText = computed(() => props.title ?? '工料編號')
</script>

<template>
  <v-row align="center" dense>
    <!-- 外部標題（可關閉/改字） -->
    <v-col v-if="showTitle" cols="auto" class="d-flex align-center">
      <h5 class="mb-0 font-weight-medium title-text">{{ titleText }}</h5>
    </v-col>

    <v-col :cols="showTitle ? 11 : 12">
      <CodeRangeField
        v-model="m as any"
        label="工料編號"
        :maxLength="20"
        :alnumUpper="true"
        :dense="dense"
        :widthFrom="widthFrom || 'w-20ch'"
        :widthTo="widthTo || 'w-20ch'"
        @open:from="openPicker('from')"
        @open:to="openPicker('to')"
        @open:multi="multiOpen = true"
      />
    </v-col>
  </v-row>

  <!-- 單選彈窗 -->
  <search-item ref="singleRef" @pick="store.pick" />

  <!-- 多選彈窗 -->
  <multi-item v-model="multiOpen" @pick="onMultiPicks" :preselected="selectedRows" />
</template>

<style scoped>
  /* 可依你的專案樣式微調或刪除，這裡給保守預設 */
  .title-text {
    color: white;
  }
</style>

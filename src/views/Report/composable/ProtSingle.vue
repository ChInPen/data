<script lang="ts" setup>
  import { ref, watch, computed } from 'vue'
  import { cInput } from '@/components/Common'
  import { useSearchProt } from '@/store/searchProt'
  import { searchProt } from '@/components/SearchProt' // 單選彈窗

  // v-model 傳一個「字串」即可（工程編號）
  const props = defineProps<{
    modelValue: string
    label?: string // 預設：工程編號
    maxLength?: number // 預設：16
    dense?: boolean
    alnumUpper?: boolean // 預設：true（只留英數並轉大寫）
    width?: string // 寬度 class，預設 w-16ch
    showTitle?: boolean // 外部標題（h5），預設 false
    title?: string
  }>()

  const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

  const store = useSearchProt()
  const singleRef = ref<any>()

  // v-model 橋接（可在 set 時做正規化）
  const norm = (v: string) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
    return (props.alnumUpper ?? true) ? s.toUpperCase() : s
  }
  const valueModel = computed({
    get: () => props.modelValue ?? '',
    set: (v: string) => emit('update:modelValue', norm(v).slice(0, props.maxLength ?? 16))
  })

  // 用於 store 單選回填
  const selectedOne = ref({ begin: '', end: '' })
  const openPicker = () => {
    // 只需要 begin，to: 'begin'
    store.set(selectedOne, [{ from: 'protno', to: 'begin' }], { open: singleRef.value?.open })
  }
  // 監聽單選結果 → 寫回 v-model
  watch(
    () => selectedOne.value.begin,
    (b) => {
      if (b != null) emit('update:modelValue', norm(String(b)).slice(0, props.maxLength ?? 16))
    }
  )

  const showTitle = computed(() => props.showTitle ?? false)
  const titleText = computed(() => props.title ?? (props.label || '工程編號'))
</script>

<template>
  <v-row align="center" class="mb-3" dense>
    <v-col v-if="showTitle" cols="auto" class="d-flex align-center">
      <h5 class="mb-0 font-weight-medium title-text">{{ titleText }}</h5>
    </v-col>

    <v-col :cols="showTitle ? 11 : 12">
      <div class="u-wch" :class="width || 'w-16ch'">
        <c-input
          :label="label || '工程編號'"
          v-model="valueModel"
          :maxlength="maxLength ?? 16"
          :density="dense ? 'compact' : undefined"
          :length-auto-width="false"
          @button="openPicker"
        />
      </div>
    </v-col>
  </v-row>

  <!-- 單選彈窗 -->
  <search-prot ref="singleRef" @pick="store.pick" />
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .w-16ch {
    --wch: calc(24 * 16px);
  } /* 依你的專案可用既有 class */
  .title-text {
    color: white;
  }
</style>

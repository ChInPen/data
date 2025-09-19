<script lang="ts" setup>
  import { computed } from 'vue'
  import { cSelect } from '@/components/Common'

  type Item = { feetno: string; feetname: string }

  const props = withDefaults(
    defineProps<{
      /** v-model：目前選中的註腳代碼（例如 '01'、'20'） */
      modelValue?: string
      /** 清單資料（不傳則用預設） */
      items?: Item[]
      /** 標籤文字 */
      label?: string
      /** 是否緊湊 */
      dense?: boolean
      /** 是否禁用 */
      disabled?: boolean
      /** 是否隱藏搜尋 */
      hideSearch?: boolean
      /** 顯示欄位 key（若你的資料鍵不同可客製） */
      itemTitleKey?: keyof Item
      /** 值欄位 key（若你的資料鍵不同可客製） */
      itemValueKey?: keyof Item
    }>(),
    {
      modelValue: '',
      label: '單行註腳',
      dense: true,
      disabled: false,
      hideSearch: true,
      itemTitleKey: 'feetname',
      itemValueKey: 'feetno',
      items: () => [
        { feetno: '01', feetname: '第一組' },
        { feetno: '02', feetname: '第二組' },
        { feetno: '03', feetname: '第三組' },
        { feetno: '04', feetname: '第四組' },
        { feetno: '05', feetname: '第五組' },
        { feetno: '20', feetname: '不列印' }
      ]
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', v: string): void
    /** 當使用者選擇時，若父層想要即時同步其他欄位，可用這個事件 */
    (e: 'change', payload: { value: string; item?: Item | undefined }): void
  }>()

  const valueModel = computed({
    get: () => props.modelValue ?? '',
    set: (v: string) => {
      emit('update:modelValue', v)
      const item = props.items.find((i) => String(i[props.itemValueKey]) === String(v))
      emit('change', { value: v, item })
    }
  })
</script>

<template>
  <c-select
    v-model="valueModel"
    :label="label"
    :items="items"
    :item-title="itemTitleKey as string"
    :item-value="itemValueKey as string"
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :hide-search="hideSearch"
    width="300px"
  />
</template>

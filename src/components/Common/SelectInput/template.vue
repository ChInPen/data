<script lang="ts" setup>
  import { ref, computed, watch } from 'vue'
  import type { PropType } from 'vue'
  import { cInput, cSelect } from '@/components/Common'

  const model = defineModel<any>()
  const title = defineModel<string | undefined>('title')
  const props = defineProps({
    items: {
      type: Array as PropType<any[]>
    },
    label: {
      type: String
    },
    icon: {
      type: String
    },
    density: {
      type: String as PropType<'default' | 'comfortable' | 'compact'>,
      default: 'compact'
    },
    rounded: {
      type: String as PropType<'0' | '1' | '2' | '3' | 'lg' | 'xl' | string>,
      default: '1'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    hideSearch: {
      type: Boolean,
      default: false
    },
    itemTitle: String,
    itemValue: String,
    itemColumns: {
      type: Array as PropType<{ column: string; label: string }[]>,
      default: () => []
    },
    front: {
      type: String as PropType<'input' | 'select'>,
      default: 'input'
    },
    inputLabel: {
      type: String
    },
    inputIcon: {
      type: String
    },
    inputMaxlength: Number,
    gutter: {
      type: [String, Number],
      default: 2
    },
    condensed: Boolean
  })

  const menuOpen = ref(false)
  const marginClass = computed(() => {
    const gutter = props.gutter?.toString() ?? '2'
    if (props.front === 'input') return `ms-${gutter}`
    if (props.front === 'select') return `me-${gutter}`
    return ''
  })

  const getItemTitle = (value: any) => {
    // 取得 item-title 欄位的值
    const items = props.items && Array.isArray(props.items) ? props.items : []
    let titleColumn = 'title'
    if (typeof props.itemTitle === 'string') {
      titleColumn = props.itemTitle
    }
    let valueColumn = 'value'
    if (typeof props.itemValue === 'string') {
      valueColumn = props.itemValue
    }
    const chooseItem = items.find((x) => x?.[valueColumn] === value)
    return chooseItem ? (chooseItem?.[titleColumn] ?? '') : ''
  }
  watch(
    () => model.value,
    (newVal: any) => {
      //將 item-title 欄位的值存進 v-model:title
      if (title.value !== undefined) {
        title.value = getItemTitle(newVal)
      }
    }
  )

  const selectRef = ref()
</script>

<template>
  <div class="d-flex">
    <c-input
      v-show="front === 'input'"
      :label="inputLabel"
      :icon="inputIcon"
      v-model="model"
      :maxlength="inputMaxlength"
      :condensed="condensed"
      :disabled="$attrs.disabled"
    />
    <c-select
      ref="selectRef"
      :class="marginClass"
      v-bind="$attrs"
      v-model="model"
      v-model:menu="menuOpen"
      :icon="icon"
      :label="label"
      :items="items"
      :item-title="front === 'input' ? itemTitle : itemValue"
      :item-value="itemValue"
      :item-columns="itemColumns"
      :density="density"
      :rounded="rounded"
      :hide-search="hideSearch"
      :is-required="isRequired"
      :condensed="condensed"
    />
    <c-input
      v-show="front === 'select'"
      :label="inputLabel"
      :icon="inputIcon"
      :model-value="title"
      :maxlength="inputMaxlength"
      :condensed="condensed"
      :disabled="$attrs.disabled"
      readonly
    />
  </div>
</template>

<style scoped></style>

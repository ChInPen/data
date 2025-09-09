<script lang="ts" setup>
  import { cButton } from '@/components/Common'

  const props = defineProps<{
    count?: number // 已選幾筆
    disabled?: boolean // 需要時可鎖多選
    showClear?: boolean // 是否顯示清除按鈕
  }>()

  const emit = defineEmits<{
    (e: 'open'): void
    (e: 'clear'): void
  }>()
</script>

<template>
  <div class="flex items-center gap-2">
    <c-button
      kind="search"
      icon="fa-solid fa-magnifying-glass"
      :disabled="disabled"
      @click="$emit('open')"
    >
      多選{{ count && count > 0 ? `（${count}）` : '' }}
    </c-button>
    <c-button v-if="showClear" kind="reset" icon="fa-solid fa-xmark" @click="$emit('clear')">
      清除多選
    </c-button>
  </div>
</template>

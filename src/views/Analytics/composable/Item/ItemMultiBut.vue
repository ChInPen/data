<!-- 多選式(工料) -->
<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cButton } from '@/components/Common'
  import MultiItem from '@/components/MultiItem/MultiItem.vue'

  // 資料庫進來的 Item
  type SearchData = {
    itemno: string
    itemname: string
    ikindname: string
    mkindname: string
    stkpurpc: number
    stksalpc: number
    [key: string]: any
  }

  const selectedItemnos = defineModel<any[]>({ default: [] })
  const props = withDefaults(
    defineProps<{
      disabled?: boolean
      dense?: boolean
      uniqueBy?: string
      returnField?: string
    }>(),
    {
      disabled: false,
      dense: false,
      uniqueBy: 'itemno',
      returnField: 'itemno'
    }
  )

  const selectedRows = ref<SearchData[]>([])

  const multiOpen = ref(false)
  const count = computed(() => selectedRows.value.length)

  /** 去重（依 uniqueBy 欄位） */
  function uniqBy<T extends Record<string, any>>(arr: T[], key: string) {
    const seen = new Set<string>()
    const out: T[] = []
    for (const r of arr) {
      const k = String(r?.[key] ?? '')
      if (!k || seen.has(k)) continue
      seen.add(k)
      out.push(r)
    }
    return out
  }

  /** 回傳物件陣列 → 取 no[] */
  const onMultiOwnerPicks = (rows: SearchData[]) => {
    const key = props.uniqueBy ?? 'itemno'
    const field = props.returnField ?? 'itemno'
    const unique = uniqBy(rows, key)
    selectedRows.value = unique
    const out = unique
      .map((r) => String(r?.[field] ?? '').trim())
      .filter((v): v is string => v.length > 0)
    selectedItemnos.value = out
    multiOpen.value = false
  }
</script>

<template>
  <v-row>
    <v-col cols="auto">
      <c-button
        kind="search"
        icon="fa-solid fa-magnifying-glass"
        :disabled="props.disabled"
        @click="multiOpen = true"
      >
        多選式{{ count > 0 ? `（${count}）` : '' }}
      </c-button>
    </v-col>
  </v-row>

  <MultiItem v-model="multiOpen" :preselected="selectedRows" @pick="onMultiOwnerPicks" />
</template>

<style scoped></style>

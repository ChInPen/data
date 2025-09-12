<!-- 多選式 -->
<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { cButton } from '@/components/Common'
  import MultiSupp from '@/components/MultiSupp/MultiSupp.vue'

  type SearchData = {
    suppno: string
    suppabbr: string
    suppname: string
    con1: string
    con2: string
    boss: string
    tel1: string
    tel2: string
    fax: string
    mobitel1: string
    mobitel2: string
    mobitel3: string
    compaddr: string
    [key: string]: any
  }

  const selected = defineModel<any[]>({ default: [] })
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
      uniqueBy: 'suppno',
      returnField: 'suppno'
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
    const key = props.uniqueBy ?? 'suppno'
    const field = props.returnField ?? 'suppno'
    const unique = uniqBy(rows, key)
    selectedRows.value = unique
    const out = unique
      .map((r) => String(r?.[field] ?? '').trim())
      .filter((v): v is string => v.length > 0)
    selected.value = out
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

  <MultiSupp v-model="multiOpen" :preselected="selectedRows" @pick="onMultiOwnerPicks" />
</template>

<style scoped></style>

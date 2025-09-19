<!-- ProtEnd.vue：業主搜尋框(迄) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchItem } from '@/components/SearchItem' // 廠商彈窗元件查詢
  import { useSearchItem } from '@/store/searchItem'
  const storeItem = useSearchItem()
  const model = defineModel<string>({ default: '' })
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
    }>(),
    {
      alnumUpper: true,
      maxlength: 20
    }
  )
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ itemno: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.itemno = val
    }
  })

  watch(
    () => model.value,
    (v) => {
      formData.value.itemno = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeItem.set(formData, [{ from: 'itemno', to: 'protno' }], { open: ownerPickOpen.value?.open })
  }
  const onPicked = (row: any) => {
    const val = String(row?.itemno ?? '').trim()
    model.value = val
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="工料編號(迄)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeItem.keyEnter(e, formData, [{ from: 'itemno', to: 'protno' }], ownerNoFromModel, {
              open: openOwnerPicker
            })
        "
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
  <search-item ref="ownerPickOpen" @pick="onPicked" />
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .w-10ch {
    --wch: calc(460px);
  }
</style>

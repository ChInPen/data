<!-- CustStart.vue：業主搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchSkill } from '@/components/SearchSkill' // 廠商彈窗元件查詢
  import { useSearchSkill } from '@/store/searchSkill'
  const storeSkill = useSearchSkill()
  const model = defineModel<string>({ default: '' })
  const abbrModel = defineModel<string>('abbr', { default: '' })
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
      label?: string
    }>(),
    {
      alnumUpper: true,
      maxlength: 10,
      label: '工種編號(起)'
    }
  )
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ skillno: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.skillno = val
      if (!val) abbrModel.value = ''
    }
  })

  watch(
    () => model.value,
    (v) => {
      formData.value.skillno = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeSkill.set(formData, [{ from: 'skillno', to: 'skillno' }], {
      open: ownerPickOpen.value?.open
    })
  }
  const onPicked = (row: any) => {
    const no = String(row?.skillno ?? '').trim()
    const abbr = String(row?.skillname ?? '').trim()
    model.value = no
    abbrModel.value = abbr
  }
</script>

<template>
  <c-input
    v-model="ownerNoFromModel"
    :label="label"
    :disabled="props.disabled"
    :maxlength="props.maxlength"
    density="compact"
    :length-auto-width="false"
    @button="openOwnerPicker"
    @keydown="
      (e: any) =>
        storeSkill.keyEnter(e, formData, [{ from: 'skillno', to: 'skillno' }], ownerNoFromModel, {
          open: openOwnerPicker
        })
    "
  />
  <!-- 單選彈窗 -->
  <search-skill ref="ownerPickOpen" @pick="onPicked" />
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .w-10ch {
    --wch: calc(343px);
  }
</style>

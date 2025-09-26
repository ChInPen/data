<!-- 工程搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchProt } from '@/components/SearchProt'
  import { useSearchProt } from '@/store/searchProt'

  const storeProt = useSearchProt()
  const model = defineModel<string>({ default: '' })
  const abbrModel = defineModel<string>('abbr', { default: '' })
  const allModel = defineModel<any>('all', { default: '' })

  // script setup
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
      label?: string
    }>(),
    {
      alnumUpper: true,
      maxlength: 16,
      label: '工程編號(起)'
    }
  )
  // 也可做個保險（去除空字串）
  const labelText = computed(() => (props.label?.trim() ? props.label : '工程編號(起)'))
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ protno_s: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.protno_s = val
      if (!val) abbrModel.value = ''
      allModel.value = null
    }
  })
  watch(
    () => model.value,
    (v) => {
      formData.value.protno_s = v ?? ''
    },
    { immediate: true }
  )
  const openOwnerPicker = () => {
    storeProt.set(formData, [{ from: 'protno', to: 'protno_s' }], {
      open: ownerPickOpen.value?.open
    })
  }
  const onPicked = (row: any) => {
    const val = String(row?.protno ?? '').trim()
    model.value = val
    abbrModel.value = String(row?.protabbr ?? '').trim()
    allModel.value = row
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        :label="labelText"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        icon="fa-solid fa-helmet-safety"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeProt.keyEnter(
              e,
              formData,
              [{ from: 'protno', to: 'protno_s' }],
              ownerNoFromModel,
              { open: openOwnerPicker }
            )
        "
      />
    </v-col>
  </v-row>
  <search-prot ref="ownerPickOpen" @pick="onPicked" />
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .w-10ch {
    --wch: 415px;
  }
</style>

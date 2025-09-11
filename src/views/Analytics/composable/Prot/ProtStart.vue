<!-- 工程搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchProt } from '@/components/SearchProt'
  import { useSearchProt } from '@/store/searchProt'

  const storeProt = useSearchProt()
  const model = defineModel<string>({ default: '' })
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
    }>(),
    {
      alnumUpper: true,
      maxlength: 16
    }
  )
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ protno_s: '' })
  const alnumN = (v: string, n: number, toUpper = true) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
      .slice(0, n)
    return toUpper ? s.toUpperCase() : s
  }
  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      const parsed = alnumN(val, props.maxlength, props.alnumUpper)
      model.value = parsed
      formData.value.protno_s = parsed
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
    model.value = alnumN(val, props.maxlength, props.alnumUpper)
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="工程編號(起)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
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

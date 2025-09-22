<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { PickPurEmit } from '@/components/PickPurEmit'
  import { usePickPurEmit } from '@/store/pickPurEmit'
  const store = usePickPurEmit()
  const model = defineModel<string>({ default: '' })
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
    }>(),
    {
      alnumUpper: false,
      maxlength: 14
    }
  )
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ ono: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.ono = val
    }
  })
  const onPicked = (row: any) => {
    const val = String(row?.ono ?? '').trim()
    model.value = val
  }
  watch(
    () => model.value,
    (v) => {
      formData.value.ono = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    store.set(formData, [{ from: 'ono', to: 'ono' }], {
      open: ownerPickOpen.value?.open
    })
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="發包估驗單號"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
  <PickPurEmit ref="ownerPickOpen" @pick="onPicked" />
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }
  .w-10ch {
    --wch: calc(400px);
  }
</style>

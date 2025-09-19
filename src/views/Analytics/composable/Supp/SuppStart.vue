<!-- SuppStart.vue：廠商搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchSupp } from '@/components/SearchSupp' // 廠商彈窗元件查詢
  import { useSearchSupp } from '@/store/searchSupp'
  const storeSupp = useSearchSupp()
  const model = defineModel<string>({ default: '' })
  const props = withDefaults(
    defineProps<{
      alnumUpper?: boolean
      disabled?: boolean
      maxlength?: number
    }>(),
    {
      alnumUpper: true,
      maxlength: 10
    }
  )
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ suppno: '' })

  const NoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.suppno = val
    }
  })

  watch(
    () => model.value,
    (v) => {
      formData.value.suppno = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeSupp.set(formData, [{ from: 'suppno', to: 'suppno' }], {
      open: ownerPickOpen.value?.open
    })
  }
  const onPicked = (row: any) => {
    const val = String(row?.suppno ?? '').trim()
    model.value = val
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="NoFromModel"
        label="廠商編號(起)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeSupp.keyEnter(e, formData, [{ from: 'suppno', to: 'suppno' }], NoFromModel, {
              open: openOwnerPicker
            })
        "
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
  <search-supp ref="ownerPickOpen" @pick="onPicked" />
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

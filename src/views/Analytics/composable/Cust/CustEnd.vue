<!-- CustEnd.vue：業主搜尋框(迄) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchCust } from '@/components/SearchCust' // 廠商彈窗元件查詢
  import { useSearchCust } from '@/store/searchCust'
  const storeCust = useSearchCust()
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
  const formData = ref({ custno_s: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.custno_s = val
    }
  })
  const onPicked = (row: any) => {
    const val = String(row?.custno ?? '').trim()
    model.value = val
  }
  watch(
    () => model.value,
    (v) => {
      formData.value.custno_s = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeCust.set(formData, [{ from: 'custno', to: 'custno_s' }], {
      open: ownerPickOpen.value?.open
    })
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="業主編號(迄)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeCust.keyEnter(
              e,
              formData,
              [{ from: 'custno', to: 'custno_s' }],
              ownerNoFromModel,
              {
                open: openOwnerPicker
              }
            )
        "
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
  <search-cust ref="ownerPickOpen" @pick="onPicked" />
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

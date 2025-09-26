<!-- CustStart.vue：業主搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchCust } from '@/components/SearchCust' // 廠商彈窗元件查詢
  import { useSearchCust } from '@/store/searchCust'
  const storeCust = useSearchCust()
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
      label: '業主編號(起)'
    }
  )
  // 也可做個保險（去除空字串）
  const labelText = computed(() => (props.label?.trim() ? props.label : '業主編號(起)'))
  const ownerPickOpen = ref<any>(null)
  const formData = ref({ custno_s: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.custno_s = val
      if (!val) abbrModel.value = ''
    }
  })

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
  const onPicked = (row: any) => {
    const no = String(row?.custno ?? '').trim()
    const abbr = String(row?.custabbr ?? row?.custname ?? '').trim()
    model.value = no
    abbrModel.value = abbr
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
        @button="openOwnerPicker"
        icon="fa-solid fa-user"
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

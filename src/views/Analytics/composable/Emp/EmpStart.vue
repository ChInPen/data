<!-- SuppStart.vue：業主搜尋框(起) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchEmp } from '@/components/SearchEmp' // 廠商彈窗元件查詢
  import { useSearchEmp } from '@/store/searchEmp'
  const storeSupp = useSearchEmp()
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
  const formData = ref({ empno: '' })

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
      formData.value.empno = parsed
    }
  })

  watch(
    () => model.value,
    (v) => {
      formData.value.empno = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeSupp.set(formData, [{ from: 'empno', to: 'empno' }], {
      open: ownerPickOpen.value?.open
    })
  }
  const onPicked = (row: any) => {
    const val = String(row?.empno ?? '').trim()
    model.value = alnumN(val, props.maxlength, props.alnumUpper)
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="人員編號(起)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeSupp.keyEnter(e, formData, [{ from: 'empno', to: 'empno' }], ownerNoFromModel, {
              open: openOwnerPicker
            })
        "
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
  <search-emp ref="ownerPickOpen" @pick="onPicked" />
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

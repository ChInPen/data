<!-- ProtEnd.vue：業主搜尋框(迄) -->
<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { cInput } from '@/components/Common'
  import { searchProt } from '@/components/SearchProt' // 廠商彈窗元件查詢
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
  const formData = ref({ protno: '' })

  const ownerNoFromModel = computed({
    get: () => model.value,
    set: (val: string) => {
      model.value = val
      formData.value.protno = val
    }
  })

  watch(
    () => model.value,
    (v) => {
      formData.value.protno = v ?? ''
    },
    { immediate: true }
  )

  const openOwnerPicker = () => {
    storeProt.set(
      formData, // 給 store 的容器（ref）
      [{ from: 'protno', to: 'protno' }],
      { open: ownerPickOpen.value?.open } // 若有 open 函式就呼叫
    )
  }
  const onPicked = (row: any) => {
    const val = String(row?.protno ?? '').trim()
    model.value = val
  }
</script>

<template>
  <v-row>
    <v-col class="u-wch w-10ch">
      <c-input
        v-model="ownerNoFromModel"
        label="工程編號(迄)"
        :disabled="props.disabled"
        :maxlength="props.maxlength"
        density="compact"
        :length-auto-width="false"
        @button="openOwnerPicker"
        @keydown="
          (e: any) =>
            storeProt.keyEnter(e, formData, [{ from: 'protno', to: 'protno' }], ownerNoFromModel, {
              open: openOwnerPicker
            })
        "
      />
    </v-col>
  </v-row>
  <!-- 單選彈窗 -->
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
    --wch: calc(415px);
  }
</style>

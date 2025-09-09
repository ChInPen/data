<script lang="ts" setup>
  import { computed } from 'vue'
  import { cInput, cButton } from '@/components/Common'

  type Model = { begin: string; end: string; limiteds: string[] }

  // 接收父層資料傳入
  const props = defineProps<{
    modelValue: Model //接收父層的v-model
    label?: string // 顯示用，例如「廠商編號」
    maxLength?: number //最大字數
    dense?: boolean //排版的緊湊模式(Vuetify)
    alnumUpper?: boolean // 是否限制英數+轉大寫
    widthFrom?: string
    widthTo?: string
  }>()

  // 回傳給父層的資料
  const emit = defineEmits<{
    (e: 'update:modelValue', v: Model): void
    (e: 'open:from'): void // 讓父層開啟單選「起」彈窗
    (e: 'open:to'): void // 讓父層開啟單選「迄」彈窗
    (e: 'open:multi'): void // 讓父層開啟「多選」彈窗
  }>()

  const norm = (v: string) => {
    const s = String(v ?? '')
      .normalize('NFKC')
      .replace(/[^0-9a-z]/gi, '')
    return props.alnumUpper ? s.toUpperCase() : s
  }

  const m = computed({
    get: () => props.modelValue,
    set: (v: Model) => emit('update:modelValue', v)
  })

  const isMulti = computed(() => (m.value.limiteds?.length ?? 0) > 0)

  const beginModel = computed({
    get: () => m.value.begin,
    set: (val: string) => {
      const out = norm(val).slice(0, props.maxLength ?? 999)
      emit('update:modelValue', { ...m.value, begin: out })
    }
  })

  const endModel = computed({
    get: () => m.value.end,
    set: (val: string) => {
      const out = norm(val).slice(0, props.maxLength ?? 999)
      emit('update:modelValue', { ...m.value, end: out })
    }
  })
</script>

<template>
  <v-row align="center" dense class="sqte-form">
    <v-col md="3" class="mb-3">
      <v-row>
        <v-col cols="auto" class="u-wch" :class="props.widthFrom">
          <c-input
            :label="label || '代碼'"
            v-model="beginModel"
            :maxlength="maxLength"
            :density="dense ? 'compact' : undefined"
            :disabled="isMulti"
            :length-auto-width="false"
            @button="$emit('open:from')"
          />
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="1" class="text-center d-none d-md-block mb-3">
      <span class="text-h5 text-grey-lighten-1">～</span>
    </v-col>

    <v-col cols="auto mb-3">
      <v-row>
        <v-col cols="auto" class="u-wch" :class="props.widthTo">
          <c-input
            :label="label || '代碼'"
            v-model="endModel"
            :maxlength="maxLength"
            :density="dense ? 'compact' : undefined"
            :disabled="isMulti"
            :length-auto-width="false"
            @button="$emit('open:to')"
          />
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="auto mb-3" class="stack-1470">
      <div class="btn">
        <c-button kind="search" icon="fa-solid fa-magnifying-glass" @click="$emit('open:multi')">
          多選式
        </c-button>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
  .u-wch {
    width: var(--wch);
    min-width: var(--wch);
    max-width: var(--wch);
    flex: 0 0 var(--wch);
  }

  .sqte-form {
    --chpx: 16px;
    --from-slot-w: calc(20 * var(--chpx));
  }
  .w-7ch {
    --wch: calc(16 * var(--chpx));
  }
  .w-8ch {
    --wch: calc(18 * var(--chpx));
  }
  .w-10ch {
    --wch: calc(20 * var(--chpx));
  }
  .w-16ch {
    --wch: calc(24 * var(--chpx));
  }
  .w-60ch {
    --wch: calc(50 * var(--chpx));
  }
  .w-20ch {
    --wch: calc(27 * var(--chpx));
  }
</style>

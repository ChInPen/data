<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon, cInput } from '@/components/common'

  const model = defineModel()
  const props = defineProps({
    items: {
      type: Array as PropType<any[]>
    },
    label: {
      type: String
    },
    icon: {
      type: String
    },
    density: {
      type: String as PropType<'default' | 'comfortable' | 'compact'>,
      default: 'compact'
    },
    rounded: {
      type: String as PropType<'0' | '1' | '2' | '3' | 'lg' | 'xl' | string>,
      default: '1'
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    hideSearch: {
      type: Boolean,
      default: false
    },
    itemColumns: {
      type: Array as PropType<{ column: string; label: string }[]>,
      default: () => []
    }
  })

  const search = ref('')
  const menuOpen = ref(false)

  //監聽開啟選單時清空查詢框 search
  watch(menuOpen, (isOpen) => {
    if (isOpen === true) {
      search.value = ''
    }
  })
</script>

<template>
  <v-select
    v-bind="$attrs"
    v-model="model"
    v-model:menu="menuOpen"
    :items="items"
    hide-details="auto"
    :density="density"
    :rounded="rounded"
    :list-props="{ bgColor: 'white' }"
    no-data-text="無資料"
  >
    <template v-slot:prepend-inner>
      <div class="prepend-inner-content">
        <c-icon
          v-if="icon || isRequired"
          :icon="isRequired && !icon ? 'fa-solid fa-asterisk' : icon"
          size="24"
          :color="isRequired ? 'red' : '#4b4b4b'"
          class="me-1"
        />
        <span class="fixed-label" v-if="label">{{ props.label }}</span>
      </div>
    </template>
    <template v-slot:clear>
      <div class="clear-content" v-if="$attrs.clearable || $attrs.clearable === ''">
        <c-icon
          icon="mdi-close-circle"
          size="18"
          class="mx-1"
          color="#4b4b4b"
          @click="model = null"
        />
      </div>
    </template>
    <template v-slot:prepend-item v-if="!props.hideSearch && items?.length && items?.length > 0">
      <v-list-item class="select-search">
        <c-input
          v-model="search"
          icon="fa-solid fa-magnifying-glass"
          autofocus
          clearable
          @mousedown.stop
          @click.stop
        />
      </v-list-item>
      <v-divider class="mt-1 mb-1"></v-divider>
    </template>
    <template v-slot:item="{ item, index, props }">
      <!-- 表頭 -->
      <template v-if="itemColumns.length > 0">
        <v-list-item density="compact" v-if="index === 0">
          <v-list-item-title class="text-grey">
            <v-row no-gutters>
              <!--class="justify-content-around"-->
              <v-col v-for="(col, i) in itemColumns" :key="'head-' + i" class="px-2 text-center">
                {{ col.label }}
              </v-col>
            </v-row>
          </v-list-item-title>
        </v-list-item>
      </template>

      <!-- 資料列 -->
      <v-list-item
        class="select-list-item"
        v-bind="{ ...props, title: undefined, ripple: { class: 'text-blue' } }"
        v-if="itemColumns.length > 0"
        v-show="
          Object.values(item.raw)
            .map((v) => String(v))
            .some((x) => x.includes(search))
        "
      >
        <v-list-item-title>
          <v-row no-gutters>
            <v-col v-for="(col, i) in itemColumns" :key="i" class="px-2 text-center">
              {{ item.raw?.[col.column] }}
            </v-col>
          </v-row>
        </v-list-item-title>
      </v-list-item>

      <v-list-item
        class="select-list-item"
        v-bind="{ ...props, title: undefined, ripple: { class: 'text-blue' } }"
        v-if="itemColumns.length == 0"
        v-show="String(item.value).includes(search) || item.title.includes(search)"
      >
        <v-list-item-title class="title">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </template>
  </v-select>
</template>

<style scoped>
  .fixed-label {
    white-space: nowrap; /* 不允許換行 */
    overflow: hidden; /* 超出裁切 */
    text-overflow: ellipsis; /* 顯示省略符號 */
    display: inline-block;
    min-width: 2em; /* 視需要設寬度 */
    color: #000; /* 或 color: black */
    font-weight: bold;
    font-size: 20px;
  }
  /* 左側 icon 和 label 區塊置中 */
  .prepend-inner-content {
    display: flex;
    align-items: center;
  }
  /* clearable icon 區塊置中 */
  .clear-content {
    height: 100%;
    display: flex;
    align-items: center;
  }
  /* 輸入框背景色 */
  :deep(.v-field) {
    background-color: var(--input-bg-color);
    min-height: 46px; /* 強制高度與 input 相同 */
  }
  /* 輸入框選中時背景色 */
  :deep(.v-field--focused) {
    background-color: rgba(255, 250, 205, 0.83); /* #fffacd + 0.83透明 */
  }
  /* 輸入文字顏色和大小 */
  :deep(.v-field__input) {
    color: var(--input-text-color);
    caret-color: var(--input-text-color);
    font-size: 20px;
  }
  /* placeholder 文字顏色 */
  :deep(.v-field__input::placeholder) {
    color: #aaa;
    opacity: 1;
  }
  /* 隱藏底線 */
  :deep(.v-field__outline) {
    display: none;
  }
  /* 右側選單開關 icon 顏色 */
  :deep(.v-select__menu-icon) {
    color: var(--input-icon-color);
  }
  /* 選單選項文字顏色和大小 */
  .select-list-item .title {
    color: var(--select-menu-text-color);
    font-size: 18px;
  }
  /* 選單選項(滑鼠停留)背景色 */
  .select-list-item:hover {
    background-color: #e3f1fb;
  }
  /* 選單選項 active 時背景色 */
  .select-list-item.v-list-item--active {
    background-color: #dbecfa;
  }
  /* 選單查詢輸入框 選中時背景色 */
  .select-search :deep(.v-field--focused) {
    background-color: #e3f1fb;
  }
</style>

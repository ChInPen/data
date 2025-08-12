<script lang="ts" setup>
  import type { PropType } from 'vue'

  defineProps({
    textAlign: {
      type: String as PropType<'start' | 'center' | 'end'>,
      default: 'start'
    }
  })
</script>

<template>
  <div class="c-divider d-flex align-items-center">
    <v-divider class="me-3" v-show="textAlign === 'center' || textAlign === 'end'" />
    <slot></slot>
    <v-divider class="ms-3" v-show="textAlign === 'center' || textAlign === 'start'" />
  </div>
</template>

<style scoped>
  .c-divider {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text-color);
    white-space: nowrap;
  }
</style>

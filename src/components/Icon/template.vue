<script lang="ts" setup>
  import { computed } from 'vue'
  defineOptions({ inheritAttrs: false })

  const props = defineProps({
    icon: String
  })

  const autoAddPrefixIcon = computed(() => {
    let iconString = props.icon
    if (props.icon?.startsWith('mdi')) iconString = 'mdi:' + iconString
    if (props.icon?.startsWith('fa')) iconString = 'fa:' + iconString
    return iconString
  })
</script>

<template>
  <v-icon
    v-bind="$attrs"
    :icon="autoAddPrefixIcon"
    class="c-icon"
    :class="props.icon?.startsWith('mdi') ? 'mdi-icon-scale' : ''"
  >
    <slot></slot>
  </v-icon>
</template>

<style scoped>
  .mdi-icon-scale {
    display: inline-flex;
    transform-origin: center;
    transform: scale(1.3);
  }
  /* 需偏移調整位置的 icon */
  .fa-paper-plane {
    transform: translate(-10%, 5%); /* 往左 10%、往下 5% */
  }
  .fa-phone-volume {
    transform: translate(-10%, 0); /* 往左 10% */
  }
  .fa-user-plus {
    transform: translate(-15%, 0); /* 往左 10% */
  }
  .fa-user-pen {
    transform: translate(-15%, 0); /* 往左 10% */
  }
</style>

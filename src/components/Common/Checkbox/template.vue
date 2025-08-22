<script lang="ts" setup>
  import { computed } from 'vue'
  import type { PropType } from 'vue'

  type Justify = 'start' | 'center' | 'end'

  const model = defineModel<boolean | any[]>({ default: false })
  const props = defineProps({
    size: {
      type: [String, Number],
      default: '1'
    },
    iconJustify: String as PropType<Justify>
  })

  const sizeClass = computed(() => {
    switch (props.size.toString()) {
      case '2':
        return 'size2'
      case '3':
        return 'size3'
      case '4':
        return 'size4'
      case '5':
        return 'size5'
      case '6':
        return 'size6'
      default:
        return ''
    }
  })
  const iconClass = computed(() => {
    switch (props.iconJustify) {
      case 'start':
        return 'icon-left'
      case 'center':
        return 'icon-center'
      case 'end':
        return 'icon-right'
      default:
        return ''
    }
  })
</script>

<template>
  <v-checkbox v-model="model" :class="[sizeClass, iconClass]" hide-details="auto"></v-checkbox>
</template>

<style scoped>
  .size2 :deep(label) {
    font-size: 1.1rem;
  }
  .size3 :deep(label) {
    font-size: 1.2rem;
  }
  .size4 :deep(label) {
    font-size: 1.3rem;
  }
  .size5 :deep(label) {
    font-size: 1.4rem;
  }
  .size6 :deep(label) {
    font-size: 1.5rem;
  }
  .size2 :deep(.v-selection-control__input) {
    .mdi-checkbox-blank-outline,
    .mdi-checkbox-marked {
      transform: scale(1.1);
    }
  }
  .size3 :deep(.v-selection-control__input) {
    .mdi-checkbox-blank-outline,
    .mdi-checkbox-marked {
      transform: scale(1.2);
    }
  }
  .size4 :deep(.v-selection-control__input) {
    .mdi-checkbox-blank-outline,
    .mdi-checkbox-marked {
      transform: scale(1.3);
    }
  }
  .size5 :deep(.v-selection-control__input) {
    .mdi-checkbox-blank-outline,
    .mdi-checkbox-marked {
      transform: scale(1.4);
    }
  }
  .size6 :deep(.v-selection-control__input) {
    .mdi-checkbox-blank-outline,
    .mdi-checkbox-marked {
      transform: scale(1.5);
    }
  }
  .icon-left :deep(.v-selection-control) {
    justify-content: start;
  }
  .icon-center :deep(.v-selection-control) {
    justify-content: center;
  }
  .icon-right :deep(.v-selection-control) {
    justify-content: end;
  }
</style>

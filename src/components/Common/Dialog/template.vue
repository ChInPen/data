<script lang="ts" setup>
  import { computed } from 'vue'
  import type { PropType } from 'vue'

  type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  type Justify = 'start' | 'center' | 'end' | 'around' | 'between' | 'evenly'

  const model = defineModel<boolean>({ default: false })
  const props = defineProps({
    title: String,
    width: {
      type: String,
      default: '900'
    },
    color: {
      type: String,
      default: '#2a3d4d'
    },
    rounded: {
      type: String as PropType<'0' | '1' | '2' | '3' | 'lg' | 'xl' | string>,
      default: '3'
    },
    btnIsrow: {
      type: Boolean,
      default: true
    },
    btnAlign: {
      type: String as PropType<Align>,
      default: 'center'
    },
    btnJustify: {
      type: String as PropType<Justify>,
      default: 'end'
    },
    titleDivider: {
      type: Boolean,
      default: false
    },
    closeBtn: {
      type: Boolean,
      default: false
    }
  })

  const cardActionClass = computed(() => {
    const classList = []
    //row
    if (props.btnIsrow) {
      classList.push('row')
      classList.push('g-2')
    } else {
      classList.push('d-flex')
    }
    //align
    classList.push(`align-items-${props.btnAlign}`)
    //justify
    classList.push(`justify-content-${props.btnJustify}`)
    return classList
  })
</script>

<template>
  <v-dialog v-model="model" :width="width" v-bind="$attrs">
    <v-card :color="color" :rounded="rounded">
      <v-card-title class="fw-bold">
        <template v-slot:default>
          <slot name="title">
            <template v-if="title">{{ title }}</template>
          </slot>
        </template>
      </v-card-title>
      <div class="card-divider" v-show="title || titleDivider"></div>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions v-if="$slots.buttons">
        <div class="container-fluid p-0">
          <div :class="cardActionClass">
            <slot name="buttons"></slot>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
  .v-card-actions {
    padding: 1rem;
  }
  .card-divider {
    border-bottom: 1px solid #f0f4f8;
    margin: 0 10px;
    transform: scaleY(0.3);
  }
</style>

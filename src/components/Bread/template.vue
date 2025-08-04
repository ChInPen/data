<script lang="ts" setup>
  import { computed } from 'vue'
  import type { PropType } from 'vue'
  import { cIcon } from '@/components/common'
  import { useRoute } from 'vue-router'
  const route = useRoute()

  type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  type Justify = 'start' | 'center' | 'end' | 'around' | 'between' | 'evenly'

  const props = defineProps({
    title: String,
    isrow: {
      type: Boolean,
      default: true
    },
    align: {
      type: String as PropType<Align>,
      default: 'center'
    },
    justify: {
      type: String as PropType<Justify>,
      default: 'end'
    }
  })

  const breadTitle = computed<string[]>(() => {
    let arr: string[] = []
    if ('bread' in route.meta) {
      const bread = typeof route.meta.bread === 'string' ? route.meta.bread : ''
      const breads = bread.split('>')
      if (breads && breads.length > 0) {
        arr = arr.concat(breads)
      }
    }
    if (props.title) {
      const titles = props.title.split('>')
      if (titles && titles.length > 0) {
        arr = arr.concat(titles)
      }
    }
    return arr
  })

  const breadActionClass = computed(() => {
    const classList = []
    //row
    if (props.isrow) {
      classList.push('row')
      classList.push('g-2')
    } else {
      classList.push('d-flex')
    }
    //align
    classList.push(`align-items-${props.align}`)
    //justify
    classList.push(`justify-content-${props.justify}`)
    return classList
  })
</script>

<template>
  <div class="bread container-fluid px-0 py-3">
    <div class="row g-0">
      <div class="col-auto">
        <div class="row g-0 align-items-center">
          <template v-for="(item, index) in breadTitle">
            <div class="col-auto fw-bold">{{ item }}</div>
            <c-icon
              v-show="index + 1 != breadTitle.length"
              class="col-auto mx-1"
              size="20"
              icon="fa-solid fa-angle-right"
            />
          </template>
        </div>
      </div>
      <div class="col container-fluid p-0">
        <div :class="breadActionClass">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .bread {
    min-height: 48px;
    font-size: 1.2rem;

    /* i {
      margin-left: 2px;
      margin-right: 2px;
    } */
  }
</style>

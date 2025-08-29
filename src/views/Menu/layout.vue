<script lang="ts" setup>
  const handleKeydown = (e: KeyboardEvent) => {
    // 如果還在輸入法組字中，就不要攔截
    if (e.isComposing) return

    if (e.key === 'Enter') {
      const target = e.target as HTMLElement

      const skipTags = ['TEXTAREA', 'SELECT']
      const skipTypes = ['checkbox', 'radio']

      if (skipTags.includes(target.tagName)) return
      if (
        (target as HTMLInputElement).type &&
        skipTypes.includes((target as HTMLInputElement).type)
      )
        return

      e.preventDefault()

      const focusable = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
          'input:not([disabled]):not([readonly])' +
            ':not([type="checkbox"]):not([type="radio"]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"]):not([role="tab"])'
        )
      )

      const index = focusable.indexOf(target)
      if (index >= 0 && index < focusable.length - 1) {
        const next = focusable[index + 1]
        if (next) {
          next.focus()
          if ((next as HTMLInputElement).select) {
            ;(next as HTMLInputElement).select()
          }
        }
      }
    }
  }
</script>

<template>
  <div class="menu-layout" @keydown="handleKeydown">
    <slot></slot>
  </div>
</template>

<style scoped>
  .menu-layout {
    padding: 0 10px 10px;
  }
</style>

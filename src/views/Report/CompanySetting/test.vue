<script setup>
  import { ref } from 'vue'

  const formData = ref({
    dates: { begin: '1000101', end: '1151231' },
    empNOs: { begin: '', end: '', limiteds: [''] },
    pagination: { start: 0, length: 100, draw: 1 },
    feetNo: '05',
    printType: '內定報表'
  })
</script>
<template></template>
<style></style>

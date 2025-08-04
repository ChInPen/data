<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { cMessage } from '@/components/Message'
  import { register } from '@/components/Message/service'

  const messageRef = ref()

  onMounted(() => {
    register(messageRef.value)
  })
</script>

<template>
  <v-app>
    <router-view />
    <c-message ref="messageRef" />
  </v-app>
</template>

<style scoped></style>

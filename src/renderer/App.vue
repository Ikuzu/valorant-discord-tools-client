<template>
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  document.documentElement.classList.remove('dark')
  if (mq.matches) {
    document.documentElement.classList.add('dark')
  }

  // システムテーマが変わったら反映したいならこれ
  mq.addEventListener('change', (e) => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    document.documentElement.classList.remove('dark')
    if (mq.matches) {
      document.documentElement.classList.add('dark')
    }
  })
})
</script>

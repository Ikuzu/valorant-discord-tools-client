<template>
  <div class="space-y-6">
    <h1 class="text-xl font-bold text-center text-gray-300">Discord 認証</h1>

    <p class="text-center text-sm text-gray-300">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()
const message = ref('認証を開始します...')

onMounted(async () => {
  message.value = '認証中...'

  window.electron.on('oauth-success', (data) => {
    auth.setAuth(data)
    router.push('/home')
  })

  window.electron.on('oauth-failed', () => {
    message.value = '認証に失敗しました。'
  })

  // Discord OAuth開始
  try {
    const result = await window.electron.invoke('start-discord-oauth')
    if (result.status === 'browser-oauth') {
      message.value = 'ブラウザでDiscordのOAuthが開かれます'
    } else if (result.status === 'no-window') {
      message.value = '認証に失敗しました。'
    }
  } catch {
    message.value = '認証に失敗しました。'
  }
})
</script>

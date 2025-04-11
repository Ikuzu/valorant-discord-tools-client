<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm space-y-6">
      <h1 class="text-xl font-bold text-center dark:text-gray-300">Discord 認証</h1>

      <p class="text-center text-sm text-gray-700 dark:text-gray-300">{{ message }}</p>
    </div>
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

  window.electron.on('oauth-success', (data) => {
    auth.setAuth(data)
    router.push('/main')
  })

  window.electron.on('oauth-failed', () => {
    message.value = '認証に失敗しました。'
  })
})
</script>

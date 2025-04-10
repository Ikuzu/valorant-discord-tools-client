<template>
  <!-- 全体のコンテナ: テーマに応じて背景色や文字色を切り替える -->
  <div
    :class="[
      themeModeClass,
      'min-h-screen flex flex-col items-center justify-center transition-colors duration-300',
    ]"
    class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
  >
    <!-- 中央に配置するカード風のUI -->
    <div class="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <!-- テーマ選択 -->
      <div class="flex items-center justify-end mb-4">
        <label class="mr-2 text-sm font-medium text-gray-600 dark:text-gray-300">Theme:</label>
        <select
          v-model="themeMode"
          class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <!-- タイトル -->
      <h1 class="text-2xl font-bold mb-6 text-center">Valorant Discord Tools</h1>

      <!-- ユーザー情報 -->
      <div class="flex mb-6 justify-between">
        <div v-if="userId" class="flex items-center">
          <img
            v-if="userAvatarUrl"
            :src="userAvatarUrl"
            alt="Avatar"
            class="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <p class="font-semibold text-lg">{{ userName }}</p>
        </div>
        <div v-else class="text-sm text-gray-500 dark:text-gray-400 mb-6">ログイン待機中...</div>

        <!-- 再認証ボタン -->
        <div class="text-right">
          <button
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-semibold focus:outline-none focus:ring"
            @click="handleReAuth"
          >
            <span v-if="userId">再認証</span>
            <span v-else>認証</span>
          </button>
        </div>
      </div>

      <!-- ギルド選択 -->
      <div class="mb-4">
        <label class="block mb-2 font-medium text-sm text-gray-700 dark:text-gray-300">
          Select a guild
        </label>
        <select
          class="border rounded px-3 py-2 w-full focus:outline-none focus:ring text-sm bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          v-model="selectedGuildId"
        >
          <option value="">-- ギルドを選択 --</option>
          <option v-for="g in guilds" :key="g.guildId" :value="g.guildId">
            {{ g.guildName }}
          </option>
        </select>
      </div>

      <!-- Start ボタン -->
      <button
        class="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400 text-sm font-semibold focus:outline-none focus:ring"
        :disabled="!canStart"
        @click="handleStart"
      >
        Start
      </button>

      <!-- メッセージ表示 -->
      <p v-if="message" class="mt-6 text-sm text-blue-600 dark:text-blue-400 whitespace-pre-line">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

/**
 * テーマモードの選択肢
 * - system: OSのダークモード設定に従う
 * - light: 常にライトモード
 * - dark:  常にダークモード
 */
const themeMode = ref<'system' | 'light' | 'dark'>('system')

// システムダークモードかどうか
const systemPrefersDark = ref(false)

// システムテーマ監視
function updateSystemDark() {
  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * 実際に付与するクラスを計算
 * - themeMode が 'dark' のとき: "dark"
 * - themeMode が 'light' のとき: ""
 * - themeMode が 'system' のとき: OSダークなら "dark" そうでなければ ""
 */
const themeModeClass = computed(() => {
  if (themeMode.value === 'dark') {
    return 'dark'
  } else if (themeMode.value === 'light') {
    return ''
  } else {
    // 'system'
    return systemPrefersDark.value ? 'dark' : ''
  }
})

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  // 初期値
  updateSystemDark()
  // リスナーを仕込む
  const handler = () => updateSystemDark()
  mq.addEventListener('change', handler)

  // OAuthイベント受信
  window.electron.on('oauth-success', handleOAuthSuccess)
  window.electron.on('oauth-failed', handleOAuthFailed)

  onUnmounted(() => {
    mq.removeEventListener('change', handler)
    window.electron.off('oauth-success', handleOAuthSuccess)
    window.electron.off('oauth-failed', handleOAuthFailed)
  })
})

/* ===== 既存ロジック ===== */
const userId = ref<string | null>(null)
const userName = ref<string | null>(null)
const userAvatar = ref<string | null>(null)
const guilds = ref<{ guildId: string; guildName: string }[]>([])
const selectedGuildId = ref('')
const message = ref('')

function handleOAuthSuccess(payload: any) {
  userId.value = payload.userId
  userName.value = payload.userName
  userAvatar.value = payload.userAvatar || null
  fetchGuilds()
  message.value = 'OAuthに成功しました。'
}

function handleOAuthFailed() {
  message.value = 'OAuthに失敗しました。'
}

async function fetchGuilds() {
  if (!userId.value) return
  try {
    const result = await window.electron.invoke('fetch-guilds', { discordUserId: userId.value })
    guilds.value = result
  } catch (err) {
    console.error('Failed to fetch guilds:', err)
  }
}

async function handleStart() {
  if (!selectedGuildId.value || !userId.value) return
  message.value = 'Starting...'
  try {
    const result = await window.electron.invoke('start-valorant', {
      discordUserId: userId.value,
      guildId: selectedGuildId.value,
    })
    if (result?.success) {
      message.value = 'RiotManager を起動しました。'
    } else {
      message.value = '起動に失敗しました。'
    }
  } catch (err) {
    console.error(err)
    message.value = 'エラーが発生しました。'
  }
}

/**
 * 再認証ボタンのクリック時に実行されるハンドラー
 * 実際の再認証処理はお使いのElectronアプリ側の実装に合わせて調整してください
 */
async function handleReAuth() {
  try {
    const isFirst = !userId.value
    message.value = isFirst ? '認証を開始します...' : '再認証を開始します...'
    // Electronアプリ側でOAuthフローを再度実行するイベントを呼び出すなど
    await window.electron.invoke('start-discord-oauth')
  } catch (error) {
    console.error(error)
    message.value = '再認証に失敗しました。'
  }
}

const userAvatarUrl = computed(() => {
  if (userId.value && userAvatar.value) {
    return `https://cdn.discordapp.com/avatars/${userId.value}/${userAvatar.value}.png`
  }
  return ''
})

const canStart = computed(() => !!userId.value && !!selectedGuildId.value)
</script>

<style scoped>
/* 必要に応じて追加CSSを書く */
</style>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
  >
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-6">
      <h1 class="text-xl font-bold text-center">Valorant Discord Tools</h1>

      <!-- ギルド選択 -->
      <div>
        <label class="block mb-1 text-sm text-gray-700 dark:text-gray-300">Guild</label>
        <Listbox v-model="selectedGuildId">
          <div class="relative">
            <ListboxButton
              class="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 text-left text-sm"
            >
              {{ guildNameFromId(selectedGuildId) || 'ギルドを選択' }}
            </ListboxButton>
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <ListboxOptions class="absolute w-full bg-white dark:bg-gray-700 border rounded mt-1">
                <ListboxOption
                  v-for="g in guilds"
                  :key="g.guildId"
                  :value="g.guildId"
                  class="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm text-gray-700 dark:text-gray-300"
                >
                  {{ g.guildName }}
                </ListboxOption>
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
      </div>

      <!-- MITM状態 -->
      <p class="text-sm text-gray-700 dark:text-gray-300">
        MITM状態：
        <span :class="colorClass(mitmStatus)">{{ mitmStatus || '未接続' }}</span>
      </p>

      <!-- サーバー状態 -->
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Server状態：
        <span :class="serverStatus === 'online' ? 'text-green-500' : 'text-red-500'">{{
          serverStatus
        }}</span>
      </p>

      <!-- Start ボタン -->
      <button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400 text-sm font-semibold"
        :disabled="!canStart"
        @click="handleStart"
      >
        Start
      </button>

      <!-- メッセージ -->
      <p v-if="message" class="text-sm text-center text-blue-500 dark:text-blue-400">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { useAuthStore } from '@/store/auth'

const selectedGuildId = ref('')
const guilds = ref<{ guildId: string; guildName: string }[]>([])
const mitmStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error' | ''>('')
const serverStatus = ref<'online' | 'offline'>('offline')
const message = ref('')
const auth = useAuthStore()

const canStart = computed(() => !!auth.userId && !!selectedGuildId.value)

const guildNameFromId = (id: string) => guilds.value.find((g) => g.guildId === id)?.guildName

const handleStart = async () => {
  if (!auth.userId || !selectedGuildId.value) return
  message.value = 'Starting...'
  const result = await window.electron.invoke('start-valorant', {
    discordUserId: auth.userId,
    guildId: selectedGuildId.value,
  })
  message.value =
    result?.status === 'started' ? 'RiotManager を起動しました。' : '起動に失敗しました。'
}

const colorClass = (status: string) => {
  switch (status) {
    case 'connected':
      return 'text-green-500'
    case 'connecting':
      return 'text-yellow-500'
    case 'disconnected':
    case 'error':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

onMounted(() => {
  fetchGuilds()

  // MITM状態受信
  window.electron.on('mitm-status', (status) => {
    mitmStatus.value = status
  })

  // サーバー状態取得（定期pingとかでも良い）
  setInterval(async () => {
    try {
      await window.electron.invoke('check-server-health')
      serverStatus.value = 'online'
    } catch {
      serverStatus.value = 'offline'
    }
  }, 5000)
})

async function fetchGuilds() {
  if (!auth.userId) return
  const result = await window.electron.invoke('fetch-guilds', { discordUserId: auth.userId })
  guilds.value = result
}
</script>

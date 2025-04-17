<template>
  <div class="relative">
    <!-- 背景キャラ（暗くぼかし） -->
    <div
      class="absolute inset-0 right-0 bg-right bg-no-repeat bg-contain opacity-10 pointer-events-none"
      :style="{ backgroundImage: `url(&quot;${valorantBackgroundUrl}&quot;)` }"
    />
    <div
      class="absolute inset-0 right-0 bg-size-[100px] bg-top-left bg-no-repeat bg-contain opacity-10 pointer-events-none"
      :style="{ backgroundImage: `url(&quot;${discordBackgroundUrl}&quot;)` }"
    />
    <!-- メインカード -->
    <div class="relative z-10 w-full">
      <!-- タイトル -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold leading-none">VALORANT</h1>
          <p class="text-gray-400 text-sm">Discord Tools</p>
        </div>
        <div class="relative inline-block group">
          <button
            :disabled="!selectedGuildId || !selectedChannelId"
            @click="handleStart"
            :class="[
              'rounded-full p-4 shadow-lg transition-all duration-200 ease-out text-white',
              !selectedGuildId
                ? 'opacity-40 cursor-not-allowed bg-gradient-to-br from-green-400 via-lime-400 to-emerald-500'
                : 'bg-gradient-to-br from-green-400 via-lime-400 to-emerald-500 hover:brightness-110 hover:saturate-150 hover:scale-105 active:brightness-90 active:scale-95 cursor-pointer',
            ]"
          >
            <PlayIcon class="w-5 h-5" />
          </button>

          <!-- ツールチップ（ギルド未選択時のみ表示） -->
          <div
            v-if="!selectedGuildId || !selectedChannelId"
            class="absolute transform border border-white w-max right-0 mb-2 bg-black/30 text-white text-xs px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          >
            {{ !selectedGuildId ? 'ギルドを選択してください' : 'チャンネルを選択してください' }}
          </div>
        </div>
      </div>

      <!-- ステータス表示 -->
      <div class="space-y-4 mb-6 text-sm">
        <!-- MITM ステータス -->
        <div class="flex items-center gap-2">
          <span :class="['w-3 h-3 rounded-full', mitmStatusColor]" />
          <span class="text-sm">MITM: {{ mitmStatusDisplay }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span
            :class="[
              'w-3 h-3 rounded-full',
              serverStatus === 'Online' ? 'bg-green-400' : 'bg-gray-500',
            ]"
          />
          <span>Server Status: {{ serverStatus }}</span>
        </div>
      </div>

      <div class="space-y-4">
        <!-- Guild選択 -->
        <SelectListbox
          v-model:selected-value="selectedGuildId"
          :options="guilds.map((g) => ({ value: g.guildId, label: g.guildName }))"
          label="サーバー"
          placeholder="サーバーを選択してください"
          noOptionsText="有効なサーバーがありません"
        />

        <SelectListbox
          v-model:selected-value="selectedChannelId"
          :options="voiceChannels.map((v) => ({ value: v.id, label: v.name }))"
          label="ボイスチャンネル"
          placeholder="チャンネルを選択してください"
          :noOptionsText="selectedGuildId ? '有効なチャンネルがありません' : 'サーバー未選択'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { PlayIcon } from '@heroicons/vue/20/solid'
import valorantBackgroundUrl from '@/assets/images/valorant-background.png?url'
import discordBackgroundUrl from '@/assets/images/discord-logo.svg?url'
import { useAuthStore } from '@/store/auth'
import SelectListbox from '../partials/common/select-listbox.vue'
import { getVoiceChannels } from '@/client/api/voice-channels'
import { Guild, VoiceChannel } from '@/typs/domain'
import { getGuilds } from '@/client/api/guilds'
import { ping } from '@/client/api/ping'

const selectedGuildId = ref('')
const authStore = useAuthStore()
const guilds = ref<Guild[]>([])
const mitmStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>()
const serverStatus = ref<'Online' | 'Offline'>('Offline')
const voiceChannels = ref<VoiceChannel[]>([])
const selectedChannelId = ref('')

let pingInterval: ReturnType<typeof setInterval> | null = null

const mitmStatusDisplay = computed(() => {
  switch (mitmStatus.value) {
    case 'connected':
      return 'connected'
    case 'connecting':
      return 'connecting...'
    case 'disconnected':
      return 'disconnected'
    case 'error':
      return 'error'
    default:
      return '-'
  }
})

const mitmStatusColor = computed(() => {
  switch (mitmStatus.value) {
    case 'connected':
      return 'bg-green-400'
    case 'connecting':
      return 'bg-yellow-400'
    case 'disconnected':
      return 'bg-gray-500'
    case 'error':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
})

watch(selectedGuildId, async (guildId) => {
  if (!guildId) return
  try {
    const result = await getVoiceChannels(guildId)
    voiceChannels.value = result
    selectedChannelId.value = result[0]?.id ?? ''
  } catch (e) {
    console.error('ボイスチャンネルの取得に失敗しました:', e)
  }
})

onMounted(async () => {
  if (authStore.userId) {
    const result = await getGuilds(authStore.userId)
    guilds.value = result
  }

  // ElectronからMITMステータスを受け取る
  window.electron?.on?.('mitm-status', (status) => {
    mitmStatus.value = status
  })

  pingServer()
  pingInterval = setInterval(pingServer, 5000)
})

onBeforeUnmount(() => {
  if (pingInterval) clearInterval(pingInterval)
})

async function handleStart() {
  if (!authStore.userId || !selectedGuildId.value) return
  const result = await window.electron.invoke('start-valorant', {
    discordUserId: authStore.userId,
    guildId: selectedGuildId.value,
  })

  if (result) {
    console.log('valorant の起動に成功しました。')
  } else {
    console.error('valorant の起動に失敗しました。')
  }
}

async function pingServer() {
  try {
    const status = await ping()
    serverStatus.value = status ? 'Online' : 'Offline'
  } catch {
    serverStatus.value = 'Offline'
  }
}
</script>

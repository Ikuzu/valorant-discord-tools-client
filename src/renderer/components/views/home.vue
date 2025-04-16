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
            :disabled="!selectedGuildId"
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
            v-if="!selectedGuildId"
            class="absolute transform border border-white w-max right-0 mb-2 bg-black/30 text-white text-xs px-3 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          >
            ギルドを選択してください
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
              serverStatus === 'online' ? 'bg-green-400' : 'bg-gray-500',
            ]"
          />
          <span>Server Status: {{ serverStatus }}</span>
        </div>
      </div>

      <!-- Guild選択 -->
      <label class="block text-sm text-gray-400 mb-1">サーバー</label>
      <Listbox v-model="selectedGuildId" v-slot="{ open }" :disabled="!isGuildListAvailable">
        <div class="relative" ref="buttonRef">
          <ListboxButton
            :disabled="!isGuildListAvailable"
            :class="[
              'w-full px-4 py-2 text-left rounded-md border',
              'text-white',
              !isGuildListAvailable
                ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                : 'bg-white/10 border-white/20 hover:bg-white/20',
            ]"
          >
            {{
              guildNameFromId(selectedGuildId) || isGuildListAvailable
                ? 'サーバーを選択してください。'
                : '有効なサーバーがありません。'
            }}
          </ListboxButton>

          <Teleport to="body">
            <div :style="dropdownStyles" class="fixed z-[1000]">
              <Transition
                @enter="updateDropdownPosition"
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <ListboxOptions
                  v-if="open && isGuildListAvailable"
                  class="max-h-60 w-full overflow-auto bg-white/10 text-white border border-white/20 rounded-md shadow-lg backdrop-blur-md"
                >
                  <ListboxOption
                    v-for="g in guilds"
                    :key="g.guildId"
                    :value="g.guildId"
                    class="cursor-pointer px-4 py-2 hover:bg-white/20"
                  >
                    {{ g.guildName }}
                  </ListboxOption>
                </ListboxOptions>
              </Transition>
            </div>
          </Teleport>
        </div>
      </Listbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, useTemplateRef, onBeforeUnmount } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { PlayIcon } from '@heroicons/vue/20/solid'
import valorantBackgroundUrl from '@/assets/images/valorant-background.png?url'
import discordBackgroundUrl from '@/assets/images/discord-logo.svg?url'
import { useAuthStore } from '@/store/auth'

const selectedGuildId = ref('')
const authStore = useAuthStore()
const guilds = ref<{ guildId: string; guildName: string }[]>([])
const mitmStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>()
const serverStatus = ref<'online' | 'offline'>('offline')

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

const isGuildListAvailable = computed(() => Array.isArray(guilds.value) && guilds.value.length > 0)
const guildNameFromId = (id: string) => guilds.value.find((g) => g.guildId === id)?.guildName

const handleStart = () => {
  console.log('Start button clicked')
}

const buttonRef = useTemplateRef<HTMLElement | null>('buttonRef')
const dropdownStyles = ref<Record<string, string>>({})

function updateDropdownPosition() {
  nextTick(() => {
    if (!buttonRef.value) return

    const rect = buttonRef.value.getBoundingClientRect()
    const dropdownHeight = 240 // px（Tailwindの max-h-60 = 15rem）
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top = 0
    let transformOrigin = 'top'

    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // 下方向に表示
      top = rect.bottom + window.scrollY
      transformOrigin = 'top'
    } else {
      // 上方向に表示
      top = rect.top + window.scrollY - dropdownHeight
      transformOrigin = 'bottom'
    }

    dropdownStyles.value = {
      top: `${top}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      'transform-origin': transformOrigin,
    }
  })
}

async function pingServer() {
  try {
    const status = await window.electron.invoke('ping')
    serverStatus.value = status ? 'online' : 'offline'
  } catch {
    serverStatus.value = 'offline'
  }
}

onMounted(async () => {
  if (authStore.userId) {
    const result = await window.electron.invoke('fetch-guilds', { discordUserId: authStore.userId })
    guilds.value = result
  }

  // ElectronからMITMステータスを受け取る
  window.electron?.on?.('mitm-status', (status) => {
    mitmStatus.value = status
  })

  pingInterval = setInterval(pingServer, 5000)

  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onBeforeUnmount(() => {
  if (pingInterval) clearInterval(pingInterval)

  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

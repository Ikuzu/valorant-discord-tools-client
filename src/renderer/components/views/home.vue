<template>
  <div class="text-white relative overflow-hidden">
    <!-- 本体 -->
    <div class="relative z-10 flex flex-col items-start px-6 py-10 max-w-4xl mx-auto space-y-8">
      <div class="text-3xl font-bold flex items-center gap-3">
        <img src="../../assets/images/discord-logo.svg" class="w-8 h-8" />
        Discord Bot
      </div>

      <!-- ステータス系 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        <div>
          <label class="block mb-1 text-sm text-gray-400">MITM 状態</label>
          <p class="text-cyan-400 font-semibold">{{ mitmStatusDisplay }}</p>
        </div>

        <div>
          <label class="block mb-1 text-sm text-gray-400">Server 状態</label>
          <p class="text-green-400 font-semibold">{{ serverStatus }}</p>
        </div>
      </div>

      <!-- ギルド選択 -->
      <div class="w-full">
        <label class="block mb-1 text-sm text-gray-400">Guild 選択</label>
        <Listbox v-model="selectedGuildId">
          <div class="relative">
            <ListboxButton
              class="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-left"
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
              <ListboxOptions
                class="absolute mt-1 max-h-60 w-full overflow-auto rounded bg-gray-800 border border-gray-600"
              >
                <ListboxOption
                  v-for="g in guilds"
                  :key="g.guildId"
                  :value="g.guildId"
                  class="cursor-pointer px-4 py-2 hover:bg-gray-700"
                >
                  {{ g.guildName }}
                </ListboxOption>
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
      </div>

      <!-- Start ボタン（右下常設でもOK）-->
      <button
        class="mt-6 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold shadow-lg hover:brightness-110"
        @click="handleStart"
      >
        <PowerIcon class="w-5 h-5 inline-block mr-1" /> 起動
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import Header from '@/components/layout/header.vue'
import { PowerIcon } from '@heroicons/vue/20/solid'

const selectedGuildId = ref('')
const guilds = ref<{ guildId: string; guildName: string }[]>([])
const mitmStatus = ref<'online' | 'offline' | ''>('offline')
const serverStatus = ref<'online' | 'offline'>('offline')

const mitmStatusDisplay = computed(() => {
  return mitmStatus.value === 'online' ? 'Online' : 'Offline'
})

const guildNameFromId = (id: string) => guilds.value.find((g) => g.guildId === id)?.guildName

const handleStart = () => {
  // Start MITM処理
  console.log('Start button clicked')
}

onMounted(() => {
  guilds.value = [
    { guildId: '123', guildName: 'Test Guild 1' },
    { guildId: '456', guildName: 'Test Guild 2' },
  ]
})
</script>

<style scoped>
/* アイコンライブラリが必要ならここで指定可能 */
</style>

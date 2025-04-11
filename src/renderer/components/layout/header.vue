<template>
  <header class="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
    <HomeIcon class="-mr-1 h-8 w-8" aria-hidden="true" />
    <div>
      <div v-if="auth.userId" class="flex items-center space-x-2">
        <img :src="userAvatarUrl" class="w-8 h-8 rounded-full" />
        <span class="font-medium text-gray-700 dark:text-gray-200">{{ auth.userName }}</span>
      </div>

      <div class="flex items-center space-x-4">
        <Menu as="div" class="relative inline-block text-left">
          <MenuButton
            class="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
          >
            メニュー
            <ChevronDownIcon class="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </MenuButton>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none"
            >
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    :class="[
                      active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm',
                    ]"
                  >
                    ログアウト
                  </button>
                </MenuItem>
              </div>

              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <div
                    :class="[
                      active ? 'bg-indigo-500 text-white' : 'text-gray-900 dark:text-gray-200',
                      'group flex w-full items-center justify-between rounded-md px-2 py-2 text-sm cursor-pointer',
                    ]"
                  >
                    <span>テーマ切替</span>

                    <Switch
                      v-model="isDark"
                      :class="[
                        isDark ? 'bg-indigo-600' : 'bg-gray-300',
                        'relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ml-2',
                      ]"
                    >
                      <span
                        :class="[
                          isDark ? 'translate-x-5' : 'translate-x-1',
                          'inline-block h-4 w-4 transform rounded-full bg-white transition',
                        ]"
                      >
                        <component
                          :is="isDark ? MoonIcon : SunIcon"
                          class="h-3 w-3 mx-auto text-indigo-600"
                        />
                      </span>
                    </Switch>
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import { ref, computed, watch, onMounted } from 'vue'
import { HomeIcon } from '@heroicons/vue/20/solid'
import { Switch } from '@headlessui/vue'
import { MoonIcon, SunIcon } from '@heroicons/vue/20/solid'
import { useAuthStore } from '@/store/auth'

const isDark = ref(false)
const auth = useAuthStore()

const userAvatarUrl = computed(() =>
  auth.userId && auth.userAvatar
    ? `https://cdn.discordapp.com/avatars/${auth.userId}/${auth.userAvatar}.png`
    : ''
)

const handleLogout = () => {
  window.electron.invoke('logout')
  auth.resetAuth()
}

const toggleTheme = () => {
  document.documentElement.classList.remove('dark')
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  }
}

watch(isDark, toggleTheme)

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mq.matches
  toggleTheme()

  // システムテーマが変わったら反映したいならこれ
  mq.addEventListener('change', (e) => {
    isDark.value = e.matches
    toggleTheme()
  })
})
</script>

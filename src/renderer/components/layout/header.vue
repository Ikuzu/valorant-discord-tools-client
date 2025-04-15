<template>
  <header
    class="fixed top-6 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-6xl px-6 py-3 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-between shadow-lg"
  >
    <!-- 左ロゴ＆リンク -->
    <div class="flex items-center space-x-4 text-white">
      <RouterLink to="/" class="flex items-center space-x-2 hover:opacity-80">
        <HomeIcon class="h-6 w-6" />
        <span class="text-lg font-semibold">MyApp</span>
      </RouterLink>
      <RouterLink to="/discord" class="text-sm hover:opacity-80"> DiscordBot設定 </RouterLink>
    </div>

    <!-- 右メニュー -->
    <Menu as="div" class="relative inline-block text-left">
      <MenuButton class="text-white hover:opacity-80 focus:outline-none">
        <Bars3Icon class="h-6 w-6" />
      </MenuButton>

      <TransitionRoot
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <MenuItems
          class="fixed inset-0 z-40 bg-black/60 backdrop-blur-lg flex flex-col justify-center items-center space-y-6 text-white"
        >
          <div class="flex flex-col items-center space-y-2">
            <img :src="userAvatarUrl" class="w-16 h-16 rounded-full border border-white" />
            <span class="text-lg">{{ auth.userName }}</span>
          </div>
          <button
            @click="handleLogout"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            ログアウト
          </button>
        </MenuItems>
      </TransitionRoot>
    </Menu>
  </header>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
import { HomeIcon, Bars3Icon } from '@heroicons/vue/20/solid'
import { TransitionRoot } from '@headlessui/vue'
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { RouterLink } from 'vue-router'

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
</script>

<template>
  <header
    class="fixed top-6 left-1/2 transform -translate-x-1/2 z-30 w-[90%] max-w-6xl px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-between shadow-lg"
  >
    <!-- 左ロゴ＆リンク -->
    <div class="flex-1 flex items-center space-x-4">
      <div class="text-lg p-0 m-0">VDTCApp</div>
    </div>

    <div class="flex-1 flex justify-center space-x-4">
      <RouterLink
        to="/home"
        :class="[
          'text-sm px-3 py-1 rounded-full transition',
          route.path === '/home'
            ? 'bg-white/20 pointer-events-none text-white'
            : 'hover:opacity-80 text-white/80',
        ]"
      >
        Home
      </RouterLink>

      <RouterLink
        to="/setting"
        :class="[
          'text-sm px-3 py-1 rounded-full transition',
          route.path === '/setting'
            ? 'bg-white/20 pointer-events-none text-white'
            : 'hover:opacity-80 text-white/80',
        ]"
      >
        Setting
      </RouterLink>
    </div>

    <!-- 右メニュー -->
    <div class="flex-1 flex justify-end">
      <button @click="isDialogOpen = true" class="hover:opacity-80 focus:outline-none">
        <Bars3Icon class="h-6 w-6" />
      </button>
    </div>

    <!-- メニューダイアログ -->
    <Teleport to="body">
      <TransitionRoot :show="isDialogOpen" as="template">
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-lg" @click="isDialogOpen = false">
          <!-- メニュー本体 -->
          <div class="relative z-10 h-full flex flex-col justify-center items-center space-y-6">
            <!-- ユーザー情報 -->
            <div class="flex flex-col items-center space-y-2">
              <img
                :src="userAvatarUrl ?? 'https://picsum.photos/200/300'"
                class="w-16 h-16 rounded-full"
              />
              <span class="text-lg text-white">{{ auth.userName ?? 'unknown' }}</span>
            </div>

            <!-- ログアウト -->
            <button
              @click="handleLogout"
              class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-r from-red-400 via-red-500 to-red-600 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 text-white focus:ring-4 focus:outline-none focus:ring-red-400"
            >
              <span
                class="relative px-4 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
              >
                ログアウト
              </span>
            </button>
          </div>
        </div>
      </TransitionRoot>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bars3Icon } from '@heroicons/vue/20/solid'
import { TransitionRoot } from '@headlessui/vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const isDialogOpen = ref(false)
const auth = useAuthStore()
const route = useRoute()

const userAvatarUrl = computed(() =>
  auth.userId && auth.userAvatar
    ? `https://cdn.discordapp.com/avatars/${auth.userId}/${auth.userAvatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/4.png'
)

const handleLogout = () => {
  window.electron.invoke('logout')
  auth.resetAuth()
  isDialogOpen.value = false
}
</script>

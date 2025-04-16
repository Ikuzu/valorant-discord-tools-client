<template>
  <div class="relative h-screen bg-[#050505] text-white overflow-hidden">
    <!-- 背景 -->
    <AnimatedBackground />

    <!-- ヘッダー（固定） -->
    <div v-if="route.path !== '/'" class="fixed top-0 left-0 w-full z-20 h-16">
      <div class="relative z-10">
        <Header />
      </div>
    </div>

    <!-- メインコンテンツ（スクロール可能） -->
    <main
      class="h-full z-10 overflow-y-auto px-4 flex items-center justify-center overflow-hidden"
      :class="{ 'pt-[100px]': route.path !== '/' }"
    >
      <div class="w-md max-h-full overflow-hidden flex justify-center px-4 text-white pb-5">
        <div
          class="custom-scroll w-full overflow-auto bg-white/5 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10"
        >
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AnimatedBackground from '../partials/common/animated-background.vue'
import Header from './header.vue'

const route = useRoute()
</script>

<style scoped>
/* カスタムスクロールバー */
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent; /* トラック背景 */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2); /* スクロールバーの色 */
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.4); /* hover時 */
}
</style>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-[#050505] text-white">
    <!-- 背景 -->
    <AnimatedBackground />

    <!-- メインコンテンツ -->
    <div class="relative z-20 flex flex-col items-center justify-center w-full h-full">
      <!-- header背景ぼかし + 透過 -->
      <div class="relative w-full">
        <!-- 背景ぼかし用レイヤーだけ -->
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"></div>

        <!-- 本体はぼかさない -->
        <div class="relative z-10">
          <Header />
        </div>
      </div>

      <main class="flex-1 pt-20">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedBackground from '../partials/common/animated-background.vue'
import Header from './header.vue'
</script>

<template>
  <div class="gradient-background">
    <div class="gradient-sphere sphere-1" />
    <div class="gradient-sphere sphere-2" />
    <div class="gradient-sphere sphere-3" />
    <div class="glow" />
    <div class="grid-overlay" />
    <div class="noise-overlay" />
    <div ref="particlesContainer" class="particles-container" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const particlesContainer = ref<HTMLElement | null>(null)
const PARTICLE_COUNT = 80

onMounted(() => {
  if (!particlesContainer.value) return

  // 初期パーティクル
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    createParticle()
  }

  function createParticle() {
    const el = document.createElement('div')
    el.className = 'particle'
    const size = Math.random() * 3 + 1
    el.style.width = `${size}px`
    el.style.height = `${size}px`
    el.style.position = 'absolute'
    el.style.background = 'white'
    el.style.borderRadius = '50%'
    resetParticle(el)
    particlesContainer.value?.appendChild(el)
    animateParticle(el)
  }

  function resetParticle(particle: HTMLDivElement) {
    const x = Math.random() * 100
    const y = Math.random() * 100
    particle.style.left = `${x}%`
    particle.style.top = `${y}%`
    particle.style.opacity = '0'
    return { x, y }
  }

  function animateParticle(particle: HTMLDivElement) {
    const pos = resetParticle(particle)
    const duration = Math.random() * 10 + 10
    const delay = Math.random() * 5

    setTimeout(() => {
      particle.style.transition = `all ${duration}s linear`
      particle.style.opacity = `${Math.random() * 0.5 + 0.1}`
      const moveX = pos.x + (Math.random() * 20 - 10)
      const moveY = pos.y - Math.random() * 30
      particle.style.left = `${moveX}%`
      particle.style.top = `${moveY}%`

      setTimeout(() => animateParticle(particle), duration * 1000)
    }, delay * 1000)
  }

  // マウス移動時のパーティクル生成
  document.addEventListener('mousemove', (e) => {
    if (!particlesContainer.value) return

    const mouseX = (e.clientX / window.innerWidth) * 100
    const mouseY = (e.clientY / window.innerHeight) * 100

    // 一時的なパーティクル生成
    const particle = document.createElement('div')
    particle.className = 'particle'

    // ランダムサイズ
    const size = Math.random() * 4 + 2
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.position = 'absolute'
    particle.style.left = `${mouseX}%`
    particle.style.top = `${mouseY}%`
    particle.style.opacity = '0.6'
    particle.style.background = 'white'
    particle.style.borderRadius = '50%'
    particle.style.pointerEvents = 'none'

    particlesContainer.value.appendChild(particle)

    // 拡散アニメーション
    setTimeout(() => {
      particle.style.transition = 'all 2s ease-out'
      particle.style.left = `${mouseX + (Math.random() * 10 - 5)}%`
      particle.style.top = `${mouseY + (Math.random() * 10 - 5)}%`
      particle.style.opacity = '0'
    }, 10)

    // 削除
    setTimeout(() => {
      particle.remove()
    }, 2000)

    // グラデーションスフィアをわずかに動かす
    const spheres = document.querySelectorAll('.gradient-sphere')
    const moveX = (e.clientX / window.innerWidth - 0.5) * 5
    const moveY = (e.clientY / window.innerHeight - 0.5) * 5
    spheres.forEach((sphere) => {
      ;(sphere as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`
    })
  })
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Helvetica Neue', sans-serif;
  overflow: hidden;
  background-color: #050505;
  color: white;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-container {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, #fff, #acacac);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
}

.btn {
  background: linear-gradient(90deg, #ff3a82, #5233ff);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 20px rgba(255, 58, 130, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 58, 130, 0.4);
}

.gradient-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.sphere-1 {
  width: 40vw;
  height: 40vw;
  background: linear-gradient(40deg, rgba(255, 0, 128, 0.8), rgba(255, 102, 0, 0.4));
  top: -10%;
  left: -10%;
  animation: float-1 15s ease-in-out infinite alternate;
}

.sphere-2 {
  width: 45vw;
  height: 45vw;
  background: linear-gradient(240deg, rgba(72, 0, 255, 0.8), rgba(0, 183, 255, 0.4));
  bottom: -20%;
  right: -10%;
  animation: float-2 18s ease-in-out infinite alternate;
}

.sphere-3 {
  width: 30vw;
  height: 30vw;
  background: linear-gradient(120deg, rgba(133, 89, 255, 0.5), rgba(98, 216, 249, 0.3));
  top: 60%;
  left: 20%;
  animation: float-3 20s ease-in-out infinite alternate;
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.05;
  z-index: 5;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

@keyframes float-1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(10%, 10%) scale(1.1);
  }
}

@keyframes float-2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-10%, -5%) scale(1.15);
  }
}

@keyframes float-3 {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-5%, 10%) scale(1.05);
    opacity: 0.6;
  }
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  z-index: 2;
}

.glow {
  position: absolute;
  width: 40vw;
  height: 40vh;
  background: radial-gradient(circle, rgba(72, 0, 255, 0.15), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  animation: pulse 8s infinite alternate;
  filter: blur(30px);
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    opacity: 0.7;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}
.particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}
</style>

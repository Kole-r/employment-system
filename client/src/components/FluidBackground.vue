<template>
  <div class="fluid-bg" ref="containerRef">
    <div class="fluid-layer fluid-bottom"></div>
    <div class="fluid-layer fluid-top" ref="topLayerRef"></div>
    <div class="fluid-blob" ref="blobRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref(null)
const topLayerRef = ref(null)
const blobRef = ref(null)

// State
const mouse = { x: -400, y: -400 }
const current = { x: -400, y: -400 }
const ease = 0.12
let time = 0
const morphSpeed = 0.02
let isHovering = false
let animationId = null

// Canvas for dynamic mask
const canvas = document.createElement('canvas')
canvas.width = 280
canvas.height = 280
const ctx = canvas.getContext('2d')

function updateMask() {
  const w = 280
  const h = 280

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'black'
  ctx.beginPath()

  const centerX = w / 2
  const centerY = h / 2
  const baseRadius = w / 3

  for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
    const variation1 = Math.sin(angle * 3 + time) * 15
    const variation2 = Math.cos(angle * 5 - time * 0.7) * 10
    const variation3 = Math.sin(angle * 7 + time * 1.3) * 8
    const radius = baseRadius + variation1 + variation2 + variation3
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    if (angle === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.fill()

  const maskImage = canvas.toDataURL()
  document.documentElement.style.setProperty('--fluid-mask-image', `url(${maskImage})`)
}

function animate() {
  time += morphSpeed

  current.x += (mouse.x - current.x) * ease
  current.y += (mouse.y - current.y) * ease

  updateMask()

  if (blobRef.value) {
    blobRef.value.style.left = `${current.x}px`
    blobRef.value.style.top = `${current.y}px`
  }

  if (topLayerRef.value) {
    topLayerRef.value.style.setProperty('--mask-x', `${current.x - 140}px`)
    topLayerRef.value.style.setProperty('--mask-y', `${current.y - 140}px`)
  }

  animationId = requestAnimationFrame(animate)
}

function onMouseEnter() {
  isHovering = true
  if (blobRef.value) blobRef.value.classList.add('active')
}

function onMouseLeave() {
  isHovering = false
  if (blobRef.value) blobRef.value.classList.remove('active')
}

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseenter', onMouseEnter)
  window.addEventListener('mouseleave', onMouseLeave)
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseenter', onMouseEnter)
  window.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<style scoped>
.fluid-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #F7F8FA 0%, #EEF2FF 50%, #F0F4FF 100%);
}

.fluid-layer,
.fluid-blob {
  display: none;
}
</style>

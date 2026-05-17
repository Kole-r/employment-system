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
}

.fluid-layer {
  position: absolute;
  inset: 0;
}

.fluid-bottom {
  background: url('/IMG_1037.jpeg') center / cover no-repeat;
  z-index: 1;
}

.fluid-top {
  background:
    linear-gradient(rgba(203, 253, 4, 0.319), rgba(0, 0, 0, 0.7)),
    url('/IMG_1037.jpeg') center / cover no-repeat;
  z-index: 2;
  -webkit-mask-image: var(--fluid-mask-image);
  mask-image: var(--fluid-mask-image);
  -webkit-mask-size: 280px 280px;
  mask-size: 280px 280px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: var(--mask-x, -600px) var(--mask-y, -600px);
  mask-position: var(--mask-x, -600px) var(--mask-y, -600px);
}

.fluid-blob {
  position: absolute;
  height: 280px;
  width: 280px;
  pointer-events: none;
  z-index: 3;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border: 1.5px solid rgba(222, 211, 211, 0.453);
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>');
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>');
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.fluid-blob.active {
  opacity: 1;
}
</style>

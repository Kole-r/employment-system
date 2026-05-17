<template>
    <header class="top-header">
        <!-- Left: Logo + Title -->
        <div class="header-left">
            <button class="brand-mark" @click="handleCollapsed" aria-label="Toggle sidebar">屌</button>
            <span class="brand-name">智就业 · 智慧就业服务平台</span>
        </div>

        <!-- Center: Time Display -->
        <div class="header-center">
            <span class="time-value">{{ currentTime }}</span>
        </div>

        <!-- Right: User Area -->
        <div class="header-right">
            <div class="status-dot"></div>
            <div class="user-area" @click="toggleDropdown" ref="userAreaRef">
                <div class="user-avatar-sm">
                    <img v-if="userInfo.$state.avatar" :src="userInfo.$state.avatar" alt="" class="avatar-img" />
                    <span v-else class="avatar-fallback">{{ avatarLetter }}</span>
                </div>
                <div class="user-info">
                    <span class="user-name">{{ userInfo.$state.username }}</span>
                    <span class="user-role">{{ userInfo.$state.role === 1 ? 'ADMIN' : userInfo.$state.role === 2 ? 'ENTERPRISE' : 'GRADUATE' }}</span>
                </div>
                <svg class="chevron" :class="{ open: dropdownVisible }" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 5.5L7 8.5L10 5.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>

            <!-- Custom Dropdown -->
            <Transition name="dropdown">
                <div v-if="dropdownVisible" class="dropdown-menu" @click.stop>
                    <button class="dropdown-item" @click="goCenter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
                        </svg>
                        <span>个人中心</span>
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item dropdown-item-danger" @click="goLogout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>退出登录</span>
                    </button>
                </div>
            </Transition>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCollapseStore } from '../../store/collapse.js'
import { useRouter } from 'vue-router'
import useUserInfoStore from '../../store/userInfo.js'

const collapseStore = useCollapseStore()
const router = useRouter()
const userInfo = useUserInfoStore()

const currentTime = ref('')
const dropdownVisible = ref(false)
const userAreaRef = ref(null)
let timer = null

const avatarLetter = computed(() => {
    const name = userInfo.$state.username || ''
    return name.charAt(0).toUpperCase()
})

const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
    document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('click', closeDropdown)
})

const handleCollapsed = () => {
    collapseStore.setCollapsed()
}

const toggleDropdown = () => {
    dropdownVisible.value = !dropdownVisible.value
}

const closeDropdown = (e) => {
    if (userAreaRef.value && !userAreaRef.value.contains(e.target)) {
        dropdownVisible.value = false
    }
}

const goCenter = () => {
    dropdownVisible.value = false
    router.push('/center')
}

const goLogout = () => {
    dropdownVisible.value = false
    localStorage.removeItem('token')
    userInfo.clearUserInfo()
    router.push('/login')
}
</script>

<style scoped lang="scss">
/* ── Tokens ── */
$black: #000000;
$surface: #0A0A0A;
$surface-1: #111111;
$border: #1A1A1A;
$border-hi: #2A2A2A;
$g1: #333333;
$g2: #555555;
$g3: #888888;
$g4: #AAAAAA;
$g5: #CCCCCC;
$white: #F0F0F0;
$pure: #FFFFFF;
$accent: #D71921;
$green: #3DDC84;

.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
    padding: 0 24px;
    background: $black;
    border-bottom: 1px solid $border;
    position: relative;
    z-index: 100;
}

/* ── Left ── */
.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand-mark {
    font-family: 'Space Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: $black;
    background:#022b6e ;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: opacity 150ms ease-out;

    &:hover { opacity: 0.85; }
}

.brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: $g5;
    letter-spacing: 0.02em;
}

/* ── Center: Time ── */
.header-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.time-value {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    color: $g3;
    letter-spacing: 0.08em;
}

/* ── Right ── */
.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $green;
    flex-shrink: 0;
}

.user-area {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px 6px 8px;
    border: 1px solid $border;
    border-radius: 999px;
    cursor: pointer;
    transition: all 150ms ease-out;

    &:hover {
        border-color: $border-hi;
        background: $surface;
    }
}

.user-avatar-sm {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    background: $surface-1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.avatar-fallback {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: $g3;
}

.user-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.user-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: $white;
    line-height: 1.2;
}

.user-role {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: $g2;
    line-height: 1.2;
}

.chevron {
    color: $g2;
    transition: transform 150ms ease-out;
    flex-shrink: 0;

    &.open { transform: rotate(180deg); }
}

/* ── Dropdown ── */
.dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 180px;
    background: $surface-1;
    border: 1px solid $border-hi;
    border-radius: 12px;
    padding: 6px;
    z-index: 200;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 120ms ease-out;

    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: $g5;

    svg { color: $g3; flex-shrink: 0; }

    &:hover {
        background: $surface;
        color: $white;
        svg { color: $g5; }
    }
}

.dropdown-item-danger {
    &:hover {
        color: $accent;
        svg { color: $accent; }
    }
}

.dropdown-divider {
    height: 1px;
    background: $border;
    margin: 4px 8px;
}

/* ── Dropdown Transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 120ms ease-out, transform 120ms ease-out;
    transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
}
</style>

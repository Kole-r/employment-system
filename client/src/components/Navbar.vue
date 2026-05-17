<template>
    <nav class="navbar">
        <div class="nav-inner">
            <!-- Logo -->
            <router-link to="/home" class="nav-logo">
                <span class="logo-mark">E</span>
                <span class="logo-text">EMPLOY</span>
            </router-link>

            <!-- Nav Links -->
            <div class="nav-links">
                <router-link to="/home" class="nav-link" :class="{ active: route.path === '/home' }">
                    [ 首页 ]
                </router-link>
                <router-link to="/news" class="nav-link" :class="{ active: route.path.startsWith('/news') }">
                    [ 资讯 ]
                </router-link>
                <router-link to="/jobs" class="nav-link" :class="{ active: route.path.startsWith('/jobs') }">
                    [ 岗位 ]
                </router-link>
            </div>

            <!-- Right -->
            <div class="nav-right">
                <router-link to="/favorites" class="nav-icon" :class="{ 'is-active': route.path === '/favorites' }" title="收藏">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </router-link>

                <div class="nav-user" @click.stop="showUserMenu = !showUserMenu">
                    <span class="user-name">{{ userInfoStore.real_name || userInfoStore.username || '用户' }}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: showUserMenu }">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>

                    <!-- Dropdown -->
                    <Transition name="dropdown">
                        <div v-if="showUserMenu" class="user-dropdown" @click.stop>
                            <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                                个人中心
                            </router-link>
                            <router-link to="/resume" class="dropdown-item" @click="showUserMenu = false">
                                简历编辑
                            </router-link>
                            <div class="dropdown-divider"></div>
                            <div class="dropdown-item danger" @click="handleLogout">退出登录</div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserInfoStore } from '../store/userInfo'

const route = useRoute()
const router = useRouter()
const userInfoStore = useUserInfoStore()
const showUserMenu = ref(false)

const handleLogout = () => {
    userInfoStore.clearInfo()
    router.push('/login')
}

const handleClickOutside = (e) => {
    if (showUserMenu.value) showUserMenu.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--black);
    border-bottom: 1px solid var(--border);
    height: 64px;
    backdrop-filter: blur(12px);
}

.nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-xl);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* ── Logo ── */
.nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-mark {
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 700;
    color: var(--black);
    background: var(--text-display);
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 150ms ease-out;
}

.nav-logo:hover .logo-mark {
    transform: scale(1.05);
}

.logo-text {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--text-display);
}

/* ── Links ── */
.nav-links {
    display: flex;
    gap: 2px;
}

.nav-link {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--text-disabled);
    padding: 8px 16px;
    transition: color 150ms ease-out;
}

.nav-link:hover {
    color: var(--text-primary);
}

.nav-link.active {
    color: var(--text-display);
}

/* ── Right ── */
.nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.nav-icon {
    color: var(--text-disabled);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    transition: all 150ms;
}

.nav-icon:hover,
.nav-icon.is-active {
    color: var(--text-display);
}

/* ── User ── */
.nav-user {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 150ms;
    position: relative;
}

.nav-user:hover {
    background: var(--surface);
}

.user-name {
    font-size: 13px;
    color: var(--text-secondary);
}

.chevron {
    color: var(--text-disabled);
    transition: transform 200ms ease-out;
}

.chevron.open {
    transform: rotate(180deg);
}

/* ── Dropdown ── */
.user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border-visible);
    border-radius: 12px;
    overflow: hidden;
    min-width: 160px;
    z-index: 200;
}

.dropdown-item {
    display: block;
    padding: 12px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    transition: all 150ms;
    cursor: pointer;
}

.dropdown-item:hover {
    background: var(--surface-raised);
    color: var(--text-display);
}

.dropdown-item.danger {
    color: var(--accent);
}

.dropdown-item.danger:hover {
    background: var(--accent-subtle);
}

.dropdown-divider {
    height: 1px;
    background: var(--border);
}

/* ── Transition ── */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 150ms ease-out, transform 150ms ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>

<template>
    <div class="fav-page">
        <div class="page-hero">
            <router-link to="/home" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                返回首页
            </router-link>
            <span class="hero-label">FAVORITES</span>
            <h1 class="hero-title">我的收藏</h1>
            <span class="hero-count" v-if="favorites.length > 0">{{ favorites.length }} ITEMS</span>
        </div>

        <template v-if="jobFavorites.length > 0">
            <h2 class="section-title">岗位 <span class="section-count">{{ jobFavorites.length }}</span></h2>
            <div class="fav-list">
                <div
                    v-for="fav in jobFavorites"
                    :key="fav.id"
                    class="fav-row"
                    @click="goDetail(fav)"
                >
                    <span class="fav-type job">岗位</span>
                    <span class="fav-title">{{ fav.title || `ID: ${fav.target_id}` }}</span>
                    <span class="fav-time">{{ formatDate(fav.created_at) }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="fav-arrow">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        </template>

        <template v-if="newsFavorites.length > 0">
            <h2 class="section-title">资讯 <span class="section-count">{{ newsFavorites.length }}</span></h2>
            <div class="fav-list">
                <div
                    v-for="fav in newsFavorites"
                    :key="fav.id"
                    class="fav-row"
                    @click="goDetail(fav)"
                >
                    <span class="fav-type news">资讯</span>
                    <span class="fav-title">{{ fav.title || `ID: ${fav.target_id}` }}</span>
                    <span class="fav-time">{{ formatDate(fav.created_at) }}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="fav-arrow">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            </div>
        </template>

        <div v-if="favorites.length === 0" class="empty-state">
            <span class="empty-label">NO FAVORITES YET</span>
            <span class="empty-desc">收藏岗位或资讯后会在这里显示</span>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import { useRouter } from 'vue-router'
import axios from '@/util/axios.config.js'

const router = useRouter()
const favorites = ref([])
//数据分组
const jobFavorites = computed(() => favorites.value.filter(f => f.target_type === 'job'))
const newsFavorites = computed(() => favorites.value.filter(f => f.target_type === 'news'))

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}.${m}.${day}`
}

const goDetail = (fav) => {
    if (fav.target_type === 'job') router.push(`/jobs/${fav.target_id}`)
    else router.push(`/news/${fav.target_id}`)
}

onMounted(async () => {
    try {
        const res = await axios.get('/webApi/user/favorites')
        if (res.data.code === 200) favorites.value = res.data.data || []
    } catch (e) { console.error(e) }
})
</script>

<style scoped>
.fav-page {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-4xl);
}

/* ── Hero ── */
.page-hero {
    margin-bottom: var(--space-xl);
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
    flex-wrap: wrap;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    width: 100%;
    margin-bottom: var(--space-xs);
    transition: color 150ms;
}

.back-link:hover { color: var(--text-primary); }

.hero-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    order: -1;
    width: 100%;
    margin-bottom: var(--space-xs);
}

.hero-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-display);
    margin: 0;
    letter-spacing: -0.02em;
}

.hero-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
}

/* ── Section ── */
.section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-display);
    margin: var(--space-xl) 0 var(--space-md);
    letter-spacing: -0.01em;
}

.section-title:first-of-type {
    margin-top: 0;
}

.section-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
    font-weight: 400;
}

/* ── List ── */
.fav-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
}

.fav-row {
    background: var(--surface);
    padding: var(--space-md) var(--space-lg);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--space-md);
    transition: background 150ms ease-out;
}

.fav-row:hover {
    background: var(--surface-raised);
}

.fav-type {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 10px;
    flex-shrink: 0;
    color: var(--text-disabled);
}

.fav-type.job {
    color: var(--text-secondary);
    border-color: var(--border-visible);
}

.fav-type.news {
    color: var(--accent, var(--text-secondary));
    border-color: var(--border-visible);
}

.fav-title {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fav-time {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    flex-shrink: 0;
}

.fav-arrow {
    color: var(--text-disabled);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 150ms ease-out;
}

.fav-row:hover .fav-arrow {
    opacity: 1;
}

/* ── Empty ── */
.empty-state {
    text-align: center;
    padding: var(--space-4xl) 0;
}

.empty-label {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-sm);
}

.empty-desc {
    font-size: 14px;
    color: var(--text-disabled);
}
</style>

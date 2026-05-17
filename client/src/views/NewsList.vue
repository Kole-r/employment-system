<template>
    <div class="page">
        <div class="page-hero">
            <router-link to="/home" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                返回首页
            </router-link>
            <span class="hero-label">NEWS</span>
            <h1 class="hero-title">就业资讯</h1>
            <span class="hero-count">{{ filteredList.length }} RESULTS</span>
        </div>

        <div class="filter-bar">
            <div class="segmented-control">
                <button
                    v-for="cat in categories"
                    :key="cat.value"
                    :class="['segment', { active: activeCat === cat.value }]"
                    @click="activeCat = cat.value"
                >{{ cat.label }}</button>
            </div>
        </div>

        <div class="news-grid">
            <div
                v-for="item in filteredList"
                :key="item.id"
                class="news-card"
                @click="$router.push(`/news/${item.id}`)"
            >
                <div class="news-cover" v-if="item.cover">
                    <img :src="item.cover" alt="" loading="lazy" />
                </div>
                <div class="news-body">
                    <div class="news-meta-row">
                        <span class="news-cat">{{ getCategoryLabel(item.category) }}</span>
                        <span class="news-views">{{ item.views || 0 }} views</span>
                    </div>
                    <h3 class="news-title">{{ item.title }}</h3>
                    <p class="news-summary" v-if="item.summary">{{ item.summary }}</p>
                    <span class="news-time">{{ formatDate(item.created_at) }}</span>
                </div>
            </div>
        </div>

        <div v-if="filteredList.length === 0" class="empty-state">
            <span class="empty-label">NO DATA</span>
            <span class="empty-desc">暂无资讯</span>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import axios from '@/util/axios.config.js'

const list = ref([])
const activeCat = ref(0)

const categories = [
    { label: '全部', value: 0 },
    { label: '政策解读', value: 1 },
    { label: '行业动态', value: 2 },
    { label: '求职技巧', value: 3 },
    { label: '校园招聘', value: 4 }
]

const categoryMap = { 1: '政策解读', 2: '行业动态', 3: '求职技巧', 4: '校园招聘' }
const getCategoryLabel = (val) => categoryMap[val] || '资讯'

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}.${m}.${day}`
}

const filteredList = computed(() => {
    if (activeCat.value === 0) return list.value
    return list.value.filter(i => i.category === activeCat.value)
})

onMounted(async () => {
    try {
        const res = await axios.get('/webApi/news/list')
        if (res.data.code === 200) list.value = res.data.data || []
    } catch (e) { console.error(e) }
})
</script>

<style scoped>
.page {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-4xl);
}

/* ═══ Hero ═══ */
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

/* ═══ Filter ═══ */
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
}

.segmented-control {
    display: inline-flex;
    border: 1px solid var(--border-visible);
    border-radius: 999px;
    overflow: hidden;
}

.segment {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: var(--text-disabled);
    cursor: pointer;
    transition: all 200ms ease-out;
}

.segment:hover {
    color: var(--text-secondary);
}

.segment.active {
    background: var(--text-display);
    color: var(--black);
    font-weight: 700;
}

/* ═══ News Grid ═══ */
.news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
}

.news-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 200ms ease-out;
}

.news-card:hover {
    border-color: var(--border-visible);
}

.news-cover {
    height: 180px;
    overflow: hidden;
    position: relative;
}

.news-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 300ms ease-out;
}

.news-card:hover .news-cover img {
    transform: scale(1.03);
}

.news-body {
    padding: var(--space-md) var(--space-lg);
}

.news-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.news-cat {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.news-views {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
}

.news-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
    line-height: 1.4;
}

.news-summary {
    font-size: 13px;
    color: var(--text-disabled);
    line-height: 1.5;
    margin: 0 0 var(--space-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-time {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
}

/* ═══ Empty ═══ */
.empty-state {
    text-align: center;
    padding: var(--space-3xl) 0;
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

/* ═══ Responsive ═══ */
@media (max-width: 768px) {
    .news-grid {
        grid-template-columns: 1fr;
    }
}
</style>

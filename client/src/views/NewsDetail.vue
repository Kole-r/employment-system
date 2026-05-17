<template>
    <div class="detail-page">
        <div v-if="news" class="detail-content">
            <!-- Back -->
            <div class="detail-nav">
                <router-link to="/news" class="back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </router-link>
                <span class="detail-cat">{{ getCategoryLabel(news.category) }}</span>
                <div style="flex:1"></div>
                                                                <button class="fav-btn" :class="{ active: isFavorited }" @click="toggleFav">
                    <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>

            <!-- Title -->
            <h1 class="detail-title">{{ news.title }}</h1>

            <!-- Meta -->
            <div class="detail-meta">
                <span class="meta-item">{{ formatDate(news.created_at) }}</span>
                <span class="meta-dot">·</span>
                <span class="meta-item">{{ news.views || 0 }} views</span>
            </div>

            <!-- Cover -->
            <div v-if="news.cover" class="detail-cover">
                <img :src="news.cover" alt="" />
            </div>

            <!-- Body -->
            <article class="detail-body" v-html="news.content"></article>

            <!-- Tags -->
            <div class="detail-tags" v-if="news.tags">
                <span class="tag" v-for="t in news.tags.split(',')" :key="t">{{ t }}</span>
            </div>

            <!-- Footer -->
            <div class="detail-footer">
                <router-link to="/news" class="footer-link">← 返回资讯列表</router-link>
            </div>
        </div>

        <div v-else class="loading">
            <span class="loading-text">[LOADING...]</span>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import { useRoute } from 'vue-router'
import axios from '@/util/axios.config.js'

const route = useRoute()
const news = ref(null)
const isFavorited = ref(false)
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

const toggleFav = async () => {
    try {
        const res = await axios.post('/webApi/user/favorite', {
            target_type: 'news',
            target_id: Number(route.params.id)
        })
        if (res.data.code === 200) isFavorited.value = res.data.data.favorited
    } catch (e) { console.error(e) }
}

onMounted(async () => {
    try {
        const [detailRes, favRes] = await Promise.all([
            axios.get(`/webApi/news/detail/${route.params.id}`),
            axios.get(`/webApi/user/favorite/check?target_type=news&target_id=${route.params.id}`)
        ])
        if (detailRes.data.code === 200) news.value = detailRes.data.data
        if (favRes.data.code === 200) isFavorited.value = favRes.data.data.favorited
    } catch (e) { console.error(e) }
})
</script>

<style scoped>
.detail-page {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-4xl);
}

/* ── Nav ── */
.detail-nav {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
}

.back-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 150ms ease-out;
}

.back-btn:hover {
    border-color: var(--border-visible);
    color: var(--text-display);
}

.detail-cat {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 3px 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.fav-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-disabled);
    cursor: pointer;
    transition: all 150ms ease-out;
    padding: 0;
}

.fav-btn:hover {
    border-color: var(--border-visible);
    color: var(--text-secondary);
}

.fav-btn.active {
    color: #e74c3c;
    border-color: rgba(231, 76, 60, 0.3);
    background: rgba(231, 76, 60, 0.05);
}

/* ── Title ── */
.detail-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-display);
    margin: 0 0 var(--space-md);
    line-height: 1.3;
    letter-spacing: -0.02em;
}

/* ── Meta ── */
.detail-meta {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-xl);
}

.meta-item {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
}

.meta-dot {
    color: var(--text-disabled);
    font-size: 11px;
}

/* ── Cover ── */
.detail-cover {
    margin-bottom: var(--space-xl);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
}

.detail-cover img {
    width: 100%;
    max-height: 420px;
    object-fit: cover;
    display: block;
}

/* ── Body ── */
.detail-body {
    font-size: 16px;
    line-height: 1.85;
    color: var(--text-secondary);
    margin-bottom: var(--space-xl);
}

.detail-body :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: var(--space-md) 0;
}

.detail-body :deep(h2),
.detail-body :deep(h3) {
    color: var(--text-primary);
    margin: var(--space-lg) 0 var(--space-sm);
}

.detail-body :deep(p) {
    margin: 0 0 var(--space-md);
}

.detail-body :deep(a) {
    color: var(--interactive);
    text-decoration: none;
}

.detail-body :deep(a:hover) {
    text-decoration: underline;
}

/* ── Tags ── */
.detail-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: var(--space-xl);
}

.tag {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    background: var(--surface);
    border-radius: 4px;
    padding: 3px 10px;
}

/* ── Footer ── */
.detail-footer {
    padding-top: var(--space-xl);
    border-top: 1px solid var(--border);
}

.footer-link {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-disabled);
    transition: color 150ms;
}

.footer-link:hover {
    color: var(--text-secondary);
}

/* ── Loading ── */
.loading {
    text-align: center;
    padding: var(--space-4xl) 0;
}

.loading-text {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--text-disabled);
}

/* ── Responsive ── */
@media (max-width: 768px) {
    .detail-title {
        font-size: 24px;
    }
}
</style>

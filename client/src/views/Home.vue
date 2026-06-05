<template>
    <div class="home-page">
        <!-- Hero -->
        <section class="hero dot-grid-subtle">
            <div class="hero-inner">
                <span class="hero-label">EMPLOYMENT PLATFORM</span>
                <h1 class="hero-title">
                    <span class="hero-line">找到你的</span>
                    <span class="hero-line hero-accent">下一份工作</span>
                </h1>
                <p class="hero-desc">为应届毕业生提供就业资讯、岗位推荐和求职指导的一站式平台。</p>
                <div class="hero-actions">
                    <router-link to="/jobs" class="btn-primary">浏览岗位</router-link>
                    <router-link to="/news" class="btn-ghost">阅读资讯</router-link>
                </div>
            </div>
            <div class="hero-stats">
                <div class="stat-item">
                    <span class="stat-num">{{ stats.jobs }}</span>
                    <span class="stat-unit">在招岗位</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-num">{{ stats.companies }}</span>
                    <span class="stat-unit">合作企业</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-num">{{ stats.news }}</span>
                    <span class="stat-unit">资讯文章</span>
                </div>
            </div>
        </section>

        <!-- Recommended Jobs -->
        <section class="section">
            <div class="section-head">
                <div>
                    <span class="section-tag">RECOMMEND</span>
                    <h2 class="section-title">推荐岗位</h2>
                </div>
                <router-link to="/jobs" class="more-link">查看全部 &rarr;</router-link>
            </div>
            <div class="job-grid">
                <div v-for="job in recommendJobs" :key="job.id" class="job-card" @click="$router.push(`/jobs/${job.id}`)">
                    <div class="job-top">
                        <span class="job-company">{{ job.company_name }}</span>
                        <span class="job-type" v-if="job.company_type">{{ job.company_type }}</span>
                    </div>
                    <h3 class="job-title">{{ job.job_title }}</h3>
                    <div class="job-meta">
                        <span class="meta-pill">{{ job.city }}</span>
                        <span class="meta-pill">{{ job.degree_required }}</span>
                        <span class="meta-pill" v-if="job.experience">{{ job.experience }}</span>
                    </div>
                    <div class="job-bottom">
                        <span class="job-salary">
                            {{ job.salary_min / 1000 }}<span class="salary-sep">–</span>{{ job.salary_max / 1000 }}<span class="salary-unit">K</span>
                        </span>
                        <div class="job-tags" v-if="job.tags">
                            <span class="tag" v-for="t in job.tags.split(',').slice(0, 3)" :key="t">{{ t }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="recommendJobs.length === 0 && !loading" class="empty-state">
                <span class="empty-label">NO DATA</span>
                <span class="empty-desc">暂无推荐岗位</span>
            </div>
        </section>

        <!-- Latest News -->
        <section class="section">
            <div class="section-head">
                <div>
                    <span class="section-tag">LATEST</span>
                    <h2 class="section-title">最新资讯</h2>
                </div>
                <router-link to="/news" class="more-link">查看全部 &rarr;</router-link>
            </div>
            <div class="news-grid">
                <div v-for="item in latestNews" :key="item.id" class="news-card" @click="$router.push(`/news/${item.id}`)">
                    <div class="news-cover" v-if="item.cover">
                        <img :src="item.cover" alt="" loading="lazy" />
                    </div>
                    <div class="news-body">
                        <div class="news-meta-row">
                            <span class="news-cat">{{ getCategoryLabel(item.category) }}</span>
                            <span class="news-time">{{ formatDate(item.created_at) }}</span>
                        </div>
                        <h3 class="news-title">{{ item.title }}</h3>
                        <p class="news-summary" v-if="item.summary">{{ item.summary }}</p>
                    </div>
                </div>
            </div>
            <div v-if="latestNews.length === 0 && !loading" class="empty-state">
                <span class="empty-label">NO DATA</span>
                <span class="empty-desc">暂无资讯</span>
            </div>
        </section>
    </div>
    <ChatBot />
</template>

<script setup>
import ChatBot from '../components/ChatBot.vue'
import { ref, onMounted } from 'vue'
import axios from '@/util/axios.config.js'

const stats = ref({ jobs: 0, companies: 0, news: 0 })
const recommendJobs = ref([])
const latestNews = ref([])
const loading = ref(true)

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

onMounted(async () => {
    try {
        // 并行加载统计、推荐岗位、最新资讯
        const [statsRes, newsRes] = await Promise.all([
            axios.get('/webApi/stats').catch(() => null),
            axios.get('/webApi/news/list?limit=4')
        ])

        if (statsRes?.data?.code === 200) {
            stats.value = statsRes.data.data
        }

        if (newsRes.data.code === 200) {
            latestNews.value = newsRes.data.data || []
        }

        // 推荐岗位（需登录，失败则回退到普通列表）
        let jobsData = []
        try {
            const recRes = await axios.get('/webApi/job/recommend?limit=6')
            if (recRes.data.code === 200) jobsData = recRes.data.data || []
        } catch {
            const jobsRes = await axios.get('/webApi/job/list?limit=6')
            if (jobsRes.data.code === 200) jobsData = jobsRes.data.data || []
        }
        recommendJobs.value = jobsData
    } catch (e) {
        console.error('首页数据加载失败:', e)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.home-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-xl) var(--space-4xl);
}

/* ═══════════════════════════════
   Hero
   ═══════════════════════════════ */
.hero {
    padding: var(--space-4xl) 0 var(--space-2xl);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 1px solid var(--border);
    margin-bottom: 0;
    position: relative;
}

.hero-inner {
    max-width: 520px;
}

.hero-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-md);
}

.hero-title {
    margin: 0 0 var(--space-lg);
}

.hero-line {
    display: block;
    font-family: var(--font-body);
    font-size: 52px;
    font-weight: 700;
    color: var(--text-display);
    letter-spacing: -0.03em;
    line-height: 1.1;
}

.hero-accent {
    font-family: var(--font-display);
    color: var(--accent);
    font-size: 56px;
    letter-spacing: 0.02em;
    margin-top: 4px;
}

.hero-desc {
    font-size: 15px;
    color: var(--text-disabled);
    line-height: 1.6;
    margin: 0 0 var(--space-lg);
    max-width: 380px;
}

.hero-actions {
    display: flex;
    gap: var(--space-sm);
}

.btn-primary {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 28px;
    border-radius: 999px;
    border: none;
    background: var(--text-display);
    color: var(--black);
    transition: all 150ms ease-out;
}

.btn-primary:hover {
    background: transparent;
    color: var(--text-display);
    border: 1px solid var(--border-visible);
}

.btn-ghost {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 28px;
    border-radius: 999px;
    border: 1px solid var(--border-visible);
    background: transparent;
    color: var(--text-secondary);
    transition: all 150ms ease-out;
}

.btn-ghost:hover {
    border-color: var(--text-secondary);
    color: var(--text-primary);
}

/* ── Stats ── */
.hero-stats {
    display: flex;
    align-items: center;
    gap: var(--space-xl);
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border);
}

.stat-item {
    text-align: center;
}

.stat-num {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 900;
    color: var(--text-display);
    display: block;
    line-height: 1;
    letter-spacing: -0.02em;
}

.stat-unit {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    display: block;
    margin-top: var(--space-xs);
}

/* ═══════════════════════════════
   Section
   ═══════════════════════════════ */
.section {
    margin-top: var(--space-3xl);
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-lg);
}

.section-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-xs);
}

.section-title {
    font-size: 24px;
    font-weight: 500;
    color: var(--text-display);
    margin: 0;
    letter-spacing: -0.01em;
}

.more-link {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
    transition: color 150ms;
}

.more-link:hover {
    color: var(--text-secondary);
}

/* ═══════════════════════════════
   Job Grid
   ═══════════════════════════════ */
.job-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-md);
}

.job-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: var(--space-lg);
    cursor: pointer;
    transition: border-color 200ms ease-out;
    display: flex;
    flex-direction: column;
}

.job-card:hover {
    border-color: var(--border-visible);
    background: #FAFBFC;
}

.job-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.job-company {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
    letter-spacing: 0.04em;
}

.job-type {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 1px 8px;
}

.job-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
    line-height: 1.3;
}

.job-meta {
    display: flex;
    gap: 6px;
    margin-bottom: var(--space-md);
    flex-wrap: wrap;
}

.meta-pill {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 2px 8px;
}

.job-bottom {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.job-salary {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-display);
    line-height: 1;
}

.salary-sep {
    color: var(--text-disabled);
    margin: 0 2px;
}

.salary-unit {
    font-size: 12px;
    color: var(--text-secondary);
    margin-left: 2px;
    font-weight: 400;
}

.job-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.tag {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-disabled);
    background: var(--surface-raised);
    border-radius: 4px;
    padding: 2px 6px;
}

/* ═══════════════════════════════
   News Grid
   ═══════════════════════════════ */
.news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
}

.news-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 200ms ease-out;
    display: flex;
    flex-direction: column;
}

.news-card:hover {
    border-color: var(--border-visible);
    background: #FAFBFC;
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
    flex: 1;
    display: flex;
    flex-direction: column;
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
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    text-transform: uppercase;
}

.news-time {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
}

.news-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
    line-height: 1.4;
}

.news-summary {
    font-size: 13px;
    color: var(--text-disabled);
    line-height: 1.5;
    margin: 0;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ═══════════════════════════════
   Empty State
   ═══════════════════════════════ */
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

/* ═══════════════════════════════
   Responsive
   ═══════════════════════════════ */
@media (max-width: 768px) {
    .hero {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-xl);
    }
    .hero-stats {
        gap: var(--space-lg);
    }
    .hero-line {
        font-size: 32px;
    }
    .hero-accent {
        font-size: 36px;
    }
    .stat-num {
        font-size: 28px;
    }
    .job-grid {
        grid-template-columns: 1fr;
    }
    .news-grid {
        grid-template-columns: 1fr;
    }
    .news-card {
        flex-direction: column;
    }
}
</style>

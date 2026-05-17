<template>
    <div class="detail-page">
        <div v-if="job" class="detail-content">
            <!-- Back -->
            <router-link to="/jobs" class="back-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </router-link>

            <!-- Header -->
            <div class="detail-header">
                <div class="header-top">
                    <span class="header-label">JOB DETAIL</span>
                    <div class="header-actions">
                                                        <button class="fav-btn" :class="{ active: isFavorited }" @click="toggleFav">
                            <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <span class="header-salary">
                            {{ job.salary_min / 1000 }}<span class="salary-sep">–</span>{{ job.salary_max / 1000 }}<span class="salary-unit">K</span>
                        </span>
                    </div>
                </div>
                <h1 class="detail-title">{{ job.job_title }}</h1>
                <div class="detail-tags" v-if="job.tags">
                    <span class="tag" v-for="t in job.tags.split(',')" :key="t">{{ t }}</span>
                </div>
            </div>

            <!-- Company Card -->
            <div class="company-card">
                <div class="company-header">
                    <div class="company-avatar">{{ (job.company_name || 'C')[0] }}</div>
                    <div class="company-info">
                        <h3 class="company-name">{{ job.company_name }}</h3>
                        <div class="company-meta">
                            <span v-if="job.company_type">{{ job.company_type }}</span>
                            <span v-if="job.company_size">{{ job.company_size }}</span>
                        </div>
                    </div>
                </div>
                <p class="company-desc" v-if="job.company_desc">{{ job.company_desc }}</p>
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">CITY</span>
                    <span class="info-val">{{ job.city || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">DEGREE</span>
                    <span class="info-val">{{ job.degree_required || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">EXPERIENCE</span>
                    <span class="info-val">{{ job.experience || '—' }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">HEADCOUNT</span>
                    <span class="info-val">{{ job.headcount || '—' }}</span>
                </div>
            </div>

            <!-- Description -->
            <div class="section">
                <h2 class="section-title">岗位描述</h2>
                <p class="section-body">{{ job.job_description }}</p>
            </div>

            <!-- Requirements -->
            <div class="section">
                <h2 class="section-title">岗位要求</h2>
                <p class="section-body">{{ job.job_requirements }}</p>
            </div>

            <!-- Benefits -->
            <div class="section" v-if="job.benefits">
                <h2 class="section-title">福利待遇</h2>
                <div class="benefits-list">
                    <span class="benefit" v-for="b in job.benefits.split(',')" :key="b">{{ b }}</span>
                </div>
            </div>

            <!-- Apply Link -->
            <div v-if="job.link" class="apply-section">
                <a :href="job.link" target="_blank" rel="noopener noreferrer" class="apply-btn">
                    立即投递
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                    </svg>
                </a>
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
const job = ref(null)
const isFavorited = ref(false)

const toggleFav = async () => {
    try {
        const res = await axios.post('/webApi/user/favorite', {
            target_type: 'job',
            target_id: Number(route.params.id)
        })
        if (res.data.code === 200) isFavorited.value = res.data.data.favorited
    } catch (e) { console.error(e) }
}

onMounted(async () => {
    try {
        const [detailRes, favRes] = await Promise.all([
            axios.get(`/webApi/job/detail/${route.params.id}`),
            axios.get(`/webApi/user/favorite/check?target_type=job&target_id=${route.params.id}`)
        ])
        if (detailRes.data.code === 200) job.value = detailRes.data.data
        if (favRes.data.code === 200) isFavorited.value = favRes.data.data.favorited
    } catch (e) { console.error(e) }
})
</script>

<style scoped>
.detail-page {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-4xl);
}

/* ── Back Button ── */
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
    margin-bottom: var(--space-xl);
    transition: all 150ms ease-out;
}

.back-btn:hover {
    border-color: var(--border-visible);
    color: var(--text-display);
}

/* ── Header ── */
.detail-header {
    margin-bottom: var(--space-xl);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.header-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
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

.header-salary {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 700;
    color: var(--text-display);
    line-height: 1;
}

.salary-sep {
    color: var(--text-disabled);
    margin: 0 2px;
}

.salary-unit {
    font-size: 14px;
    color: var(--text-secondary);
    margin-left: 2px;
    font-weight: 400;
}

.detail-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-display);
    margin: 0 0 var(--space-md);
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.detail-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 3px 10px;
}

/* ── Company ── */
.company-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.company-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
}

.company-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    flex-shrink: 0;
}

.company-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 4px;
}

.company-meta {
    display: flex;
    gap: var(--space-sm);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
}

.company-desc {
    font-size: 13px;
    color: var(--text-disabled);
    margin: 0;
    line-height: 1.6;
}

/* ── Info Grid ── */
.info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: var(--space-xl);
}

.info-item {
    background: var(--surface);
    padding: var(--space-md);
    text-align: center;
}

.info-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.info-val {
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 500;
}

/* ── Sections ── */
.section {
    margin-bottom: var(--space-xl);
}

.section-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-md);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--border);
}

.section-body {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-secondary);
    margin: 0;
    white-space: pre-line;
}

/* ── Benefits ── */
.benefits-list {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: wrap;
}

.benefit {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    border: 1px solid var(--border-visible);
    border-radius: 999px;
    padding: 4px 14px;
}

/* ── Apply ── */
.apply-section {
    margin-top: var(--space-xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--border);
}

.apply-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 14px 32px;
    border-radius: 999px;
    border: 1px solid var(--text-display);
    background: var(--text-display);
    color: var(--bg, #000);
    text-decoration: none;
    cursor: pointer;
    transition: all 150ms ease-out;
}

.apply-btn:hover {
    background: transparent;
    color: var(--text-display);
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
    .info-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .header-salary {
        font-size: 22px;
    }
    .detail-title {
        font-size: 24px;
    }
}
</style>

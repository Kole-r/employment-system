<template>
    <div class="page">
        <div class="page-hero">
            <router-link to="/home" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                返回首页
            </router-link>
            <span class="hero-label">JOBS</span>
            <h1 class="hero-title">岗位列表</h1>
            <span class="hero-count">{{ filteredList.length }} RESULTS</span>
        </div>

        <div class="filter-bar">
            <div class="segmented-control">
                <button
                    v-for="t in typeOptions"
                    :key="t.value"
                    :class="['segment', { active: activeType === t.value }]"
                    @click="activeType = t.value"
                >{{ t.label }}</button>
            </div>
            <input
                v-model="keyword"
                class="search-input"
                placeholder="搜索岗位或公司..."
            />
        </div>

        <div class="job-list">
            <div
                v-for="job in filteredList"
                :key="job.id"
                class="job-row"
                @click="$router.push(`/jobs/${job.id}`)"
            >
                <div class="row-main">
                    <div class="row-header">
                        <span class="row-company">{{ job.company_name }}</span>
                        <span class="row-type" v-if="job.company_type">{{ job.company_type }}</span>
                    </div>
                    <h3 class="row-title">{{ job.job_title }}</h3>
                    <div class="row-meta">
                        <span class="meta-pill">{{ job.city }}</span>
                        <span class="meta-pill">{{ job.degree_required }}</span>
                        <span class="meta-pill" v-if="job.experience">{{ job.experience }}</span>
                    </div>
                    <div class="row-tags" v-if="job.tags">
                        <span class="tag" v-for="t in job.tags.split(',').slice(0, 5)" :key="t">{{ t }}</span>
                    </div>
                </div>
                <div class="row-side">
                    <span class="row-salary">
                        {{ job.salary_min / 1000 }}<span class="salary-sep">–</span>{{ job.salary_max / 1000 }}<span class="salary-unit">K</span>
                    </span>
                    <span class="row-benefits" v-if="job.benefits">{{ job.benefits.split(',').slice(0, 2).join(' · ') }}</span>
                </div>
            </div>
        </div>

        <div v-if="filteredList.length === 0" class="empty-state">
            <span class="empty-label">NO DATA</span>
            <span class="empty-desc">暂无匹配的岗位</span>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import axios from '@/util/axios.config.js'

const list = ref([])
const activeType = ref('all')
const keyword = ref('')

const typeOptions = [
    { label: '全部', value: 'all' },
    { label: '技术', value: '技术' },
    { label: '产品', value: '产品' },
    { label: '运营', value: '运营' },
    { label: '设计', value: '设计' }
]

const filteredList = computed(() => {
    let data = list.value
    if (activeType.value !== 'all') data = data.filter(i => i.job_type === activeType.value)
    if (keyword.value) {
        const kw = keyword.value.toLowerCase()
        data = data.filter(i =>
            i.job_title.toLowerCase().includes(kw) ||
            i.company_name.toLowerCase().includes(kw)
        )
    }
    return data
})

onMounted(async () => {
    try {
        const res = await axios.get('/webApi/job/list')
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
    gap: var(--space-md);
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

.search-input {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 10px 18px;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-primary);
    outline: none;
    width: 240px;
    transition: border-color 200ms ease-out;
}

.search-input::placeholder {
    color: var(--text-disabled);
}

.search-input:focus {
    border-color: var(--text-secondary);
}

/* ═══ Job List ═══ */
.job-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.job-row {
    background: var(--surface);
    padding: var(--space-lg) var(--space-xl);
    cursor: pointer;
    transition: background 150ms ease-out;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.job-row:hover {
    background: var(--surface-raised);
}

.job-row::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: transparent;
    transition: background 200ms ease-out;
}

.job-row:hover::before {
    background: var(--accent);
}

.row-main {
    flex: 1;
    min-width: 0;
}

.row-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: 6px;
}

.row-company {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-disabled);
    letter-spacing: 0.04em;
}

.row-type {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-disabled);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 1px 8px;
}

.row-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-sm);
}

.row-meta {
    display: flex;
    gap: 6px;
    margin-bottom: var(--space-sm);
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

.row-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.tag {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-disabled);
    background: var(--surface-raised);
    border-radius: 4px;
    padding: 2px 6px;
}

/* ── Side ── */
.row-side {
    text-align: right;
    flex-shrink: 0;
    margin-left: var(--space-xl);
}

.row-salary {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 700;
    color: var(--text-display);
    display: block;
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

.row-benefits {
    font-size: 11px;
    color: var(--text-disabled);
    margin-top: var(--space-xs);
    display: block;
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
    .filter-bar {
        flex-direction: column;
        align-items: flex-start;
    }
    .search-input {
        width: 100%;
    }
    .job-row {
        flex-direction: column;
        align-items: flex-start;
    }
    .row-side {
        text-align: left;
        margin: var(--space-md) 0 0;
    }
}
</style>

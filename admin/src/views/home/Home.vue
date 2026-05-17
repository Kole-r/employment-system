<template>
    <div class="home-page">
        <!-- Hero Greeting -->
        <div class="hero-section">
            <div class="hero-left">
                <span class="hero-label">DASHBOARD</span>
                <h1 class="hero-greeting">{{ welcomeText }}</h1>
                <p class="hero-sub">{{ userInfo.$state.username }}，欢迎回来</p>
            </div>
            <div class="hero-right">
                <div class="user-card">
                    <div class="user-avatar-wrap">
                        <img :src="avatarUrl" alt="avatar" class="user-avatar" />
                    </div>
                    <div class="user-meta">
                        <span class="meta-label">ROLE</span>
                        <span class="meta-value">{{ userInfo.$state.role === 1 ? '管理员' : userInfo.$state.role === 2 ? '企业人员' : '毕业生' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Time Display -->
        <div class="time-bar">
            <div class="time-display">
                <span class="time-value">{{ currentTime }}</span>
                <span class="time-date">{{ currentDate }}</span>
            </div>
            <div class="time-divider"></div>
            <div class="quick-stats">
                <div class="qstat">
                    <span class="qstat-label">SYSTEM</span>
                    <span class="qstat-value online">ONLINE</span>
                </div>
                <div class="qstat">
                    <span class="qstat-label">VERSION</span>
                    <span class="qstat-value">1.0.0</span>
                </div>
            </div>
        </div>

        <!-- Stats Overview -->
        <div class="section-block">
            <div class="section-head">
                <span class="section-label">OVERVIEW</span>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">{{ stats.newsCount }}</div>
                    <div class="stat-meta">
                        <span class="stat-label">NEWS</span>
                        <span class="stat-sub">已发布 {{ stats.publishedCount }} 篇</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ stats.jobCount }}</div>
                    <div class="stat-meta">
                        <span class="stat-label">JOBS</span>
                        <span class="stat-sub">招聘中 {{ stats.activeJobCount }} 个</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">{{ stats.userCount }}</div>
                    <div class="stat-meta">
                        <span class="stat-label">USERS</span>
                        <span class="stat-sub">管理员 {{ stats.adminCount }} 人</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="section-block">
            <div class="section-head">
                <span class="section-label">ANALYTICS</span>
            </div>
            <div class="chart-grid">
                <div class="chart-card">
                    <span class="chart-title">新闻分类分布</span>
                    <div ref="categoryChartRef" class="chart-container"></div>
                </div>
                <div class="chart-card">
                    <span class="chart-title">岗位城市分布</span>
                    <div ref="cityChartRef" class="chart-container"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import useUserInfoStore from '../../store/userInfo.js'
import axios from '../../util/axios.config.js'
import { computed, ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const userInfo = useUserInfoStore()
const avatarUrl = computed(() =>
    userInfo.$state.avatar
        ? userInfo.$state.avatar
        : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
)

const welcomeText = computed(() => {
    const hours = new Date().getHours()
    if (hours < 12) return '早上好'
    if (hours < 18) return '下午好'
    return '晚上好'
})

/* ── Clock ── */
const currentTime = ref('')
const currentDate = ref('')
let timer = null

const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
}

/* ── Stats Data ── */
const stats = reactive({
    newsCount: 0,
    publishedCount: 0,
    jobCount: 0,
    activeJobCount: 0,
    userCount: 0,
    adminCount: 0,
})

/* ── Chart Refs ── */
const categoryChartRef = ref(null)
const cityChartRef = ref(null)
let categoryChart = null
let cityChart = null

const CATEGORY_MAP = { 1: '就业政策', 2: '行业动态', 3: '求职技巧', 4: '企业资讯', 5: '校园招聘' }

/* ── Fetch & Init ── */
onMounted(async () => {
    updateTime()
    timer = setInterval(updateTime, 1000)

    // ECharts dark theme config
    echarts.registerTheme('ndDark', {
        backgroundColor: 'transparent',
        textStyle: { color: '#888888' },
        title: { textStyle: { color: '#CCCCCC' } },
    })

    try {
        const [newsRes, jobsRes, usersRes] = await Promise.all([
            axios.get('/adminApi/news/list'),
            axios.get('/adminApi/job/list'),
            axios.get('/adminApi/user/list'),
        ])

        const newsList = newsRes.data?.data || []
        const jobList = jobsRes.data?.data || []
        const userList = usersRes.data?.data || []

        // Compute stats
        stats.newsCount = newsList.length
        stats.publishedCount = newsList.filter(n => n.status === 1).length
        stats.jobCount = jobList.length
        stats.activeJobCount = jobList.filter(j => j.status === 1).length
        stats.userCount = userList.length
        stats.adminCount = userList.filter(u => u.role === 1).length

        // News category distribution
        const categoryCount = {}
        newsList.forEach(n => {
            const name = CATEGORY_MAP[n.category] || `分类${n.category}`
            categoryCount[name] = (categoryCount[name] || 0) + 1
        })
        const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }))

        // Jobs city distribution (top 8)
        const cityCount = {}
        jobList.forEach(j => {
            if (j.city) cityCount[j.city] = (cityCount[j.city] || 0) + 1
        })
        const sortedCities = Object.entries(cityCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
        const cityNames = sortedCities.map(c => c[0]).reverse()
        const cityValues = sortedCities.map(c => c[1]).reverse()

        // Init category chart (doughnut)
        if (categoryChartRef.value) {
            categoryChart = echarts.init(categoryChartRef.value, 'ndDark')
            categoryChart.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                legend: {
                    bottom: 0,
                    textStyle: { color: '#888888', fontSize: 11 },
                    itemWidth: 10,
                    itemHeight: 10,
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '65%'],
                    center: ['50%', '42%'],
                    avoidLabelOverlap: false,
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#F0F0F0' },
                    },
                    data: categoryData,
                    itemStyle: {
                        borderColor: '#111111',
                        borderWidth: 2,
                    },
                }],
                color: ['#D71921', '#5B9BF6', '#3DDC84', '#D4A843', '#A78BFA', '#F472B6'],
            })
        }

        // Init city chart (horizontal bar)
        if (cityChartRef.value) {
            cityChart = echarts.init(cityChartRef.value, 'ndDark')
            cityChart.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: 80, right: 40, top: 16, bottom: 24 },
                xAxis: {
                    type: 'value',
                    axisLine: { lineStyle: { color: '#1E1E1E' } },
                    splitLine: { lineStyle: { color: '#1E1E1E' } },
                    axisLabel: { color: '#555555' },
                },
                yAxis: {
                    type: 'category',
                    data: cityNames,
                    axisLine: { lineStyle: { color: '#1E1E1E' } },
                    axisLabel: { color: '#888888', fontSize: 12 },
                },
                series: [{
                    type: 'bar',
                    data: cityValues,
                    barWidth: 16,
                    itemStyle: {
                        borderRadius: [0, 4, 4, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#D7192144' },
                            { offset: 1, color: '#D71921' },
                        ]),
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: '#888888',
                        fontSize: 11,
                        fontFamily: 'Space Mono, monospace',
                    },
                }],
            })
        }
    } catch (e) {
        console.warn('Dashboard data load failed:', e)
    }

    // Resize handler
    const handleResize = () => {
        categoryChart?.resize()
        cityChart?.resize()
    }
    window.addEventListener('resize', handleResize)
    // Store for cleanup
    if (timer) timer._resizeHandler = handleResize
})

onUnmounted(() => {
    clearInterval(timer)
    categoryChart?.dispose()
    cityChart?.dispose()
    if (timer?._resizeHandler) {
        window.removeEventListener('resize', timer._resizeHandler)
    }
})
</script>

<style lang="scss" scoped>
/* ── Tokens ── */
$black: #000000;
$surface: #0A0A0A;
$surface-1: #111111;
$surface-2: #161616;
$border: #1E1E1E;
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
$amber: #D4A843;
$blue: #5B9BF6;

.home-page {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: $g5;
    background: $black;
    min-height: 100vh;
    padding: 32px 40px 64px;
}

/* ── Hero ── */
.hero-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
}

.hero-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
    display: block;
    margin-bottom: 12px;
}

.hero-greeting {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 56px;
    font-weight: 700;
    color: $pure;
    margin: 0;
    letter-spacing: -0.03em;
    line-height: 1;
}

.hero-sub {
    font-size: 16px;
    color: $g3;
    margin: 16px 0 0;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 20px;
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 16px 24px;
}

.user-avatar-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid $border-hi;
    flex-shrink: 0;
}

.user-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.user-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.meta-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g2;
}

.meta-value {
    font-size: 15px;
    color: $g5;
    font-weight: 500;
}

/* ── Time Bar ── */
.time-bar {
    display: flex;
    align-items: center;
    gap: 32px;
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 20px 28px;
    margin-bottom: 48px;
}

.time-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.time-value {
    font-family: 'Space Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: $pure;
    letter-spacing: -0.02em;
    line-height: 1;
}

.time-date {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g3;
    letter-spacing: 0.02em;
}

.time-divider {
    width: 1px;
    height: 40px;
    background: $border-hi;
}

.quick-stats {
    display: flex;
    gap: 32px;
}

.qstat {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.qstat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g2;
}

.qstat-value {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    color: $g5;

    &.online { color: $green; }
}

/* ── Section ── */
.section-block {
    margin-bottom: 40px;
}

.section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
}

/* ── Stats Cards ── */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.stat-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 28px 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: border-color 150ms ease-out;

    &:hover { border-color: $border-hi; }
}

.stat-number {
    font-family: 'Space Mono', monospace;
    font-size: 42px;
    font-weight: 700;
    color: $pure;
    letter-spacing: -0.03em;
    line-height: 1;
    min-width: 72px;
    text-align: center;
}

.stat-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g2;
}

.stat-sub {
    font-size: 13px;
    color: $g3;
}

/* ── Chart Cards ── */
.chart-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.chart-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 24px;
    transition: border-color 150ms ease-out;

    &:hover { border-color: $border-hi; }
}

.chart-title {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.06em;
    color: $g3;
    display: block;
    margin-bottom: 16px;
}

.chart-container {
    width: 100%;
    height: 280px;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
    .chart-grid { grid-template-columns: 1fr; }
}

@media (max-width: 860px) {
    .stats-grid { grid-template-columns: 1fr; }
    .hero-section { flex-direction: column; align-items: flex-start; gap: 24px; }
}
</style>

<template>
    <div class="profile-page">
        <div class="page-hero">
            <router-link to="/home" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                返回首页
            </router-link>
            <span class="hero-label">PROFILE</span>
            <h1 class="hero-title">个人中心</h1>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
            <router-link to="/resume" class="action-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <div class="action-info">
                    <span class="action-title">简历编辑</span>
                    <span class="action-desc">创建和编辑个人简历</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="action-arrow">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </router-link>
        </div>

        <div class="content-grid">
            <!-- Profile Card -->
            <div class="profile-card">
                <div class="avatar-section">
                    <div class="avatar-ring">
                        <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="avatar" class="avatar-img" />
                        <span v-else class="avatar-initial">{{ avatarInitial }}</span>
                    </div>
                    <span class="profile-name">{{ userInfo.real_name || userInfo.username }}</span>
                    <span class="profile-role-tag">{{ roleLabel }}</span>
                </div>
                <div class="profile-stats">
                    <div class="pstat-row" v-for="field in displayFields" :key="field.key">
                        <span class="pstat-label">{{ field.label }}</span>
                        <span class="pstat-value">{{ userInfo[field.key] || '—' }}</span>
                    </div>
                </div>
            </div>

            <!-- Edit Form -->
            <div class="form-card">
                <div class="form-header">
                    <span class="form-tag">EDIT PROFILE</span>
                </div>
                <div class="form-body">
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label class="form-label">用户名</label>
                            <input v-model="userForm.username" type="text" class="form-input" placeholder="请输入用户名" />
                        </div>
                        <div class="form-group form-group-half">
                            <label class="form-label">真实姓名</label>
                            <input v-model="userForm.real_name" type="text" class="form-input" placeholder="请输入真实姓名" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label class="form-label">手机号</label>
                            <input v-model="userForm.phone" type="text" class="form-input" placeholder="请输入手机号" />
                        </div>
                        <div class="form-group form-group-half">
                            <label class="form-label">邮箱</label>
                            <input v-model="userForm.email" type="text" class="form-input" placeholder="请输入邮箱" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label class="form-label">毕业院校</label>
                            <input v-model="userForm.university" type="text" class="form-input" placeholder="请输入毕业院校" />
                        </div>
                        <div class="form-group form-group-half">
                            <label class="form-label">专业</label>
                            <input v-model="userForm.major" type="text" class="form-input" placeholder="请输入专业" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label class="form-label">学历</label>
                            <div class="select-wrap">
                                <select v-model="userForm.degree" class="form-select">
                                    <option value="">请选择</option>
                                    <option value="本科">本科</option>
                                    <option value="硕士">硕士</option>
                                    <option value="博士">博士</option>
                                </select>
                                <span class="select-arrow">&#9662;</span>
                            </div>
                        </div>
                        <div class="form-group form-group-half">
                            <label class="form-label">毕业年份</label>
                            <input v-model="userForm.graduation_year" type="number" class="form-input" placeholder="如 2025" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">意向城市</label>
                        <div class="tag-selector">
                            <button v-for="city in cityOptions" :key="city"
                                class="tag-btn" :class="{ active: (userForm.city_preference || '').split(',').includes(city) }"
                                @click="toggleCity(city)" type="button">
                                {{ city }}
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">意向岗位</label>
                        <div class="tag-selector">
                            <button v-for="type in jobTypeOptions" :key="type"
                                class="tag-btn" :class="{ active: (userForm.job_preference || '').split(',').includes(type) }"
                                @click="toggleJobType(type)" type="button">
                                {{ type }}
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">个人简介</label>
                        <textarea v-model="userForm.bio" class="form-textarea" rows="4" placeholder="请输入个人简介"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">头像</label>
                        <Upload :avatar="userForm.avatar" @koleChange="handChange" />
                    </div>
                    <div class="form-actions">
                        <span v-if="statusMsg" class="status-msg" :class="{ success: isSuccess }">{{ statusMsg }}</span>
                        <button class="btn-save" @click="submitForm">保存更改</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import { useUserInfoStore } from '../store/userInfo'
import upload from '../util/upload.js'
import Upload from '../components/upload/Upload.vue'

const store = useUserInfoStore()
const userInfo = computed(() => store.$state)
const avatarInitial = computed(() => (userInfo.value.real_name || userInfo.value.username || 'U')[0])

const roleLabel = computed(() => {
    const r = userInfo.value.role
    return r === 1 ? '管理员' : r === 2 ? '企业人员' : '毕业生'
})

const displayFields = [
    { key: 'username', label: 'USERNAME' },
    { key: 'real_name', label: 'REAL NAME' },
    { key: 'phone', label: 'PHONE' },
    { key: 'email', label: 'EMAIL' },
    { key: 'major', label: 'MAJOR' },
    { key: 'degree', label: 'DEGREE' },
    { key: 'university', label: 'UNIVERSITY' },
    { key: 'city_preference', label: '意向城市' },
    { key: 'job_preference', label: '意向岗位' },
]

const cityOptions = ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '苏州', '长沙', '重庆']
const jobTypeOptions = ['技术', '产品', '运营', '设计', '数据', '测试', '市场', '销售']

const toggleCity = (city) => {
    const list = userForm.city_preference ? userForm.city_preference.split(',').filter(Boolean) : []
    const idx = list.indexOf(city)
    if (idx >= 0) list.splice(idx, 1)
    else list.push(city)
    userForm.city_preference = list.join(',')
}

const toggleJobType = (type) => {
    const list = userForm.job_preference ? userForm.job_preference.split(',').filter(Boolean) : []
    const idx = list.indexOf(type)
    if (idx >= 0) list.splice(idx, 1)
    else list.push(type)
    userForm.job_preference = list.join(',')
}

const statusMsg = ref('')
const isSuccess = ref(false)

const userForm = reactive({
    username: store.username || '',
    real_name: store.real_name || '',
    phone: store.phone || '',
    email: store.email || '',
    avatar: store.avatar || '',
    major: store.major || '',
    degree: store.degree || '',
    graduation_year: store.graduation_year || '',
    university: store.university || '',
    city_preference: store.city_preference || '',
    job_preference: store.job_preference || '',
    bio: store.bio || '',
    file: null
})

const handChange = (file) => {
    userForm.avatar = URL.createObjectURL(file)
    userForm.file = file
}

const showStatus = (msg, success = false) => {
    isSuccess.value = success
    statusMsg.value = msg
    setTimeout(() => { statusMsg.value = '' }, 3000)
}

const submitForm = async () => {
    if (!userForm.username) {
        showStatus('[ERROR] 请输入用户名')
        return
    }
    try {
        const res = await upload('/webApi/user/profile', userForm, 'put')
        if (res.code === 200) {
            store.updateInfo({
                username: res.data.username,
                real_name: res.data.real_name,
                phone: res.data.phone,
                email: res.data.email,
                avatar: res.data.avatar,
                major: res.data.major,
                degree: res.data.degree,
                graduation_year: res.data.graduation_year,
                university: res.data.university,
                city_preference: res.data.city_preference,
                job_preference: res.data.job_preference,
                bio: res.data.bio,
            })
            userForm.avatar = res.data.avatar || userForm.avatar
            showStatus('[SAVED]', true)
        } else {
            showStatus('[ERROR] ' + res.message)
        }
    } catch (e) {
        showStatus('[ERROR] 保存失败')
    }
}
</script>

<style scoped>
.profile-page {
    max-width: 960px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-4xl);
}

.page-hero {
    margin-bottom: var(--space-xl);
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    margin-bottom: var(--space-sm);
    transition: color 150ms;
}

.back-link:hover { color: var(--text-primary); }

.hero-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-xs);
}

.hero-title {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-display);
    margin: 0;
    letter-spacing: -0.02em;
}

/* ── Quick Actions ── */
.quick-actions {
    margin-bottom: var(--space-lg);
}

.action-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: 16px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    transition: all 150ms ease-out;
    color: var(--text-primary);
}

.action-card:hover {
    border-color: var(--border-visible);
    background: var(--surface-raised);
}

.action-card svg:first-child {
    color: var(--text-secondary);
    flex-shrink: 0;
}

.action-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.action-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-display);
}

.action-desc {
    font-size: 12px;
    color: var(--text-disabled);
}

.action-arrow {
    color: var(--text-disabled);
    flex-shrink: 0;
}

/* ── Content Grid ── */
.content-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;
    align-items: start;
}

/* ── Profile Card ── */
.profile-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px 24px;
    border-bottom: 1px solid var(--border);
}

.avatar-ring {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--border-visible);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-raised);
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.avatar-initial {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 900;
    color: var(--text-display);
}

.profile-name {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.profile-role-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    border: 1px solid var(--border-visible);
    border-radius: 999px;
    padding: 3px 12px;
}

.profile-stats {
    padding: 8px 24px;
}

.pstat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
}

.pstat-row:last-child { border-bottom: none; }

.pstat-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
}

.pstat-value {
    font-size: 13px;
    color: var(--text-secondary);
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Form Card ── */
.form-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.form-header {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
}

.form-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
}

.form-body {
    padding: 28px;
}

.form-group {
    margin-bottom: 24px;
}

.form-group:last-of-type { margin-bottom: 32px; }

.form-row {
    display: flex;
    gap: 24px;
}

.form-group-half {
    flex: 1;
}

.form-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-disabled);
    display: block;
    margin-bottom: 10px;
}

.form-input {
    width: 100%;
    background: var(--surface-raised);
    border: 1px solid var(--border-visible);
    border-radius: 8px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;
}

.form-input::placeholder { color: var(--text-disabled); }
.form-input:focus { border-color: var(--text-secondary); background: #F9FAFB; }

.select-wrap {
    position: relative;
}

.form-select {
    width: 100%;
    background: var(--surface-raised);
    border: 1px solid var(--border-visible);
    border-radius: 8px;
    padding: 12px 16px;
    padding-right: 40px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;
}

.form-select:focus { border-color: var(--text-secondary); }

.select-arrow {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--text-disabled);
    pointer-events: none;
}

.form-textarea {
    width: 100%;
    background: var(--surface-raised);
    border: 1px solid var(--border-visible);
    border-radius: 8px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    resize: vertical;
    min-height: 100px;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;
}

.form-textarea::placeholder { color: var(--text-disabled); }
.form-textarea:focus { border-color: var(--text-secondary); }

.form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    border-top: 1px solid var(--border);
    padding-top: 24px;
}

.status-msg {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--accent);
}

.status-msg.success {
    color: var(--success);
}

.btn-save {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 28px;
    border-radius: 999px;
    border: 1px solid var(--text-primary);
    background: transparent;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 150ms ease-out;
}

.btn-save:hover {
    background: var(--text-primary);
    color: var(--black);
}

/* ── Tag Selector ── */
.tag-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag-btn {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-visible);
    background: transparent;
    color: var(--text-disabled);
    cursor: pointer;
    transition: all 150ms ease-out;
}

.tag-btn:hover {
    border-color: var(--text-secondary);
    color: var(--text-secondary);
}

.tag-btn.active {
    border-color: var(--text-primary);
    background: var(--text-primary);
    color: var(--black);
}
</style>

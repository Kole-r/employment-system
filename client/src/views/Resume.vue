<template>
    <div class="resume-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <router-link to="/profile" class="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    返回
                </router-link>
                <span class="hero-label">RESUME BUILDER</span>
                <h1 class="hero-title">简历编辑</h1>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary" @click="openFullPreview">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    预览
                </button>
                <button class="btn btn-secondary" @click="exportPDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    导出 PDF
                </button>
                <button class="btn btn-secondary" @click="exportText">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    导出文本
                </button>
            </div>
        </div>

        <!-- Privacy Notice -->
        <div class="privacy-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>你的简历数据仅保存在本地浏览器中，不会上传至云端服务器。</span>
        </div>

        <!-- Editor + Preview Split -->
        <div class="editor-layout">
            <!-- Editor Panel -->
            <div class="editor-panel">
                <!-- Personal Info -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('personal')">
                        <span class="section-label">PERSONAL INFO</span>
                        <span class="section-title">基本信息</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.personal }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.personal">
                        <!-- Avatar Upload -->
                        <div class="avatar-upload">
                            <div class="avatar-preview" @click="triggerAvatarInput">
                                <img v-if="resume.avatar" :src="resume.avatar" alt="头像" />
                                <div v-else class="avatar-placeholder">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    <span>上传照片</span>
                                </div>
                            </div>
                            <div class="avatar-actions">
                                <button class="btn-text" @click="triggerAvatarInput">
                                    {{ resume.avatar ? '更换照片' : '选择照片' }}
                                </button>
                                <button class="btn-text btn-text-danger" @click="resume.avatar = ''" v-if="resume.avatar">
                                    移除
                                </button>
                            </div>
                            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>姓名</label>
                                <input v-model="resume.name" placeholder="请输入姓名" />
                            </div>
                            <div class="form-group">
                                <label>电话</label>
                                <input v-model="resume.phone" placeholder="请输入手机号" />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>邮箱</label>
                                <input v-model="resume.email" placeholder="请输入邮箱" />
                            </div>
                            <div class="form-group">
                                <label>求职意向</label>
                                <input v-model="resume.objective" placeholder="期望岗位" />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Education -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('education')">
                        <span class="section-label">EDUCATION</span>
                        <span class="section-title">教育经历</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.education }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.education">
                        <div class="entry-card" v-for="(edu, i) in resume.education" :key="i">
                            <div class="entry-header">
                                <span class="entry-index">{{ i + 1 }}</span>
                                <button class="btn-remove" @click="removeItem('education', i)" v-if="resume.education.length > 1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>学校</label>
                                    <input v-model="edu.school" placeholder="学校名称" />
                                </div>
                                <div class="form-group">
                                    <label>专业</label>
                                    <input v-model="edu.major" placeholder="专业名称" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>学历</label>
                                    <input v-model="edu.degree" placeholder="本科 / 硕士" />
                                </div>
                                <div class="form-group">
                                    <label>时间</label>
                                    <input v-model="edu.period" placeholder="2020.09 - 2024.06" />
                                </div>
                            </div>
                        </div>
                        <button class="btn-add" @click="addItem('education')">+ 添加教育经历</button>
                    </div>
                </section>

                <!-- Skills -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('skills')">
                        <span class="section-label">SKILLS</span>
                        <span class="section-title">专业技能</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.skills }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.skills">
                        <div class="form-group">
                            <label>技能描述</label>
                            <textarea v-model="resume.skills" rows="4" placeholder="每行一个技能，例如：&#10;熟练掌握 Vue.js / React 前端框架&#10;熟悉 Node.js 后端开发&#10;英语 CET-6"></textarea>
                        </div>
                    </div>
                </section>

                <!-- Experience -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('experience')">
                        <span class="section-label">EXPERIENCE</span>
                        <span class="section-title">工作 / 实习经历</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.experience }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.experience">
                        <div class="entry-card" v-for="(exp, i) in resume.experience" :key="i">
                            <div class="entry-header">
                                <span class="entry-index">{{ i + 1 }}</span>
                                <button class="btn-remove" @click="removeItem('experience', i)" v-if="resume.experience.length > 1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>公司</label>
                                    <input v-model="exp.company" placeholder="公司名称" />
                                </div>
                                <div class="form-group">
                                    <label>职位</label>
                                    <input v-model="exp.title" placeholder="职位名称" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>时间</label>
                                <input v-model="exp.period" placeholder="2023.06 - 2023.09" />
                            </div>
                            <div class="form-group">
                                <label>工作内容</label>
                                <textarea v-model="exp.description" rows="3" placeholder="描述你的工作内容和成果，每行一条"></textarea>
                            </div>
                        </div>
                        <button class="btn-add" @click="addItem('experience')">+ 添加工作经历</button>
                    </div>
                </section>

                <!-- Projects -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('projects')">
                        <span class="section-label">PROJECTS</span>
                        <span class="section-title">项目经历</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.projects }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.projects">
                        <div class="entry-card" v-for="(proj, i) in resume.projects" :key="i">
                            <div class="entry-header">
                                <span class="entry-index">{{ i + 1 }}</span>
                                <button class="btn-remove" @click="removeItem('projects', i)" v-if="resume.projects.length > 1">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>项目名称</label>
                                    <input v-model="proj.name" placeholder="项目名称" />
                                </div>
                                <div class="form-group">
                                    <label>角色</label>
                                    <input v-model="proj.role" placeholder="你的角色" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>时间</label>
                                <input v-model="proj.period" placeholder="2023.09 - 2024.01" />
                            </div>
                            <div class="form-group">
                                <label>项目描述</label>
                                <textarea v-model="proj.description" rows="3" placeholder="描述项目内容、技术栈和你的贡献"></textarea>
                            </div>
                        </div>
                        <button class="btn-add" @click="addItem('projects')">+ 添加项目经历</button>
                    </div>
                </section>

                <!-- Self Evaluation -->
                <section class="editor-section">
                    <div class="section-header" @click="toggleSection('evaluation')">
                        <span class="section-label">SELF EVALUATION</span>
                        <span class="section-title">自我评价</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections.evaluation }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections.evaluation">
                        <div class="form-group">
                            <textarea v-model="resume.evaluation" rows="4" placeholder="简要描述你的个人特质、职业态度和优势"></textarea>
                        </div>
                    </div>
                </section>

                <!-- Extra Pages -->
                <section class="editor-section" v-for="(page, pi) in resume.extraPages" :key="'page-' + pi">
                    <div class="section-header" @click="toggleSection('extra-' + pi)">
                        <span class="section-label">PAGE {{ pi + 2 }}</span>
                        <span class="section-title">{{ page.title || '第 ' + (pi + 2) + ' 页' }}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron" :class="{ open: openSections['extra-' + pi] }"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <div class="section-body" v-show="openSections['extra-' + pi]">
                        <div class="form-group">
                            <label>页面标题</label>
                            <input v-model="page.title" placeholder="例如：附加信息" />
                        </div>
                        <div class="form-group">
                            <label>内容</label>
                            <textarea v-model="page.content" rows="6" placeholder="输入该页内容，每行一条"></textarea>
                        </div>
                        <button class="btn-remove-page" @click="removeExtraPage(pi)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            删除此页
                        </button>
                    </div>
                </section>

                <button class="btn-add-page" @click="addExtraPage">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    新增第二页
                </button>
            </div>

            <!-- Preview Panel -->
            <div class="preview-panel">
                <div class="preview-label">PREVIEW</div>
                <div class="preview-scroll">
                    <!-- Page 1 -->
                    <div class="resume-paper" id="resume-paper">
                        <div class="paper-content" v-html="renderedPage1"></div>
                    </div>
                    <!-- Extra Pages -->
                    <div class="resume-paper" v-for="(page, pi) in renderedExtraPages" :key="'rp-' + pi">
                        <div class="paper-content" v-html="page"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Preview Modal -->
        <Teleport to="body">
            <div class="full-preview-overlay" v-if="showFullPreview">
                <div class="full-preview-header">
                    <span class="full-preview-title">简历预览</span>
                    <div class="full-preview-actions">
                        <button class="btn btn-secondary" @click="exportPDF">导出 PDF</button>
                        <button class="btn btn-secondary" @click="exportText">导出文本</button>
                        <button class="btn btn-ghost" @click="showFullPreview = false">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                </div>
                <div class="full-preview-body">
                    <div class="full-paper-wrap" v-for="(_, pi) in totalPages" :key="'fp-' + pi">
                        <div class="page-number">第 {{ pi + 1 }} 页</div>
                        <div class="resume-paper resume-paper-full">
                            <div class="paper-content" v-html="pi === 0 ? renderedPage1 : renderedExtraPages[pi - 1]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Print Container (hidden, used only for printing) -->
        <Teleport to="body">
            <div id="print-container" ref="printContainer">
                <div class="print-page" v-for="(_, pi) in totalPages" :key="'pp-' + pi">
                    <div class="print-paper">
                        <div class="paper-content" v-html="pi === 0 ? renderedPage1 : renderedExtraPages[pi - 1]"></div>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Status Bar -->
        <div class="status-bar">
            <span class="status-text" :class="statusClass">{{ statusText }}</span>
        </div>
    </div>
    <ChatBot />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import ChatBot from '../components/ChatBot.vue'
import { useUserInfoStore } from '../store/userInfo'

const userInfoStore = useUserInfoStore()
const STORAGE_KEY = 'employ_resume_data'

const showFullPreview = ref(false)
const printContainer = ref(null)
const avatarInput = ref(null)
const statusText = ref('')
const statusClass = ref('')

const openSections = reactive({
    personal: true,
    education: true,
    skills: true,
    experience: false,
    projects: false,
    evaluation: false
})

const defaultResume = () => ({
    name: userInfoStore.real_name || '',
    avatar: '',
    phone: '',
    email: '',
    objective: '',
    education: [{
        school: userInfoStore.university || '',
        major: userInfoStore.major || '',
        degree: userInfoStore.degree || '',
        period: ''
    }],
    skills: '',
    experience: [{ company: '', title: '', period: '', description: '' }],
    projects: [{ name: '', role: '', period: '', description: '' }],
    evaluation: '',
    extraPages: []
})

const resume = reactive(defaultResume())

onMounted(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
        try {
            const data = JSON.parse(saved)
            Object.assign(resume, data)
            if (!resume.extraPages) resume.extraPages = []
        } catch (e) { /* ignore */ }
    }
})

let saveTimer = null
watch(resume, () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
        flashStatus('已自动保存', 'saved')
    }, 800)
}, { deep: true })

function flashStatus(text, cls) {
    statusText.value = text
    statusClass.value = cls
    setTimeout(() => {
        statusText.value = ''
        statusClass.value = ''
    }, 2000)
}

function toggleSection(key) {
    openSections[key] = !openSections[key]
}

function addItem(type) {
    const templates = {
        education: { school: '', major: '', degree: '', period: '' },
        experience: { company: '', title: '', period: '', description: '' },
        projects: { name: '', role: '', period: '', description: '' }
    }
    resume[type].push({ ...templates[type] })
}

function removeItem(type, index) {
    resume[type].splice(index, 1)
}

function addExtraPage() {
    resume.extraPages.push({ title: '', content: '' })
    openSections['extra-' + (resume.extraPages.length - 1)] = true
}

function removeExtraPage(index) {
    resume.extraPages.splice(index, 1)
}

const totalPages = computed(() => 1 + resume.extraPages.length)

function triggerAvatarInput() {
    avatarInput.value.click()
}

function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
        flashStatus('图片大小不能超过 2MB', 'error')
        return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
        resume.avatar = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
}

// ── HTML Renderer ──
function esc(str) {
    if (!str) return ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const renderedPage1 = computed(() => {
    let html = ''
    const name = esc(resume.name || '你的姓名')
    const contacts = []
    if (resume.phone) contacts.push(esc(resume.phone))
    if (resume.email) contacts.push(esc(resume.email))
    if (resume.objective) contacts.push(esc(resume.objective))

    html += `<div class="r-header">`
    html += `<div class="r-header-text">`
    html += `<h1 class="r-name">${name}</h1>`
    if (contacts.length) html += `<div class="r-contact">${contacts.join(' &nbsp;|&nbsp; ')}</div>`
    html += `</div>`
    if (resume.avatar) {
        html += `<div class="r-avatar"><img src="${resume.avatar}" alt="头像" /></div>`
    }
    html += `</div>`

    const eduItems = resume.education.filter(e => e.school || e.major)
    if (eduItems.length) {
        html += `<div class="r-section"><div class="r-section-title">教育经历</div><div class="r-divider"></div>`
        eduItems.forEach(edu => {
            html += `<div class="r-entry"><div class="r-entry-top"><span class="r-entry-name">${esc(edu.school)}</span><span class="r-entry-period">${esc(edu.period)}</span></div>`
            const sub = [edu.major, edu.degree].filter(Boolean).map(esc).join(' / ')
            if (sub) html += `<div class="r-entry-sub">${sub}</div>`
            html += `</div>`
        })
        html += `</div>`
    }

    const skillLines = resume.skills.split('\n').map(s => s.trim()).filter(Boolean)
    if (skillLines.length) {
        html += `<div class="r-section"><div class="r-section-title">专业技能</div><div class="r-divider"></div><ul class="r-list">`
        skillLines.forEach(l => { html += `<li>${esc(l)}</li>` })
        html += `</ul></div>`
    }

    const expItems = resume.experience.filter(e => e.company || e.title)
    if (expItems.length) {
        html += `<div class="r-section"><div class="r-section-title">工作 / 实习经历</div><div class="r-divider"></div>`
        expItems.forEach(exp => {
            html += `<div class="r-entry"><div class="r-entry-top"><span class="r-entry-name">${esc(exp.company)}${exp.title ? ' — ' + esc(exp.title) : ''}</span><span class="r-entry-period">${esc(exp.period)}</span></div>`
            if (exp.description) {
                const lines = exp.description.split('\n').map(s => s.trim()).filter(Boolean)
                if (lines.length) {
                    html += `<ul class="r-list">`
                    lines.forEach(l => { html += `<li>${esc(l)}</li>` })
                    html += `</ul>`
                }
            }
            html += `</div>`
        })
        html += `</div>`
    }

    const projItems = resume.projects.filter(p => p.name)
    if (projItems.length) {
        html += `<div class="r-section"><div class="r-section-title">项目经历</div><div class="r-divider"></div>`
        projItems.forEach(proj => {
            html += `<div class="r-entry"><div class="r-entry-top"><span class="r-entry-name">${esc(proj.name)}${proj.role ? ' — ' + esc(proj.role) : ''}</span><span class="r-entry-period">${esc(proj.period)}</span></div>`
            if (proj.description) {
                const lines = proj.description.split('\n').map(s => s.trim()).filter(Boolean)
                if (lines.length) {
                    html += `<ul class="r-list">`
                    lines.forEach(l => { html += `<li>${esc(l)}</li>` })
                    html += `</ul>`
                }
            }
            html += `</div>`
        })
        html += `</div>`
    }

    if (resume.evaluation && resume.evaluation.trim()) {
        html += `<div class="r-section"><div class="r-section-title">自我评价</div><div class="r-divider"></div><div class="r-body-text">${esc(resume.evaluation)}</div></div>`
    }

    return html
})

const renderedExtraPages = computed(() => {
    return resume.extraPages.map(page => {
        let html = ''
        if (page.title) {
            html += `<div class="r-header"><h1 class="r-name" style="font-size:1.5em">${esc(page.title)}</h1></div>`
        }
        if (page.content) {
            const lines = page.content.split('\n').map(s => s.trim()).filter(Boolean)
            html += `<ul class="r-list">`
            lines.forEach(l => { html += `<li>${esc(l)}</li>` })
            html += `</ul>`
        }
        return html
    })
})

// ── Export PDF ──
function openFullPreview() {
    showFullPreview.value = true
}

function exportPDF() {
    showFullPreview.value = false
    nextTick(() => {
        setTimeout(() => window.print(), 200)
    })
}

// ── Export Text ──
function exportText() {
    let text = ''
    text += `${resume.name || '你的姓名'}\n`
    const contacts = [resume.phone, resume.email, resume.objective].filter(Boolean)
    if (contacts.length) text += contacts.join(' | ') + '\n'
    text += '\n'

    const eduItems = resume.education.filter(e => e.school || e.major)
    if (eduItems.length) {
        text += '═══ 教育经历 ═══\n'
        eduItems.forEach(e => {
            text += `${e.school || ''}  ${e.period || ''}\n`
            const sub = [e.major, e.degree].filter(Boolean).join(' / ')
            if (sub) text += `${sub}\n`
        })
        text += '\n'
    }

    const skillLines = resume.skills.split('\n').map(s => s.trim()).filter(Boolean)
    if (skillLines.length) {
        text += '═══ 专业技能 ═══\n'
        skillLines.forEach(l => { text += `· ${l}\n` })
        text += '\n'
    }

    const expItems = resume.experience.filter(e => e.company || e.title)
    if (expItems.length) {
        text += '═══ 工作 / 实习经历 ═══\n'
        expItems.forEach(e => {
            text += `${e.company || ''}${e.title ? ' — ' + e.title : ''}  ${e.period || ''}\n`
            if (e.description) {
                e.description.split('\n').map(s => s.trim()).filter(Boolean).forEach(l => {
                    text += `  · ${l}\n`
                })
            }
        })
        text += '\n'
    }

    const projItems = resume.projects.filter(p => p.name)
    if (projItems.length) {
        text += '═══ 项目经历 ═══\n'
        projItems.forEach(p => {
            text += `${p.name}${p.role ? ' — ' + p.role : ''}  ${p.period || ''}\n`
            if (p.description) {
                p.description.split('\n').map(s => s.trim()).filter(Boolean).forEach(l => {
                    text += `  · ${l}\n`
                })
            }
        })
        text += '\n'
    }

    if (resume.evaluation && resume.evaluation.trim()) {
        text += '═══ 自我评价 ═══\n'
        text += resume.evaluation + '\n'
    }

    resume.extraPages.forEach(page => {
        text += '\n'
        if (page.title) text += `═══ ${page.title} ═══\n`
        if (page.content) text += page.content + '\n'
    })

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resume.name || '简历'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    flashStatus('文本已导出', 'saved')
}
</script>

<style scoped>
/* ═══════════════════════════════════════════
   Resume Builder — Nothing Design
   ═══════════════════════════════════════════ */

.resume-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-xl) var(--space-3xl);
    min-height: calc(100vh - 64px);
}

/* ── Header ── */
.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
    gap: var(--space-md);
    flex-wrap: wrap;
}

.header-left { flex-shrink: 0; }

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

.header-actions {
    display: flex;
    gap: var(--space-sm);
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
    margin-bottom: var(--space-sm);
    transition: color 150ms;
}

.back-link:hover { color: var(--text-primary); }

/* ── Privacy ── */
.privacy-notice {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 12px 16px;
    background: var(--surface);
    border: 1px solid var(--border-visible);
    border-radius: 8px;
    margin-bottom: var(--space-lg);
    font-size: 13px;
    color: var(--text-secondary);
}

.privacy-notice svg { flex-shrink: 0; color: var(--success); }

/* ── Buttons ── */
.btn {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 10px 18px;
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 150ms ease-out;
    white-space: nowrap;
    border: none;
    background: transparent;
}

.btn-secondary {
    border: 1px solid var(--border-visible);
    color: var(--text-primary);
}

.btn-secondary:hover {
    border-color: var(--text-primary);
    color: var(--text-display);
}

.btn-ghost {
    color: var(--text-secondary);
    padding: 8px;
}

.btn-ghost:hover { color: var(--text-display); }

.btn-add {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px dashed var(--border-visible);
    border-radius: 8px;
    color: var(--text-disabled);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 150ms;
    margin-top: var(--space-sm);
}

.btn-add:hover { border-color: var(--text-secondary); color: var(--text-secondary); }

.btn-remove {
    background: none;
    border: none;
    color: var(--text-disabled);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 150ms;
}

.btn-remove:hover { color: var(--accent); }

/* ── Avatar Upload ── */
.avatar-upload {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.avatar-preview {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    border: 1px solid var(--border-visible);
    overflow: hidden;
    cursor: pointer;
    flex-shrink: 0;
    background: var(--surface-raised);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 150ms;
}

.avatar-preview:hover { border-color: var(--text-secondary); }

.avatar-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--text-disabled);
}

.avatar-placeholder span {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.btn-text {
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--interactive);
    cursor: pointer;
    padding: 4px 0;
    text-align: left;
    transition: color 150ms;
}

.btn-text:hover { color: var(--text-display); }
.btn-text-danger { color: var(--accent); }
.btn-text-danger:hover { color: #ff4d55; }

.btn-add-page {
    width: 100%;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border-visible);
    border-radius: 12px;
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 150ms;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: var(--space-sm);
}

.btn-add-page:hover {
    border-color: var(--text-primary);
    color: var(--text-display);
}

.btn-remove-page {
    background: none;
    border: none;
    color: var(--text-disabled);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    transition: color 150ms;
}

.btn-remove-page:hover { color: var(--accent); }

/* ── Editor Layout ── */
.editor-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-xl);
    align-items: start;
}

/* ── Editor Panel ── */
.editor-panel {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.editor-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.section-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: 16px 20px;
    cursor: pointer;
    transition: background 150ms;
    user-select: none;
}

.section-header:hover { background: var(--surface-raised); }

.section-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--text-disabled);
}

.section-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    flex: 1;
}

.chevron {
    color: var(--text-disabled);
    transition: transform 200ms ease-out;
}

.chevron.open { transform: rotate(180deg); }

.section-body {
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

/* ── Form ── */
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
    text-transform: uppercase;
}

.form-group input,
.form-group textarea {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 150ms;
    resize: vertical;
    line-height: 1.5;
}

.form-group input:focus,
.form-group textarea:focus { border-color: var(--text-secondary); }

.form-group input::placeholder,
.form-group textarea::placeholder { color: var(--text-disabled); }

/* ── Entry Cards ── */
.entry-card {
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.entry-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.entry-index {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--text-disabled);
}

/* ── Preview Panel ── */
.preview-panel {
    position: sticky;
    top: calc(64px + var(--space-xl));
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    max-height: calc(100vh - 64px - var(--space-xl) * 2);
}

.preview-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-disabled);
    flex-shrink: 0;
}

.preview-scroll {
    flex: 1;
    overflow-y: auto;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: #F2F4F7;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

/* ── Resume Paper ── */
.resume-paper {
    background: #FAFAF8;
    color: #1a1a1a;
    border-radius: 2px;
    font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    width: 100%;
    /* A4 aspect ratio */
    aspect-ratio: 210 / 297;
    overflow: hidden;
}

.resume-paper .paper-content {
    padding: 40px 44px;
    font-size: 13px;
    height: 100%;
    box-sizing: border-box;
}

/* ── Resume Template ── */
.paper-content :deep(.r-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #1a1a1a;
}

.paper-content :deep(.r-header-text) {
    flex: 1;
}

.paper-content :deep(.r-avatar) {
    flex-shrink: 0;
    margin-left: 20px;
}

.paper-content :deep(.r-avatar img) {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #d0d0d0;
}

.paper-content :deep(.r-name) {
    font-size: 2em;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 6px;
    letter-spacing: 0.08em;
}

.paper-content :deep(.r-contact) {
    font-size: 0.85em;
    color: #555;
    letter-spacing: 0.02em;
}

.paper-content :deep(.r-section) {
    margin-bottom: 18px;
}

.paper-content :deep(.r-section-title) {
    font-size: 1.1em;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
}

.paper-content :deep(.r-divider) {
    height: 1px;
    background: #d0d0d0;
    margin-bottom: 10px;
}

.paper-content :deep(.r-entry) {
    margin-bottom: 10px;
}

.paper-content :deep(.r-entry-top) {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
}

.paper-content :deep(.r-entry-name) {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 1em;
}

.paper-content :deep(.r-entry-period) {
    font-size: 0.85em;
    color: #777;
    white-space: nowrap;
    flex-shrink: 0;
}

.paper-content :deep(.r-entry-sub) {
    font-size: 0.9em;
    color: #555;
    margin-top: 2px;
}

.paper-content :deep(.r-list) {
    padding-left: 18px;
    margin: 4px 0;
}

.paper-content :deep(.r-list li) {
    margin-bottom: 3px;
    color: #333;
    font-size: 0.95em;
}

.paper-content :deep(.r-body-text) {
    color: #333;
    white-space: pre-wrap;
    font-size: 0.95em;
}

/* ── Full Preview Modal ── */
.full-preview-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: #F7F8FA;
    display: flex;
    flex-direction: column;
}

.full-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.full-preview-title {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
}

.full-preview-actions {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
}

.full-preview-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-2xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2xl);
}

.full-paper-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
}

.page-number {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-disabled);
}

.resume-paper-full {
    max-width: 794px;
    width: 100%;
}

.resume-paper-full .paper-content {
    padding: 48px 56px;
    font-size: 14px;
}

/* ── Status Bar ── */
.status-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    pointer-events: none;
}

.status-text {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    transition: opacity 200ms;
}

.status-text.saved { color: var(--success); }
.status-text.error { color: var(--accent); }

/* ═══════════════════════════════════════════
   PRINT STYLES — dedicated print container
   ═══════════════════════════════════════════ */

/* Hide everything except the print container on screen during print */
</style>

<style>
/* Global print styles (not scoped — must apply to print container) */
#print-container {
    display: none;
}

@media print {
    /* Hide the app entirely */
    .resume-page,
    .full-preview-overlay,
    .navbar,
    .main-content {
        display: none !important;
    }

    body {
        background: white !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    /* Show the print container */
    #print-container {
        display: block !important;
    }

    .print-page {
        width: 100%;
        page-break-after: always;
    }

    .print-page:last-child {
        page-break-after: auto;
    }

    .print-paper {
        background: white;
        color: #1a1a1a;
        font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
        line-height: 1.6;
        padding: 48px 56px;
        font-size: 12pt;
    }

    .print-paper .r-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #1a1a1a;
    }

    .print-paper .r-header-text {
        flex: 1;
    }

    .print-paper .r-avatar {
        flex-shrink: 0;
        margin-left: 20px;
    }

    .print-paper .r-avatar img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #d0d0d0;
    }

    .print-paper .r-name {
        font-size: 2em;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 6px;
        letter-spacing: 0.08em;
    }

    .print-paper .r-contact {
        font-size: 0.85em;
        color: #555;
    }

    .print-paper .r-section {
        margin-bottom: 18px;
    }

    .print-paper .r-section-title {
        font-size: 1.1em;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
    }

    .print-paper .r-divider {
        height: 1px;
        background: #d0d0d0;
        margin-bottom: 10px;
    }

    .print-paper .r-entry {
        margin-bottom: 10px;
    }

    .print-paper .r-entry-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
    }

    .print-paper .r-entry-name {
        font-weight: 600;
        color: #1a1a1a;
    }

    .print-paper .r-entry-period {
        font-size: 0.85em;
        color: #777;
    }

    .print-paper .r-entry-sub {
        font-size: 0.9em;
        color: #555;
        margin-top: 2px;
    }

    .print-paper .r-list {
        padding-left: 18px;
        margin: 4px 0;
    }

    .print-paper .r-list li {
        margin-bottom: 3px;
        color: #333;
    }

    .print-paper .r-body-text {
        color: #333;
        white-space: pre-wrap;
    }
}

/* ── Responsive ── */
@media (max-width: 960px) {
    .editor-layout {
        grid-template-columns: 1fr;
    }

    .preview-panel {
        position: static;
        max-height: none;
    }

    .preview-scroll {
        max-height: 500px;
    }

    .form-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .resume-page {
        padding: var(--space-md) var(--space-md) var(--space-2xl);
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
    }

    .header-actions .btn {
        flex: 1;
        justify-content: center;
    }
}
</style>

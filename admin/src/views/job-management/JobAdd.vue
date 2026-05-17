<template>
    
    <div class="add-page">
        <!-- Hero -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">JOB MANAGEMENT</span>
                <h1 class="hero-title">发布岗位</h1>
            </div>
        </div>

        <!-- Form Card -->
        <div class="form-card">
            <div class="form-header">
                <span class="form-tag">NEW POSITION</span>
            </div>
            <div class="form-body">
                <!-- Company Info -->
                <div class="section-title">公司信息</div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">公司名称</label>
                        <input v-model="form.company_name" type="text" class="form-input" placeholder="如：字节跳动" />
                        <span v-if="errors.company_name" class="form-error">{{ errors.company_name }}</span>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">公司类型</label>
                        <input v-model="form.company_type" type="text" class="form-input" placeholder="如：互联网" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">公司规模</label>
                        <input v-model="form.company_size" type="text" class="form-input" placeholder="如：10000人以上" />
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">公司Logo</label>
                        <Upload :avatar="form.company_logo" @koleChange="handleLogoChange" />
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">公司描述</label>
                    <textarea v-model="form.company_desc" class="form-textarea" rows="2" placeholder="一句话介绍公司"></textarea>
                </div>

                <!-- Job Info -->
                <div class="section-title">岗位信息</div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">岗位名称</label>
                        <input v-model="form.job_title" type="text" class="form-input" placeholder="如：前端开发工程师" />
                        <span v-if="errors.job_title" class="form-error">{{ errors.job_title }}</span>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">工作城市</label>
                        <input v-model="form.city" type="text" class="form-input" placeholder="如：北京" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">岗位类型</label>
                        <div class="select-wrap">
                            <select v-model="form.job_type" class="form-select">
                                <option :value="null" disabled>请选择类型</option>
                                <option value="技术">技术</option>
                                <option value="产品">产品</option>
                                <option value="运营">运营</option>
                                <option value="设计">设计</option>
                            </select>
                            <span class="select-arrow">&#9662;</span>
                        </div>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">岗位分类</label>
                        <input v-model="form.job_category" type="text" class="form-input" placeholder="如：前端/后端/算法" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">学历要求</label>
                        <div class="select-wrap">
                            <select v-model="form.degree_required" class="form-select">
                                <option :value="null" disabled>请选择</option>
                                <option value="本科">本科</option>
                                <option value="硕士">硕士</option>
                                <option value="博士">博士</option>
                            </select>
                            <span class="select-arrow">&#9662;</span>
                        </div>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">经验要求</label>
                        <input v-model="form.experience" type="text" class="form-input" placeholder="如：应届" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">最低薪资 (元/月)</label>
                        <input v-model.number="form.salary_min" type="number" class="form-input" placeholder="如：15000" />
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">最高薪资 (元/月)</label>
                        <input v-model.number="form.salary_max" type="number" class="form-input" placeholder="如：30000" />
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">招聘人数</label>
                    <input v-model.number="form.headcount" type="number" class="form-input" style="width: 120px;" placeholder="1" />
                </div>
                <div class="form-group">
                    <label class="form-label">岗位描述</label>
                    <textarea v-model="form.job_description" class="form-textarea" rows="3" placeholder="描述日常工作内容"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">岗位要求</label>
                    <textarea v-model="form.job_requirements" class="form-textarea" rows="3" placeholder="任职资格要求"></textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">福利待遇</label>
                    <input v-model="form.benefits" type="text" class="form-input" placeholder="逗号分隔，如：五险一金,带薪年假,免费三餐" />
                </div>
                <div class="form-group">
                    <label class="form-label">标签</label>
                    <input v-model="form.tags" type="text" class="form-input" placeholder="逗号分隔，如：Vue,React,TypeScript" />
                </div>
                <div class="form-group">
                    <label class="form-label">投递链接</label>
                    <input v-model="form.link" type="text" class="form-input" placeholder="如：https://company.com/apply" />
                </div>

                <!-- Actions -->
                <div class="form-actions">
                    <span v-if="statusMsg" class="status-msg">{{ statusMsg }}</span>
                    <button class="btn-draft" @click="submitDraft">保存草稿</button>
                    <button class="btn-publish" @click="submitPublish">发布岗位</button>
                </div>
            </div>
        </div>
        <AdminChatBot :context="`岗位: ${form.job_title}\n公司: ${form.company_name}\n描述: ${form.job_description}`" />
    </div>
</template>

<script setup>
import Upload from '@/components/upload/Upload.vue';
import AdminChatBot from '@/components/AdminChatBot.vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/util/axios.config.js';

const router = useRouter();
const statusMsg = ref('');

const form = reactive({
    company_name: '',
    company_logo: '',
    company_size: '',
    company_type: '',
    company_desc: '',
    job_title: '',
    job_type: null,
    job_category: '',
    city: '',
    salary_min: null,
    salary_max: null,
    degree_required: null,
    experience: '',
    job_description: '',
    job_requirements: '',
    benefits: '',
    tags: '',
    link: '',
    headcount: 1,
    status: 1
});

const errors = reactive({
    company_name: '',
    job_title: ''
});

const clearErrors = () => {
    errors.company_name = '';
    errors.job_title = '';
};

const validate = () => {
    clearErrors();
    let valid = true;
    if (!form.company_name) {
        errors.company_name = '请填写公司名称';
        valid = false;
    }
    if (!form.job_title) {
        errors.job_title = '请填写岗位名称';
        valid = false;
    }
    return valid;
};

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

const handleLogoChange = (file) => {
    form.company_logo = URL.createObjectURL(file);
};

const submitDraft = async () => {
    form.status = 0;
    await submitForm();
};

const submitPublish = async () => {
    form.status = 1;
    await submitForm();
};

const submitForm = async () => {
    if (!validate()) return;
    try {
        await axios.post('/adminApi/job/add', form, {
            headers: { 'Content-Type': 'application/json' }
        });
        showStatus('[SAVED]');
        setTimeout(() => {
            router.push('/job-management/JobList');
        }, 800);
    } catch (e) {
        showStatus('[ERROR] 提交失败');
    }
};
</script>

<style lang="scss" scoped>
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

.add-page {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: $g5;
    background: $black;
    min-height: 100vh;
    padding: 32px 40px 64px;
}

.page-hero { margin-bottom: 40px; }

.hero-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
    display: block;
    margin-bottom: 8px;
}

.hero-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: $pure;
    margin: 0;
    letter-spacing: -0.02em;
}

.form-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    overflow: hidden;
    max-width: 860px;
    margin: 0 auto;
}

.form-header {
    padding: 20px 28px;
    border-bottom: 1px solid $border;
}

.form-tag {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
}

.form-body { padding: 28px; }

.section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: $white;
    margin-bottom: 20px;
    margin-top: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid $border;

    &:first-child { margin-top: 0; }
}

.form-group { margin-bottom: 20px; }

.form-row {
    display: flex;
    gap: 20px;
}

.form-group-half { flex: 1; }

.form-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $g3;
    display: block;
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 12px 16px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: $white;
    outline: none;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; }
}

.form-textarea {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 12px 16px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: $white;
    outline: none;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;
    resize: vertical;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; }
}

.form-error {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: $accent;
    display: block;
    margin-top: 6px;
}

.select-wrap { position: relative; }

.form-select {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 12px 16px;
    padding-right: 40px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    color: $white;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &:focus { border-color: $g4; }
}

.select-arrow {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: $g3;
    pointer-events: none;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-top: 32px;
    border-top: 1px solid $border;
}

.status-msg {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: $g4;
    margin-right: auto;
}

.btn-draft {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid $border-hi;
    background: transparent;
    color: $g4;
    cursor: pointer;
    transition: all 150ms ease-out;

    &:hover {
        border-color: $g4;
        color: $g5;
    }
}

.btn-publish {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid $pure;
    background: transparent;
    color: $pure;
    cursor: pointer;
    transition: all 150ms ease-out;

    &:hover {
        background: $pure;
        color: $black;
    }
}
</style>

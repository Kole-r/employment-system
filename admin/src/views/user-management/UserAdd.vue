<template>
    <div class="add-page">
        <!-- Hero -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">USER MANAGEMENT</span>
                <h1 class="hero-title">添加用户</h1>
            </div>
        </div>

        <!-- Form Card -->
        <div class="form-card">
            <div class="form-header">
                <span class="form-tag">NEW USER</span>
            </div>
            <div class="form-body">
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">用户名</label>
                        <input v-model="userForm.username" type="text" class="form-input" placeholder="请输入用户名（3-20字符）" />
                        <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">密码</label>
                        <input v-model="userForm.password" type="password" class="form-input" placeholder="请输入密码（6-20字符）" />
                        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">角色</label>
                        <div class="select-wrap">
                            <select v-model="userForm.role" class="form-select">
                                <option value="1">管理员</option>
                                <option value="2">企业人员</option>
                                <option value="0">毕业生</option>
                            </select>
                            <span class="select-arrow">&#9662;</span>
                        </div>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">状态</label>
                        <div class="select-wrap">
                            <select v-model="userForm.status" class="form-select">
                                <option value="1">正常</option>
                                <option value="0">禁用</option>
                            </select>
                            <span class="select-arrow">&#9662;</span>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">真实姓名</label>
                        <input v-model="userForm.real_name" type="text" class="form-input" placeholder="请输入真实姓名" />
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">手机号</label>
                        <input v-model="userForm.phone" type="text" class="form-input" placeholder="请输入手机号" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">邮箱</label>
                        <input v-model="userForm.email" type="text" class="form-input" placeholder="请输入邮箱" />
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">毕业院校</label>
                        <input v-model="userForm.university" type="text" class="form-input" placeholder="请输入毕业院校" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">专业</label>
                        <input v-model="userForm.major" type="text" class="form-input" placeholder="请输入专业" />
                    </div>
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
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">毕业年份</label>
                        <input v-model="userForm.graduation_year" type="number" class="form-input" placeholder="如 2025" />
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">意向城市</label>
                        <input v-model="userForm.city_preference" type="text" class="form-input" placeholder="如 北京,上海,深圳" />
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">意向岗位</label>
                    <input v-model="userForm.job_preference" type="text" class="form-input" placeholder="如 技术,产品,运营" />
                </div>

                <div class="form-group">
                    <label class="form-label">个人简介</label>
                    <textarea v-model="userForm.bio" class="form-textarea" rows="4" placeholder="请输入个人简介"></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">头像</label>
                    <Upload :avatar="userForm.avatar" @koleChange="handChange" />
                    <span v-if="errors.avatar" class="form-error">{{ errors.avatar }}</span>
                </div>

                <div class="form-actions">
                    <span v-if="statusMsg" class="status-msg">{{ statusMsg }}</span>
                    <button class="btn-submit" @click="submitForm">添加用户</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const statusMsg = ref('');
const userForm = reactive({
    username: '',
    password: '',
    role: '0',
    status: '1',
    real_name: '',
    phone: '',
    email: '',
    avatar: '',
    major: '',
    degree: '',
    graduation_year: '',
    university: '',
    city_preference: '',
    job_preference: '',
    bio: '',
    file: null
});

const errors = reactive({
    username: '',
    password: '',
    avatar: ''
});

const handChange = (file) => {
    userForm.avatar = URL.createObjectURL(file);
    userForm.file = file;
    errors.avatar = '';
};

const clearErrors = () => {
    errors.username = '';
    errors.password = '';
    errors.avatar = '';
};

const validate = () => {
    clearErrors();
    let valid = true;

    if (!userForm.username || userForm.username.length < 3) {
        errors.username = '用户名长度至少 3 个字符';
        valid = false;
    }
    if (userForm.username.length > 20) {
        errors.username = '用户名长度不能超过 20 个字符';
        valid = false;
    }
    if (!userForm.password || userForm.password.length < 6) {
        errors.password = '密码长度至少 6 个字符';
        valid = false;
    }
    if (userForm.password.length > 20) {
        errors.password = '密码长度不能超过 20 个字符';
        valid = false;
    }
    if (!userForm.avatar) {
        errors.avatar = '请上传头像';
        valid = false;
    }

    return valid;
};

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

const submitForm = async () => {
    if (!validate()) return;
    try {
        await upload('/adminApi/user/add', userForm);
        showStatus('[SAVED]');
        setTimeout(() => {
            router.push('/user-management/UserList');
        }, 800);
    } catch (error) {
        if (error.response && error.response.status === 400) {
            showStatus('[ERROR] 用户名或密码格式不对');
        } else {
            showStatus('[ERROR] 提交失败');
        }
    }
};
</script>

<style lang="scss" scoped>
/* ── Tokens ── */
$black: #F7F8FA;
$surface: #FFFFFF;
$surface-1: #FFFFFF;
$surface-2: #F2F4F7;
$border: #E4E7EB;
$border-hi: #D0D5DD;
$g1: #98A2B3;
$g2: #667085;
$g3: #475467;
$g4: #344054;
$g5: #1D2939;
$white: #344054;
$pure: #101828;
$accent: #2563EB;
$green: #16A34A;

.add-page {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: $g5;
    background: $black;
    min-height: 100vh;
    padding: 32px 40px 64px;
}

/* ── Hero ── */
.page-hero {
    margin-bottom: 40px;
}

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

/* ── Form Card ── */
.form-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    overflow: hidden;
    max-width: 720px;
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

.form-body {
    padding: 28px;
}

.form-group {
    margin-bottom: 24px;
}

.form-row {
    display: flex;
    gap: 24px;
}

.form-group-half {
    flex: 1;
}

.form-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $g3;
    display: block;
    margin-bottom: 10px;
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
    &:focus { border-color: $g4; background: #F9FAFB; }
}

.form-error {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: $accent;
    display: block;
    margin-top: 6px;
    letter-spacing: 0.02em;
}

.select-wrap {
    position: relative;
}

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

    &:focus { border-color: $g4; background: #F9FAFB; }
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
    resize: vertical;
    min-height: 100px;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; background: #F9FAFB; }
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
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

.btn-submit {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 28px;
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

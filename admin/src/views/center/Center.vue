<template>
    <div class="center-page">
        <!-- Hero -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">ACCOUNT</span>
                <h1 class="hero-title">个人中心</h1>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
            <!-- Profile Card -->
            <div class="profile-card">
                <div class="avatar-section">
                    <div class="avatar-ring">
                        <img :src="avatarUrl" alt="avatar" class="avatar-img" />
                    </div>
                    <span class="profile-name">{{ userInfo.$state.real_name || userInfo.$state.username }}</span>
                    <span class="profile-role-tag">{{ role === 1 ? '管理员' : role === 2 ? '企业人员' : '毕业生' }}</span>
                </div>
                <div class="profile-stats">
                    <div class="pstat-row">
                        <span class="pstat-label">USERNAME</span>
                        <span class="pstat-value">{{ userInfo.$state.username }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">ROLE</span>
                        <span class="pstat-value">{{ role === 1 ? '管理员' : role === 2 ? '企业人员' : '毕业生' }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">PHONE</span>
                        <span class="pstat-value">{{ userInfo.$state.phone || '—' }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">EMAIL</span>
                        <span class="pstat-value">{{ userInfo.$state.email || '—' }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">MAJOR</span>
                        <span class="pstat-value">{{ userInfo.$state.major || '—' }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">DEGREE</span>
                        <span class="pstat-value">{{ userInfo.$state.degree || '—' }}</span>
                    </div>
                    <div class="pstat-row">
                        <span class="pstat-label">UNIVERSITY</span>
                        <span class="pstat-value">{{ userInfo.$state.university || '—' }}</span>
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
                    <div class="form-row">
                        <div class="form-group form-group-half">
                            <label class="form-label">意向城市</label>
                            <input v-model="userForm.city_preference" type="text" class="form-input" placeholder="如 北京,上海" />
                        </div>
                        <div class="form-group form-group-half">
                            <label class="form-label">意向岗位</label>
                            <input v-model="userForm.job_preference" type="text" class="form-input" placeholder="如 技术,产品" />
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
                        <span v-if="statusMsg" class="status-msg">{{ statusMsg }}</span>
                        <button class="btn-save" @click="submitForm">保存更改</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import useUserInfoStore from '../../store/userInfo.js';
import { computed, reactive, ref } from 'vue';
import upload from '@/util/upload.js';
import Upload from '@/components/upload/Upload.vue';

const userInfo = useUserInfoStore();
const { username, role, avatar, real_name, phone, email, major, degree, graduation_year, university, city_preference, job_preference, bio } = userInfo.$state;
const statusMsg = ref('');
const userForm = reactive({
    username: username || '',
    real_name: real_name || '',
    phone: phone || '',
    email: email || '',
    avatar: avatar || '',
    major: major || '',
    degree: degree || '',
    graduation_year: graduation_year || '',
    university: university || '',
    city_preference: city_preference || '',
    job_preference: job_preference || '',
    bio: bio || '',
    file: null
});

const avatarUrl = computed(() => userInfo.$state.avatar ? userInfo.$state.avatar : 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

const handChange = (file) => {
    userForm.avatar = URL.createObjectURL(file);
    userForm.file = file;
};

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

const submitForm = async () => {
    if (!userForm.username) {
        showStatus('[ERROR] 请输入用户名');
        return;
    }
    try {
        const res = await upload("/adminApi/user/upload", userForm);
        if (res.code === 200) {
            const serverAvatar = res.data.avatar || userForm.avatar;
            userInfo.setUserInfo({
                ...userInfo.$state,
                username: userForm.username,
                real_name: userForm.real_name,
                phone: userForm.phone,
                email: userForm.email,
                major: userForm.major,
                degree: userForm.degree,
                graduation_year: userForm.graduation_year ? Number(userForm.graduation_year) : null,
                university: userForm.university,
                city_preference: userForm.city_preference,
                job_preference: userForm.job_preference,
                bio: userForm.bio,
                avatar: serverAvatar
            });
            userForm.avatar = serverAvatar;
            showStatus('[SAVED]');
        }
    } catch (e) {
        showStatus('[ERROR] 保存失败');
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

.center-page {
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

/* ── Content Grid ── */
.content-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    align-items: start;
}

/* ── Profile Card ── */
.profile-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 14px;
    overflow: hidden;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px 24px;
    border-bottom: 1px solid $border;
}

.avatar-ring {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid $border-hi;
    margin-bottom: 16px;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.profile-name {
    font-size: 18px;
    font-weight: 500;
    color: $white;
    margin-bottom: 8px;
}

.profile-role-tag {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: $g3;
    border: 1px solid $border-hi;
    border-radius: 999px;
    padding: 3px 12px;
}

.profile-stats {
    padding: 16px 24px;
}

.pstat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid $border;

    &:last-child { border-bottom: none; }
}

.pstat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g2;
}

.pstat-value {
    font-size: 14px;
    color: $g5;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Form Card ── */
.form-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 14px;
    overflow: hidden;
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

    &:last-of-type { margin-bottom: 32px; }
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
    padding-top: 8px;
    border-top: 1px solid $border;
    padding-top: 24px;
}

.status-msg {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: $g4;
}

.btn-save {
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

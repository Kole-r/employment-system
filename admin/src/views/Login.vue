<template>
    <div class="login-page">
        <div class="dot-grid-bg"></div>

        <div class="login-container">
            <!-- Tertiary: system label -->
            <span class="system-label">SMART EMPLOYMENT PLATFORM</span>

            <!-- Primary: title -->
            <h1 class="login-title">智就业</h1>
            <p class="login-subtitle">智慧就业服务平台</p>

            <!-- Secondary: form -->
            <el-form
                ref="formRef"
                :model="form"
                status-icon
                :rules="formRules"
                label-position="top"
                class="login-form"
            >
                <el-form-item prop="username">
                    <template #label>
                        <span class="field-label">USERNAME</span>
                    </template>
                    <el-input
                        v-model="form.username"
                        autocomplete="off"
                        placeholder="输入用户名"
                        size="large"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <template #label>
                        <span class="field-label">PASSWORD</span>
                    </template>
                    <el-input
                        v-model="form.password"
                        type="password"
                        autocomplete="off"
                        placeholder="输入密码"
                        size="large"
                        show-password
                    />
                </el-form-item>
                <el-form-item v-if="isRegister" prop="inviteCode">
                    <template #label>
                        <span class="field-label">INVITE CODE</span>
                    </template>
                    <el-input
                        v-model="form.inviteCode"
                        autocomplete="off"
                        placeholder="输入邀请码"
                        size="large"
                    />
                </el-form-item>
                <el-form-item class="submit-item">
                    <el-button
                        type="primary"
                        class="login-btn"
                        @click="submitForm()"
                    >
                        {{ isRegister ? 'SIGN UP' : 'SIGN IN' }}
                    </el-button>
                </el-form-item>
                <div class="toggle-mode">
                    <span class="toggle-link" @click="toggleMode">
                        {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
                    </span>
                </div>
                <div v-if="statusMsg" class="login-status" :class="{ success: isSuccess }">{{ statusMsg }}</div>
            </el-form>

            <!-- Tertiary: footer -->
            <div class="login-footer">
                <span class="footer-text">v2.0.0</span>
                <span class="footer-dot">·</span>
                <span class="footer-text">EMPLOYMENT SERVICES</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../util/axios.config.js'
import useUserInfoStore from '../store/userInfo.js'

const INVITE_CODES = {
    '123456': 1, // 管理员
    '654321': 2, // 企业
}

const isRegister = ref(false)
const isSuccess = ref(false)
const form = reactive({
    username: '',
    password: '',
    inviteCode: ''
})
const formRef = ref()
const statusMsg = ref('')

const validateInviteCode = (rule, value, callback) => {
    if (!value) {
        callback(new Error('请输入邀请码'))
    } else if (!(value in INVITE_CODES)) {
        callback(new Error('邀请码不正确'))
    } else {
        callback()
    }
}

const formRules = computed(() => ({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符之间', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符之间', trigger: 'blur' }
    ],
    ...(isRegister.value ? { inviteCode: [{ validator: validateInviteCode, trigger: 'blur' }] } : {})
}))

const router = useRouter()
const userInfoStore = useUserInfoStore()

const toggleMode = () => {
    isRegister.value = !isRegister.value
    statusMsg.value = ''
    isSuccess.value = false
    form.inviteCode = ''
    formRef.value?.clearValidate()
}

const submitForm = () => {
    formRef.value.validate((valid) => {
        if (!valid) return
        statusMsg.value = ''

        if (isRegister.value) {
            // 注册
            axios.post("/adminApi/user/register", {
                username: form.username,
                password: form.password,
                role: INVITE_CODES[form.inviteCode]
            }).then(res => {
                if (res.data.code === 200) {
                    isSuccess.value = true
                    statusMsg.value = '注册成功，请登录'
                    isRegister.value = false
                    form.inviteCode = ''
                } else {
                    isSuccess.value = false
                    statusMsg.value = '[ERROR] ' + res.data.message
                    setTimeout(() => { statusMsg.value = '' }, 3000)
                }
            }).catch(() => {
                isSuccess.value = false
                statusMsg.value = '[ERROR] 注册请求失败'
                setTimeout(() => { statusMsg.value = '' }, 3000)
            })
        } else {
            // 登录
            axios.post("/adminApi/user/login", {
                username: form.username,
                password: form.password
            }).then(res => {
                if (res.data.code === 200) {
                    userInfoStore.setUserInfo(res.data.data)
                    router.push('/')
                } else if (res.data.code === 403) {
                    isSuccess.value = false
                    statusMsg.value = '[ERROR] ' + res.data.message
                    setTimeout(() => { statusMsg.value = '' }, 4000)
                } else {
                    isSuccess.value = false
                    statusMsg.value = '[ERROR] 用户名或密码不正确'
                    setTimeout(() => { statusMsg.value = '' }, 3000)
                }
            }).catch(() => {
                isSuccess.value = false
                statusMsg.value = '[ERROR] 登录请求失败'
                setTimeout(() => { statusMsg.value = '' }, 3000)
            })
        }
    })
}
</script>

<style scoped lang="scss">

.login-page {
    width: 100vw;
    height: 100vh;
    background-color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.dot-grid-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #222222 0.8px, transparent 0.8px);
    background-size: 24px 24px;
    opacity: 0.4;
}

.login-container {
    position: relative;
    z-index: 1;
    width: 380px;
    padding: 48px 40px;
    background-color: #111111;
    border: 1px solid #222222;
    border-radius: 16px;
}

/* Tertiary: system label */
.system-label {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #666666;
    text-transform: uppercase;
    margin-bottom: 32px;
}

/* Primary: title */
.login-title {
    font-family: 'Doto', 'Space Mono', monospace;
    font-size: 42px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: -0.02em;
    line-height: 1.0;
    margin: 0;
}

.login-subtitle {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 18px;
    font-weight: 300;
    color: #999999;
    margin: 8px 0 40px 0;
    letter-spacing: 0.02em;
}

/* Secondary: form */
.login-form {
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        font-family: 'Space Mono', monospace;
        font-size: 11px;
        letter-spacing: 0.08em;
        color: #999999;
        text-transform: uppercase;
        line-height: 1;
        padding-bottom: 8px !important;
    }

    :deep(.el-input__wrapper) {
        background-color: transparent;
        border: none;
        border-bottom: 1px solid #333333;
        border-radius: 0;
        box-shadow: none !important;
        padding: 4px 0;
        transition: border-color 200ms ease;

        &:hover {
            border-bottom-color: #666666;
        }
    }

    :deep(.el-input.is-focus .el-input__wrapper) {
        border-bottom-color: #E8E8E8;
    }

    :deep(.el-input__inner) {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 16px;
        color: #E8E8E8;
        letter-spacing: 0;

        &::placeholder {
            color: #666666;
        }
    }

    :deep(.el-input__suffix) {
        color: #666666;
    }
}

.field-label {
    font-family: 'Space Mono', monospace;
}

.submit-item {
    margin-top: 8px;
    margin-bottom: 0;

    :deep(.el-form-item__content) {
        margin-left: 0 !important;
    }
}

.login-btn {
    width: 100%;
    height: 48px;
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
    border: none;
    background-color: #FFFFFF;
    color: #000000;
    transition: opacity 200ms ease;

    &:hover {
        opacity: 0.85;
    }

    &:active {
        opacity: 0.7;
    }
}

/* Tertiary: footer */
.login-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #222222;
}

.footer-text {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: #666666;
    text-transform: uppercase;
}

.footer-dot {
    color: #333333;
    font-size: 14px;
}

/* Error state override */
:deep(.el-form-item.is-error .el-input__wrapper) {
    border-bottom-color: #D71921 !important;
}

:deep(.el-form-item__error) {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #D71921;
    letter-spacing: 0.04em;
}

.toggle-mode {
    text-align: center;
    margin-top: 4px;
    margin-bottom: 8px;
}

.toggle-link {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: #666666;
    cursor: pointer;
    transition: color 200ms ease;

    &:hover {
        color: #E8E8E8;
    }
}

.login-status {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: #D71921;
    text-align: center;
    margin-top: 4px;

    &.success {
        color: #4CAF50;
    }
}
</style>

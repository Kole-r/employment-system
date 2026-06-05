<template>
    <div class="login-page">
        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <span class="logo-mark">E</span>
                </div>
                <span class="login-label">EMPLOYMENT PLATFORM</span>
                <h1 class="login-title">{{ isRegister ? '注册' : '登录' }}</h1>
            </div>

            <div class="login-body">
                <div class="form-group">
                    <label class="form-label">USERNAME</label>
                    <input
                        v-model="form.username"
                        type="text"
                        class="form-input"
                        placeholder="请输入用户名"
                        @keyup.enter="handleSubmit"
                        autocomplete="username"
                    />
                    <span v-if="errors.username" class="form-error">[ERROR] {{ errors.username }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">PASSWORD</label>
                    <input
                        v-model="form.password"
                        type="password"
                        class="form-input"
                        placeholder="请输入密码"
                        @keyup.enter="handleSubmit"
                        autocomplete="current-password"
                    />
                    <span v-if="errors.password" class="form-error">[ERROR] {{ errors.password }}</span>
                </div>

                <div v-if="isRegister" class="form-group">
                    <label class="form-label">REAL NAME</label>
                    <input
                        v-model="form.real_name"
                        type="text"
                        class="form-input"
                        placeholder="请输入真实姓名"
                    />
                </div>

                <div v-if="statusMsg" class="status-msg">{{ statusMsg }}</div>

                <button class="btn-submit" @click="handleSubmit" :disabled="isLoading">
                    {{ isLoading ? '[ ... ]' : (isRegister ? 'REGISTER' : 'LOGIN') }}
                </button>

                <div class="login-footer">
                    <span class="toggle-text" @click="isRegister = !isRegister">
                        {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
                    </span>
                </div>
            </div>
        </div>

        <div class="login-bg-text">EMPLOY</div>

        <FluidBackground />
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '../store/userInfo'
import axios from '@/util/axios.config.js'
import FluidBackground from '../components/FluidBackground.vue'

const router = useRouter()
const userInfoStore = useUserInfoStore()

const isRegister = ref(false)
const isLoading = ref(false)
const statusMsg = ref('')

const form = reactive({
    username: '',
    password: '',
    real_name: ''
})

const errors = reactive({
    username: '',
    password: ''
})

const clearErrors = () => {
    errors.username = ''
    errors.password = ''
}

const validate = () => {
    clearErrors()
    let valid = true
    if (!form.username || form.username.length < 3) {
        errors.username = '用户名至少 3 个字符'
        valid = false
    }
    if (!form.password || form.password.length < 4) {
        errors.password = '密码至少 4 个字符'
        valid = false
    }
    return valid
}

const handleSubmit = async () => {
    if (!validate()) return
    isLoading.value = true
    statusMsg.value = ''

    try {
        const url = isRegister.value ? '/webApi/user/register' : '/webApi/user/login'
        const res = await axios.post(url, form)

        if (res.data.code === 200) {
            if (isRegister.value) {
                statusMsg.value = '[REGISTERED] 请登录'
                isRegister.value = false
            } else {
                userInfoStore.updateInfo(res.data.data)
                statusMsg.value = '[OK]'
                setTimeout(() => router.push('/home'), 400)
            }
        } else {
            statusMsg.value = `[ERROR] ${res.data.message}`
        }
    } catch (e) {
        statusMsg.value = '[ERROR] 网络异常'
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.login-bg-text {
    position: absolute;
    bottom: -60px;
    right: -30px;
    font-family: var(--font-display);
    font-size: 22vw;
    font-weight: 900;
    color: #E4E7EB;
    letter-spacing: -0.04em;
    pointer-events: none;
    user-select: none;
    line-height: 1;
}

.login-card {
    width: 400px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

.login-header {
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
    text-align: center;
}

.login-logo {
    margin-bottom: var(--space-md);
}

.logo-mark {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 700;
    color: var(--black);
    background: var(--text-display);
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.login-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-sm);
}

.login-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-display);
    margin: 0;
    letter-spacing: -0.02em;
}

.login-body {
    padding: 0 var(--space-xl) var(--space-xl);
}

.form-group {
    margin-bottom: var(--space-lg);
}

.form-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    color: var(--text-disabled);
    display: block;
    margin-bottom: var(--space-sm);
}

.form-input {
    width: 100%;
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 200ms ease-out;
    box-sizing: border-box;
}

.form-input::placeholder {
    color: var(--text-disabled);
}

.form-input:focus {
    border-color: var(--text-secondary);
    background: #F9FAFB;
}

.form-error {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
    display: block;
    margin-top: 6px;
}

.status-msg {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    margin-bottom: var(--space-md);
}

.btn-submit {
    width: 100%;
    padding: 14px;
    border-radius: 999px;
    border: 1px solid var(--border-visible);
    background: transparent;
    color: var(--text-display);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 200ms ease-out;
    margin-top: var(--space-sm);
}

.btn-submit:hover {
    background: var(--text-display);
    color: var(--black);
    border-color: var(--text-display);
}

.btn-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn-submit:disabled:hover {
    background: transparent;
    color: var(--text-display);
    border-color: var(--border-visible);
}

.login-footer {
    text-align: center;
    margin-top: var(--space-lg);
}

.toggle-text {
    font-size: 13px;
    color: var(--text-disabled);
    cursor: pointer;
    transition: color 150ms;
}

.toggle-text:hover {
    color: var(--text-secondary);
}
</style>

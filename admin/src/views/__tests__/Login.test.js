import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/login' }),
}))

import AdminLogin from '../Login.vue'
import axios from '../../util/axios.config.js'

describe('Admin - Login', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountLogin = () =>
    mount(AdminLogin, {
      global: {
        stubs: {
          'el-form': {
            template: '<form @submit.prevent><slot /></form>',
            props: ['model', 'rules', 'labelPosition'],
            methods: {
              validate(cb) { cb(true) },
            },
          },
          'el-form-item': {
            template: '<div><slot /><slot name="label" /></div>',
            props: ['prop', 'class'],
          },
          'el-input': {
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue', 'type', 'placeholder', 'size', 'showPassword'],
            emits: ['update:modelValue'],
          },
          'el-button': {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'class'],
            emits: ['click'],
          },
        },
      },
    })

  it('应渲染管理员登录页面', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('.login-title').text()).toBe('智就业')
    expect(wrapper.find('.login-subtitle').text()).toBe('智慧就业服务平台')
  })

  it('应显示 SIGN IN 按钮', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('SIGN IN')
  })

  it('应显示版本号和版权信息', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('v2.0.0')
    expect(wrapper.text()).toContain('EMPLOYMENT SERVICES')
  })

  it('应显示系统标签', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('SMART EMPLOYMENT PLATFORM')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/login' }),
}))

vi.mock('../../components/FluidBackground.vue', () => ({
  default: { template: '<div />' },
}))

import Login from '../Login.vue'
import axios from '@/util/axios.config.js'

describe('Client - Login', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountLogin = () =>
    mount(Login, {
      global: {
        stubs: { FluidBackground: true },
      },
    })

  it('应渲染登录表单', () => {
    const wrapper = mountLogin()
    expect(wrapper.find('h1').text()).toBe('登录')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('.btn-submit').text()).toContain('LOGIN')
  })

  it('用户名少于 3 字符应显示错误', async () => {
    const wrapper = mountLogin()
    await wrapper.find('input[type="text"]').setValue('ab')
    await wrapper.find('.btn-submit').trigger('click')
    expect(wrapper.find('.form-error').text()).toContain('3')
  })

  it('密码少于 4 字符应显示错误', async () => {
    const wrapper = mountLogin()
    await wrapper.find('input[type="text"]').setValue('admin')
    await wrapper.find('input[type="password"]').setValue('123')
    await wrapper.find('.btn-submit').trigger('click')
    expect(wrapper.find('.form-error').text()).toContain('4')
  })

  it('表单验证通过应发送登录请求', async () => {
    axios.post.mockResolvedValue({ data: { code: 200, data: { token: 't', username: 'admin' } } })
    const wrapper = mountLogin()
    await wrapper.find('input[type="text"]').setValue('admin')
    await wrapper.find('input[type="password"]').setValue('123456')
    await wrapper.find('.btn-submit').trigger('click')

    expect(axios.post).toHaveBeenCalledWith('/webApi/user/login', expect.objectContaining({
      username: 'admin',
      password: '123456',
    }))
  })

  it('登录失败应显示错误消息', async () => {
    axios.post.mockResolvedValue({ data: { code: 401, message: '密码错误' } })
    const wrapper = mountLogin()
    await wrapper.find('input[type="text"]').setValue('admin')
    await wrapper.find('input[type="password"]').setValue('123456')
    await wrapper.find('.btn-submit').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.find('.status-msg').text()).toContain('密码错误')
    })
  })

  it('点击切换链接应切换到注册模式', async () => {
    const wrapper = mountLogin()
    expect(wrapper.find('h1').text()).toBe('登录')
    await wrapper.find('.toggle-text').trigger('click')
    expect(wrapper.find('h1').text()).toBe('注册')
    expect(wrapper.find('.btn-submit').text()).toContain('REGISTER')
  })

  it('注册模式下应显示真实姓名输入框', async () => {
    const wrapper = mountLogin()
    await wrapper.find('.toggle-text').trigger('click')
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3)
  })
})

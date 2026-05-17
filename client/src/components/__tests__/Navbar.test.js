import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/home' }),
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import Navbar from '../Navbar.vue'
import { useUserInfoStore } from '../../store/userInfo'

describe('Client - Navbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountNavbar = (userInfo = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    if (Object.keys(userInfo).length > 0) {
      useUserInfoStore().updateInfo(userInfo)
    }
    return mount(Navbar)
  }

  it('应渲染导航栏', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.navbar').exists()).toBe(true)
    expect(wrapper.text()).toContain('EMPLOY')
  })

  it('应显示导航链接', () => {
    const wrapper = mountNavbar()
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('资讯')
    expect(wrapper.text()).toContain('岗位')
  })

  it('应显示用户名', () => {
    const wrapper = mountNavbar({ username: 'zhangsan', real_name: '张三' })
    expect(wrapper.find('.user-name').text()).toBe('张三')
  })

  it('无 real_name 时应显示 username', () => {
    const wrapper = mountNavbar({ username: 'admin' })
    expect(wrapper.find('.user-name').text()).toBe('admin')
  })

  it('无用户信息时应显示默认文字', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.user-name').text()).toBe('用户')
  })

  it('点击用户区域应切换下拉菜单', async () => {
    const wrapper = mountNavbar({ username: 'admin' })
    expect(wrapper.find('.user-dropdown').exists()).toBe(false)
    await wrapper.find('.nav-user').trigger('click')
    expect(wrapper.find('.user-dropdown').exists()).toBe(true)
  })

  it('下拉菜单应包含个人中心和退出登录', async () => {
    const wrapper = mountNavbar({ username: 'admin' })
    await wrapper.find('.nav-user').trigger('click')
    expect(wrapper.text()).toContain('个人中心')
    expect(wrapper.text()).toContain('简历编辑')
    expect(wrapper.text()).toContain('退出登录')
  })

  it('应有收藏图标链接', () => {
    const wrapper = mountNavbar()
    expect(wrapper.find('.nav-icon').exists()).toBe(true)
  })
})

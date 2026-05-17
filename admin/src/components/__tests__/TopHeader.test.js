import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/home' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import TopHeader from '@/components/mainbox/TopHeader.vue'
import { useUserInfoStore } from '../../store/userInfo.js'

describe('Admin - TopHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountHeader = (userInfo = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useUserInfoStore()
    if (Object.keys(userInfo).length > 0) {
      store.setUserInfo(userInfo)
    }
    return mount(TopHeader)
  }

  it('应渲染品牌名称', () => {
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('智就业')
    expect(wrapper.text()).toContain('智慧就业服务平台')
  })

  it('应显示用户名', () => {
    const wrapper = mountHeader({ username: 'admin' })
    expect(wrapper.text()).toContain('admin')
  })

  it('应显示角色标签', () => {
    const wrapper = mountHeader({ username: 'admin', role: 1 })
    expect(wrapper.text()).toContain('ADMIN')
  })

  it('应显示在线状态点', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.status-dot').exists()).toBe(true)
  })

  it('应显示时间', async () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.time-value').exists()).toBe(true)
    await new Promise(r => setTimeout(r, 50))
    expect(wrapper.find('.time-value').text()).toBeTruthy()
  })

  it('应显示折叠按钮', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.brand-mark').exists()).toBe(true)
  })

  it('点击用户区域应显示下拉菜单', async () => {
    const wrapper = mountHeader({ username: 'admin' })
    expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    await wrapper.find('.user-area').trigger('click')
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
    expect(wrapper.text()).toContain('个人中心')
    expect(wrapper.text()).toContain('退出登录')
  })

  it('毕业生角色应显示 GRADUATE', () => {
    const wrapper = mountHeader({ username: 'student', role: 0 })
    expect(wrapper.text()).toContain('GRADUATE')
  })
})

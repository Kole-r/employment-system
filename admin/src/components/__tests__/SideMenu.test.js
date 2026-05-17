import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ fullPath: '/home' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@element-plus/icons-vue', () => ({
  HomeFilled: { template: '<span />' },
  UserFilled: { template: '<span />' },
  Avatar: { template: '<span />' },
  Management: { template: '<span />' },
  Briefcase: { template: '<span />' },
}))

import SideMenu from '@/components/mainbox/SideMenu.vue'
import { useUserInfoStore } from '../../store/userInfo.js'

const globalStubs = {
  'el-aside': { template: '<aside><slot /></aside>', props: ['width'] },
  'el-menu': { template: '<nav><slot /></nav>', props: ['collapse', 'collapseTransition', 'router', 'default-active', 'class'] },
  'el-menu-item': { template: '<div><slot /><slot name="title" /></div>', props: ['index'] },
  'el-sub-menu': { template: '<div><slot name="title" /><slot /></div>', props: ['index'] },
  'el-icon': { template: '<span><slot /></span>' },
}

describe('Admin - SideMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountMenu = (role = 1) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useUserInfoStore()
    store.setUserInfo({ username: 'admin', role })
    return mount(SideMenu, { global: { stubs: globalStubs } })
  }

  it('应渲染 logo', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('.logo-mark').text()).toBe('E')
    expect(wrapper.find('.logo-text').text()).toBe('EMPLOY')
  })

  it('应显示版本号', () => {
    const wrapper = mountMenu()
    expect(wrapper.find('.footer-ver').text()).toBe('v1.0')
  })

  it('管理员应看到所有菜单项', () => {
    const wrapper = mountMenu(1)
    const text = wrapper.text()
    expect(text).toContain('首页')
    expect(text).toContain('个人中心')
    expect(text).toContain('用户管理')
    expect(text).toContain('新闻管理')
    expect(text).toContain('岗位管理')
  })

  it('应包含子菜单项', () => {
    const wrapper = mountMenu(1)
    const text = wrapper.text()
    expect(text).toContain('添加用户')
    expect(text).toContain('用户列表')
    expect(text).toContain('添加新闻')
    expect(text).toContain('新闻列表')
    expect(text).toContain('发布岗位')
    expect(text).toContain('岗位列表')
  })
})

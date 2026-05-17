import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/components/ChatBot.vue', () => ({
  default: {
    name: 'ChatBot',
    template: '<div class="chatbot-mock"></div>'
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/profile' }),
  RouterLink: { template: '<a><slot /></a>' },
  createRouter: vi.fn(() => ({ install: vi.fn(), beforeEach: vi.fn(), push: vi.fn() })),
  createWebHistory: vi.fn(),
}))

import Profile from '../Profile.vue'
import { useUserInfoStore } from '../../store/userInfo'

describe('Client - Profile', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountProfile = (userInfo = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useUserInfoStore()
    if (Object.keys(userInfo).length > 0) {
      store.updateInfo(userInfo)
    }
    return mount(Profile)
  }

  it('应渲染个人信息页面', () => {
    const wrapper = mountProfile()
    expect(wrapper.find('.hero-title').text()).toBe('个人中心')
  })

  it('应显示用户名首字母头像', () => {
    const wrapper = mountProfile({ username: 'zhangsan', real_name: '张三' })
    expect(wrapper.find('.avatar-initial').text()).toBe('张')
  })

  it('无 real_name 时应使用 username 首字母', () => {
    const wrapper = mountProfile({ username: 'admin' })
    expect(wrapper.find('.avatar-initial').text()).toBe('a')
  })

  it('应显示用户名和姓名', () => {
    const wrapper = mountProfile({ username: 'zhangsan', real_name: '张三' })
    expect(wrapper.text()).toContain('张三')
  })

  it('应显示专业和学校信息', () => {
    const wrapper = mountProfile({
      username: 'zhangsan',
      real_name: '张三',
      major: '计算机科学',
      university: '北京大学',
    })
    expect(wrapper.text()).toContain('计算机科学')
    expect(wrapper.text()).toContain('北京大学')
  })

  it('应显示所有数据字段标签', () => {
    const wrapper = mountProfile()
    expect(wrapper.text()).toContain('USERNAME')
    expect(wrapper.text()).toContain('REAL NAME')
    expect(wrapper.text()).toContain('MAJOR')
    expect(wrapper.text()).toContain('DEGREE')
    expect(wrapper.text()).toContain('UNIVERSITY')
  })

  it('未填字段应显示破折号', () => {
    const wrapper = mountProfile({ username: 'admin' })
    const vals = wrapper.findAll('.pstat-value')
    const dashCount = vals.filter(w => w.text() === '—').length
    expect(dashCount).toBeGreaterThan(0)
  })

  it('应有简历编辑快捷入口', () => {
    const wrapper = mountProfile()
    expect(wrapper.text()).toContain('简历编辑')
  })

  it('应显示意向城市和意向岗位字段标签', () => {
    const wrapper = mountProfile()
    expect(wrapper.text()).toContain('意向城市')
    expect(wrapper.text()).toContain('意向岗位')
  })

  it('应显示意向城市和意向岗位在资料卡中', () => {
    const wrapper = mountProfile({ city_preference: '北京,上海', job_preference: '技术,产品' })
    expect(wrapper.text()).toContain('北京,上海')
    expect(wrapper.text()).toContain('技术,产品')
  })

  it('应渲染城市标签选择器', () => {
    const wrapper = mountProfile()
    const tagBtns = wrapper.findAll('.tag-btn')
    expect(tagBtns.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.text()).toContain('上海')
    expect(wrapper.text()).toContain('深圳')
    expect(wrapper.text()).toContain('杭州')
  })

  it('已选城市标签应有 active 样式', () => {
    const wrapper = mountProfile({ city_preference: '北京,上海' })
    const activeBtns = wrapper.findAll('.tag-btn.active')
    const activeTexts = activeBtns.map(b => b.text())
    expect(activeTexts).toContain('北京')
    expect(activeTexts).toContain('上海')
  })

  it('点击城市标签应切换选中状态', async () => {
    const wrapper = mountProfile({ city_preference: '北京' })
    const btns = wrapper.findAll('.tag-btn')
    const shanghaiBtn = btns.find(b => b.text() === '上海')
    expect(shanghaiBtn).toBeTruthy()
    expect(shanghaiBtn.classes()).not.toContain('active')

    await shanghaiBtn.trigger('click')
    expect(shanghaiBtn.classes()).toContain('active')
  })

  it('点击已选城市标签应取消选中', async () => {
    const wrapper = mountProfile({ city_preference: '北京,上海' })
    const btns = wrapper.findAll('.tag-btn')
    const beijingBtn = btns.find(b => b.text() === '北京')
    expect(beijingBtn.classes()).toContain('active')

    await beijingBtn.trigger('click')
    expect(beijingBtn.classes()).not.toContain('active')
  })

  it('应渲染岗位类型标签选择器', () => {
    const wrapper = mountProfile()
    expect(wrapper.text()).toContain('技术')
    expect(wrapper.text()).toContain('产品')
    expect(wrapper.text()).toContain('运营')
    expect(wrapper.text()).toContain('设计')
  })

  it('已选岗位标签应有 active 样式', () => {
    const wrapper = mountProfile({ job_preference: '技术,设计' })
    const activeBtns = wrapper.findAll('.tag-btn.active')
    const activeTexts = activeBtns.map(b => b.text())
    expect(activeTexts).toContain('技术')
    expect(activeTexts).toContain('设计')
  })

  it('点击岗位标签应切换选中状态', async () => {
    const wrapper = mountProfile({ job_preference: '技术' })
    const btns = wrapper.findAll('.tag-btn')
    const opsBtn = btns.find(b => b.text() === '运营')
    expect(opsBtn).toBeTruthy()
    expect(opsBtn.classes()).not.toContain('active')

    await opsBtn.trigger('click')
    expect(opsBtn.classes()).toContain('active')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('@/util/upload.js', () => ({ default: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/user-management/UserAdd' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub"></div>' },
}))

import UserAdd from '@/views/user-management/UserAdd.vue'

describe('Admin - UserAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountUserAdd = () => mount(UserAdd)

  it('应渲染页面标题', () => {
    const wrapper = mountUserAdd()
    expect(wrapper.find('.hero-title').text()).toBe('添加用户')
    expect(wrapper.text()).toContain('USER MANAGEMENT')
  })

  it('应显示表单标签', () => {
    const wrapper = mountUserAdd()
    expect(wrapper.text()).toContain('NEW USER')
    expect(wrapper.text()).toContain('用户名')
    expect(wrapper.text()).toContain('密码')
    expect(wrapper.text()).toContain('角色')
    expect(wrapper.text()).toContain('状态')
    expect(wrapper.text()).toContain('真实姓名')
    expect(wrapper.text()).toContain('手机号')
    expect(wrapper.text()).toContain('邮箱')
    expect(wrapper.text()).toContain('毕业院校')
    expect(wrapper.text()).toContain('专业')
    expect(wrapper.text()).toContain('学历')
    expect(wrapper.text()).toContain('个人简介')
    expect(wrapper.text()).toContain('头像')
  })

  it('应显示提交按钮', () => {
    const wrapper = mountUserAdd()
    expect(wrapper.find('.btn-submit').text()).toBe('添加用户')
  })

  it('应显示角色选项', () => {
    const wrapper = mountUserAdd()
    const roleSelect = wrapper.findAll('select')[0]
    const options = roleSelect.findAll('option')
    expect(options[0].text()).toBe('管理员')
    expect(options[1].text()).toBe('企业人员')
    expect(options[2].text()).toBe('毕业生')
  })

  it('应显示学历选项', () => {
    const wrapper = mountUserAdd()
    const degreeSelect = wrapper.findAll('select')[2]
    const options = degreeSelect.findAll('option')
    expect(options[0].text()).toBe('请选择')
    expect(options[1].text()).toBe('本科')
    expect(options[2].text()).toBe('硕士')
    expect(options[3].text()).toBe('博士')
  })

  it('应渲染上传组件', () => {
    const wrapper = mountUserAdd()
    expect(wrapper.find('.upload-stub').exists()).toBe(true)
  })
})

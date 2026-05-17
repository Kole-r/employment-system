import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('@/util/upload.js', () => ({ default: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/center' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub"></div>' },
}))

import Center from '@/views/center/Center.vue'
import { useUserInfoStore } from '../../store/userInfo.js'

describe('Admin - Center', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountCenter = (userInfo = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useUserInfoStore()
    if (Object.keys(userInfo).length > 0) {
      store.setUserInfo(userInfo)
    }
    return mount(Center)
  }

  it('应渲染页面标题', () => {
    const wrapper = mountCenter()
    expect(wrapper.find('.hero-title').text()).toBe('个人中心')
    expect(wrapper.text()).toContain('ACCOUNT')
  })

  it('应显示用户名', () => {
    const wrapper = mountCenter({ username: 'admin' })
    expect(wrapper.text()).toContain('admin')
  })

  it('应显示角色标签', () => {
    const wrapper = mountCenter({ username: 'admin', role: 1 })
    expect(wrapper.text()).toContain('管理员')
  })

  it('应显示所有数据字段', () => {
    const wrapper = mountCenter()
    expect(wrapper.text()).toContain('USERNAME')
    expect(wrapper.text()).toContain('ROLE')
    expect(wrapper.text()).toContain('PHONE')
    expect(wrapper.text()).toContain('EMAIL')
    expect(wrapper.text()).toContain('MAJOR')
    expect(wrapper.text()).toContain('DEGREE')
    expect(wrapper.text()).toContain('UNIVERSITY')
  })

  it('应显示表单编辑区域', () => {
    const wrapper = mountCenter()
    expect(wrapper.text()).toContain('EDIT PROFILE')
    expect(wrapper.text()).toContain('保存更改')
  })

  it('应显示学历选项', () => {
    const wrapper = mountCenter()
    const selects = wrapper.findAll('select')
    const degreeSelect = selects[0]
    const options = degreeSelect.findAll('option')
    expect(options[0].text()).toBe('请选择')
    expect(options[1].text()).toBe('本科')
  })

  it('未填字段应显示破折号', () => {
    const wrapper = mountCenter({ username: 'admin' })
    expect(wrapper.text()).toContain('—')
  })
})

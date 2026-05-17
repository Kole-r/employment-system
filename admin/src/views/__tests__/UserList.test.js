import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../../util/axios.config.js', () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}))

vi.mock('../../util/upload.js', () => ({ default: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/user-management/UserList' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub"></div>' },
}))

import UserList from '@/views/user-management/UserList.vue'
import axios from '../../util/axios.config.js'

const mockUsers = [
  { id: 1, username: 'admin', real_name: '管理员', role: 1, major: '', degree: '', phone: '13800000000', status: 1, avatar: '' },
  { id: 2, username: 'zhangsan', real_name: '张三', role: 0, major: '计算机科学', degree: '本科', phone: '13900000000', status: 1, avatar: '' },
  { id: 3, username: 'company1', real_name: '企业用户', role: 2, major: '', degree: '', phone: '', status: 0, avatar: '' },
]

describe('Admin - UserList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { data: mockUsers } })
  })

  const mountUserList = async () => {
    const wrapper = mount(UserList)
    await flushPromises()
    return wrapper
  }

  it('应渲染页面标题', async () => {
    const wrapper = await mountUserList()
    expect(wrapper.find('.hero-title').text()).toBe('用户列表')
    expect(wrapper.text()).toContain('USER MANAGEMENT')
  })

  it('应加载并显示用户列表', async () => {
    const wrapper = await mountUserList()
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)
    expect(wrapper.text()).toContain('admin')
    expect(wrapper.text()).toContain('zhangsan')
  })

  it('应显示角色标签', async () => {
    const wrapper = await mountUserList()
    expect(wrapper.text()).toContain('管理员')
    expect(wrapper.text()).toContain('毕业生')
    expect(wrapper.text()).toContain('企业人员')
  })

  it('应显示统计信息', async () => {
    const wrapper = await mountUserList()
    const statNums = wrapper.findAll('.stat-num')
    expect(statNums[0].text()).toBe('3')   // TOTAL
    expect(statNums[1].text()).toBe('1')   // TEACHERS
    expect(statNums[2].text()).toBe('1')   // ENTERPRISE
    expect(statNums[3].text()).toBe('1')   // GRADUATES
  })

  it('应显示操作按钮', async () => {
    const wrapper = await mountUserList()
    expect(wrapper.findAll('.abtn-edit').length).toBe(3)
    expect(wrapper.findAll('.abtn-delete').length).toBe(3)
  })

  it('应显示状态标签', async () => {
    const wrapper = await mountUserList()
    expect(wrapper.findAll('.status-pill.active').length).toBe(2)
    expect(wrapper.findAll('.status-pill.disabled').length).toBe(1)
  })

  it('空列表应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = await mountUserList()
    expect(wrapper.text()).toContain('NO DATA')
    expect(wrapper.text()).toContain('暂无用户数据')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { get: vi.fn() },
}))

vi.mock('@/components/ChatBot.vue', () => ({
  default: {
    name: 'ChatBot',
    template: '<div class="chatbot-mock"></div>'
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/jobs' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import JobList from '../JobList.vue'
import axios from '@/util/axios.config.js'

const mockJobs = [
  { id: 1, job_title: '前端工程师', company_name: '字节跳动', city: '北京', job_type: '技术', salary_min: 15000, salary_max: 30000, degree_required: '本科', status: 1 },
  { id: 2, job_title: '产品经理', company_name: '腾讯', city: '深圳', job_type: '产品', salary_min: 20000, salary_max: 40000, degree_required: '硕士', status: 1 },
  { id: 3, job_title: '运营专员', company_name: '阿里', city: '杭州', job_type: '运营', salary_min: 10000, salary_max: 20000, degree_required: '本科', status: 1 },
]

describe('Client - JobList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { code: 200, data: mockJobs } })
  })

  const mountJobList = async () => {
    const wrapper = mount(JobList)
    await flushPromises()
    return wrapper
  }

  it('应加载并显示职位列表', async () => {
    const wrapper = await mountJobList()
    const rows = wrapper.findAll('.job-row')
    expect(rows.length).toBe(3)
    expect(wrapper.text()).toContain('前端工程师')
    expect(wrapper.text()).toContain('字节跳动')
  })

  it('应显示结果数量', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.find('.hero-count').text()).toContain('3')
  })

  it('按类型筛选应正确过滤', async () => {
    const wrapper = await mountJobList()
    const segments = wrapper.findAll('.segment')
    // 点击"技术"
    await segments[1].trigger('click')
    expect(wrapper.findAll('.job-row').length).toBe(1)
    expect(wrapper.text()).toContain('前端工程师')
  })

  it('关键字搜索应正确过滤', async () => {
    const wrapper = await mountJobList()
    await wrapper.find('.search-input').setValue('腾讯')
    expect(wrapper.findAll('.job-row').length).toBe(1)
    expect(wrapper.text()).toContain('产品经理')
  })

  it('搜索无结果应显示空状态', async () => {
    const wrapper = await mountJobList()
    await wrapper.find('.search-input').setValue('不存在的公司')
    expect(wrapper.findAll('.job-row').length).toBe(0)
    expect(wrapper.text()).toContain('NO DATA')
  })

  it('应显示薪资信息', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('30K')
  })

  it('空列表应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { code: 200, data: [] } })
    const wrapper = await mountJobList()
    expect(wrapper.text()).toContain('NO DATA')
    expect(wrapper.text()).toContain('暂无匹配的岗位')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { get: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/home' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/ChatBot.vue', () => ({
  default: { template: '<div class="chatbot-stub"></div>' },
}))

import Home from '@/views/Home.vue'
import axios from '@/util/axios.config.js'

const mockJobs = [
  { id: 1, job_title: '前端工程师', company_name: '字节跳动', city: '北京', degree_required: '本科', salary_min: 15000, salary_max: 30000, company_type: '互联网', tags: 'React,Vue' },
  { id: 2, job_title: '产品经理', company_name: '腾讯', city: '深圳', degree_required: '硕士', salary_min: 20000, salary_max: 40000, company_type: '互联网', tags: 'B端,C端' },
]

const mockNews = [
  { id: 1, title: '2026年春招政策', category: 1, created_at: '2026-04-01', cover: '', summary: '春招政策解读' },
  { id: 2, title: '互联网行业趋势', category: 2, created_at: '2026-04-02', cover: '', summary: '行业分析' },
]

describe('Client - Home', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockImplementation((url) => {
      if (url.includes('job/recommend') || url.includes('job/list')) {
        return Promise.resolve({ data: { code: 200, data: mockJobs } })
      }
      if (url.includes('news/list')) {
        return Promise.resolve({ data: { code: 200, data: mockNews } })
      }
      return Promise.resolve({ data: { code: 200, data: [] } })
    })
  })

  const mountHome = async () => {
    const wrapper = mount(Home)
    await flushPromises()
    return wrapper
  }

  it('应渲染首页标题', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('EMPLOYMENT PLATFORM')
    expect(wrapper.text()).toContain('找到你的')
    expect(wrapper.text()).toContain('下一份工作')
  })

  it('应显示描述文字', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('一站式平台')
  })

  it('应显示导航按钮', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('浏览岗位')
    expect(wrapper.text()).toContain('阅读资讯')
  })

  it('应加载并显示推荐岗位', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('推荐岗位')
    expect(wrapper.text()).toContain('前端工程师')
    expect(wrapper.text()).toContain('字节跳动')
    expect(wrapper.text()).toContain('产品经理')
  })

  it('应显示岗位薪资', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('30K')
  })

  it('应加载并显示最新资讯', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('最新资讯')
    expect(wrapper.text()).toContain('2026年春招政策')
    expect(wrapper.text()).toContain('互联网行业趋势')
  })

  it('应显示统计数据', async () => {
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('在招岗位')
    expect(wrapper.text()).toContain('合作企业')
    expect(wrapper.text()).toContain('资讯文章')
  })

  it('应渲染 ChatBot 组件', async () => {
    const wrapper = await mountHome()
    expect(wrapper.find('.chatbot-stub').exists()).toBe(true)
  })

  it('空数据应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { code: 200, data: [] } })
    const wrapper = await mountHome()
    expect(wrapper.text()).toContain('NO DATA')
  })
})

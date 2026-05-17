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
  useRoute: () => ({ path: '/news' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import NewsList from '../NewsList.vue'
import axios from '@/util/axios.config.js'

const mockNews = [
  { id: 1, title: '2026年春招政策', category: 1, views: 120, created_at: '2026-04-01' },
  { id: 2, title: '互联网行业趋势', category: 2, views: 85, created_at: '2026-04-02' },
  { id: 3, title: '面试技巧分享', category: 3, views: 200, created_at: '2026-04-03' },
  { id: 4, title: '校园招聘会通知', category: 4, views: 50, created_at: '2026-04-04' },
]

describe('Client - NewsList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { code: 200, data: mockNews } })
  })

  const mountNewsList = async () => {
    const wrapper = mount(NewsList)
    await flushPromises()
    return wrapper
  }

  it('应加载并显示新闻列表', async () => {
    const wrapper = await mountNewsList()
    const cards = wrapper.findAll('.news-card')
    expect(cards.length).toBe(4)
    expect(wrapper.text()).toContain('2026年春招政策')
  })

  it('应显示结果数量', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.find('.hero-count').text()).toContain('4')
  })

  it('按分类筛选应正确过滤', async () => {
    const wrapper = await mountNewsList()
    const segments = wrapper.findAll('.segment')
    // 点击"政策解读"
    await segments[1].trigger('click')
    expect(wrapper.findAll('.news-card').length).toBe(1)
    expect(wrapper.text()).toContain('2026年春招政策')
  })

  it('点击"全部"应显示所有新闻', async () => {
    const wrapper = await mountNewsList()
    const segments = wrapper.findAll('.segment')
    await segments[1].trigger('click')
    expect(wrapper.findAll('.news-card').length).toBe(1)
    await segments[0].trigger('click')
    expect(wrapper.findAll('.news-card').length).toBe(4)
  })

  it('应格式化日期', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.text()).toContain('2026.04.01')
  })

  it('应显示浏览量', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.text()).toContain('120 views')
  })

  it('空列表应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { code: 200, data: [] } })
    const wrapper = await mountNewsList()
    expect(wrapper.text()).toContain('NO DATA')
  })
})

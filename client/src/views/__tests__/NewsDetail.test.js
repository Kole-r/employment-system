import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('@/components/ChatBot.vue', () => ({
  default: {
    name: 'ChatBot',
    template: '<div class="chatbot-mock"></div>'
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { id: '1' }, path: '/news/1' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import NewsDetail from '@/views/NewsDetail.vue'
import axios from '@/util/axios.config.js'

const mockNews = {
  id: 1,
  title: '2026年春招政策全面解读',
  category: 1,
  created_at: '2026-04-01',
  views: 120,
  cover: 'https://example.com/cover.jpg',
  content: '<p>春招政策详细内容</p><p>第二段内容</p>',
  tags: '春招,政策,就业',
}

describe('Client - NewsDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockImplementation((url) => {
      if (url.includes('news/detail')) {
        return Promise.resolve({ data: { code: 200, data: mockNews } })
      }
      if (url.includes('favorite/check')) {
        return Promise.resolve({ data: { code: 200, data: { favorited: false } } })
      }
      return Promise.resolve({ data: { code: 200, data: {} } })
    })
  })

  const mountNewsDetail = async () => {
    const wrapper = mount(NewsDetail)
    await flushPromises()
    return wrapper
  }

  it('应渲染新闻标题', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.find('.detail-title').text()).toBe('2026年春招政策全面解读')
  })

  it('应显示分类标签', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.text()).toContain('政策解读')
  })

  it('应显示日期', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.text()).toContain('2026.04.01')
  })

  it('应显示浏览量', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.text()).toContain('120 views')
  })

  it('应显示封面图片', async () => {
    const wrapper = await mountNewsDetail()
    const coverImg = wrapper.find('.detail-cover img')
    expect(coverImg.exists()).toBe(true)
    expect(coverImg.attributes('src')).toBe('https://example.com/cover.jpg')
  })

  it('应渲染新闻内容', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.find('.detail-body').html()).toContain('春招政策详细内容')
  })

  it('应显示标签', async () => {
    const wrapper = await mountNewsDetail()
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(3)
    expect(wrapper.text()).toContain('春招')
    expect(wrapper.text()).toContain('政策')
    expect(wrapper.text()).toContain('就业')
  })

  it('应显示收藏按钮', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.find('.fav-btn').exists()).toBe(true)
  })

  it('应显示返回链接', async () => {
    const wrapper = await mountNewsDetail()
    expect(wrapper.text()).toContain('返回资讯列表')
  })

  it('加载中应显示 loading', () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(NewsDetail)
    expect(wrapper.text()).toContain('LOADING...')
  })
})

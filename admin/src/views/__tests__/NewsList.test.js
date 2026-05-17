import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

vi.mock('@/util/upload.js', () => ({ default: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/news-management/NewsList' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub"></div>' },
}))

import NewsList from '@/views/news-management/NewsList.vue'
import axios from '@/util/axios.config.js'

const mockNews = [
  { id: 1, title: '春招政策解读', category: 1, isPublish: 1, editTime: '2026-04-01', cover: '', content: '<p>内容一</p>' },
  { id: 2, title: '互联网行业趋势分析', category: 2, isPublish: 0, editTime: '2026-04-02', cover: '', content: '<p>内容二</p>' },
  { id: 3, title: '面试技巧分享', category: 3, isPublish: 1, editTime: '2026-04-03', cover: '', content: '<p>内容三</p>' },
]

describe('Admin - NewsList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { data: mockNews } })
  })

  const mountNewsList = async () => {
    const wrapper = mount(NewsList)
    await flushPromises()
    return wrapper
  }

  it('应渲染页面标题', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.find('.hero-title').text()).toBe('新闻列表')
  })

  it('应加载并显示新闻列表', async () => {
    const wrapper = await mountNewsList()
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)
    expect(wrapper.text()).toContain('春招政策解读')
    expect(wrapper.text()).toContain('互联网行业趋势分析')
  })

  it('应显示总数和已发布数统计', async () => {
    const wrapper = await mountNewsList()
    const statNums = wrapper.findAll('.stat-num')
    expect(statNums[0].text()).toBe('3')
    expect(statNums[1].text()).toBe('2')
  })

  it('应显示分类筛选按钮', async () => {
    const wrapper = await mountNewsList()
    const segments = wrapper.findAll('.segment')
    expect(segments.length).toBe(5)
    expect(segments[0].text()).toBe('全部')
  })

  it('按分类筛选应正确过滤', async () => {
    const wrapper = await mountNewsList()
    const segments = wrapper.findAll('.segment')
    await segments[1].trigger('click')
    expect(wrapper.findAll('tbody tr').length).toBe(1)
    expect(wrapper.text()).toContain('春招政策解读')
  })

  it('应显示发布状态', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.text()).toContain('已发布')
    expect(wrapper.text()).toContain('草稿')
  })

  it('应显示操作按钮', async () => {
    const wrapper = await mountNewsList()
    expect(wrapper.findAll('.abtn-preview').length).toBe(3)
    expect(wrapper.findAll('.abtn-delete').length).toBe(3)
  })

  it('空列表应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = await mountNewsList()
    expect(wrapper.text()).toContain('NO DATA')
    expect(wrapper.text()).toContain('当前分类下没有新闻')
  })
})

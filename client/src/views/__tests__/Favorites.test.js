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
  useRoute: () => ({ path: '/favorites' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import Favorites from '../Favorites.vue'
import axios from '@/util/axios.config.js'

const mockFavorites = [
  { id: 1, target_type: 'job', target_id: 10, title: '前端工程师', created_at: '2026-04-01' },
  { id: 2, target_type: 'news', target_id: 5, title: '春招政策', created_at: '2026-04-02' },
  { id: 3, target_type: 'job', target_id: 11, title: '后端工程师', created_at: '2026-04-03' },
]

describe('Client - Favorites', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { code: 200, data: mockFavorites } })
  })

  const mountFavorites = async () => {
    const wrapper = mount(Favorites)
    await flushPromises()
    return wrapper
  }

  it('应加载并显示收藏列表', async () => {
    const wrapper = await mountFavorites()
    expect(wrapper.text()).toContain('前端工程师')
    expect(wrapper.text()).toContain('春招政策')
    expect(wrapper.text()).toContain('后端工程师')
  })

  it('应按类型分组显示', async () => {
    const wrapper = await mountFavorites()
    expect(wrapper.text()).toContain('岗位')
    expect(wrapper.text()).toContain('资讯')
  })

  it('应显示收藏数量', async () => {
    const wrapper = await mountFavorites()
    expect(wrapper.text()).toContain('3 ITEMS')
  })

  it('应显示岗位和资讯各自的数量', async () => {
    const wrapper = await mountFavorites()
    const counts = wrapper.findAll('.section-count')
    expect(counts[0].text()).toBe('2')
    expect(counts[1].text()).toBe('1')
  })

  it('空收藏应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { code: 200, data: [] } })
    const wrapper = await mountFavorites()
    expect(wrapper.text()).toContain('NO FAVORITES YET')
  })

  it('应显示格式化日期', async () => {
    const wrapper = await mountFavorites()
    expect(wrapper.text()).toContain('2026.04.01')
  })
})

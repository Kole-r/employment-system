import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('@/util/upload.js', () => ({ default: vi.fn() }))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/news-management/NewsAdd' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub"></div>' },
}))

vi.mock('@/components/Editor/editor.vue', () => ({
  default: { template: '<div class="editor-stub"></div>', emits: ['event'] },
}))

vi.mock('@/components/AdminChatBot.vue', () => ({
  default: { template: '<div class="chatbot-stub"></div>', props: ['context'] },
}))

import NewsAdd from '@/views/news-management/NewsAdd.vue'

describe('Admin - NewsAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountNewsAdd = () => mount(NewsAdd)

  it('应渲染页面标题', () => {
    const wrapper = mountNewsAdd()
    expect(wrapper.find('.hero-title').text()).toBe('创建新闻')
    expect(wrapper.text()).toContain('NEWS MANAGEMENT')
  })

  it('应显示表单标签', () => {
    const wrapper = mountNewsAdd()
    expect(wrapper.text()).toContain('NEW ARTICLE')
    expect(wrapper.text()).toContain('新闻标题')
    expect(wrapper.text()).toContain('新闻内容')
    expect(wrapper.text()).toContain('类别')
    expect(wrapper.text()).toContain('封面')
  })

  it('应显示提交按钮', () => {
    const wrapper = mountNewsAdd()
    expect(wrapper.text()).toContain('保存草稿')
    expect(wrapper.text()).toContain('发布新闻')
  })

  it('应显示分类选项', () => {
    const wrapper = mountNewsAdd()
    const options = wrapper.findAll('select option')
    expect(options.length).toBe(5)
    expect(options[1].text()).toBe('政策解读')
    expect(options[2].text()).toBe('行业动态')
  })

  it('应渲染编辑器和上传组件', () => {
    const wrapper = mountNewsAdd()
    expect(wrapper.find('.editor-stub').exists()).toBe(true)
    expect(wrapper.find('.upload-stub').exists()).toBe(true)
  })
})

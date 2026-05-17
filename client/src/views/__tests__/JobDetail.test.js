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
  useRoute: () => ({ params: { id: '1' }, path: '/jobs/1' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import JobDetail from '@/views/JobDetail.vue'
import axios from '@/util/axios.config.js'

const mockJob = {
  id: 1,
  job_title: '前端工程师',
  company_name: '字节跳动',
  company_type: '互联网',
  company_size: '10000人以上',
  company_desc: '字节跳动是全球领先的科技公司',
  city: '北京',
  degree_required: '本科',
  experience: '3-5年',
  headcount: 5,
  salary_min: 15000,
  salary_max: 30000,
  job_description: '负责前端开发工作',
  job_requirements: '熟悉 Vue/React',
  benefits: '五险一金,年终奖,弹性工作',
  tags: 'React,Vue,TypeScript',
  link: 'https://example.com/apply',
}

describe('Client - JobDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockImplementation((url) => {
      if (url.includes('job/detail')) {
        return Promise.resolve({ data: { code: 200, data: mockJob } })
      }
      if (url.includes('favorite/check')) {
        return Promise.resolve({ data: { code: 200, data: { favorited: false } } })
      }
      return Promise.resolve({ data: { code: 200, data: {} } })
    })
  })

  const mountJobDetail = async () => {
    const wrapper = mount(JobDetail)
    await flushPromises()
    return wrapper
  }

  it('应渲染岗位标题', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.find('.detail-title').text()).toBe('前端工程师')
  })

  it('应显示薪资信息', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('30K')
  })

  it('应显示公司信息', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('字节跳动')
    expect(wrapper.text()).toContain('互联网')
    expect(wrapper.text()).toContain('10000人以上')
    expect(wrapper.text()).toContain('字节跳动是全球领先的科技公司')
  })

  it('应显示岗位详情信息', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('CITY')
    expect(wrapper.text()).toContain('北京')
    expect(wrapper.text()).toContain('DEGREE')
    expect(wrapper.text()).toContain('本科')
    expect(wrapper.text()).toContain('EXPERIENCE')
    expect(wrapper.text()).toContain('3-5年')
  })

  it('应显示岗位描述', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('岗位描述')
    expect(wrapper.text()).toContain('负责前端开发工作')
  })

  it('应显示岗位要求', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('岗位要求')
    expect(wrapper.text()).toContain('熟悉 Vue/React')
  })

  it('应显示福利待遇', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('福利待遇')
    expect(wrapper.text()).toContain('五险一金')
    expect(wrapper.text()).toContain('年终奖')
  })

  it('应显示标签', async () => {
    const wrapper = await mountJobDetail()
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(3)
    expect(wrapper.text()).toContain('React')
    expect(wrapper.text()).toContain('Vue')
  })

  it('应显示投递按钮', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.text()).toContain('立即投递')
  })

  it('应显示收藏按钮', async () => {
    const wrapper = await mountJobDetail()
    expect(wrapper.find('.fav-btn').exists()).toBe(true)
  })

  it('加载中应显示 loading', () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    const wrapper = mount(JobDetail)
    expect(wrapper.text()).toContain('LOADING...')
  })
})

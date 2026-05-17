import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import JobList from '../../views/job-management/JobList.vue'
import axios from '@/util/axios.config.js'

const mockJobs = [
  { id: 1, job_title: '前端工程师', company_name: '字节跳动', company_type: '互联网', city: '北京', job_type: '技术', salary_min: 15000, salary_max: 30000, degree_required: '本科', status: 1, tags: 'Vue,React' },
  { id: 2, job_title: '产品经理', company_name: '腾讯', company_type: '互联网', city: '深圳', job_type: '产品', salary_min: 20000, salary_max: 40000, degree_required: '硕士', status: 0, tags: '' },
]

describe('Admin - JobList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { data: mockJobs } })
  })

  const mountJobList = async () => {
    const wrapper = mount(JobList)
    await flushPromises()
    return wrapper
  }

  it('应渲染岗位列表页面', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.find('.hero-title').text()).toBe('岗位列表')
    expect(wrapper.text()).toContain('JOB MANAGEMENT')
  })

  it('应加载并显示岗位数据', async () => {
    const wrapper = await mountJobList()
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)
    expect(wrapper.text()).toContain('前端工程师')
    expect(wrapper.text()).toContain('字节跳动')
  })

  it('应显示统计数据', async () => {
    const wrapper = await mountJobList()
    const stats = wrapper.findAll('.stat-num')
    expect(stats[0].text()).toBe('2')  // TOTAL
    expect(stats[1].text()).toBe('1')  // HIRING
  })

  it('应显示结果数量', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.find('.result-count').text()).toContain('2')
  })

  it('按类型筛选应正确过滤', async () => {
    const wrapper = await mountJobList()
    const segments = wrapper.findAll('.segment')
    await segments[1].trigger('click') // 技术
    expect(wrapper.findAll('tbody tr').length).toBe(1)
  })

  it('关键字搜索应正确过滤', async () => {
    const wrapper = await mountJobList()
    await wrapper.find('.search-input').setValue('腾讯')
    expect(wrapper.findAll('tbody tr').length).toBe(1)
    expect(wrapper.text()).toContain('产品经理')
  })

  it('应显示岗位状态', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.text()).toContain('招聘中')
    expect(wrapper.text()).toContain('已下架')
  })

  it('应显示薪资信息', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.text()).toContain('15K–30K')
  })

  it('应显示操作按钮', async () => {
    const wrapper = await mountJobList()
    expect(wrapper.findAll('.abtn-edit').length).toBe(2)
    expect(wrapper.findAll('.abtn-toggle').length).toBe(2)
    expect(wrapper.findAll('.abtn-delete').length).toBe(2)
  })

  it('点击下架应调用更新接口', async () => {
    axios.put.mockResolvedValue({ data: { code: 200 } })
    const wrapper = await mountJobList()
    await wrapper.findAll('.abtn-toggle')[0].trigger('click')
    expect(axios.put).toHaveBeenCalledWith(
      '/adminApi/job/update/1',
      { status: 0 },
      expect.any(Object)
    )
  })

  it('点击删除应调用删除接口', async () => {
    axios.delete.mockResolvedValue({ data: { code: 200 } })
    axios.get.mockResolvedValueOnce({ data: { data: mockJobs } })
      .mockResolvedValueOnce({ data: { data: [mockJobs[1]] } })
    const wrapper = await mountJobList()
    await wrapper.findAll('.abtn-delete')[0].trigger('click')
    expect(axios.delete).toHaveBeenCalledWith('/adminApi/job/delete/1')
  })

  it('空数据应显示空状态', async () => {
    axios.get.mockResolvedValue({ data: { data: [] } })
    const wrapper = await mountJobList()
    expect(wrapper.text()).toContain('NO DATA')
  })
})

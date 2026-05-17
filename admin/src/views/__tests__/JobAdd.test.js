import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/util/axios.config.js', () => ({
  default: { post: vi.fn() },
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/upload/Upload.vue', () => ({
  default: { template: '<div class="upload-stub" />' },
}))

vi.mock('@/components/AdminChatBot.vue', () => ({
  default: { template: '<div />', props: ['context'] },
}))

import JobAdd from '../../views/job-management/JobAdd.vue'
import axios from '@/util/axios.config.js'

describe('Admin - JobAdd', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mountJobAdd = () =>
    mount(JobAdd, {
      global: {
        stubs: {
          Upload: true,
          AdminChatBot: true,
        },
      },
    })

  it('应渲染发布岗位页面', () => {
    const wrapper = mountJobAdd()
    expect(wrapper.find('.hero-title').text()).toBe('发布岗位')
    expect(wrapper.text()).toContain('NEW POSITION')
  })

  it('应显示公司信息表单区域', () => {
    const wrapper = mountJobAdd()
    expect(wrapper.text()).toContain('公司信息')
    expect(wrapper.text()).toContain('公司名称')
    expect(wrapper.text()).toContain('公司类型')
    expect(wrapper.text()).toContain('公司规模')
  })

  it('应显示岗位信息表单区域', () => {
    const wrapper = mountJobAdd()
    expect(wrapper.text()).toContain('岗位信息')
    expect(wrapper.text()).toContain('岗位名称')
    expect(wrapper.text()).toContain('工作城市')
    expect(wrapper.text()).toContain('学历要求')
  })

  it('应有保存草稿和发布按钮', () => {
    const wrapper = mountJobAdd()
    expect(wrapper.text()).toContain('保存草稿')
    expect(wrapper.text()).toContain('发布岗位')
  })

  it('空公司名称提交应显示错误', async () => {
    const wrapper = mountJobAdd()
    await wrapper.find('.btn-publish').trigger('click')
    expect(wrapper.text()).toContain('请填写公司名称')
  })

  it('空岗位名称提交应显示错误', async () => {
    const wrapper = mountJobAdd()
    const inputs = wrapper.findAll('input')
    // 填写公司名称但不填岗位名称
    await inputs[0].setValue('测试公司')
    await wrapper.find('.btn-publish').trigger('click')
    expect(wrapper.text()).toContain('请填写岗位名称')
  })

  it('表单填写完整后提交应调用接口', async () => {
    axios.post.mockResolvedValue({ data: { code: 200 } })
    const wrapper = mountJobAdd()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('字节跳动')   // company_name
    await inputs[3].setValue('前端工程师') // job_title

    await wrapper.find('.btn-publish').trigger('click')
    expect(axios.post).toHaveBeenCalledWith(
      '/adminApi/job/add',
      expect.objectContaining({
        company_name: '字节跳动',
        job_title: '前端工程师',
        status: 1,
      }),
      expect.any(Object)
    )
  })

  it('保存草稿应设置 status 为 0', async () => {
    axios.post.mockResolvedValue({ data: { code: 200 } })
    const wrapper = mountJobAdd()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('测试公司')
    await inputs[3].setValue('测试岗位')

    await wrapper.find('.btn-draft').trigger('click')
    expect(axios.post).toHaveBeenCalledWith(
      '/adminApi/job/add',
      expect.objectContaining({ status: 0 }),
      expect.any(Object)
    )
  })

  it('应有表单输入字段', () => {
    const wrapper = mountJobAdd()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(5)
  })

  it('应有文本区域用于描述', () => {
    const wrapper = mountJobAdd()
    const textareas = wrapper.findAll('textarea')
    expect(textareas.length).toBeGreaterThanOrEqual(3)
  })
})

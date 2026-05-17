import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ path: '/not-found' }),
  RouterLink: { template: '<a><slot /></a>' },
}))

import NotFound from '@/views/notFound/NotFound.vue'

describe('Admin - NotFound', () => {
  it('应渲染 404 页面', () => {
    const wrapper = mount(NotFound)
    expect(wrapper.text()).toContain('ERROR 404')
    expect(wrapper.text()).toContain('NOT FOUND')
  })

  it('应显示提示信息', () => {
    const wrapper = mount(NotFound)
    expect(wrapper.text()).toContain('页面不存在或已被移除')
  })

  it('应显示返回首页链接', () => {
    const wrapper = mount(NotFound)
    expect(wrapper.text()).toContain('BACK TO HOME')
  })
})

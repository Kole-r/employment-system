import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Home.vue uses `import * as echarts from 'echarts'` (namespace import),
// so mock must expose named exports at top level, not nested under `default`.
vi.mock('echarts', () => {
    const mockChart = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() }
    return {
        init: vi.fn(() => mockChart),
        registerTheme: vi.fn(),
        graphic: { LinearGradient: vi.fn() },
    }
})

vi.mock('../../util/axios.config.js', () => ({
    default: { get: vi.fn(() => Promise.resolve({ data: { data: [] } })) },
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: vi.fn() }),
    useRoute: () => ({ path: '/home' }),
    RouterLink: { template: '<a><slot /></a>' },
}))

import Home from '@/views/home/Home.vue'
import axios from '../../util/axios.config.js'
import { useUserInfoStore } from '../../store/userInfo.js'

describe('Admin - Home', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // Reset call history but keep the default mock implementation
        axios.get.mockClear()
    })

    const mountHome = (userInfo = {}) => {
        const pinia = createPinia()
        setActivePinia(pinia)
        const store = useUserInfoStore()
        if (Object.keys(userInfo).length > 0) {
            store.setUserInfo(userInfo)
        }
        return mount(Home)
    }

    it('应渲染仪表盘标题', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('DASHBOARD')
    })

    it('应显示问候语', () => {
        const wrapper = mountHome()
        const greeting = wrapper.find('.hero-greeting')
        expect(['早上好', '下午好', '晚上好']).toContain(greeting.text())
    })

    it('应显示用户名', () => {
        const wrapper = mountHome({ username: 'admin' })
        expect(wrapper.text()).toContain('admin')
        expect(wrapper.text()).toContain('欢迎回来')
    })

    it('应显示角色信息', () => {
        const wrapper = mountHome({ username: 'admin', role: 1 })
        expect(wrapper.text()).toContain('管理员')
    })

    it('应显示系统状态', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('SYSTEM')
        expect(wrapper.text()).toContain('ONLINE')
        expect(wrapper.text()).toContain('VERSION')
    })

    it('应显示时间', () => {
        const wrapper = mountHome()
        expect(wrapper.find('.time-value').exists()).toBe(true)
    })

    it('应显示统计概览区域', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('OVERVIEW')
    })

    it('应显示3个统计卡片', () => {
        const wrapper = mountHome()
        const cards = wrapper.findAll('.stat-card')
        expect(cards.length).toBe(3)
    })

    it('统计卡片应显示NEWS、JOBS、USERS标签', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('NEWS')
        expect(wrapper.text()).toContain('JOBS')
        expect(wrapper.text()).toContain('USERS')
    })

    it('应显示数据分析区域', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('ANALYTICS')
    })

    it('应显示2个图表容器', () => {
        const wrapper = mountHome()
        const charts = wrapper.findAll('.chart-container')
        expect(charts.length).toBe(2)
    })

    it('应显示图表标题', () => {
        const wrapper = mountHome()
        expect(wrapper.text()).toContain('新闻分类分布')
        expect(wrapper.text()).toContain('岗位城市分布')
    })

    it('应请求3个接口获取数据', async () => {
        mountHome()
        await new Promise(r => setTimeout(r, 0))
        expect(axios.get).toHaveBeenCalledWith('/adminApi/news/list')
        expect(axios.get).toHaveBeenCalledWith('/adminApi/job/list')
        expect(axios.get).toHaveBeenCalledWith('/adminApi/user/list')
    })

    it('应显示接口返回的统计数据', async () => {
        axios.get.mockImplementation((url) => {
            if (url === '/adminApi/news/list')
                return Promise.resolve({ data: { data: [{ id: 1, status: 1 }, { id: 2, status: 0 }] } })
            if (url === '/adminApi/job/list')
                return Promise.resolve({ data: { data: [{ id: 1, status: 1 }, { id: 2, status: 1 }, { id: 3, status: 0 }] } })
            if (url === '/adminApi/user/list')
                return Promise.resolve({ data: { data: [{ id: 1, role: 1 }, { id: 2, role: 0 }] } })
            return Promise.resolve({ data: { data: [] } })
        })

        const wrapper = mountHome()
        // Wait for async onMounted (Promise.all) to resolve and DOM to update
        await new Promise(r => setTimeout(r, 50))
        await wrapper.vm.$nextTick()

        expect(wrapper.text()).toContain('2')  // news count
        expect(wrapper.text()).toContain('3')  // job count
        expect(wrapper.text()).toContain('1 篇')  // published count
    })
})

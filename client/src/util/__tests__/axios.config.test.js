import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pinia store
const mockStore = {
  token: '',
  updateToken: vi.fn(),
  clearInfo: vi.fn(),
}

vi.mock('../../store/userInfo', () => ({
  useUserInfoStore: () => mockStore,
}))

vi.mock('../../router', () => ({
  default: { push: vi.fn() },
}))

// Mock axios to capture interceptors
let reqInterceptor, resInterceptor, resErrorInterceptor
vi.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: (fn) => { reqInterceptor = fn } },
      response: { use: (success, error) => { resInterceptor = success; resErrorInterceptor = error } },
    },
  }
  return {
    default: {
      create: () => instance,
    },
  }
})

// Re-import to trigger interceptor registration
await import('../axios.config.js')

describe('Client - axios interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('请求拦截器', () => {
    it('有 token 时应添加 Authorization 头', () => {
      mockStore.token = 'test-jwt-token'
      const config = { headers: {} }
      const result = reqInterceptor(config)
      expect(result.headers['Authorization']).toBe('Bearer test-jwt-token')
    })

    it('无 token 时不应添加 Authorization 头', () => {
      mockStore.token = ''
      const config = { headers: {} }
      const result = reqInterceptor(config)
      expect(result.headers['Authorization']).toBeUndefined()
    })
  })

  describe('响应拦截器', () => {
    it('响应含新 token 时应调用 updateToken', () => {
      const response = { headers: { authorization: 'new-token' }, data: {} }
      resInterceptor(response)
      expect(mockStore.updateToken).toHaveBeenCalledWith('new-token')
    })

    it('响应无新 token 时不应调用 updateToken', () => {
      const response = { headers: {}, data: {} }
      resInterceptor(response)
      expect(mockStore.updateToken).not.toHaveBeenCalled()
    })
  })

  describe('错误拦截器', () => {
    it('401 错误应清空用户信息', async () => {
      const error = { response: { status: 401 } }
      await resErrorInterceptor(error).catch(() => {})
      expect(mockStore.clearInfo).toHaveBeenCalled()
    })

    it('非 401 错误不应清空用户信息', async () => {
      const error = { response: { status: 500 } }
      await resErrorInterceptor(error).catch(() => {})
      expect(mockStore.clearInfo).not.toHaveBeenCalled()
    })
  })
})

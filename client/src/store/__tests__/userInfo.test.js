import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserInfoStore } from '../userInfo'

describe('Client - useUserInfoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('初始状态应有空字段', () => {
    const store = useUserInfoStore()
    expect(store.token).toBe('')
    expect(store.username).toBe('')
    expect(store.role).toBe(0)
  })

  it('updateInfo 应该更新用户信息', () => {
    const store = useUserInfoStore()
    store.updateInfo({
      token: 'test-token',
      id: 2,
      username: 'zhangsan',
      role: 0,
      real_name: '张三',
      major: '计算机'
    })

    expect(store.token).toBe('test-token')
    expect(store.username).toBe('zhangsan')
    expect(store.real_name).toBe('张三')
    expect(store.major).toBe('计算机')
  })

  it('updateToken 应该只更新 token', () => {
    const store = useUserInfoStore()
    store.updateInfo({ username: 'zhangsan' })
    store.updateToken('new-token')

    expect(store.token).toBe('new-token')
    expect(store.username).toBe('zhangsan')
  })

  it('clearInfo 应该重置所有状态', () => {
    const store = useUserInfoStore()
    store.updateInfo({ token: 'test', username: 'zhangsan', role: 1 })
    store.clearInfo()

    expect(store.token).toBe('')
    expect(store.username).toBe('')
    expect(store.role).toBe(0)
  })
})

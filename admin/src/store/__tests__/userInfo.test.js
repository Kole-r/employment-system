import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserInfoStore } from '../userInfo'

describe('Admin - useUserInfoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('初始状态应为空对象', () => {
    const store = useUserInfoStore()
    expect(store.username).toBeUndefined()
  })

  it('setUserInfo 应该更新状态', () => {
    const store = useUserInfoStore()
    store.setUserInfo({
      id: 1,
      username: 'admin',
      role: 1,
      real_name: '管理员'
    })

    expect(store.$state.username).toBe('admin')
    expect(store.$state.role).toBe(1)
    expect(store.$state.real_name).toBe('管理员')
  })
})

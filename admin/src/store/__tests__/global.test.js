import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGlobalStore } from '../global'

describe('Admin - useGlobalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态 isGlobalRouter 应为 false', () => {
    const store = useGlobalStore()
    expect(store.isGlobalRouter).toBe(false)
  })

  it('setGlobalRouter 应该设置为 true', () => {
    const store = useGlobalStore()
    store.setGlobalRouter(true)
    expect(store.isGlobalRouter).toBe(true)
  })
})

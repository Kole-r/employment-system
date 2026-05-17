import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGlobalStore } from '../global'

describe('Client - useGlobalStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态 isRouterAdded 应为 false', () => {
    const store = useGlobalStore()
    expect(store.isRouterAdded).toBe(false)
  })

  it('setRouterAdded 应该设置为 true', () => {
    const store = useGlobalStore()
    store.setRouterAdded(true)
    expect(store.isRouterAdded).toBe(true)
  })
})

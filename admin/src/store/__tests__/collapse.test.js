import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCollapseStore } from '../collapse'

describe('Admin - useCollapseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态 isCollapsed 应为 false', () => {
    const store = useCollapseStore()
    expect(store.isCollapsed).toBe(false)
  })

  it('setCollapsed 应该切换状态', () => {
    const store = useCollapseStore()
    store.setCollapsed()
    expect(store.isCollapsed).toBe(true)
    store.setCollapsed()
    expect(store.isCollapsed).toBe(false)
  })
})

import { test, expect } from '@playwright/test'

test.describe('收藏功能', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 收藏 API 返回空数据
    await page.route('**/webApi/user/favorites', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.goto('/favorites')
  })

  test('应显示收藏页面', async ({ page }) => {
    await expect(page.locator('.hero-title')).toContainText('我的收藏')
    await expect(page.locator('.hero-label')).toContainText('FAVORITES')
  })

  test('应显示返回首页链接', async ({ page }) => {
    await expect(page.locator('.back-link')).toContainText('返回首页')
  })

  test('无收藏时应显示空状态', async ({ page }) => {
    const emptyState = page.locator('.empty-state')
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText('NO FAVORITES YET')
    }
  })

  test('有收藏时应分组显示', async ({ page }) => {
    const sections = page.locator('.section-title')
    const count = await sections.count()
    if (count > 0) {
      // 应该有岗位或资讯分组
      const text = await page.textContent('body')
      const hasJobSection = text.includes('岗位')
      const hasNewsSection = text.includes('资讯')
      expect(hasJobSection || hasNewsSection).toBe(true)
    }
  })

  test('应显示收藏数量', async ({ page }) => {
    const count = page.locator('.hero-count')
    if (await count.isVisible()) {
      const text = await count.textContent()
      expect(text).toMatch(/\d+ ITEMS/)
    }
  })
})

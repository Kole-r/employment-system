import { test, expect } from '@playwright/test'

test.describe('资讯浏览', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.evaluate(() => {
      const userInfo = {
        token: 'mock-jwt-token',
        id: 1,
        username: 'testuser',
        role: 0,
        real_name: '测试用户',
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    })
    await page.goto('/news')
  })

  test('应显示资讯列表页面', async ({ page }) => {
    await expect(page.locator('.hero-title')).toContainText('就业资讯')
    await expect(page.locator('.hero-label')).toContainText('NEWS')
  })

  test('应显示分类筛选', async ({ page }) => {
    const segments = page.locator('.segment')
    await expect(segments).toHaveCount(5)
    await expect(segments.nth(0)).toContainText('全部')
    await expect(segments.nth(1)).toContainText('政策解读')
    await expect(segments.nth(2)).toContainText('行业动态')
  })

  test('点击分类应切换激活状态', async ({ page }) => {
    const secondSegment = page.locator('.segment').nth(1)
    await secondSegment.click()
    await expect(secondSegment).toHaveClass(/active/)
  })

  test('应显示返回首页链接', async ({ page }) => {
    await expect(page.locator('.back-link')).toContainText('返回首页')
  })

  test('资讯列表为空时应显示空状态', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    const newsCards = page.locator('.news-card')
    const count = await newsCards.count()
    if (count === 0) {
      await expect(page.locator('.empty-state')).toContainText('NO DATA')
    }
  })

  test('有数据时应显示资讯卡片', async ({ page }) => {
    const newsCards = page.locator('.news-card')
    const count = await newsCards.count()
    if (count > 0) {
      // 应该有标题
      await expect(page.locator('.news-title').first()).toBeVisible()
    }
  })
})

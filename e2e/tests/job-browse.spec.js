import { test, expect } from '@playwright/test'

test.describe('岗位浏览', () => {
  // 需要先登录
  test.beforeEach(async ({ page }) => {
    // 注入 token 模拟登录状态
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
    await page.goto('/jobs')
  })

  test('应显示岗位列表页面', async ({ page }) => {
    await expect(page.locator('.hero-title')).toContainText('岗位列表')
    await expect(page.locator('.hero-label')).toContainText('JOBS')
  })

  test('应显示筛选控件', async ({ page }) => {
    await expect(page.locator('.segmented-control')).toBeVisible()
    await expect(page.locator('.search-input')).toBeVisible()
  })

  test('应显示筛选分类选项', async ({ page }) => {
    const segments = page.locator('.segment')
    await expect(segments).toHaveCount(5)
    await expect(segments.nth(0)).toContainText('全部')
    await expect(segments.nth(1)).toContainText('技术')
  })

  test('搜索框应能输入关键字', async ({ page }) => {
    await page.fill('.search-input', '工程师')
    await expect(page.locator('.search-input')).toHaveValue('工程师')
  })

  test('点击分类应切换激活状态', async ({ page }) => {
    const techSegment = page.locator('.segment').nth(1)
    await techSegment.click()
    await expect(techSegment).toHaveClass(/active/)
  })

  test('应显示返回首页链接', async ({ page }) => {
    await expect(page.locator('.back-link')).toContainText('返回首页')
  })

  test('岗位列表为空时应显示空状态', async ({ page }) => {
    // Mock API 返回空数据以测试空状态
    await page.route('**/webApi/job/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.goto('/jobs')
    await page.waitForTimeout(500)
    const emptyState = page.locator('.empty-state')
    await expect(emptyState).toContainText('NO DATA')
  })
})

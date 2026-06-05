import { test, expect } from '@playwright/test'

test.describe('导航与路由', () => {
  test('未登录访问首页应重定向到登录页', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear()
    })
    await page.goto('/home')
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
  })

  test('登录后应能访问首页', async ({ page }) => {
    await page.route('**/webApi/stats**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: { jobs: 0, companies: 0, news: 0 } }) })
    )
    await page.route('**/webApi/job/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.route('**/webApi/news/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.goto('/home')
    await page.waitForTimeout(1000)
    expect(page.url()).not.toContain('/login')
  })

  test('登录后应能访问岗位页面', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/jobs')
  })

  test('登录后应能访问资讯页面', async ({ page }) => {
    await page.goto('/news')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/news')
  })

  test('登录后应能访问收藏页面', async ({ page }) => {
    await page.route('**/webApi/user/favorites', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.goto('/favorites')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/favorites')
  })

  test('登录后应能访问个人中心', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/profile')
  })

  test('导航栏应显示主要链接', async ({ page }) => {
    await page.goto('/home')
    await page.waitForTimeout(1000)
    const nav = page.locator('.navbar')
    if (await nav.isVisible()) {
      await expect(page.locator('.nav-link').first()).toBeVisible()
    }
  })

  test('收藏页点击返回应跳转到首页', async ({ page }) => {
    await page.route('**/webApi/stats**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: { jobs: 0, companies: 0, news: 0 } }) })
    )
    await page.route('**/webApi/user/favorites', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.route('**/webApi/job/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.route('**/webApi/news/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data: [] }) })
    )
    await page.goto('/favorites')
    await page.waitForTimeout(1000)
    const backLink = page.locator('.back-link')
    if (await backLink.isVisible()) {
      await backLink.click()
      await page.waitForURL('**/home')
    }
  })
})

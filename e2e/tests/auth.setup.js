import { test as setup } from '@playwright/test'

const authFile = 'tests/.auth/user.json'

setup('save auth state', async ({ page }) => {
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.setItem('userInfo', JSON.stringify({
      token: 'mock-jwt-token',
      id: 1,
      username: 'testuser',
      role: 0,
      real_name: '测试用户',
    }))
  })
  await page.context().storageState({ path: authFile })
})

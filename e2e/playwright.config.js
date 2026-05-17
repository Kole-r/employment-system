import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'cd ../server && npm start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 10000,
    },
    {
      command: 'cd ../client && npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 10000,
    },
  ],
})

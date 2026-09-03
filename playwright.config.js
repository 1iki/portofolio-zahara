import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite --port=3000 --host=127.0.0.1',
    port: 3000,
    reuseExistingServer: true,
    timeout: 30000,
  },
});

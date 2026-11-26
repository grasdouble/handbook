import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: 'e2e',
  use: { ...devices['Desktop Chrome'], baseURL, locale: 'en-US', trace: 'retain-on-failure' },
  webServer: { command: 'pnpm preview', url: baseURL, reuseExistingServer: !process.env.CI },
});

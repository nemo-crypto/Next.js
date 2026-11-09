import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    workers: 1,
    timeout: 45_000,
    use: { baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3100', trace: 'retain-on-failure' },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: process.env.E2E_BASE_URL ? undefined : [
        { command: 'node scripts/mock-backend.mjs', url: 'http://127.0.0.1:9099', reuseExistingServer: false },
        { command: 'pnpm exec next start -H 127.0.0.1 -p 3100', url: 'http://127.0.0.1:3100', timeout: 60_000, reuseExistingServer: false,
            env: { API_URL: 'http://127.0.0.1:9099/', API_FUTURES: 'http://127.0.0.1:9099/' } },
    ],
});

const { defineConfig, devices } = require('@playwright/test');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const executablePath = process.env.GITHUB_ACTIONS === 'true' ? undefined : process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
module.exports = defineConfig({
  testDir: '../tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 15000 },
  outputDir: path.join(root, 'reports/playwright-production/test-results'),
  reporter: [
    ['list'],
    ['json', { outputFile: path.join(root, 'reports/playwright-production/results.json') }],
    ['junit', { outputFile: path.join(root, 'reports/playwright-production/junit.xml') }],
    ['html', { outputFolder: path.join(root, 'reports/playwright-production/html'), open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3215',
    serviceWorkers: 'block',
    reducedMotion: 'no-preference',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure', // Passing UI screenshots are attached by fixtures.cjs (V1104).
    launchOptions: { ...(executablePath ? { executablePath } : {}), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-touch', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
  ],
  webServer: {
    cwd: root,
    command: `"${process.execPath}" "${path.join(__dirname, '../node_modules/next/dist/bin/next')}" start --hostname 127.0.0.1 --port 3215`,
    url: 'http://127.0.0.1:3215',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
      // Synthetic credentials: no production account or external devices involved.
      SPOTIFY_CLIENT_ID: 'playwright-local-client', SPOTIFY_CLIENT_SECRET: 'playwright-local-secret',
      SPOTIFY_REDIRECT_URI: 'http://127.0.0.1:3215/api/spotify/callback',
      SESSION_SECRET: 'playwright-local-session-secret-00000000000000000000000000000000',
    },
  },
});

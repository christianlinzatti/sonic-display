const { test: base, expect } = require('@playwright/test');
const test = base.extend({
  runtimeGuard: [async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().includes('/_next/static/') && response.status() >= 400)
        errors.push(`Chunk HTTP ${response.status()}: ${response.url()}`);
    });
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1' || ['data:', 'blob:'].includes(url.protocol)) return route.continue();
      errors.push(`Unexpected external browser request: ${url.origin}`);
      return route.abort();
    });
    await use();
    expect(errors, 'No runtime errors, missing chunks or external requests').toEqual([]);
  }, { auto: true }],
});
// V1104: Attach a real screenshot of every visited local UI after each test.
// API-only tests never navigate, so they do not create misleading blank images.
test.afterEach(async ({ page }, testInfo) => {
  if (page.isClosed() || !/^http:\/\/127\.0\.0\.1:3215(?:\/|$)/.test(page.url())) return;
  const body = await page.screenshot({ type: 'jpeg', quality: 72, fullPage: true,
    animations: 'disabled', timeout: 15000 });
  await testInfo.attach('v1104-ui-screenshot', { body, contentType: 'image/jpeg' });
});
async function openSettings(page, section) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SONIC DISPLAY', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '⚙ Settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Sonic Display Einstellungen' });
  await expect(dialog).toBeVisible();
  if (section) await dialog.locator(`[data-v571-tab="${section}"]`).click();
  return dialog;
}
module.exports = { test, expect, openSettings };

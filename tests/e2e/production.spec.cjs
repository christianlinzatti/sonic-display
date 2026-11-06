const { test, expect } = require('./fixtures.cjs');
const fs = require('node:fs');

async function home(page) {
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'SONIC DISPLAY', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'CONNECT SPOTIFY' })).toHaveAttribute('href', '/api/spotify/login');
}

test('production HTML, hydration, CSS and emitted JS load after reload', async ({ page }) => {
  await home(page);
  await expect(page).toHaveTitle('Sonic Display');
  expect(await page.locator('html').getAttribute('lang')).toBe('de');
  const scripts = await page.locator('script[src*="/_next/static/"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src')));
  expect(scripts.length).toBeGreaterThan(0);
  const css = page.locator('link[rel="stylesheet"][href*="/_next/static/"]');
  expect(await css.count()).toBeGreaterThan(0);
  expect(await css.first().evaluate(node => Boolean(node.sheet))).toBe(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'SONIC DISPLAY', exact: true })).toBeVisible();
});

test('lazy settings hydrate and can be opened, closed and reopened', async ({ page }) => {
  await home(page);
  const trigger = page.getByRole('button', { name: '⚙ Settings', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Sonic Display Einstellungen' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click();
  await expect(dialog).toBeHidden();
  await trigger.click();
  await expect(dialog).toBeVisible();
});

test('acceptance form saves actual input across reload and exports JSON', async ({ page }) => {
  await page.goto('/acceptance');
  await expect(page.getByRole('heading', { name: /Concert Acceptance Dashboard/ })).toBeVisible();
  await page.getByLabel('Prüfende Person', { exact: true }).fill('Playwright production');
  await page.getByLabel('Gerät / GPU / Display', { exact: true }).fill('CI Chromium');
  await page.getByLabel('Browser und Version', { exact: true }).fill('Chromium production smoke');
  await page.getByRole('button', { name: 'Lokal speichern', exact: true }).click();
  await expect(page.getByText('Prüfliste lokal im Browser gespeichert.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Prüfende Person', { exact: true })).toHaveValue('Playwright production');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'review.json exportieren', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('review.json');
  const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  expect(exported.reviewer).toBe('Playwright production');
  expect(exported.scenarios).toHaveLength(6);
  await page.getByRole('link', { name: '← Sonic Display', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'SONIC DISPLAY', exact: true })).toBeVisible();
});

test('real unauthenticated Spotify API rejects missing sessions', async ({ request }) => {
  const response = await request.get('/api/spotify/current');
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ connected: false, reauthRequired: true });
});

test('PWA manifest and each declared icon are served by the production server', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.name).toBe('Sonic Display');
  expect(manifest.start_url).toBe('/');
  expect(manifest.icons.length).toBeGreaterThan(0);
  for (const icon of manifest.icons) {
    expect(icon.src.startsWith('/')).toBe(true);
    const asset = await request.get(icon.src);
    expect(asset.status(), icon.src).toBe(200);
    expect(asset.headers()['content-type']).toMatch(/^image\//);
  }
});

test('unknown route returns a real 404', async ({ request }) => {
  const response = await request.get('/playwright-route-that-does-not-exist');
  expect(response.status()).toBe(404);
});

const { test, expect, openSettings } = require('./fixtures.cjs');
const REVIEW_KEY = 'sonic.v697.acceptance.manual-review.v1';

test('settings search handles no matches and restores categories when cleared', async ({ page }) => {
  const dialog = await openSettings(page);
  const search = dialog.getByRole('searchbox', { name: 'Einstellungen suchen' });
  await search.fill('zzzz-no-such-category');
  await expect(dialog.getByText(/Keine passende Kategorie/)).toBeVisible();
  await expect(dialog.locator('[data-v571-tab]')).toHaveCount(0);
  await search.fill('Avatar');
  await expect(dialog.locator('[data-v571-tab="avatar"]')).toBeVisible();
  await search.fill('');
  expect(await dialog.locator('[data-v571-tab]').count()).toBeGreaterThan(3);
});

test('Escape closes settings and returns keyboard focus to the trigger', async ({ page }) => {
  const dialog = await openSettings(page);
  await expect(dialog.getByRole('searchbox', { name: 'Einstellungen suchen' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: '⚙ Settings', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
});

test('invalid review import keeps unsaved form input', async ({ page }) => {
  await page.goto('/acceptance');
  await page.getByLabel('Prüfende Person', { exact: true }).fill('Preserved input');
  await page.getByLabel('review.json importieren', { exact: true }).setInputFiles({
    name: 'invalid-review.json', mimeType: 'application/json', buffer: Buffer.from('{"wrong":"format"}'),
  });
  await expect(page.getByText('V696-Prüfblatt nicht kompatibel. Bestehende Eingaben bleiben erhalten.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Prüfende Person', { exact: true })).toHaveValue('Preserved input');
});

test('corrupted local review is reported and preserved until explicit replacement', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, 'broken-json'), REVIEW_KEY);
  await page.goto('/acceptance');
  await expect(page.getByText(/Browser-Speicherung ist nicht lesbar/)).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), REVIEW_KEY)).toBe('broken-json');
  await expect(page.getByLabel('Prüfende Person', { exact: true })).toBeEditable();
});

test('review deletion accepts explicit confirmation and clears saved fields', async ({ page }) => {
  await page.goto('/acceptance');
  await page.getByLabel('Prüfende Person', { exact: true }).fill('Test reviewer');
  await page.getByLabel('Gerät / GPU / Display', { exact: true }).fill('Chromium CI');
  await page.getByLabel('Browser und Version', { exact: true }).fill('Production browser');
  await page.getByRole('button', { name: 'Lokal speichern', exact: true }).click();
  await expect(page.getByText('Prüfliste lokal im Browser gespeichert.', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Prüfliste löschen', exact: true }).click();
  await expect(page.getByText('Lokale Prüfliste gelöscht.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), REVIEW_KEY)).toBeNull();
  await page.reload();
  await expect(page.getByLabel('Prüfende Person', { exact: true })).toHaveValue('');
});

test('tampered Spotify session cookie stays unauthenticated', async ({ request }) => {
  const response = await request.get('/api/spotify/current', { headers: { Cookie: 'sonic_session=not-a-valid-session' } });
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ connected: false, reauthRequired: true });
});

test('admin login rejects a foreign Origin before processing credentials', async ({ request }) => {
  const response = await request.post('/api/admin', { headers: { Origin: 'https://untrusted.invalid' }, data: { password: 'invalid-test-password' } });
  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({ error: 'Origin mismatch' });
});

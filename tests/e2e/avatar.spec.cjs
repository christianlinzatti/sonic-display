const { test, expect, openSettings } = require('./fixtures.cjs');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { REFERENCE_AVATAR_NAME } = require('../../scripts/playwright-production.cjs');
const AVATAR_LABEL = REFERENCE_AVATAR_NAME.replace('.glb', '');
const PREFS = 'sonic-display-ui-preferences-v1';

async function selectReference(page, request) {
  const catalog = await request.get('/api/avatars');
  expect(catalog.status()).toBe(200);
  const entry = (await catalog.json()).models.find(model => model.id === `local:${REFERENCE_AVATAR_NAME}`);
  expect(entry).toMatchObject({ url: `/avatars/${REFERENCE_AVATAR_NAME}` });
  const response = await request.get(entry.url);
  expect(response.status()).toBe(200);
  const bytes = await response.body();
  const source = fs.readFileSync(path.join(__dirname, '../../public/benchmark/v777-reference-performer.glb'));
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(createHash('sha256').update(source).digest('hex'));
  expect(bytes.toString('ascii', 0, 4)).toBe('glTF');
  const dialog = await openSettings(page, 'avatar');
  const loaded = page.waitForResponse(r => new URL(r.url()).pathname === entry.url && r.status() === 200);
  await dialog.getByRole('button', { name: new RegExp(AVATAR_LABEL) }).click();
  await loaded;
  await expect(dialog.locator('.settings-avatar-preview').getByRole('heading', { name: AVATAR_LABEL, exact: true })).toBeVisible();
  return dialog;
}

async function renderedAvatar(canvas, page, testInfo, name) {
  await expect(canvas).toBeVisible();
  await expect.poll(() => canvas.evaluate(c => c.width * c.height)).toBeGreaterThan(100);
  // Decode the actual compositor screenshot, not a test canvas or a fabricated render flag.
  let screenshot;
  await expect.poll(async () => {
    screenshot = await canvas.screenshot();
    return page.evaluate(async data => {
      const img = new Image(); img.src = data; await img.decode();
      const target = document.createElement('canvas'); target.width = img.width; target.height = img.height;
      const ctx = target.getContext('2d'); ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      const colors = new Set();
      for (let i = 0; i < pixels.length; i += 16) colors.add(`${pixels[i] >> 4},${pixels[i+1] >> 4},${pixels[i+2] >> 4}`);
      return colors.size;
    }, `data:image/png;base64,${screenshot.toString('base64')}`);
  }, { timeout: 30000, message: 'Avatar must visibly render in a real WebGL canvas' }).toBeGreaterThan(8);
  await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
}

test('built-in procedural avatar renders and preview play/pause and speed work', async ({ page }, testInfo) => {
  const dialog = await openSettings(page, 'avatar');
  const preview = dialog.locator('.settings-avatar-preview');
  await expect(preview.getByRole('heading', { name: 'Procedural', exact: true })).toBeVisible();
  await renderedAvatar(preview.locator('canvas'), page, testInfo, 'procedural-avatar');
  await preview.getByRole('button', { name: '▶ Tanz testen', exact: true }).click();
  await expect(preview.getByRole('button', { name: '⏸ Tanz pausieren', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await preview.getByLabel('Vorschau-Tempo').selectOption('0.5');
  await expect(preview.getByLabel('Vorschau-Tempo')).toHaveValue('0.5');
  await preview.getByRole('button', { name: '⏸ Tanz pausieren', exact: true }).click();
  await expect(preview.getByRole('button', { name: '▶ Tanz testen', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('real reference GLB loads, embedded animation scrubs and selection survives reload', async ({ page, request }, testInfo) => {
  let dialog = await selectReference(page, request);
  const studio = dialog.getByRole('group', { name: 'Dance Studio · Animation Timeline V93', exact: true });
  const animation = studio.getByRole('combobox', { name: 'Animation', exact: true });
  await expect(animation).toBeEnabled();
  expect(await animation.locator('option').count()).toBeGreaterThan(0);
  const scrubber = studio.getByLabel('Animation scrubben');
  await expect(scrubber).toBeEnabled();
  await scrubber.focus(); await scrubber.press('End');
  expect(Number(await scrubber.inputValue())).toBeGreaterThan(0);
  await scrubber.press('Home');
  await expect(scrubber).toHaveValue('0');
  const canvas = studio.locator('canvas');
  await renderedAvatar(canvas, page, testInfo, 'loaded-reference-glb');
  await studio.getByRole('button', { name: '▶ Tanz testen', exact: true }).click();
  await expect.poll(async () => Number(await scrubber.inputValue()), { timeout: 15000 }).toBeGreaterThan(0.02);
  await studio.getByRole('button', { name: '⏸ Tanz pausieren', exact: true }).click();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)).avatarModelId, PREFS)).toBe(`local:${REFERENCE_AVATAR_NAME}`);
  dialog = await openSettings(page, 'avatar');
  await expect(dialog.getByRole('button', { name: new RegExp(AVATAR_LABEL) })).toHaveAttribute('aria-pressed', 'true');
  await renderedAvatar(dialog.locator('.settings-avatar-preview canvas'), page, testInfo, 'reference-after-reload');
});

test('avatar library filter finds GLB and switching back to Procedural persists', async ({ page, request }) => {
  const dialog = await selectReference(page, request);
  await dialog.getByLabel('Modelle filtern', { exact: true }).fill(AVATAR_LABEL);
  await expect(dialog.locator('.avatar-card')).toHaveCount(1);
  await dialog.getByLabel('Modelle filtern', { exact: true }).fill('');
  await dialog.getByRole('button', { name: /^Procedural/ }).click();
  await expect(dialog.locator('.settings-avatar-preview').getByRole('heading', { name: 'Procedural', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)).avatarModelId, PREFS)).toBe('procedural');
});

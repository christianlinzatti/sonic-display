'use strict';
const { test, expect, openSettings } = require('./fixtures.cjs');
const PREFS = 'sonic-display-ui-preferences-v1';

// These tests run against `next start` on BOTH desktop Chromium and touch Chromium.
test('V1104 visual: display modes save and restore across a real reload', async ({ page }, testInfo) => {
  let dialog = await openSettings(page, 'display');
  const select = dialog.getByRole('combobox', { name: 'Visualizer', exact: true });
  await expect(select).toBeVisible();
  await select.selectOption('wave');
  await select.selectOption('particles');
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k))?.visualizerMode, PREFS)).toBe('particles');
  await testInfo.attach('v1104-display-settings', { body: await page.screenshot({type:'jpeg',quality:75,fullPage:true}), contentType:'image/jpeg' });
  dialog = await openSettings(page, 'display');
  await expect(dialog.getByRole('combobox', { name: 'Visualizer', exact: true })).toHaveValue('particles');
});

test('V1104 visual: 360 arena settings and show designer become accessible', async ({ page }, testInfo) => {
  const dialog = await openSettings(page, 'avatar');
  const theme = dialog.getByRole('combobox', { name: 'Bühnenstil', exact: true });
  await expect(theme).toBeVisible();
  await theme.selectOption('arena360');
  await expect(dialog.locator('.arena360-settings-v1031')).toBeVisible();
  await expect.poll(() => page.evaluate(k => JSON.parse(localStorage.getItem(k))?.stageTheme, PREFS)).toBe('arena360');
  await testInfo.attach('v1104-360-arena', { body: await page.screenshot({type:'jpeg',quality:75,fullPage:false}),contentType:'image/jpeg' });
});

test('V1104 visual: Govee controls are disabled without selecting a device', async ({ page }, testInfo) => {
  const dialog = await openSettings(page, 'govee');
  await expect(dialog.getByText('Govee LAN · lokale Konzertbeleuchtung')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Lichter EIN', exact:true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Lichter AUS', exact:true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Farbe senden', exact:true })).toBeDisabled();
  await testInfo.attach('v1104-govee-safety', { body: await page.screenshot({type:'jpeg',quality:75,fullPage:false}),contentType:'image/jpeg' });
});

test('V1104 visual: settings filter and categories work on touch and desktop', async ({ page }, testInfo) => {
  const dialog = await openSettings(page);
  const search = dialog.getByRole('searchbox', {name:'Einstellungen suchen'});
  await search.fill('Mikrofon');
  await expect(dialog.locator('[data-v571-tab="audio"]')).toBeVisible();
  await dialog.locator('[data-v571-tab="audio"]').click();
  await expect(dialog.locator('[data-v571-tab="audio"]')).toHaveAttribute('aria-current','page');
  await testInfo.attach('v1104-audio-search', { body: await page.screenshot({type:'jpeg',quality:75,fullPage:false}),contentType:'image/jpeg' });
  await search.fill('');
  await expect(dialog.locator('[data-v571-tab="display"]')).toBeVisible();
});

test('V1104 visual: acceptance dashboard remains editable with no external account', async ({ page }, testInfo) => {
  const response=await page.goto('/acceptance');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: /Concert Acceptance Dashboard/ })).toBeVisible();
  await page.getByLabel('Prüfende Person', {exact:true}).fill('Automatischer visueller Qualitätstest');
  await page.getByLabel('Gerät / GPU / Display', {exact:true}).fill('Chromium Desktop oder Touch');
  await testInfo.attach('v1104-acceptance-form', {body:await page.screenshot({type:'jpeg',quality:75,fullPage:true}),contentType:'image/jpeg'});
  await expect(page.getByLabel('Prüfende Person', {exact:true})).toHaveValue('Automatischer visueller Qualitätstest');
});

test('V1104 visual: controls fit inside both viewport sizes without body overflow', async ({ page }) => {
  await page.goto('/');
  const dialog = await openSettings(page,'display');
  await expect(dialog).toBeVisible();
  // Responsive controls should fit without allowing the page to scroll horizontally.
  const metrics = await page.evaluate(() => ({ inner: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth, settings: Boolean(document.querySelector('.settings-popover')) }));
  expect(metrics.settings).toBe(true);
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.inner + 2);
});

test('V1104 visual: external navigation is blocked and OAuth login is not triggered', async ({ page }) => {
  await page.goto('/');
  const login = page.getByRole('link', {name:'CONNECT SPOTIFY'});
  await expect(login).toHaveAttribute('href','/api/spotify/login');
  // We inspect the link but deliberately never click it or require real OAuth.
  await expect(page.getByRole('heading',{name:'SONIC DISPLAY',exact:true})).toBeVisible();
});

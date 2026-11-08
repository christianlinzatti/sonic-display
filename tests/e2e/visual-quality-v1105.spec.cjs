'use strict';
const { test, expect, openSettings } = require('./fixtures.cjs');
const {comparePngV1105} = require('../../lib/visualPngDiffV1105.cjs');
// Each quality scenario attaches a fresh PNG in its JSON reporter entry.
async function attachAuditScreenshot(page,testInfo,scenario){
  const png=await page.screenshot({type:'png',animations:'disabled',fullPage:false,timeout:15000});
  await testInfo.attach('v1105-'+scenario+'-screenshot',{body:png,contentType:'image/png'});
}

// Executed in BOTH Chromium Desktop and Chromium Touch against the built Next.js server.
// No external accounts, Spotify OAuth, LEDs or changes to real Govee devices.
test('V1105 visual: stable heading screenshot before and after reload', async ({page}, testInfo) => {
  await page.goto('/');
  const heading=page.getByRole('heading',{name:'SONIC DISPLAY',exact:true});
  await expect(heading).toBeVisible();
  const options={type:'png',animations:'disabled',caret:'hide',timeout:15000};
  const before=await heading.screenshot(options);
  await testInfo.attach('v1105-heading-before-screenshot',{body:before,contentType:'image/png'});
  await page.reload();
  await expect(heading).toBeVisible();
  const after=await heading.screenshot(options);
  await testInfo.attach('v1105-heading-after-screenshot',{body:after,contentType:'image/png'});
  const compared=comparePngV1105(before,after,{maxDifferentRatio:0.07,channelTolerance:14});
  await testInfo.attach('v1105-visual-diff',{body:Buffer.from(JSON.stringify(compared,null,2)),contentType:'application/json'});
  expect(compared.passed,`Unstable header pixels after reload: ${JSON.stringify(compared)}`).toBe(true);
});

test('V1105 visual: settings dialog stays inside viewport on desktop and touch', async ({page},testInfo) => {
  const dialog=await openSettings(page,'display');
  const search=dialog.getByRole('searchbox',{name:'Einstellungen suchen'});
  await expect(search).toBeVisible();
  const measurements=await page.evaluate(() => {
    const element=document.querySelector('[role="dialog"][aria-label="Sonic Display Einstellungen"]');
    const rect=element?.getBoundingClientRect();
    const input=element?.querySelector('input[type="search"]');
    return {viewportWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
      dialogLeft:rect?.left??NaN,dialogRight:rect?.right??NaN,dialogWidth:rect?.width??NaN,
      searchVisible:!!input&&input.getBoundingClientRect().width>4,
      headingVisible:!!element?.querySelector('h2,h3')};
  });
  const overflow=Math.max(0,measurements.scrollWidth-measurements.viewportWidth);
  expect(overflow,'No horizontal document overflow').toBeLessThanOrEqual(2);
  expect(measurements.dialogLeft).toBeGreaterThanOrEqual(-2);
  expect(measurements.dialogRight).toBeLessThanOrEqual(measurements.viewportWidth+2);
  expect(measurements.searchVisible).toBe(true);
  expect(measurements.headingVisible).toBe(true);
  await testInfo.attach('v1105-viewport-metrics',{body:Buffer.from(JSON.stringify(measurements)),contentType:'application/json'});
  await testInfo.attach('v1105-responsive-screenshot',{body:await page.screenshot({type:'png',animations:'disabled',fullPage:false}),contentType:'image/png'});
});

test('V1105 visual: keyboard can close settings and focus returns safely', async ({page},testInfo) => {
  const dialog=await openSettings(page);
  await expect(dialog.getByRole('searchbox',{name:'Einstellungen suchen'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  const trigger=page.getByRole('button',{name:'⚙ Settings',exact:true});
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await attachAuditScreenshot(page,testInfo,'keyboard-focus');
});

test('V1105 visual: settings categories are operable without a mouse', async ({page},testInfo) => {
  const dialog=await openSettings(page);
  const display=dialog.locator('[data-v571-tab="display"]');
  await display.focus();
  await expect(display).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(display).toHaveAttribute('aria-current','page');
  await expect(dialog.getByRole('combobox',{name:'Visualizer',exact:true})).toBeVisible();
  await attachAuditScreenshot(page,testInfo,'keyboard-categories');
});

test('V1105 visual: reduced motion preference keeps readable UI usable', async ({page},testInfo) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  const dialog=await openSettings(page,'display');
  await expect(dialog.getByRole('combobox',{name:'Visualizer',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await expect(dialog.locator('[data-v571-tab="display"]')).toHaveAttribute('aria-current','page');
  await attachAuditScreenshot(page,testInfo,'reduced-motion');
});

test('V1105 visual: unauthenticated Govee commands remain unavailable', async ({page},testInfo) => {
  const dialog=await openSettings(page,'govee');
  for(const name of ['Lichter EIN','Lichter AUS','Farbe senden'])
    await expect(dialog.getByRole('button',{name,exact:true})).toBeDisabled();
  await expect(dialog.getByText('Govee LAN · lokale Konzertbeleuchtung')).toBeVisible();
  await attachAuditScreenshot(page,testInfo,'unauthenticated-govee');
});

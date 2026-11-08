const { test, expect, openSettings } = require('./fixtures.cjs');
const CREW = [
  { id: 'sonic-neon-pulse', label: 'Neon Pulse', slug: 'neon-pulse', preset: 'techno' },
  { id: 'sonic-festival-nova', label: 'Festival Nova', slug: 'festival-nova', preset: 'freestyle' },
  { id: 'sonic-chrome-beat', label: 'Chrome Beat', slug: 'chrome-beat', preset: 'robot' },
];
const CLIPS = ['Dance_Groove','Dance_Techno','Idle_Breathe','Dance_House','Dance_HipHop','Dance_Disco','Dance_Shuffle','Dance_Robot','Dance_FestivalBounce','Gesture_Wave'];
const PREFS = 'sonic-display-ui-preferences-v1';
test('stage crew catalog serves local models and original previews once each', async ({ request }) => {
  const response = await request.get('/api/avatars'); expect(response.status()).toBe(200);
  const catalog = await response.json();
  for (const crew of CREW) {
    const all = [...catalog.defaults, ...catalog.models];
    expect(all.filter(m => m.url === `/avatars/sonic/${crew.slug}.glb`)).toHaveLength(1);
    const model = all.find(m => m.id === crew.id);
    expect(model).toMatchObject({ label: crew.label, category: 'Sonic Stage Crew', defaultDancePreset: crew.preset });
    expect(model.genre.length).toBeGreaterThan(0); expect(model.tags).toContain('12 Animationen');
    const asset = await request.get(model.url); expect(asset.status()).toBe(200);
    expect((await asset.body()).toString('ascii',0,4)).toBe('glTF');
    const preview = await request.get(model.preview); expect(preview.status()).toBe(200);
    expect(preview.headers()['content-type']).toContain('image/png');
  }
});
for (const crew of CREW) test(`${crew.label}: gallery, all clips, visible animation and saved selection`, async ({ page }, testInfo) => {
  test.setTimeout(180000);
  let dialog = await openSettings(page, 'avatar');
  await dialog.getByLabel('Modelle filtern', { exact: true }).fill(crew.label);
  const card = dialog.locator('.avatar-card'); await expect(card).toHaveCount(1);
  await expect(card.locator('img')).toBeVisible();
  expect(await card.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await card.click(); await expect(card).toHaveAttribute('aria-pressed','true');
  await expect(dialog.locator('.settings-avatar-preview').getByRole('heading', { name: crew.label, exact: true })).toBeVisible();
  const studio = dialog.getByRole('group', { name: 'Dance Studio · Animation Timeline V93', exact: true });
  const animation = studio.getByRole('combobox', { name: 'Animation', exact: true });
  await expect(animation).toBeEnabled(); await expect(animation.locator('option')).toHaveCount(12);
  const signatures = { 'neon-pulse': ['Dance_NeonCircuit','Dance_LaserStep'], 'festival-nova': ['Dance_FestivalFlow','Dance_DiscoStar'], 'chrome-beat': ['Dance_PopLock','Dance_Clockwork'] };
  const expectedClips = [...CLIPS, ...signatures[crew.slug]];
  expect((await animation.locator('option').allTextContents()).map(text => text.replace(/ \(.*$/, ''))).toEqual(expectedClips);
  for (const name of signatures[crew.slug]) await expect(animation.locator('option').filter({ hasText: name })).toContainText(name === 'Dance_Clockwork' ? '16.0 s' : '12.0 s');
  const scrubber = studio.getByLabel('Animation scrubben');
  for (let i=0;i<expectedClips.length;i++) {
    await animation.selectOption(`embedded:${i}`);
    await expect(animation).toHaveValue(`embedded:${i}`);
    await scrubber.focus(); await scrubber.press('Home');
    await scrubber.press('ArrowRight'); expect(Number(await scrubber.inputValue())).toBeGreaterThan(0);
  }
  await animation.selectOption('embedded:1');
  const canvas = studio.locator('canvas'); await expect(canvas).toBeVisible(); await canvas.scrollIntoViewIfNeeded();
  await scrubber.focus(); await scrubber.press('Home');
  // Compare two compositor captures at different scrub times, without a running clock.
  const before = await canvas.screenshot();
  await scrubber.press('PageUp'); await scrubber.press('PageUp'); await scrubber.press('PageUp');
  await expect.poll(async () => !(await canvas.screenshot()).equals(before), { timeout: 15000 }).toBe(true);
  await testInfo.attach(crew.slug, { body: await canvas.screenshot(), contentType: 'image/png' });
  await studio.getByRole('button', { name: '▶ Tanz testen', exact: true }).click();
  const at = Number(await scrubber.inputValue());
  await expect.poll(async () => Number(await scrubber.inputValue())).not.toBe(at);
  await studio.getByRole('button', { name: '⏸ Tanz pausieren', exact: true }).click();
  const detail = studio.getByLabel('Avatar-Detailansicht');
  const positionBefore = Number(await scrubber.inputValue());
  await detail.selectOption('portrait');
  await expect(detail).toHaveValue('portrait');
  await expect.poll(async () => (await studio.locator('canvas').boundingBox()).height).toBeGreaterThanOrEqual(240);
  await testInfo.attach(`${crew.slug}-face`, { body: await studio.locator('canvas').screenshot(), contentType: 'image/png' });
  expect(Math.abs(Number(await scrubber.inputValue())-positionBefore)).toBeLessThan(.15);
  await detail.selectOption('upper');
  await testInfo.attach(`${crew.slug}-hands`, { body: await studio.locator('canvas').screenshot(), contentType: 'image/png' });
  await studio.getByRole('button', { name: 'Ansicht zurücksetzen', exact: true }).click();
  await expect(detail).toHaveValue('full');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)).avatarModelId, PREFS)).toBe(crew.id);
  dialog = await openSettings(page,'avatar');
  await expect(dialog.getByRole('button', { name: new RegExp(crew.label) })).toHaveAttribute('aria-pressed','true');
});

test('playing signature changes and rapid switches keep the studio running; fine scrubbing stays exact', async ({ page }, testInfo) => {
  test.setTimeout(120000);
  const dialog = await openSettings(page,'avatar');
  await dialog.getByRole('button', { name: /^Neon Pulse/ }).click();
  const studio=dialog.getByRole('group', { name: 'Dance Studio · Animation Timeline V93', exact: true });
  const animation=studio.getByRole('combobox', { name:'Animation', exact:true });
  await expect(animation.locator('option')).toHaveCount(12);
  await studio.getByRole('button',{ name:'▶ Tanz testen',exact:true }).click();
  await animation.selectOption('embedded:10');
  await animation.selectOption('embedded:11');
  await animation.selectOption('embedded:5');
  await expect(studio.getByRole('button',{ name:'⏸ Tanz pausieren',exact:true })).toHaveAttribute('aria-pressed','true');
  const scrubber=studio.getByLabel('Animation scrubben');
  await expect.poll(async()=>Number(await scrubber.inputValue())).toBeGreaterThan(.05);
  await testInfo.attach('signature-transition', { body:await studio.locator('canvas').screenshot(), contentType:'image/png' });
  await studio.getByRole('button',{ name:'⏸ Tanz pausieren',exact:true }).click();
  await animation.selectOption('embedded:1');
  await scrubber.focus();await scrubber.press('Home');await scrubber.press('ArrowRight');
  await expect(scrubber).toHaveValue('0.01');
  // Wait for the rendered preview's position report, which used to overwrite small seeks.
  await expect.poll(async()=>{
    await studio.locator('canvas').screenshot();
    return scrubber.inputValue();
  }).toBe('0.01');
});

test('reduced-motion preferences keep clip changes paused', async ({ page }) => {
  await page.addInitScript(key=>localStorage.setItem(key,JSON.stringify({reducedMotion:true,avatarModelId:'sonic-neon-pulse'})),PREFS);
  const dialog=await openSettings(page,'avatar');
  const studio=dialog.getByRole('group',{name:'Dance Studio · Animation Timeline V93',exact:true});
  const animation=studio.getByRole('combobox',{name:'Animation',exact:true});
  await expect(animation.locator('option')).toHaveCount(12);
  await animation.selectOption('embedded:10');
  await expect(studio.getByRole('button',{name:'▶ Tanz testen',exact:true})).toBeDisabled();
  await expect(studio.getByLabel('Animation scrubben')).toHaveValue('0');
});

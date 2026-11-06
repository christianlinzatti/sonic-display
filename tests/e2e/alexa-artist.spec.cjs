const { test, expect, openSettings } = require('./fixtures.cjs');
const KEY = 'sonic-display:alexa-artist-follow-v1007';

test('Alexa artist permission is separate, defaults off and persists on this display', async ({ page }) => {
  let dialog = await openSettings(page, 'govee');
  const group = dialog.getByRole('group', { name: 'Alexa Spotify-Künstler', exact: true });
  const permission = group.getByRole('checkbox', { name: 'Künstler auf Spotify per Alexa folgen und entfolgen erlauben', exact: true });
  await expect(permission).not.toBeChecked();
  await permission.check();
  await expect(permission).toBeChecked();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);
  expect(saved.enabled).toBe(true); expect(saved.since).toBeGreaterThan(0);
  // Artist permission does not silently enable general Alexa or any hardware sync.
  await expect(dialog.getByRole('checkbox', { name: 'Alexa-Befehle auf diesem Display empfangen (opt-in)', exact: true })).not.toBeChecked();
  dialog = await openSettings(page, 'govee');
  const persisted = dialog.getByRole('checkbox', { name: 'Künstler auf Spotify per Alexa folgen und entfolgen erlauben', exact: true });
  await expect(persisted).toBeChecked();
  await persisted.uncheck();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).enabled, KEY)).toBe(false);
});

test('artist follow API requires a Spotify session even with a valid same-origin voice request', async ({ request }) => {
  for (const follow of [true, false]) {
    const response = await request.post('/api/spotify/artists/follow', {
      headers: { Origin: 'http://127.0.0.1:3215' },
      data: { artistId: '2takcwOaAZWiXQijPHIx7B', follow },
    });
    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ code: 'reauth_required' });
  }
});

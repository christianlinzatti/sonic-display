const {test,expect}=require('./fixtures.cjs');
const PREFS='sonic-display-ui-preferences-v1';
test('display stays usable while Spotify and connection diagnostics do not respond',async({page})=>{
 const held=[];
 await page.route('**/api/spotify/current',route=>{held.push(route);});
 await page.route('**/api/alexa/status',route=>{held.push(route);});
 try{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Sonic Display Einstellungen'});await expect(dialog).toBeVisible();
  await dialog.locator('[data-v571-tab="govee"]').click();const tools=dialog.getByRole('group',{name:'Alexa Zusatzfunktionen',exact:true});
  await tools.getByRole('button',{name:'Alexa- und Spotify-Verbindung prüfen',exact:true}).click();
  await expect(tools.getByRole('button',{name:'Verbindung wird geprüft…',exact:true})).toBeDisabled();
  await tools.getByText('Anzeige lokal ausprobieren',{exact:true}).click();
  await tools.getByRole('button',{name:'Ruhige Darstellung',exact:true}).click();
  await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).reducedMotion,PREFS)).toBe(true);
  await tools.getByRole('button',{name:'Lyrics ausblenden',exact:true}).click();
  await expect.poll(()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)).lyricsVisible,PREFS)).toBe(false);
  await page.getByRole('button',{name:'Einstellungen schließen',exact:true}).click();await expect(dialog).not.toBeVisible();
  await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await expect(dialog).toBeVisible();
  await expect.poll(()=>held.length).toBeGreaterThanOrEqual(2);
 }finally{for(const route of held)await route.abort().catch(()=>{});}
});

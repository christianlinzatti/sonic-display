const {test,expect,openSettings}=require('./fixtures.cjs');
const PREFS='sonic-display-ui-preferences-v1';
const DISPLAY='sonic-display:alexa-display-v1008';
async function tools(page){const dialog=await openSettings(page,'govee');return dialog.getByRole('group',{name:'Alexa Zusatzfunktionen',exact:true});}
async function prefs(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),PREFS);}
test('voice display permission is separate and persists without enabling Alexa',async({page})=>{
 let panel=await tools(page);const toggle=panel.getByRole('checkbox',{name:'Anzeige per Alexa steuern erlauben',exact:true});await expect(toggle).not.toBeChecked();await toggle.check();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).enabled,DISPLAY)).toBe(true);
 await expect(page.getByRole('checkbox',{name:'Alexa-Befehle auf diesem Display empfangen (opt-in)',exact:true})).not.toBeChecked();
 panel=await tools(page);await expect(panel.getByRole('checkbox',{name:'Anzeige per Alexa steuern erlauben',exact:true})).toBeChecked();
});
test('local voice lyrics controls hide immersive lyrics too and survive reload',async({page})=>{
 let panel=await tools(page);await panel.getByText('Anzeige lokal ausprobieren',{exact:true}).click();
 await panel.getByRole('button',{name:'Lyrics ausblenden',exact:true}).click();
 await expect.poll(async()=>{const p=await prefs(page);return [p.lyricsVisible,p.lyricsImmersiveEnabled];}).toEqual([false,false]);
 panel=await tools(page);await panel.getByText('Anzeige lokal ausprobieren',{exact:true}).click();await panel.getByRole('button',{name:'Lyrics einblenden',exact:true}).click();
 await expect.poll(async()=>(await prefs(page)).lyricsVisible).toBe(true);
});
test('voice avatar cycling uses installed models and calm mode is reversible',async({page})=>{
 const panel=await tools(page);await panel.getByText('Anzeige lokal ausprobieren',{exact:true}).click();
 // The API catalog is authoritative: built-in Stage Crew characters are now ahead
 // of user-installed GLBs, so a hard-coded two-avatar order is no longer valid.
 const response=await page.request.get('/api/avatars');expect(response.ok()).toBe(true);
 const catalog=await response.json();
 const entries=[...(Array.isArray(catalog.defaults)?catalog.defaults:[]),...(Array.isArray(catalog.models)?catalog.models:[])];
 const models=Array.from(new Map(entries.filter(model=>model&&typeof model.id==='string'&&typeof model.label==='string'&&
   (model.id==='procedural'||(typeof model.url==='string'&&model.url.length>0))).map(model=>[model.id,model])).values());
 expect(models.some(model=>model.id==='sonic-neon-pulse')).toBe(true);
 expect(models.some(model=>model.id==='local:sonic-playwright-reference.glb')).toBe(true);
 const initial=(await prefs(page)).avatarModelId;
 const startIndex=models.findIndex(model=>model.id===initial);
 expect(startIndex).toBeGreaterThanOrEqual(0);
 for(let step=1;step<=models.length;step++){
  const expected=models[(startIndex+step)%models.length].id;
  await panel.getByRole('button',{name:'Avatar wechseln',exact:true}).click();
  await expect.poll(async()=>(await prefs(page)).avatarModelId).toBe(expected);
 }
 await expect.poll(async()=>(await prefs(page)).avatarModelId).toBe(initial);
 await panel.getByRole('button',{name:'Ruhige Darstellung',exact:true}).click();await expect.poll(async()=>(await prefs(page)).reducedMotion).toBe(true);
 await panel.getByRole('button',{name:'Normale Darstellung',exact:true}).click();await expect.poll(async()=>(await prefs(page)).reducedMotion).toBe(false);
});
test('connection diagnostics report a missing Spotify session honestly',async({page})=>{
 const panel=await tools(page);await panel.getByRole('button',{name:'Alexa- und Spotify-Verbindung prüfen',exact:true}).click();
 await expect(panel.getByText('Spotify: Anmeldung fehlt. Bitte neu verbinden.',{exact:true})).toBeVisible();
});
test('voice results and batch artist changes reject anonymous or foreign-origin writes',async({request})=>{
 const id='12345678-1234-1234-1234-123456789abc';
 for(const [url,data] of [['/api/alexa/voice-result',{id,phase:'claim'}],['/api/spotify/artists/follow-batch',{changes:[{artistId:'2takcwOaAZWiXQijPHIx7B',follow:true}]}]]){
  const unauth=await request.post(url,{headers:{Origin:'http://127.0.0.1:3215'},data});expect(unauth.status()).toBe(401);
  const foreign=await request.post(url,{headers:{Origin:'https://foreign.invalid'},data});expect(foreign.status()).toBe(403);
 }
 const status=await request.get('/api/alexa/status');expect(status.status()).toBe(401);
});

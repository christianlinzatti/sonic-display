const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test.use({actionTimeout:15000});
async function seed(page){await page.addInitScript(()=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,
  lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',reducedMotion:false,microphoneEnabled:false,
  geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-aurora-synth'}));
});}
test('mock Spotify → timed lyrics → live show: verse, hook, break, pause and missing lyrics',async({page},testInfo)=>{
 test.setTimeout(150000);const mock=await installConcertMocksV1130(page);await seed(page);await page.goto('/');
 await expect(page.getByRole('heading',{name:'Aurora Mock Concert',exact:true})).toBeVisible();
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});
 await expect(director).toHaveAttribute('data-show-act','story');
 await expect(page.locator('.lyric.active')).toContainText('Wir gehen weiter');
 await expect(page.locator('.lyric.active .kinetic-word').first()).toBeVisible();
 // Both provider calls are fulfilled by this fixture, without a Spotify session.
 expect(mock.calls.spotify).toBeGreaterThan(0);expect(mock.calls.lyrics).toBeGreaterThan(0);
 mock.setPlayback({position:32500});await page.reload();
 await expect(director).toHaveAttribute('data-show-act','lift');
 const statusBox=await page.locator('.show-v1130-status').boundingBox();expect(statusBox.y+statusBox.height).toBeLessThan(page.viewportSize().height-100);
 await expect(page.locator('.lyric.active')).toContainText('Ein Licht ein Beat');
 await expect(page.locator('.lyric.active')).toHaveAttribute('data-show-hook','true');
 await testInfo.attach('mocked-chorus-show',{body:await page.screenshot(),contentType:'image/png'});
 mock.setPlayback({position:47000});await page.reload();await expect(director).toHaveAttribute('data-show-act','breathe');
 mock.setPlayback({position:33000,playing:false});await page.reload();
 await expect(director).toContainText('PAUSE');await expect(director).not.toHaveClass(/show-v1130-moving/);
 mock.setPlayback({trackId:'MockWithoutLyrics1130A',missingLyrics:true,position:5000});await page.reload();
 await expect(page.getByRole('heading',{name:'Silent Mock Concert',exact:true})).toBeVisible();
 await expect(page.locator('.lyric.active')).toHaveCount(0);
 expect(mock.calls.lyrics).toBeGreaterThan(1);
});
test('all headliners load real clips in the intelligent rehearsal',async({page},testInfo)=>{
 test.setTimeout(150000);await installConcertMocksV1130(page);await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await expect(box.getByLabel('Figur 1').locator('option')).toHaveCount(11);
 // The accessible label may include extra descriptive text. Do not require an exact match.
 // Check that each headliner option is available before selecting it.
 for(const [slot,id] of ['sonic-atlas-prism','sonic-rio-carnival','sonic-quantum-bass'].entries()){
  const select=box.getByLabel(`Figur ${slot+1}`);
  await expect(select).toBeVisible();
  await expect(select.locator(`option[value="${id}"]`)).toHaveCount(1);
  await select.selectOption(id);
  await expect(select).toHaveValue(id);
 }
 // The 3D preview can reflow this settings group while models load.
 // Keyboard activation is a real accessible interaction, without force-click
 // or bypassing the button's handler/actionability.
 // Start from a disabled crew so Enter must actually change persisted
 // settings; merely focusing the button cannot satisfy the assertion.
 const crewEnabled=box.getByLabel('Musiksteuerung für Sonic Stage Crew');
 await crewEnabled.uncheck();
 await expect(crewEnabled).not.toBeChecked();
 const activate=box.getByRole('button',{name:'Intelligente Show aktivieren',exact:true});
 await expect(activate).toBeEnabled();
 await activate.focus();
 await activate.press('Enter');
 await expect.poll(()=>page.evaluate(()=>{
  const raw=localStorage.getItem('sonic-stage-crew-v4');
  return raw?JSON.parse(raw).enabled===true&&JSON.parse(raw).mode==='adaptive':false;
 })).toBe(true);
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 await box.getByLabel('Simulierter Abschnitt').selectOption('drop');
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=box.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect.poll(async()=>(await rows.allTextContents()).every(t=>t.includes('Dance_'))).toBe(true);
 await testInfo.attach('headliner-intelligent-drop',{body:await canvas.screenshot(),contentType:'image/png'});
});

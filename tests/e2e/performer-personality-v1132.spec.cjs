const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test.use({actionTimeout:15000});
test('expression persists and real mixed performers display their personalities and musical sequences',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:8000,playing:false});
 await page.addInitScript(()=>{
  if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',expression:'balanced'}));
  if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,
   lyricsStyle:'cinematic',microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',reducedMotion:false}));
 });
 await page.goto('/');await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 let box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await box.getByRole('combobox',{name:'Charakterausdruck',exact:true}).selectOption('bold');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).expression)).toBe('bold');
 for(const [slot,id] of ['sonic-neon-pulse','sonic-luna-flow','sonic-quantum-bass'].entries())await box.getByLabel(`Figur ${slot+1}`).selectOption(id);
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=box.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 // V1134 opens deliberately quietly. Seek to the verse before checking energetic sequences.
 const position=box.getByLabel('Simulierte Position');await position.focus();await position.press('Home');for(let i=0;i<8;i++)await position.press('ArrowRight');
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect(rows.nth(0)).toContainText('Präziser Taktgeber');await expect(rows.nth(1)).toContainText('Fließende Träumerin');await expect(rows.nth(2)).toContainText('Druckvoller Bass-Roboter');
 await expect.poll(async()=>(await rows.allTextContents()).every(s=>/Groove & Schritte|Kontrast & Akzent|Signatur & Antwort/.test(s))).toBe(true);
 await testInfo.attach('three-performer-personalities',{body:await canvas.screenshot(),contentType:'image/png'});
 await box.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await expect(box.getByRole('combobox',{name:'Charakterausdruck',exact:true})).toHaveValue('bold');
});

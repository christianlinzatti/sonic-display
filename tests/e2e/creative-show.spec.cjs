const {test,expect}=require('./fixtures.cjs');
const manifest=require('../../public/avatars/sonic/manifest.json');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test('creative direction develops real contrasting body motifs and reunites the crew on a drop',async({page},testInfo)=>{
 test.setTimeout(180000);
 await installConcertMocksV1130(page,{position:8000,playing:false,missingLyrics:true});
 await page.addInitScript(()=>{
  localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false}));
 });
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Silent Mock Concert',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Sonic Display Einstellungen'});
 await dialog.locator('[data-v571-tab="avatar"]').click();
 const crew=dialog.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await expect(crew).toContainText('Kreative Regie');
 await crew.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 await crew.getByLabel('Simulierter Abschnitt').selectOption('verse');
 await crew.getByLabel('Simuliertes Genre').selectOption('house');
 await crew.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=crew.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 const rows=crew.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect(rows.first()).toHaveAttribute('data-evaluated-clip',/^(Dance_|Idle_Breathe$)/);
 await crew.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
 const slider=crew.getByLabel('Simulierte Position');
 const seek=async seconds=>{
  await slider.focus();await slider.press('Home');await slider.press('ArrowRight');
  await expect(slider).toHaveValue('1');
  await expect.poll(()=>rows.evaluateAll(items=>items.every(item=>Math.abs(Number(item.dataset.clipTime)-1)<.01))).toBe(true);
  await slider.press('Home');await expect(slider).toHaveValue('0');
  await expect.poll(()=>rows.evaluateAll(items=>items.every(item=>Math.abs(Number(item.dataset.clipTime))<.01))).toBe(true);
  const pageStep=Math.max(1,Math.round((Number(await slider.getAttribute('max'))-Number(await slider.getAttribute('min')))/10));
  let position=0;
  while(seconds-position>=pageStep){await slider.press('PageUp');position+=pageStep;}
  for(let i=position;i<seconds;i++)await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(seconds));
 };
 const seen=new Set();
 for(const seconds of [25,42,59]){
  await seek(seconds);
  await expect.poll(async()=>{
   const clip=await rows.first().getAttribute('data-evaluated-clip');
   const duration=manifest.find(a=>a.file==='neon-pulse.glb').clips.find(c=>c.name===clip)?.seconds;
   const time=Number(await rows.first().getAttribute('data-clip-time'));
   return duration?Math.abs(time-seconds%duration)<.025:false;
  }).toBe(true);
  await expect(rows.first()).toHaveAttribute('data-evaluated-clip',/^Dance_/);
  seen.add(await rows.first().getAttribute('data-evaluated-clip'));
 }
 expect(seen.size).toBeGreaterThanOrEqual(2);
 await crew.getByLabel('Simulierter Abschnitt').selectOption('drop');
 await seek(64);
 await expect.poll(async()=>rows.evaluateAll(items=>items.every(item=>Math.abs(Number(item.dataset.clipTime))<.025))).toBe(true);
 await expect.poll(async()=>new Set(await rows.evaluateAll(items=>items.map(item=>item.dataset.evaluatedClip))).size).toBe(1);
 await testInfo.attach('creative-shared-hit',{body:await canvas.screenshot(),contentType:'image/png'});
});

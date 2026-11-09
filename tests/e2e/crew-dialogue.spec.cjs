const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test('real dancers hand a motif to the partner and recall it together after a seek',async({page},testInfo)=>{
 test.setTimeout(180000);
 const mock=await installConcertMocksV1130(page,{position:25000,playing:false,missingLyrics:true,genre:'house'});
 await page.addInitScript(()=>{
  localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false}));
  localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,
   modelIds:['sonic-neon-pulse','sonic-festival-nova','sonic-chrome-beat',''],cues:[]}));
 });
 await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});
 await expect(director).toHaveAttribute('data-show-dialogue','call');await expect(director).toContainText('Motiv vorstellen');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
 await page.locator('[data-v571-tab="avatar"]').click();
 const crew=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await crew.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 await crew.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=crew.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 const rows=crew.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect(rows.first()).toHaveAttribute('data-evaluated-clip',/^(Dance_|Idle_Breathe$)/);
 await crew.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
 const slider=crew.getByLabel('Simulierte Position');
 async function seek(seconds){
  await slider.focus();await slider.press('Home');await slider.press('ArrowRight');await slider.press('Home');
  const pageStep=Math.max(1,Math.round((Number(await slider.getAttribute('max'))-Number(await slider.getAttribute('min')))/10));
  let position=0;while(seconds-position>=pageStep){await slider.press('PageUp');position+=pageStep;}
  for(let i=position;i<seconds;i++)await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(seconds));
 }
 const clips=()=>rows.evaluateAll(items=>items.map(item=>item.dataset.evaluatedClip));
 await seek(25);
 await expect.poll(async()=>{const a=await clips();return a.length===3&&a[0]!==a[1]&&a[2]==='Dance_Groove'&&a.every(c=>c?.startsWith('Dance_'));}).toBe(true);
 const call=await clips();
 await seek(33);await expect.poll(clips).toEqual([call[1],call[0],call[2]]);
 await seek(41);await expect.poll(clips).toEqual([call[0],call[0],call[0]]);
 await testInfo.attach('dialogue-shared-reprise',{body:await canvas.screenshot(),contentType:'image/png'});
 mock.setPlayback({position:33000});await page.reload();await expect(director).toHaveAttribute('data-show-dialogue','reply');
 await expect(director).toHaveAttribute('data-show-leader','1');
 mock.setPlayback({position:41000});await page.reload();await expect(director).toHaveAttribute('data-show-dialogue','reunion');
 await expect(director).toHaveAttribute('data-show-interaction','unison');
});

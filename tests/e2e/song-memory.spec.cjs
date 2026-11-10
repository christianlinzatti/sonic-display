const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page){await page.addInitScript(()=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,modelIds:['sonic-neon-pulse','sonic-festival-nova','sonic-chrome-beat',''],cues:[]}));
});}
async function openCrew(page){
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const crew=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await crew.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();await crew.getByLabel('Simulierter Abschnitt').selectOption('auto');
 await crew.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();await crew.locator('canvas').scrollIntoViewIfNeeded();
 const rows=crew.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);await expect(rows.first()).toHaveAttribute('data-evaluated-clip',/^(Dance_|Idle_Breathe$)/);
 await crew.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
 return {crew,rows,seek:async seconds=>{
  const slider=crew.getByLabel('Simulierte Position');await slider.focus();await slider.press('Home');await slider.press('ArrowRight');await slider.press('Home');
  const jump=Math.max(1,Math.round(Number(await slider.getAttribute('max'))/10));let pos=0;
  while(seconds-pos>=jump){await slider.press('PageUp');pos+=jump;}for(let i=pos;i<seconds;i++)await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(seconds));
 }};
}
test('whole-song motifs return in the actual crew and finish with a shared reprise after seeks',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-memory','seed');await expect(director).toHaveAttribute('data-show-genre','house');
 const theme=await director.getAttribute('data-show-theme');expect(theme).toMatch(/^Dance_/);
 const {crew,rows,seek}=await openCrew(page);const clips=()=>rows.evaluateAll(items=>items.map(item=>item.dataset.evaluatedClip));
 await seek(17);await expect.poll(clips).toEqual([theme,theme,theme]);
 await seek(25);await expect.poll(clips).toEqual([theme,theme,theme]);
 await seek(65);await expect.poll(async()=>{const a=await clips();return a.length===3&&a.every(c=>c===a[0])&&/^Dance_(RobotGroove|FluidArc|FrontmanDrive|JazzRebound|CrossStep|TurnPhrase)$/.test(a[0])&&a[0]!==theme;}).toBe(true);
 const contrast=(await clips())[0];await seek(95);await expect.poll(clips).toEqual([contrast,contrast,contrast]);
 await seek(99);await expect.poll(clips).toEqual([theme,theme,theme]);
 await testInfo.attach('whole-song-finale',{body:await crew.locator('canvas').screenshot(),contentType:'image/png'});
 mock.setPlayback({position:95000});await page.reload();await expect(director).toHaveAttribute('data-show-memory','response');
 mock.setPlayback({position:99000});await page.reload();await expect(director).toHaveAttribute('data-show-memory','unite');await expect(director).toHaveAttribute('data-show-theme',theme);
});
test('explicit motif feedback persists locally and can be reduced and reset',async({page})=>{
 test.setTimeout(120000);await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-memory','seed');await expect(director).toHaveAttribute('data-show-genre','house');
 const expectedTheme=await director.getAttribute('data-show-theme');
 const {crew,rows,seek}=await openCrew(page);await seek(17);await expect(rows.first()).toHaveAttribute('data-evaluated-clip',expectedTheme);await expect(crew.getByRole('button',{name:'Mehr davon: Neon Pulse',exact:true})).toBeVisible();
 const clip=await rows.first().getAttribute('data-evaluated-clip');
 await crew.getByRole('button',{name:'Mehr davon: Neon Pulse',exact:true}).click();await crew.getByRole('button',{name:'Mehr davon: Neon Pulse',exact:true}).click();
 await expect(crew.getByLabel('Motiv-Vorliebe: Neon Pulse')).toHaveText('2');
 await crew.getByRole('button',{name:'Weniger davon: Neon Pulse',exact:true}).click();await expect(crew.getByLabel('Motiv-Vorliebe: Neon Pulse')).toHaveText('1');
 await page.reload();expect(await page.evaluate(clip=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).taste[clip],clip)).toBe(1);
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 await page.getByRole('button',{name:'Vorlieben zurücksetzen',exact:true}).click();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).taste??{})).toEqual({});
 await expect(page.getByRole('button',{name:'Vorlieben zurücksetzen',exact:true})).toBeDisabled();
});
test('confirmed instrumental gaps widen the show and release it before the incoming text',async({page})=>{
 const payload={provider:'lrclib',synced:true,lines:[{startMs:0,endMs:5000,text:'Ein leiser Beginn'},{startMs:24000,endMs:29000,text:'Unser Licht trägt diese Nacht'},{startMs:64000,endMs:69000,text:'Unser Licht trägt diese Nacht'}]};
 const mock=await installConcertMocksV1130(page,{position:12000,playing:false,genre:'house',lyricPayload:payload});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-staging','instrumental');
 mock.setPlayback({position:22000});await page.reload();await expect(director).toHaveAttribute('data-show-staging','anticipation');
});

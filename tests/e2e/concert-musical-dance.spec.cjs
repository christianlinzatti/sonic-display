const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function start(page,extra={}){
 await page.addInitScript(()=>{
  if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual',showStyle:'neon'}));
  if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid'}));
  window.__danceFrames=[];window.__danceFx=[];
  window.addEventListener('sonic:crew-performance',e=>{window.__danceFrames.push(e.detail);window.__danceFrames=window.__danceFrames.slice(-120);});
  window.addEventListener('sonic:concert-scenery',e=>{window.__danceFx.push(e.detail);window.__danceFx=window.__danceFx.slice(-60);});
 });
 const mock=await installConcertMocksV1130(page,{position:14000,playing:true,advancing:true,genre:'house',missingLyrics:true,durationMs:180000,...extra});
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__danceFrames.some(f=>f.clip&&f.dance)),{timeout:90000}).toBe(true);return mock;
}
test('real concert crew performs musical phrases, opts out immediately and keeps the uncluttered reading layout',async({page},testInfo)=>{
 test.setTimeout(180000);await start(page);
 const frame=await page.evaluate(()=>window.__danceFrames.find(f=>f.clip&&f.dance));expect(frame.dance.measured).toBe(false);expect([4,8]).toContain(frame.dance.bars);expect(['seed','develop','contrast','resolve']).toContain(frame.dance.phase);
 await expect(page.getByRole('button')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();const box=page.getByLabel('Musikalische Tanzfolgen und Crew-Wellen',{exact:true});await expect(box).toBeChecked();await box.uncheck();
 await page.evaluate(()=>{window.__danceFrames=[];window.__danceFx=[];});
 await expect.poll(()=>page.evaluate(()=>window.__danceFrames.some(f=>f.clip&&!f.dance)),{timeout:30000}).toBe(true);
 await expect.poll(()=>page.evaluate(()=>window.__danceFx.some(f=>f.active&&f.motionSegments===0&&!f.landing)),{timeout:30000}).toBe(true);
 await page.keyboard.press('Escape');await testInfo.attach('musical-show-clean-screen',{body:await page.screenshot(),contentType:'image/png'});
 await page.reload();await expect(page.getByRole('button',{name:'Show steuern',exact:true})).toBeVisible();await page.getByRole('button',{name:'Show steuern',exact:true}).click();await expect(page.getByLabel('Musikalische Tanzfolgen und Crew-Wellen',{exact:true})).not.toBeChecked();
});
test('pause, a large seek and reduced motion clear observed movement effects without a catch-up streak',async({page})=>{
 test.setTimeout(180000);const mock=await start(page);mock.setPlayback({position:80000,playing:false,advancing:false});
 await expect.poll(()=>page.evaluate(()=>window.__danceFx.at(-1)?.moving),{timeout:30000}).toBe(false);
 const paused=await page.evaluate(()=>window.__danceFx.at(-1));expect(paused.motionSegments).toBe(0);expect(paused.landing).toBe(false);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.evaluate(()=>window.__danceFx.at(-1)?.spotTargets.length)).toBe(0);
 const reduced=await page.evaluate(()=>window.__danceFx.at(-1));expect(reduced.motionSegments).toBe(0);expect(reduced.particles).toBe(0);
});

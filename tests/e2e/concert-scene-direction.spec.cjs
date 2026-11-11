const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {rapLyrics}=require('../fixtures/concertStressV1134.cjs');
async function seed(page,live=false){await page.addInitScript(({live})=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',showPlans:true,showStyle:'groove',poseAware:true,stagecraft:true}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsImmersiveEnabled:false,lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-festival-nova',''],cues:[{id:'concert-auto',at:0,formation:'wide',focus:-1,drop:false,transition:1,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 window.__sceneCrew=[];window.addEventListener('sonic:crew-performance',e=>window.__sceneCrew.push(e.detail));
 },{live});}
const director=page=>page.locator('aside[data-show-production]'),lyrics=page=>page.locator('section.lyrics[data-show-production]');
test('scene preparation starts early, refrain signatures return, and dense rap removes decorative motion',async({page},testInfo)=>{
 const mock=await installConcertMocksV1130(page,{position:9000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 await expect(director(page)).toHaveAttribute('data-show-next','refrain');await expect(director(page)).toHaveAttribute('data-show-next-at','24000');await expect(director(page)).toHaveAttribute('data-show-prepare','0.000');expect(await lyrics(page).evaluate(el=>getComputedStyle(el).boxShadow)).toContain('16px');
 mock.setPlayback({position:18000});await page.reload();await expect.poll(async()=>Number(await director(page).getAttribute('data-show-prepare'))).toBeGreaterThan(.05);
 mock.setPlayback({position:25000});await page.reload();await expect(lyrics(page)).toHaveAttribute('data-show-identity','refrain');await expect(lyrics(page).locator('.concert-lyric-signature')).toBeVisible();
 const signature=await lyrics(page).getAttribute('data-show-lyric-motif'),color=await lyrics(page).evaluate(el=>el.style.getPropertyValue('--production-color'));
 await testInfo.attach('refrain-signature',{body:await lyrics(page).screenshot(),contentType:'image/png'});
 mock.setPlayback({position:65000});await page.reload();await expect(lyrics(page)).toHaveAttribute('data-show-identity','refrain');await expect(lyrics(page)).toHaveAttribute('data-show-lyric-motif',signature);expect(await lyrics(page).evaluate(el=>el.style.getPropertyValue('--production-color'))).toBe(color);
 mock.setPlayback({position:10000,lyricPayload:rapLyrics,playing:true});await page.reload();await expect(lyrics(page)).toHaveAttribute('data-show-identity','rap');await expect(lyrics(page).locator('.concert-lyric-signature')).toHaveCount(0);await expect(director(page)).toHaveAttribute('data-show-prepare','0.000');
 const animation=await lyrics(page).locator('.lyric.active').evaluate(el=>getComputedStyle(el).animationName);expect(animation).toBe('none');
});
test('the rendered crew revisits the same partners and actual motif through dialogue chapters and the finale',async({page},testInfo)=>{
 test.setTimeout(240000);const mock=await installConcertMocksV1130(page,{position:25000,playing:false,advancing:false,genre:'house'});await seed(page,true);await page.goto('/');
 await expect(director(page)).toHaveAttribute('data-show-genre','house');await expect(director(page)).toHaveAttribute('data-show-theme',/^Dance_/);const theme=await director(page).getAttribute('data-show-theme');expect(theme).toMatch(/^Dance_/);const pair=await director(page).getAttribute('data-show-pair');expect(pair).toMatch(/^\d:\d$/);
 for(const [position,visit] of [[25000,0],[53000,1],[77000,2],[99000,2]]){
  if(position!==25000){mock.setPlayback({position,playing:false});await page.reload();}
  await expect(director(page)).toHaveAttribute('data-show-pair',pair);await expect(director(page)).toHaveAttribute('data-show-pair-visit',String(visit));
  await expect.poll(()=>page.evaluate(()=>new Set(window.__sceneCrew.map(f=>f.slot)).size),{timeout:90000}).toBe(3);
  mock.setPlayback({playing:true});await expect(director(page)).toContainText('LIVE SHOW',{timeout:30000});
  // Let the loaded mixer reach the next safe bar/fade; do not demand an instantaneous cut.
  const limit=position===25000?32000:position===53000?56000:position===77000?80000:100001;
  const observed=()=>page.evaluate(({position,limit})=>{const latest=new Map();for(const f of window.__sceneCrew)if(f.clip&&f.progressMs>=position&&f.progressMs<limit)latest.set(f.slot,f);return [...latest.values()];},{position,limit});
  await expect.poll(async()=>{const actual=await observed();return actual.length===3&&actual.every(f=>f.bond===pair)&&(position===25000||position===99000?actual.every(f=>f.clip===theme):actual.find(f=>f.slot===Number(pair.split(':')[0]))?.clip===theme);},{timeout:90000}).toBe(true);
  const actual=await observed();expect(actual.every(f=>f.bond===pair),JSON.stringify({position,pair,actual})).toBe(true);
  if(position===99000)expect(new Set(actual.map(f=>f.clip)).size).toBe(1);
 }
 await testInfo.attach('crew-final-reprise',{body:await page.locator('.immersive-stage canvas').screenshot(),contentType:'image/png'});
});
test('live show review measures the actual camera, lyric lane and loaded dance actions without claiming complete coverage',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:25000,playing:true,advancing:true,genre:'house'});await seed(page,true);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__sceneCrew.filter(f=>f.clip).length),{timeout:90000}).toBeGreaterThan(18);
 mock.setPlayback({playing:false});await expect(director(page)).toContainText('PAUSE',{timeout:30000});await page.getByRole('button',{name:'Konzertmodus verlassen',exact:true}).click();
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const panel=page.getByRole('group',{name:'Show-Check',exact:true});await panel.locator('summary').click();await expect(panel).toContainText('Ausschnitt erfasst');
 const report=panel.locator('[data-review-source]');await expect(report).toHaveAttribute('data-review-source','track:MockConcertV1130TrackA');expect(Number(await report.getAttribute('data-review-samples'))).toBeGreaterThan(5);
 for(const field of ['camera','crew','lyric'])expect(Number(await report.getAttribute(`data-review-${field}-ms`))).toBeGreaterThan(500);
 expect(Number(await report.getAttribute('data-review-coverage'))).toBeLessThan(.25);await expect(panel).not.toContainText('Ganzer Song erfasst');
 const settings=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('sonic-stage-crew-v4'))));expect(settings).not.toContain('observedMs');expect(settings).not.toContain('cameraMs');await testInfo.attach('live-show-review',{body:await panel.screenshot(),contentType:'image/png'});
});

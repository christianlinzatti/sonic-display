const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {rapLyrics}=require('../fixtures/concertStressV1134.cjs');
async function start(page,extra={}){
 await page.addInitScript(()=>{
  if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse'}));
  if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual',showStyle:'cinema'}));
  window.__screenFrames=[];window.addEventListener('sonic:concert-scenery',e=>{window.__screenFrames.push(e.detail);window.__screenFrames=window.__screenFrames.slice(-100);});
 });
 const mock=await installConcertMocksV1130(page,{position:26000,playing:true,advancing:false,genre:'house',durationMs:180000,...extra});
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();return mock;
}
test('real stage screens show cover and credits, preserve the lyric lane and clear stale song images',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await start(page);
 await expect.poll(()=>page.evaluate(()=>window.__screenFrames.some(f=>f.screens?.count>=1&&f.screens.image==='ready'&&f.screens.title==='Aurora Mock Concert')),{timeout:90000}).toBe(true);
 await page.screenshot({path:testInfo.outputPath('stage-screens.png')});
 const samples=await page.evaluate(()=>window.__screenFrames.filter(f=>f.active&&f.screens));
 for(const f of samples)expect(f.screens.count).toBeLessThanOrEqual(f.tier==='high'?2:f.tier==='balanced'?1:0);
 expect(samples.filter(f=>f.screens.count===2&&f.screens.opacity>.2&&f.scene==='refrain').every(f=>f.screens.lyric)).toBe(true);
 const lane=await page.getByRole('region',{name:'Songtext',exact:true}).boundingBox(),stage=await page.locator('.immersive-stage').boundingBox();expect(stage.y+stage.height).toBeLessThanOrEqual(lane.y+2);await expect(page.getByRole('button')).toHaveCount(2);
 mock.setPlayback({trackId:'MockStageScreenB',title:'Neuer Song',position:14000,playing:false});
 await expect.poll(()=>page.evaluate(()=>window.__screenFrames.some(f=>f.source==='track:MockStageScreenB'&&f.screens?.title==='Neuer Song'&&f.screens.image==='ready')),{timeout:30000}).toBe(true);
 expect(await page.evaluate(()=>window.__screenFrames.filter(f=>f.source==='track:MockStageScreenB').every(f=>f.screens?.title!=='Aurora Mock Concert'))).toBe(true);
});
test('missing artwork falls back locally; rap dims screen content and the screen opt-out persists',async({page})=>{
 test.setTimeout(180000);await start(page,{albumCoverUrl:null,lyricPayload:rapLyrics,position:10000,genre:'hip-hop'});
 await expect.poll(()=>page.evaluate(()=>window.__screenFrames.some(f=>f.screens?.count>=1&&f.screens.image==='fallback')),{timeout:90000}).toBe(true);
 expect(await page.evaluate(()=>window.__screenFrames.filter(f=>f.screens?.count>0).every(f=>!f.screens.lyric&&f.screens.opacity<=.2))).toBe(true);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();await page.getByLabel('Albumcover & Titel auf Bühnen-Screens',{exact:true}).uncheck();
 await expect.poll(()=>page.evaluate(()=>window.__screenFrames.at(-1)?.screens?.count)).toBe(0);
 await page.keyboard.press('Escape');await page.reload();await page.getByRole('button',{name:'Show steuern',exact:true}).click();await expect(page.getByLabel('Albumcover & Titel auf Bühnen-Screens',{exact:true})).not.toBeChecked();
});

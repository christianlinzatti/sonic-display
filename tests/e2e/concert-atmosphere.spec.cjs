const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {rapLyrics}=require('../fixtures/concertStressV1134.cjs');
async function seed(page){await page.addInitScript(()=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual',showStyle:'cinema'}));
 if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid'}));
 window.__roomFrames=[];window.addEventListener('sonic:concert-scenery',e=>{window.__roomFrames.push(e.detail);window.__roomFrames=window.__roomFrames.slice(-60);});
 });}
const frame=page=>page.evaluate(()=>window.__roomFrames.at(-1));
async function active(page){await expect.poll(async()=>!!(await frame(page))?.atmosphere?.backdrop,{timeout:90000}).toBe(true);}
test.beforeEach(async({page})=>{page.__roomErrors=[];page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|shader error|VALIDATE_STATUS/.test(m.text()))page.__roomErrors.push(m.text());});});
test.afterEach(async({page})=>expect(page.__roomErrors).toEqual([]));
test('real room shader follows the whole show, recalls its opening and keeps the lyric lane clear',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await active(page);
 expect((await frame(page)).atmosphere.motif).toBe('aurora');
 mock.setPlayback({position:25000,playing:true,advancing:true});await page.reload();await active(page);await expect.poll(async()=>(await frame(page))?.atmosphere?.motif).toBe('prism');
 await expect.poll(async()=>((await frame(page))?.atmosphere?.mix?.[1]??0),{timeout:30000}).toBeGreaterThan(.8);
 await testInfo.attach('prism-concert-room',{body:await page.screenshot(),contentType:'image/png'});
 const lane=await page.getByRole('region',{name:'Songtext',exact:true}).boundingBox(),stage=await page.locator('.immersive-stage').boundingBox();expect(stage.y+stage.height).toBeLessThanOrEqual(lane.y+2);await expect(page.getByRole('button')).toHaveCount(2);
 mock.setPlayback({position:65000,playing:false,advancing:false});await page.reload();await active(page);expect((await frame(page)).atmosphere.motif).toBe('stars');const paused=(await frame(page)).atmosphere.time;
 await expect.poll(()=>page.evaluate(()=>window.__roomFrames.filter(f=>f.atmosphere?.backdrop).length)).toBeGreaterThan(2);expect((await frame(page)).atmosphere.time).toBe(paused);expect((await frame(page)).atmosphere.floor).toBe(false);
 mock.setPlayback({position:99000});await page.reload();await active(page);expect((await frame(page)).atmosphere.scene).toBe('reprise');expect((await frame(page)).atmosphere.motif).toBe('aurora');
});
test('room opt-out persists; rap and reduced motion remove floor movement and authored lighting keeps ownership',async({page})=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:true,advancing:true,genre:'house'});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await active(page);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();const toggle=page.getByLabel('Raum- und Bodeneffekte',{exact:true});await toggle.uncheck();await expect.poll(async()=>!!(await frame(page))?.atmosphere?.backdrop).toBe(false);
 await page.reload();await page.getByRole('button',{name:'Show steuern',exact:true}).click();await expect(toggle).not.toBeChecked();await toggle.check();await page.keyboard.press('Escape');await active(page);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>!!(await frame(page))?.atmosphere?.moving).toBe(false);expect((await frame(page)).atmosphere.floor).toBe(false);
 mock.setPlayback({position:10000,playing:true,advancing:false,genre:'hip-hop',durationMs:120000,lyricPayload:rapLyrics});await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await active(page);
 await expect.poll(async()=>(await frame(page))?.atmosphere?.scene).toBe('text');expect((await frame(page)).atmosphere.floor).toBe(false);expect((await frame(page)).atmosphere.amount).toBe(0);
 await page.evaluate(()=>localStorage.setItem('sonic-display:light-timeline-v172:MockConcertV1130TrackA',JSON.stringify([{id:'manual-room',atMs:0,kind:'color',color:'#ff0000',strength:.5,durationMs:120000}])));await page.reload();
 await expect.poll(async()=>!!(await frame(page))?.manual,{timeout:90000}).toBe(true);expect((await frame(page)).atmosphere.backdrop).toBe(false);expect((await frame(page)).atmosphere.floor).toBe(false);
});
test('refrains reveal different real shader accents and pause clears their uniforms',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:26000,playing:true,advancing:false,genre:'house',durationMs:180000});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();
 const seen=()=>page.evaluate(()=>window.__roomFrames.filter(f=>f.atmosphere?.heroAmount>.01).map(f=>f.atmosphere.hero));
 await expect.poll(seen,{timeout:90000}).toContain('portal');await testInfo.attach('portal-stage',{body:await page.screenshot({path:testInfo.outputPath('portal-stage.png')}),contentType:'image/png'});
 mock.setPlayback({position:66000});await page.reload();await expect.poll(seen,{timeout:90000}).toContain('meteors');
 mock.setPlayback({position:94000});await page.reload();await expect.poll(seen,{timeout:90000}).toContain('orbit');
 mock.setPlayback({playing:false});await expect.poll(async()=>(await frame(page))?.atmosphere?.heroAmount,{timeout:30000}).toBe(0);
 const lane=await page.getByRole('region',{name:'Songtext',exact:true}).boundingBox(),stage=await page.locator('.immersive-stage').boundingBox();expect(stage.y+stage.height).toBeLessThanOrEqual(lane.y+2);await expect(page.getByRole('button')).toHaveCount(2);
});

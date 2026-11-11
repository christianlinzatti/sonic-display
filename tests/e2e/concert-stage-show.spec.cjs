const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {rapLyrics}=require('../fixtures/concertStressV1134.cjs');
const LIGHT='sonic-display:light-timeline-v172:MockConcertV1130TrackA';
async function seed(page){await page.addInitScript(()=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual',showStyle:'cinema'}));
 if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsImmersiveEnabled:false,lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 if(!localStorage.getItem('sonic-multi-avatar-stage-v326'))localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:false,count:3,modelIds:[],cues:[]}));
 window.__stageShow=[];window.__stageCast=[];window.addEventListener('sonic:concert-scenery',e=>{window.__stageShow.push(e.detail);window.__stageShow=window.__stageShow.slice(-90);});window.addEventListener('sonic:crew-stagecraft',e=>window.__stageCast.push(e.detail));
 });}
const latest=page=>page.evaluate(()=>window.__stageShow.at(-1));
async function active(page){await expect.poll(async()=>!!(await latest(page))?.active,{timeout:90000}).toBe(true);}
async function loaded(page){await expect.poll(()=>page.evaluate(()=>window.__stageCast.some(f=>f.loaded?.filter(Boolean).length===3)),{timeout:90000}).toBe(true);}
test.beforeEach(async({page})=>{const errors=[];page.on('console',message=>{if(message.type()==='error'&&/WebGLProgram|shader error|VALIDATE_STATUS/i.test(message.text()))errors.push(message.text());});page.__stageShaderErrors=errors;});
test.afterEach(async({page})=>expect(page.__stageShaderErrors).toEqual([]));
test('concert is uncluttered, closes old dialogs, keeps lyrics separate and exposes only compact show controls',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:33000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await expect(page.getByRole('dialog',{name:'Sonic Display Einstellungen'})).toBeVisible();
 // Leave the foreground settings dialog before using the concert launch control.
 await page.getByRole('button',{name:'Einstellungen schließen',exact:true}).click();
 await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await active(page);await loaded(page);
 await expect(page.getByRole('dialog',{name:'Sonic Display Einstellungen'})).toHaveCount(0);await expect(page.getByRole('button')).toHaveCount(2);
 await expect(page.getByLabel('Aktueller Titel',{exact:true})).toContainText('Aurora Mock Concert');
 const lane=await page.getByRole('region',{name:'Songtext',exact:true}).boundingBox(),stage=await page.locator('.immersive-stage').boundingBox();expect(stage.y+stage.height).toBeLessThanOrEqual(lane.y+2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await testInfo.attach('clean-concert-screen',{body:await page.screenshot(),contentType:'image/png'});
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();const panel=page.getByRole('dialog',{name:'Konzertshow steuern',exact:true});await expect(panel).toBeVisible();
 const range=panel.getByLabel('Effektstärke',{exact:true});await range.focus();await range.press('Home');await expect.poll(async()=>!!(await latest(page))?.active).toBe(false);
 await range.press('End');await active(page);await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(page.locator('main')).toHaveClass(/concert-presentation/);
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Konzertmodus starten',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'⚙ Settings',exact:true})).toBeVisible();
 const crew=await page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')));expect(crew.scenery).toBeUndefined();expect(crew.sceneryStrength).toBe(100);
});
test('real LED pictures change for the refrain, project the timed line and recall the opening picture in the finale',async({page},testInfo)=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await active(page);const verse=(await latest(page)).pattern;
 mock.setPlayback({position:25000});await page.reload();await active(page);await expect.poll(async()=>!!(await latest(page))?.projection,{timeout:30000}).toBe(true);await expect.poll(async()=>{const frame=await latest(page);return frame?.mix?.[frame.pattern]??0;}).toBeGreaterThan(.85);const chorus=await latest(page);expect(chorus.scene).toBe('refrain');expect(chorus.pattern).not.toBe(verse);expect(chorus.mix[chorus.pattern]).toBeGreaterThan(.65);
 await loaded(page);expect((await latest(page)).spotTargets.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.slot>=0&&p.slot<3)).toBe(true);
 await testInfo.attach('led-refrain-and-fixed-lyrics',{body:await page.screenshot(),contentType:'image/png'});
 mock.setPlayback({position:99000});await page.reload();await active(page);await expect.poll(async()=>(await latest(page))?.scene).toBe('finale');expect((await latest(page)).pattern).toBe(verse);expect((await latest(page)).particles).toBe(0);expect((await latest(page)).accent).toBeNull();
});
test('dense rap fits the fixed lane while projection and motion stop; reduced motion removes extra moving lights',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:10000,playing:true,advancing:false,genre:'hip-hop',durationMs:120000,lyricPayload:rapLyrics});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await active(page);await loaded(page);
 const frame=await latest(page);expect(frame.scene).toBe('reading');expect(frame.projection).toBe(false);expect(frame.particles).toBe(0);expect(frame.moving).toBe(false);
 const region=page.getByRole('region',{name:'Songtext',exact:true}),line=region.locator('.lyric.active');await expect(line).toBeVisible();const lane=await region.boundingBox(),text=await line.boundingBox();expect(text.y).toBeGreaterThanOrEqual(lane.y);expect(text.y+text.height).toBeLessThanOrEqual(lane.y+lane.height+1);
 await testInfo.attach('quiet-rap-concert',{body:await page.screenshot(),contentType:'image/png'});
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(async()=>(await latest(page))?.spotTargets?.length).toBe(0);const reduced=await latest(page);expect(reduced.moving).toBe(false);expect(reduced.spotTargets).toHaveLength(0);expect(reduced.particles).toBe(0);
});
test('authored light timelines retain ownership; seeking to the end never triggers a catch-up burst',async({page})=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:true,advancing:true,genre:'house',missingLyrics:true});await seed(page);
 await page.addInitScript(key=>{if(!sessionStorage.getItem('manual-stage-seeded')){localStorage.setItem(key,JSON.stringify([{id:'authored',atMs:0,kind:'color',color:'#ff0000',strength:.5,durationMs:10000}]));sessionStorage.setItem('manual-stage-seeded','true');}},LIGHT);
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await expect.poll(async()=>!!(await latest(page))?.manual,{timeout:90000}).toBe(true);expect((await latest(page)).led).toBe(false);
 await page.evaluate(key=>localStorage.removeItem(key),LIGHT);mock.setPlayback({position:97500,advancing:false});await page.reload();await active(page);await expect.poll(()=>page.evaluate(()=>window.__stageShow.filter(f=>f.active).length)).toBeGreaterThan(2);expect((await latest(page)).particles).toBe(0);expect((await latest(page)).accent).toBeNull();
 mock.setPlayback({position:100000,playing:false});await expect.poll(()=>page.evaluate(()=>window.__stageShow.some(f=>f.scene==='afterglow')),{timeout:30000}).toBe(true);expect((await latest(page)).moving).toBe(false);
});

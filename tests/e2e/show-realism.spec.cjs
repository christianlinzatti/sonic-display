const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const load=require('../helpers/load-stage-typescript.cjs');
const {lyricLayoutAudit}=load('lib/showQualityAudit.ts');
async function seed(page,live=false){await page.addInitScript(({live})=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',stageTheme:'classic',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-festival-nova',''],cues:[{id:'realism',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 window.__realismCamera=[];window.addEventListener('sonic-camera-studio-status-v299',e=>window.__realismCamera.push(e.detail));
},{live});}
async function controls(page){await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();return page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});}
test('multi-song variety is bounded, survives reload, respects opt-out and has an independent reset',async({page})=>{
 await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-genre','house');
 const theme=await director.getAttribute('data-show-theme');
 await page.evaluate(theme=>localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',taste:{[theme]:1},history:Array.from({length:8},(_,i)=>({track:'previous-'+i,motifs:[theme],shots:[0]}))})),theme);
 await page.reload();await expect(director).toHaveAttribute('data-show-genre','house');await expect(director).not.toHaveAttribute('data-show-shot','0');await expect(director).toHaveAttribute('data-show-audio','planned');
 const crew=await controls(page),remember=crew.getByRole('checkbox',{name:'Abwechslung über mehrere Songs merken',exact:true});
 await remember.uncheck();await expect(director).toHaveAttribute('data-show-shot','0');await expect(director).toHaveAttribute('data-show-theme',theme);
 await page.reload();const reloaded=await controls(page);await expect(reloaded.getByRole('checkbox',{name:'Abwechslung über mehrere Songs merken',exact:true})).not.toBeChecked();
 await reloaded.getByRole('button',{name:'Show-Verlauf löschen',exact:true}).click();await expect(reloaded.getByRole('button',{name:'Show-Verlauf löschen',exact:true})).toBeDisabled();
 const settings=await page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')));expect(settings.history).toBeUndefined();expect(settings.taste[theme]).toBe(1);
});
test('real rehearsal reports measured stance quality and personality-specific replies',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:33000,playing:false,missingLyrics:true,genre:'house'});await seed(page);await page.goto('/');
 const crew=await controls(page);for(const [slot,id] of ['sonic-neon-pulse','sonic-luna-flow','sonic-festival-nova'].entries())await crew.getByLabel(`Figur ${slot+1}`).selectOption(id);
 await crew.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();await crew.getByLabel('Simulierter Abschnitt').selectOption('verse');
 await crew.getByRole('button',{name:'Aktuelle Songposition übernehmen',exact:true}).click();await crew.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 await crew.locator('canvas').scrollIntoViewIfNeeded();const rows=crew.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect.poll(()=>rows.evaluateAll(items=>items.every(item=>Number(item.dataset.qualitySamples)>12)),{timeout:60000}).toBe(true);
 await expect.poll(()=>rows.evaluateAll(items=>new Set(items.map(item=>item.dataset.answerStyle)).size)).toBe(3);
 await expect(crew.getByLabel('Gemessene Bewegungsqualität')).toContainText('Standkontakt:');
 await testInfo.attach('measured-crew-quality',{body:await crew.locator('canvas').screenshot(),contentType:'image/png'});
 await crew.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
});
test('actual live performance records only local motifs and camera choices while lyrics fit the viewport',async({page})=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:17000,playing:true,advancing:false,missingLyrics:true,genre:'house',lyricPayload:{provider:'spotify',synced:true,lines:[{startMs:0,endMs:60000,text:'Wir teilen diesen Klang und tanzen durch die Nacht'}]}});await seed(page,true);await page.goto('/');
 await expect(page.locator('.immersive-stage canvas')).toBeVisible({timeout:90000});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).history?.some(row=>row.track==='MockConcertV1130TrackA'&&row.motifs.length&&row.shots.length)??false),{timeout:60000}).toBe(true);
 const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).history);expect(history.length).toBeLessThanOrEqual(24);expect(Object.keys(history[0]).sort()).toEqual(['motifs','shots','track']);
 await expect.poll(()=>page.evaluate(()=>window.__realismCamera.length),{timeout:60000}).toBeGreaterThan(3);
 const quality=await page.evaluate(()=>window.__realismCamera.at(-1)?.showQualityV1152);expect(Number.isFinite(quality?.samples)).toBe(true);expect(Number.isFinite(quality?.cameraCuts)).toBe(true);expect(typeof quality?.frequentCuts).toBe('boolean');
 const finite=await page.evaluate(()=>window.__realismCamera.slice(-3).every(sample=>[sample.camera.x,sample.camera.y,sample.camera.z,sample.camera.fov].every(Number.isFinite)));expect(finite).toBe(true);
 mock.setPlayback({position:17000,playing:false,missingLyrics:false});await page.reload();
 const region=page.getByRole('region',{name:'Songtext',exact:true});const line=region.locator('.lyric.active');await expect(line).toBeVisible();await line.scrollIntoViewIfNeeded();
 const rect=await line.boundingBox();const viewport=page.viewportSize();expect(lyricLayoutAudit(rect,{x:0,y:0,width:viewport.width,height:viewport.height}).clipped).toBe(false);
});

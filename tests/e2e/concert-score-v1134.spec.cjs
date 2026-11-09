const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {malformedLyrics}=require('../fixtures/concertStressV1134.cjs');
test.use({actionTimeout:15000});
async function seed(page,live=false){await page.addInitScript(({live})=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',stageTheme:'classic',lyricsVisible:true,
 lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,
 modelIds:['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass',''],cues:[{id:'score',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 window.__scoreCamera=[];window.addEventListener('sonic-camera-studio-status-v299',e=>window.__scoreCamera.push(e.detail));
},{live});}
test('score anticipates the chorus, rotates the lead and survives missing lyrics and pause/resume',async({page})=>{
 test.setTimeout(150000);const mock=await installConcertMocksV1130(page,{position:22500,playing:false});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});
 await expect(director).toHaveAttribute('data-show-staging','anticipation');await expect(director).toContainText('Spannung sammeln');
 mock.setPlayback({position:24600});await page.reload();await expect(director).toHaveAttribute('data-show-staging','chorus');await expect(director).toHaveAttribute('data-show-leader','0');
 await expect(page.getByRole('region',{name:'Songtext',exact:true})).toHaveAttribute('data-lyric-presentation','anthem');
 mock.setPlayback({position:65000});await page.reload();await expect(director).toHaveAttribute('data-show-leader','1');await expect(director).toContainText('Refrain 2');
 mock.setPlayback({position:17000,missingLyrics:true,trackId:'MockMissingLyrics1134AA',playing:true,advancing:true});await page.reload();
 await expect(page.getByRole('heading',{name:'Silent Mock Concert',exact:true})).toBeVisible();await expect(director).toHaveAttribute('data-show-chapter','0');
 await expect(director).toContainText('LIVE SHOW');
 mock.setPlayback({position:18000,playing:false});await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(director).toContainText('PAUSE',{timeout:20000});
 await expect(director).not.toHaveClass(/show-v1130-moving/);
 mock.setPlayback({position:18000,playing:true,advancing:true});await page.evaluate(()=>window.dispatchEvent(new Event('online')));await expect(director).toContainText('LIVE SHOW',{timeout:20000});
});
test('malformed lyric timestamps are repaired before rendering and never fabricate word highlights',async({page})=>{
 test.setTimeout(90000);await installConcertMocksV1130(page,{position:9000,playing:false,lyricPayload:malformedLyrics});await seed(page);await page.goto('/');
 const region=page.getByRole('region',{name:'Songtext',exact:true});await expect(region.locator('.lyric.active')).toContainText('Sicher lesbare Zeile');
 await expect(region.locator('[data-v1133-current="true"]')).toHaveCount(0);
 await expect(region).not.toContainText('Negative Zeit');await expect(region).not.toContainText('Doppelte Zeit');
 await expect(page.getByRole('complementary',{name:'Intelligente Show-Regie'})).toHaveAttribute('data-show-staging','verse');
});
test('live rap holds the actual automatic 3D camera and keeps text readable while playback runs',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:10000,playing:true,advancing:true,genre:'hip-hop',durationMs:120000});
 await page.unroute('**/api/lyrics?*');
 const text='Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen';
 await page.route('**/api/lyrics?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({provider:'spotify',synced:true,plainText:text,lines:Array.from({length:24},(_,i)=>({startMs:8000+i*4000,endMs:12000+i*4000,text,words:undefined}))})}));
 await seed(page,true);await page.goto('/');
 const canvas=page.locator('.immersive-stage canvas');await expect(canvas).toBeVisible({timeout:90000});
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-staging','reading');
 const region=page.getByRole('region',{name:'Songtext',exact:true});await expect(region).toHaveAttribute('data-lyric-presentation','rap');
 await expect.poll(()=>page.evaluate(()=>window.__scoreCamera.filter(s=>s.playing).length),{timeout:60000}).toBeGreaterThan(6);
 const drift=await page.evaluate(()=>{const samples=window.__scoreCamera.filter(s=>s.playing).slice(-4).map(s=>s.camera);return Math.max(...samples.map(s=>Math.hypot(s.x-samples[0].x,s.y-samples[0].y,s.z-samples[0].z,s.fov-samples[0].fov)));});
 expect(drift).toBeLessThan(.02);
 const css=await region.locator('.lyric.active').evaluate(el=>{const s=getComputedStyle(el);return {animation:s.animationName,transform:s.transform}});expect(css).toEqual({animation:'none',transform:'none'});
 await testInfo.attach('coordinated-reading-stage',{body:await page.screenshot(),contentType:'image/png'});
});
test('crew rehearsal tolerates drastic tempo changes and retains its position through pauses',async({page})=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:8000,playing:false,missingLyrics:true});await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 const slider=box.getByLabel('Simulierte Position');await slider.focus();await slider.press('Home');for(let i=0;i<8;i++)await slider.press('ArrowRight');
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();await box.locator('canvas').scrollIntoViewIfNeeded();
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);await expect(rows.first()).toContainText('Dance_');
 for(const bpm of [65,210,90,170]){await box.getByLabel('Simuliertes Tempo').fill(String(bpm));await expect(rows.first()).toContainText('Dance_');await expect(rows.first()).not.toContainText('NaN');}
 await box.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();await expect(rows.first()).toContainText('Pausiert');
 const paused=Number(await slider.inputValue());await expect.poll(async()=>Number(await slider.inputValue())).toBe(paused);
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();await expect(rows.first()).toContainText('Dance_');await expect.poll(async()=>Number(await slider.inputValue())).toBeGreaterThan(paused);
});

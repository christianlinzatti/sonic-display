const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page,live){await page.addInitScript(({live})=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',stageTheme:'classic',lyricsVisible:true,
 lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,
 avatarModelId:'sonic-chrome-beat',avatarMotionMode:'hybrid',reducedMotion:false}));
 if(live)localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,
 modelIds:['sonic-chrome-beat','sonic-luna-flow','sonic-quantum-bass',''],cues:[{id:'continuity',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 window.__continuity=[];window.addEventListener('sonic-camera-studio-status-v299',e=>window.__continuity.push(e.detail));
},{live});}
test('paused rehearsal scrubs actual rig poses immediately and resumes from the chosen position',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:8000,playing:false});await seed(page,false);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});await box.getByLabel('Figur 1').selectOption('sonic-chrome-beat');
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();const canvas=box.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 const slider=box.getByLabel('Simulierte Position'),rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');
 await expect(rows).toHaveCount(3);
 await slider.focus();await slider.press('Home');for(let i=0;i<9;i++)await slider.press('ArrowRight');
 await expect(rows.first()).toContainText('Pausiert');await expect(rows.first()).toHaveAttribute('data-evaluated-clip','Dance_RobotGroove');
 await expect.poll(async()=>Number(await rows.first().getAttribute('data-clip-time'))).toBeCloseTo(1,2);
 await slider.press('ArrowRight');await expect.poll(async()=>Number(await rows.first().getAttribute('data-clip-time'))).toBeCloseTo(2,2);
 const paused=await rows.first().getAttribute('data-clip-time');
 await expect.poll(()=>rows.first().getAttribute('data-clip-time')).toBe(paused);
 await testInfo.attach('paused-scrub-target-pose',{body:await canvas.screenshot(),contentType:'image/png'});
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();await expect(rows.first()).toContainText('Dance_');
 await expect.poll(async()=>Number(await slider.inputValue())).toBeGreaterThan(10);
});
test('live rap camera follows seek and track identity without reload and settles into a stable reading shot',async({page})=>{
 test.setTimeout(180000);
 const text='Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen';
 const lyricPayload={provider:'spotify',synced:true,plainText:text,lines:Array.from({length:28},(_,i)=>({startMs:i*4000,endMs:(i+1)*4000,text}))};
 const mock=await installConcertMocksV1130(page,{position:10000,playing:true,advancing:true,trackId:'ContinuitySongA1136',genre:'hip-hop',durationMs:120000,lyricPayload});await seed(page,true);await page.goto('/');
 await expect(page.locator('.immersive-stage canvas')).toBeVisible({timeout:90000});
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});await expect(director).toHaveAttribute('data-show-staging','reading');
 await expect.poll(()=>page.evaluate(()=>window.__continuity.filter(s=>s.scoreSourceV1136==='track:ContinuitySongA1136'&&s.scoreHoldV1136==='reading').length),{timeout:60000}).toBeGreaterThan(3);
 const beforeStall=await page.evaluate(()=>window.__continuity.filter(s=>s.scoreHoldV1136==='reading').at(-1).camera);
 const countBefore=await page.evaluate(()=>window.__continuity.length);
 await page.evaluate(()=>{const until=performance.now()+2000;while(performance.now()<until){}});
 await expect.poll(()=>page.evaluate(()=>window.__continuity.length),{timeout:20000}).toBeGreaterThan(countBefore+4);
 const afterStall=await page.evaluate(()=>window.__continuity.filter(s=>s.scoreHoldV1136==='reading').at(-1).camera);
 expect(Math.hypot(afterStall.x-beforeStall.x,afterStall.y-beforeStall.y,afterStall.z-beforeStall.z,afterStall.fov-beforeStall.fov)).toBeLessThan(.02);
 mock.setPlayback({position:42000,advancing:true});await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await expect.poll(()=>page.evaluate(()=>window.__continuity.some(s=>s.progressMs>=42000&&s.scoreHoldV1136==='reading')),{timeout:25000}).toBe(true);
 mock.setPlayback({position:12000,trackId:'ContinuitySongB1136',title:'Second Continuity Show',advancing:true});await page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await expect(page.getByRole('heading',{name:'Second Continuity Show',exact:true})).toBeVisible({timeout:25000});
 await expect.poll(()=>page.evaluate(()=>window.__continuity.filter(s=>s.scoreSourceV1136==='track:ContinuitySongB1136'&&s.scoreHoldV1136==='reading').length),{timeout:30000}).toBeGreaterThan(10);
 const samples=await page.evaluate(()=>window.__continuity.filter(s=>s.scoreSourceV1136==='track:ContinuitySongB1136'&&s.scoreHoldV1136==='reading').slice(-3).map(s=>s.camera));
 expect(samples).toHaveLength(3);for(const s of samples)for(const k of ['x','y','z','fov'])expect(Number.isFinite(s[k])).toBe(true);
 const drift=Math.max(...samples.map(s=>Math.hypot(s.x-samples[0].x,s.y-samples[0].y,s.z-samples[0].z,s.fov-samples[0].fov)));expect(drift).toBeLessThan(.035);
 await expect(page.getByRole('region',{name:'Songtext',exact:true})).toHaveAttribute('data-lyric-presentation','rap');
});

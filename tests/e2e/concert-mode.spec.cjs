const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page,reduced=false){await page.addInitScript(({reduced})=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsImmersiveEnabled:false,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:reduced}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:false,count:3,modelIds:[],cues:[]}));
 window.__concertPositions=[];window.addEventListener('sonic:crew-stagecraft',e=>window.__concertPositions.push(e.detail));
},{reduced});}
test('concert fills the viewport, reserves readable lyrics, hides controls and restores the previous display',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:33000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 const start=page.getByRole('button',{name:'Konzertmodus starten',exact:true});await start.click();
 await expect(page.locator('main')).toHaveClass(/concert-presentation/);
 const canvas=page.locator('.immersive-stage canvas');await expect(canvas).toBeVisible({timeout:90000});
 await expect(page.getByRole('group',{name:'3 music-reactive 3D avatars',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'⚙ Settings',exact:true})).not.toBeVisible();
 const stage=await page.locator('.immersive-stage').boundingBox(),text=await page.getByRole('region',{name:'Songtext',exact:true}).boundingBox(),size=page.viewportSize();
 expect(stage.width).toBeGreaterThan(size.width*.9);expect(stage.height).toBeGreaterThan(size.height*.5);expect(stage.y+stage.height).toBeLessThanOrEqual(text.y+2);
 const line=await page.locator('.layout .lyric.active').boundingBox();expect(line.x).toBeGreaterThanOrEqual(0);expect(line.y+line.height).toBeLessThanOrEqual(size.height);
 await expect.poll(()=>page.evaluate(()=>window.__concertPositions.some(s=>s.loaded?.filter(Boolean).length===3)),{timeout:90000}).toBe(true);
 await testInfo.attach('concert-presentation',{body:await page.screenshot(),contentType:'image/png'});
 await page.keyboard.press('Escape');await expect(start).toBeVisible();await expect(page.locator('main')).not.toHaveClass(/concert-presentation/);
 const saved=await page.evaluate(()=>({ui:JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1')),crew:JSON.parse(localStorage.getItem('sonic-stage-crew-v4')),group:JSON.parse(localStorage.getItem('sonic-multi-avatar-stage-v326'))}));
 expect(saved.ui.visualizerMode).toBe('wave');expect(saved.crew.mode).toBe('individual');expect(saved.group.enabled).toBe(false);
});
test('concert crew publishes separated role targets and holds its roots when playback pauses',async({page})=>{
 test.setTimeout(180000);const mock=await installConcertMocksV1130(page,{position:33000,playing:true,advancing:true,missingLyrics:true,genre:'house'});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__concertPositions.filter(s=>s.positions.every(p=>p?.target)).length),{timeout:90000}).toBeGreaterThan(2);
 await expect.poll(()=>page.evaluate(()=>{const samples=window.__concertPositions.filter(s=>s.positions.every(p=>p?.target));if(samples.length<2)return 0;return Math.max(...samples.at(-1).positions.map((p,i)=>Math.hypot(p.x-samples[0].positions[i].x,p.z-samples[0].positions[i].z)));}),{timeout:60000}).toBeGreaterThan(.004);
 const sample=await page.evaluate(()=>window.__concertPositions.filter(s=>s.positions.every(p=>p?.target)).at(-1));
 expect(new Set(sample.positions.map(p=>p.target.z)).size).toBeGreaterThan(1);
 for(let i=1;i<sample.positions.length;i++)expect(sample.positions[i].x-sample.positions[i-1].x).toBeGreaterThan(.9);
 mock.setPlayback({playing:false});await expect(page.getByRole('complementary',{name:'Intelligente Show-Regie'})).toContainText('PAUSE',{timeout:30000});
 const count=await page.evaluate(()=>window.__concertPositions.length);await expect.poll(()=>page.evaluate(()=>window.__concertPositions.length)).toBeGreaterThan(count+2);
 const positions=await page.evaluate(()=>window.__concertPositions.slice(-2).map(s=>s.positions.map(p=>({x:p.x,z:p.z}))));expect(positions[0]).toEqual(positions[1]);
 await page.getByRole('button',{name:'Konzertmodus verlassen',exact:true}).click();
});

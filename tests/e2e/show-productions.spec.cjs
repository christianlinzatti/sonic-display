const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page,live=false){await page.addInitScript(({live})=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',showPlans:true}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-festival-nova',''],cues:[{id:'production-test',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 },{live});}
async function controls(page){await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();return page.getByRole('group',{name:'AI-Show-Inszenierung',exact:true});}
const direction=page=>page.locator('aside[data-show-production]');
const lyrics=page=>page.locator('section.lyrics[data-show-production]');
test('four selectable concepts coordinate actual lyrics and direction; a new take and opt-out persist',async({page},testInfo)=>{
 await installConcertMocksV1130(page,{position:17000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 await expect(direction(page)).toHaveAttribute('data-show-genre','house');await expect(lyrics(page)).toHaveCount(1);
 const box=await controls(page),colors=new Set(),themes=new Set();
 for(const id of ['neon','cinema','groove','festival']){
  await box.getByLabel('Show-Konzept',{exact:true}).selectOption(id);
  await expect(direction(page)).toHaveAttribute('data-show-production',id);await expect(lyrics(page)).toHaveAttribute('data-show-production',id);
  colors.add(await lyrics(page).evaluate(el=>el.style.getPropertyValue('--production-color')));themes.add(await direction(page).getAttribute('data-show-theme'));
 }
 expect(colors.size).toBe(4);expect(themes.size).toBe(4);await testInfo.attach('show-concept-controls',{body:await box.screenshot(),contentType:'image/png'});
 await box.getByRole('button',{name:'Neue Show-Version',exact:true}).click();await expect(direction(page)).toHaveAttribute('data-show-take','1');
 await page.reload();await expect(direction(page)).toHaveAttribute('data-show-production','festival');await expect(direction(page)).toHaveAttribute('data-show-take','1');
 const again=await controls(page);await again.getByRole('checkbox',{name:'AI-Show-Planung aktivieren',exact:true}).uncheck();await expect(direction(page)).toHaveAttribute('data-show-production','off');await expect(lyrics(page)).toHaveAttribute('data-show-production','off');
 await expect(again.getByRole('button',{name:'Neue Show-Version',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Einstellungen schließen',exact:true}).click();await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await expect(direction(page)).toHaveAttribute('data-show-production','off');await page.getByRole('button',{name:'Konzertmodus verlassen',exact:true}).click();
});
test('the actual live crew pins its performed concept across reload and records a different automatic take',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:17000,playing:true,advancing:false,missingLyrics:true,genre:'house'});await seed(page,true);await page.goto('/');
 await expect(page.locator('.immersive-stage canvas')).toBeVisible({timeout:90000});
 const performed=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).history?.find(row=>row.track==='MockConcertV1130TrackA'));
 await expect.poll(async()=>{const row=await performed();return !!row?.production&&row.motifs.length>0&&row.shots.length>0;},{timeout:60000}).toBe(true);
 const first=await performed();expect(first.take).toBe(0);await expect(direction(page)).toHaveAttribute('data-show-production',first.production);
 await page.reload();await expect(direction(page)).toHaveAttribute('data-show-production',first.production);
 const box=await controls(page);await box.getByRole('button',{name:'Neue Show-Version',exact:true}).click();
 await expect(direction(page)).toHaveAttribute('data-show-take','1');await expect(direction(page)).not.toHaveAttribute('data-show-production',first.production);
 await expect.poll(async()=>{const row=await performed();return row?.take===1&&row.production!==first.production;},{timeout:60000}).toBe(true);
 const next=await performed();expect(next.motifs.length).toBeGreaterThan(0);expect(Object.keys(next).sort()).toEqual(['motifs','production','shots','take','track']);
 await page.getByRole('button',{name:'Einstellungen schließen',exact:true}).click();await testInfo.attach('live-show-production',{body:await page.locator('.immersive-stage canvas').screenshot(),contentType:'image/png'});
});
test('dense rap keeps a stable reading scene for every concept without invented word timings',async({page})=>{
 const text='Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen';
 await installConcertMocksV1130(page,{position:10000,playing:true,advancing:false,genre:'hip-hop',durationMs:120000,lyricPayload:{provider:'spotify',synced:true,plainText:text,lines:Array.from({length:28},(_,i)=>({startMs:i*4000,endMs:(i+1)*4000,text}))}});
 await seed(page);await page.goto('/');await expect(lyrics(page)).toHaveAttribute('data-lyric-presentation','rap');const box=await controls(page);
 for(const id of ['neon','cinema','groove','festival']){
  await box.getByLabel('Show-Konzept',{exact:true}).selectOption(id);await expect(lyrics(page)).toHaveAttribute('data-show-production',id);await expect(lyrics(page)).toHaveAttribute('data-show-scene','reading');await expect(direction(page)).toHaveAttribute('data-show-scene','reading');
  const animation=await lyrics(page).locator('.lyric.active').evaluate(el=>({animation:getComputedStyle(el).animationName,transform:getComputedStyle(el).transform}));expect(animation).toEqual({animation:'none',transform:'none'});
 }
 await expect(lyrics(page).locator('[data-v1133-current="true"]')).toHaveCount(0);
});

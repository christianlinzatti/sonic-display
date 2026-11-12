const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const SESSION='sonic-concert-session-v1';
async function seed(page){await page.addInitScript(()=>{
 if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual',taste:{Dance_JazzRebound:1}}));
 if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsStyle:'cinematic',lyricsImmersiveEnabled:false,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',reducedMotion:false}));
 if(!localStorage.getItem('sonic-multi-avatar-stage-v326'))localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:false,count:3,modelIds:[],cues:[]}));
 window.__resumeFrames=[];window.addEventListener('sonic:crew-stagecraft',e=>window.__resumeFrames.push(e.detail));
});}
async function loaded(page){await expect.poll(()=>page.evaluate(()=>window.__resumeFrames.some(s=>s.loaded?.filter(Boolean).length===3)),{timeout:90000}).toBe(true);}
test('reload resumes the concert and exit restores the original view while preserving newer taste and manual choices',async({page})=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:33000,playing:false,genre:'house'});await seed(page);await page.goto('/');
 const overflow=await page.evaluate(()=>document.body.style.overflow);await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();
 await expect(page.locator('main')).toHaveClass(/concert-presentation/);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1')).visualizerMode)).toBe('avatar');
 await page.evaluate(()=>{
  const crew=JSON.parse(localStorage.getItem('sonic-stage-crew-v4'));crew.taste={Dance_JazzRebound:3};crew.history=[{track:'learned-in-concert',motifs:['Dance_JazzRebound'],shots:[2]}];crew.reactions=false;localStorage.setItem('sonic-stage-crew-v4',JSON.stringify(crew));
  const prefs=JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1'));prefs.lyricsStyle='neon';localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify(prefs));
 });
 await page.reload();await expect(page.getByRole('button',{name:'Konzertmodus verlassen',exact:true})).toBeVisible();await loaded(page);
 const stored=await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)),SESSION);expect(stored.version).toBe(1);expect(stored.crew.history).toBeUndefined();expect(stored.crew.taste).toBeUndefined();
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Konzertmodus starten',exact:true})).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1')).visualizerMode)).toBe('wave');
 const result=await page.evaluate(key=>({crew:JSON.parse(localStorage.getItem('sonic-stage-crew-v4')),ui:JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1')),group:JSON.parse(localStorage.getItem('sonic-multi-avatar-stage-v326')),session:sessionStorage.getItem(key),overflow:document.body.style.overflow}),SESSION);
 expect(result.crew.mode).toBe('individual');expect(result.crew.reactions).toBe(false);expect(result.crew.taste.Dance_JazzRebound).toBe(3);expect(result.crew.history[0].track).toBe('learned-in-concert');expect(result.ui.lyricsStyle).toBe('neon');expect(result.group.enabled).toBe(false);expect(result.session).toBeNull();expect(result.overflow).toBe(overflow);
});
for(const viewport of [{width:390,height:844},{width:844,height:390}])test(`phone concert preserves the lyric lane and exit control at ${viewport.width}x${viewport.height}`,async({page},testInfo)=>{
 test.setTimeout(180000);await page.setViewportSize(viewport);
 const text='Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen';
 const lyricPayload={provider:'spotify',synced:true,plainText:text,lines:Array.from({length:28},(_,i)=>({startMs:i*4000,endMs:(i+1)*4000,text}))};
 await installConcertMocksV1130(page,{position:10000,playing:true,advancing:false,genre:'hip-hop',durationMs:120000,lyricPayload});await seed(page);await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await loaded(page);
 const region=page.getByRole('region',{name:'Songtext',exact:true});await expect(region).toHaveAttribute('data-lyric-presentation','rap');
 // React may paint the lyric lane before the active line has its first
 // visible layout box. Poll the actual geometry (no fixed sleep), and keep
 // the existing strict mobile clipping/exit-control assertions below.
 let boxes;
 await expect.poll(async()=>{
  boxes=await Promise.all([
   page.locator('.immersive-stage').boundingBox(),
   region.boundingBox(),
   region.locator('.lyric.active').boundingBox(),
   page.getByRole('button',{name:'Konzertmodus verlassen',exact:true}).boundingBox(),
  ]);
  return boxes.every(rect=>rect!==null&&rect.width>0&&rect.height>0);
 },{timeout:15000,message:'Phone concert must expose a visible stage, lyric lane, active lyric and exit control'}).toBe(true);
 const [stage,lane,line,exit]=boxes;
 expect(stage.y+stage.height).toBeLessThanOrEqual(lane.y+2);expect(lane.y+lane.height).toBeLessThanOrEqual(viewport.height);expect(line.x).toBeGreaterThanOrEqual(lane.x);expect(line.x+line.width).toBeLessThanOrEqual(lane.x+lane.width+1);expect(line.y).toBeGreaterThanOrEqual(lane.y);expect(line.y+line.height).toBeLessThanOrEqual(lane.y+lane.height+1);expect(exit.x).toBeGreaterThanOrEqual(0);expect(exit.y+exit.height).toBeLessThan(lane.y);
 await expect(page.locator('.concert-presentation [data-v441-slot]').first()).not.toBeVisible();
 await testInfo.attach('phone-concert',{body:await page.screenshot(),contentType:'image/png'});await page.getByRole('button',{name:'Konzertmodus verlassen',exact:true}).click();
});

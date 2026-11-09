const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page,live=false){await page.addInitScript(({live})=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',expression:'bold'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:live?'avatar':'wave',stageTheme:'classic',lyricsVisible:true,
 lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,
 avatarModelId:'sonic-neon-pulse',secondaryAvatarModelId:'sonic-luna-flow',avatarMotionMode:'hybrid',reducedMotion:false}));
 if(live)localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,
 modelIds:['sonic-neon-pulse','sonic-luna-flow','sonic-quantum-bass',''],cues:[{id:'presence',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
},{live});}
test('real three-person rehearsal keeps a planted foot on the floor and releases motion on pause',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:8000,playing:false});await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 for(const [slot,id] of ['sonic-neon-pulse','sonic-luna-flow','sonic-quantum-bass'].entries())await box.getByLabel(`Figur ${slot+1}`).selectOption(id);
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 const slider=box.getByLabel('Simulierte Position');await slider.focus();await slider.press('Home');for(let i=0;i<8;i++)await slider.press('ArrowRight');
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();await box.locator('canvas').scrollIntoViewIfNeeded();
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);await expect(rows.first()).toContainText('Dance_');
 await expect.poll(async()=>{const gaps=await rows.evaluateAll(nodes=>nodes.map(n=>Number(n.dataset.soleGap)));return gaps.every(x=>Number.isFinite(x)&&Math.abs(x)<.025);}).toBe(true);
 await testInfo.attach('grounded-three-performer-rehearsal',{body:await box.locator('canvas').screenshot(),contentType:'image/png'});
 await box.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();await expect(rows.first()).toContainText('Pausiert');
 const paused=await rows.allTextContents();await expect.poll(()=>rows.allTextContents()).toEqual(paused);
});
test('grounded live crew and dramatic refrain render with mocked Spotify and readable lyrics',async({page},testInfo)=>{
 test.setTimeout(180000);const loaded=new Set();page.on('response',r=>{if(r.ok()&&r.url().endsWith('.glb'))loaded.add(new URL(r.url()).pathname);});
 await installConcertMocksV1130(page,{position:65000,playing:true});await seed(page,true);await page.goto('/');
 await expect(page.locator('.immersive-stage canvas')).toBeVisible({timeout:90000});
 await expect.poll(()=>['neon-pulse','luna-flow','quantum-bass'].every(s=>loaded.has(`/avatars/sonic/${s}.glb`)),{timeout:90000}).toBe(true);
 await expect(page.getByRole('complementary',{name:'Intelligente Show-Regie'})).toHaveAttribute('data-show-staging','chorus');
 const lyrics=page.getByRole('region',{name:'Songtext',exact:true});await expect(lyrics).toHaveAttribute('data-lyric-presentation','anthem');
 const wordGap=await lyrics.locator('.lyric.active .kinetic-word').evaluateAll(words=>{
  const first=words[0],second=words[1];if(!first?.firstChild||!second)return -1;
  const range=document.createRange();range.setStart(first.firstChild,0);range.setEnd(first.firstChild,first.textContent.trimEnd().length);
  return second.getBoundingClientRect().left-range.getBoundingClientRect().right;
 });expect(wordGap).toBeGreaterThan(2);
 const box=await lyrics.locator('.lyric.active').boundingBox();expect(box.y+box.height).toBeLessThan(page.viewportSize().height-110);
 await testInfo.attach('grounded-live-refrain-stage',{body:await page.screenshot(),contentType:'image/png'});
});

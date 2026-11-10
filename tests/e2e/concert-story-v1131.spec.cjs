const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test.use({actionTimeout:15000});
async function seed(page){await page.addInitScript(()=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsImmersiveEnabled:false,
 lyricsStyle:'cinematic',microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-aurora-synth',reducedMotion:false}));
});}
test('mocked whole-song story escalates choruses and restores the right chapter after seeks and track changes',async({page},testInfo)=>{
 test.setTimeout(150000);const mock=await installConcertMocksV1130(page,{position:32500});await seed(page);await page.goto('/');
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});
 await expect(director).toHaveAttribute('data-show-chapter','1');await expect(director).toContainText('Refrain 1');
 mock.setPlayback({position:65000});await page.reload();await expect(director).toHaveAttribute('data-show-chapter','2');
 await expect(director).toContainText('Steigerung');await expect(page.locator('.lyric.active')).toContainText('Ein Licht ein Beat');
 await testInfo.attach('second-chorus-story',{body:await page.screenshot(),contentType:'image/png'});
 mock.setPlayback({position:95000});await page.reload();await expect(director).toHaveAttribute('data-show-act','finale');
 await expect(director).toHaveAttribute('data-show-interaction','unison');await expect(director).toContainText('Das große Finale');
 mock.setPlayback({position:32500});await page.reload();await expect(director).toHaveAttribute('data-show-chapter','1');
 mock.setPlayback({position:65000,playing:false});await page.reload();await expect(director).toContainText('PAUSE');
 await expect(director).not.toHaveClass(/show-v1130-moving/);
 mock.setPlayback({position:8000,playing:true,trackId:'MockSecondSong1131AAAAA',title:'Second Mock Concert'});await page.reload();
 await expect(page.getByRole('heading',{name:'Second Mock Concert',exact:true})).toBeVisible();
 await expect(director).toHaveAttribute('data-show-chapter','0');
});
test('mixed original/headliner crew reprises whole-body motifs with answer roles from mocked song lyrics',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:65000,playing:false});await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 for(const [slot,id] of ['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass'].entries())await box.getByLabel(`Figur ${slot+1}`).selectOption(id);
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();
 await box.getByRole('button',{name:'Aktuelle Songposition übernehmen',exact:true}).click();
 await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=box.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 await expect.poll(async()=>(await rows.allTextContents()).every(s=>/Dance_(RobotGroove|FluidArc|FrontmanDrive|JazzRebound|CrossStep|TurnPhrase)/.test(s))).toBe(true);
 await expect.poll(async()=>(await rows.allTextContents()).filter(s=>s.includes(' · Antwort ·')).length).toBe(2);
 await expect(rows.first()).toContainText('Refrain 2');
 await testInfo.attach('mixed-crew-footwork-answer',{body:await canvas.screenshot(),contentType:'image/png'});
 await box.getByRole('button',{name:'Show-Simulation pausieren',exact:true}).click();
 await expect.poll(async()=>(await rows.allTextContents()).every(s=>s.includes('Pausiert'))).toBe(true);
});
test('live 3D stage renders the mixed crew and shared finale with mocked playback',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:95000});
 const loaded=new Set();page.on('response',response=>{if(response.ok()&&response.url().endsWith('.glb'))loaded.add(new URL(response.url()).pathname);});
 await page.addInitScript(()=>{
  localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'avatar',stageTheme:'classic',lyricsVisible:true,
   lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',microphoneEnabled:false,geniusSongInsightsEnabledV447:false,
   avatarModelId:'sonic-neon-pulse',secondaryAvatarModelId:'sonic-rio-carnival',avatarMotionMode:'hybrid',reducedMotion:false}));
  localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,
   modelIds:['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass',''],cues:[{id:'live-show',at:0,formation:'wide',focus:-1,drop:false,transition:.8,positions:[[-1.8,0,0],[0,0,0],[1.8,0,0]]}]}));
 });
 await page.goto('/');await expect(page.getByRole('heading',{name:'Aurora Mock Concert',exact:true})).toBeVisible();
 const canvas=page.locator('.immersive-stage canvas');await expect(canvas).toBeVisible({timeout:90000});
 await expect.poll(()=>['neon-pulse','rio-carnival','quantum-bass'].every(slug=>loaded.has(`/avatars/sonic/${slug}.glb`)),{timeout:90000}).toBe(true);
 await expect(page.getByRole('complementary',{name:'Intelligente Show-Regie'})).toHaveAttribute('data-show-act','finale');
 await testInfo.attach('live-mixed-crew-finale',{body:await page.screenshot(),contentType:'image/png'});
});

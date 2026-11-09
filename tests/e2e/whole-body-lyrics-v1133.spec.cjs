const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test.use({actionTimeout:15000});
async function seed(page){await page.addInitScript(()=>{
 localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive',expression:'bold'}));
 localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsImmersiveEnabled:false,
 lyricsStyle:'cinematic',lyricsWordHighlight:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-chrome-beat',reducedMotion:false}));
});}
test('chorus becomes a visible hero panel and highlights a genuinely timed keyword',async({page},testInfo)=>{
 test.setTimeout(120000);await installConcertMocksV1130(page,{position:33000,playing:false});await seed(page);await page.goto('/');
 const lyrics=page.getByRole('region',{name:'Songtext',exact:true});await expect(lyrics).toHaveAttribute('data-lyric-presentation','anthem');
 await expect(lyrics.locator('[data-v1133-keyword="true"]')).toHaveText('Licht ');
 const box=await lyrics.locator('.lyric.active').boundingBox();expect(box.y).toBeGreaterThan(70);expect(box.y+box.height).toBeLessThan(page.viewportSize().height-110);
 await testInfo.attach('chorus-keyword-stage',{body:await page.screenshot(),contentType:'image/png'});
});
test('fast mocked rap stays still, wraps completely and keeps one timed reading cursor',async({page},testInfo)=>{
 test.setTimeout(120000);const words='Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen'.split(' ');
 const tokens=[...words,...words];const text=tokens.join(' ');
 const lyricPayload={provider:'spotify',synced:true,plainText:text,lines:[{startMs:8000,endMs:16000,text,
 words:tokens.map((text,i)=>({text,startMs:8000+i*8000/tokens.length,endMs:8000+(i+1)*8000/tokens.length}))}]};
 await installConcertMocksV1130(page,{position:10000,playing:false,genre:'hiphop',lyricPayload});await seed(page);await page.goto('/');
 const lyrics=page.getByRole('region',{name:'Songtext',exact:true});await expect(lyrics).toHaveAttribute('data-lyric-presentation','rap');
 await expect(lyrics.locator('.lyric.active')).toContainText(text);await expect(lyrics.locator('[data-v1133-current="true"]')).toHaveCount(1);
 const css=await lyrics.locator('.lyric.active').evaluate(el=>{const s=getComputedStyle(el);return {animation:s.animationName,translate:s.translate,transform:s.transform,lineHeight:parseFloat(s.lineHeight),fontSize:parseFloat(s.fontSize)}});
 expect(css.animation).toBe('none');expect(css.translate).toBe('none');expect(css.transform).toBe('none');expect(css.lineHeight/css.fontSize).toBeGreaterThan(1.35);
 const box=await lyrics.locator('.lyric.active').boundingBox();expect(box.y).toBeGreaterThan(70);expect(box.y+box.height).toBeLessThan(page.viewportSize().height-110);
 await testInfo.attach('readable-rapid-lyrics',{body:await page.screenshot(),contentType:'image/png'});
});
test('robot, flowing dancer and frontman perform different real whole-body phrases',async({page},testInfo)=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:8000,playing:false});await seed(page);await page.goto('/');
 await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();await page.locator('[data-v571-tab="avatar"]').click();
 const box=page.getByRole('group',{name:'Sonic Stage Crew – Musik und gemeinsame Show',exact:true});
 for(const [slot,id] of ['sonic-chrome-beat','sonic-luna-flow','sonic-ember-rock'].entries())await box.getByLabel(`Figur ${slot+1}`).selectOption(id);
 await box.getByRole('button',{name:'Show-Simulation öffnen',exact:true}).click();await box.getByRole('button',{name:'Show-Simulation starten',exact:true}).click();
 const canvas=box.locator('canvas');await canvas.scrollIntoViewIfNeeded();
 // Seek into a verse duet, after assets are ready, to compare body style rather than a shared chorus.
 const rows=box.getByRole('list',{name:'Wiedergegebene Show-Clips'}).locator('li');await expect(rows).toHaveCount(3);
 const slider=box.getByLabel('Simulierte Position');await slider.focus();await slider.press('Home');for(let i=0;i<8;i++)await slider.press('ArrowRight');
 await expect(rows.nth(0)).toContainText('Dance_RobotGroove');await expect(rows.nth(1)).toContainText('Dance_FluidArc');await expect(rows.nth(2)).toContainText('Dance_FrontmanDrive');
 await testInfo.attach('distinct-whole-body-styles',{body:await canvas.screenshot(),contentType:'image/png'});
});

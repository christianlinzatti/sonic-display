const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
const {rapLyrics}=require('../fixtures/concertStressV1134.cjs');
async function setup(page,extra={}){
 await page.addInitScript(()=>{
  if(!localStorage.getItem('sonic-stage-crew-v4'))localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'individual'}));
  if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',wardrobeModeV468:'album'}));
  window.__ensembleCrew=[];window.__ensembleLights=[];
  window.addEventListener('sonic:crew-performance',e=>{window.__ensembleCrew.push(e.detail);window.__ensembleCrew=window.__ensembleCrew.slice(-90);});
  window.addEventListener('sonic:ensemble-light-delivered',e=>{window.__ensembleLights.push(e.detail);window.__ensembleLights=window.__ensembleLights.slice(-90);});
 });
 const mock=await installConcertMocksV1130(page,{position:14000,playing:true,advancing:false,genre:'rock',durationMs:180000,...extra});
 return mock;
}
async function open(page){await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();}
test('ensemble performs in song fabric looks; lyric motifs and opt-outs persist on a clean screen',async({page},testInfo)=>{
 test.setTimeout(180000);await setup(page);await open(page);
 const lane=page.getByRole('region',{name:'Songtext',exact:true});
 await expect(lane).toHaveAttribute('data-ensemble-lyrics',/halo|ribbon|brackets|constellation/);
 await expect.poll(()=>page.evaluate(()=>window.__ensembleCrew.some(f=>f.clip&&f.costume?.startsWith('Rock'))),{timeout:90000}).toBe(true);
 await expect(page.getByRole('button')).toHaveCount(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const wordGap=await lane.locator('.lyric.active').evaluate(line=>{
  const words=line.querySelectorAll('.kinetic-word');if(words.length<2)return null;
  const text=words[0].firstChild,range=document.createRange();range.setStart(text,0);range.setEnd(text,text.textContent.trimEnd().length);
  return words[1].getBoundingClientRect().left-range.getBoundingClientRect().right;
 });expect(wordGap,'Real spaces between timed words stay visibly readable').toBeGreaterThan(2);
 await page.screenshot({path:testInfo.outputPath('ensemble-show.png')});
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();
 await page.getByLabel('Songabhängige Outfit-Farben und Stofflooks',{exact:true}).uncheck();
 await page.getByLabel('Abwechslungsreiche Lyrics-Lichtbilder',{exact:true}).uncheck();
 await page.getByLabel('Ensemble: Blickwechsel und Antwortpausen',{exact:true}).uncheck();
 await expect(lane).toHaveAttribute('data-ensemble-lyrics','off');
 await page.evaluate(()=>{window.__ensembleCrew=[];});
 await expect.poll(()=>page.evaluate(()=>window.__ensembleCrew.some(f=>f.clip&&f.costume===null)),{timeout:30000}).toBe(true);
 await page.keyboard.press('Escape');await page.reload();await page.getByRole('button',{name:'Show steuern',exact:true}).click();
 await expect(page.getByLabel('Ensemble: Blickwechsel und Antwortpausen',{exact:true})).not.toBeChecked();
 await expect(page.getByLabel('Songabhängige Outfit-Farben und Stofflooks',{exact:true})).not.toBeChecked();
});
test('rap remains stable and pause/reduced motion remove lyric ornamentation',async({page})=>{
 test.setTimeout(180000);const mock=await setup(page,{lyricPayload:rapLyrics,position:10000,genre:'rap'});await open(page);
 const lane=page.getByRole('region',{name:'Songtext',exact:true});await expect(lane).toHaveAttribute('data-ensemble-lyrics','reading');await expect(lane.locator('.ensemble-lyric-ornament')).toHaveCount(0);
 const line=lane.locator('.lyric.active').first();await expect(line).toBeVisible();expect(await line.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 mock.setPlayback({lyricPayload:require('../fixtures/concertMocksV1130.cjs').lyrics,trackId:'NextMockSong',position:14000,playing:false});
 await expect(lane).toHaveAttribute('data-ensemble-lyrics','still',{timeout:30000});
 mock.setPlayback({playing:true});await page.emulateMedia({reducedMotion:'reduce'});await expect(lane).toHaveAttribute('data-ensemble-lyrics','still');
});
test('mock Govee bridge receives paced whole-lamp looks from the ensemble and stops with music-sync off',async({page})=>{
 test.setTimeout(180000);await setup(page);
 await page.addInitScript(()=>localStorage.setItem('sonic-display:govee-lan-v909',JSON.stringify({endpoint:'http://127.0.0.1:8765',token:'mock-bridge-only',enabled:true,autoSync:true,selectedIps:['192.168.1.42'],masterBrightness:50,directorEnabledV911:true,deviceRolesV911:{'192.168.1.42':'ambient'}})));
 const commands=[];await page.route('http://127.0.0.1:8765/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  // Slow inventory must not compress the gap between actual look commands.
  if(path==='/devices'&&req.method()==='GET')await new Promise(resolve=>setTimeout(resolve,1100));
  if(path==='/command'&&req.method()==='POST')commands.push({at:Date.now(),...req.postDataJSON()});
  return route.fulfill({status:200,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'},contentType:'application/json',body:JSON.stringify(path==='/devices'?{devices:[{ip:'192.168.1.42',sku:'H6008'}]}:{ok:true,device:{ip:'192.168.1.42',sku:'H6008'}})});
 });
 await open(page);await expect.poll(()=>page.evaluate(()=>window.__ensembleLights.some(f=>f.active)),{timeout:90000}).toBe(true);
 expect(commands.length).toBeGreaterThan(0);expect(commands.every(c=>c.action==='look'&&c.value.brightness<=50&&Object.values(c.value.color).every(v=>v>=0&&v<=255))).toBe(true);
 for(let i=1;i<commands.length;i++)expect(commands[i].at-commands[i-1].at).toBeGreaterThanOrEqual(850);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();await page.getByLabel('Govee folgt Ensemble und Lyrics',{exact:true}).uncheck();
 // Unchanged looks are intentionally suppressed. Expire the old stage cue, then
 // request a real cap change so the next delivered command can prove the opt-out.
 await page.waitForTimeout(2600);
 await page.evaluate(()=>{window.__ensembleLights=[];const key='sonic-display:govee-lan-v909',c=JSON.parse(localStorage.getItem(key));c.masterBrightness=30;localStorage.setItem(key,JSON.stringify(c));window.dispatchEvent(new Event('sonic-display:govee-lan-config-changed'));});
 await expect.poll(()=>page.evaluate(()=>window.__ensembleLights.some(f=>!f.active&&f.brightness<=30)),{timeout:30000}).toBe(true);
 await page.evaluate(()=>{const key='sonic-display:govee-lan-v909',c=JSON.parse(localStorage.getItem(key));c.autoSync=false;localStorage.setItem(key,JSON.stringify(c));window.dispatchEvent(new Event('sonic-display:govee-lan-config-changed'));});
 const stopped=commands.length;await page.waitForTimeout(2200);expect(commands.length).toBe(stopped);
});

const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
for(const worker of [true,false])test(`real Web Audio pulse train is measured and silence releases its beat clock (worker=${worker})`,async({page})=>{
 test.setTimeout(90000);
 await installConcertMocksV1130(page,{position:14000,playing:true,advancing:true,missingLyrics:true,genre:'house'});
 await page.addInitScript(enabled=>{
  localStorage.setItem('sonic-display:audio-worker',enabled?'on':'off');
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',microphoneEnabled:false,geniusSongInsightsEnabledV447:false}));
  const NativeAudioContext=window.AudioContext;window.__audioClocks=[];window.AudioContext=class extends NativeAudioContext{constructor(...args){super(...args);window.__audioClocks.push(this);}};
  window.__analysis=[];window.addEventListener('sonic:music-analysis',e=>{window.__analysis.push(e.detail);window.__analysis=window.__analysis.slice(-60);});
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{
   const ctx=new AudioContext(),destination=ctx.createMediaStreamDestination(),osc=ctx.createOscillator(),gain=ctx.createGain();
   osc.frequency.value=65;gain.gain.value=0;osc.connect(gain).connect(destination);osc.start();await ctx.resume();
   const origin=ctx.currentTime+.1;
   for(let i=0;i<80;i++){const at=origin+i*.5;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.5,at+.008);gain.gain.exponentialRampToValueAtTime(.00001,at+.11);gain.gain.setValueAtTime(0,at+.15);}
   window.__stopTestAudio=()=>{gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setValueAtTime(0,ctx.currentTime);};
   window.__testAudioContext=ctx;return destination.stream;
  }});
 },worker);
 await page.goto('/');await page.getByRole('button',{name:'Mikrofon aktivieren',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__analysis.some(f=>f.activity==='music'&&f.bpm>=115&&f.bpm<=125&&f.confidence>.65)),{timeout:25000}).toBe(true).catch(async error=>{console.error('AUDIO_EVIDENCE',JSON.stringify(await page.evaluate(()=>({frames:window.__analysis,context:window.__testAudioContext?.state,time:window.__testAudioContext?.currentTime,clocks:window.__audioClocks?.map(c=>({state:c.state,time:c.currentTime}))}))));throw error;});
 if(worker){await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await page.getByRole('button',{name:'Show steuern',exact:true}).click();await page.getByRole('button',{name:'Kalibrierung starten',exact:true}).click();await expect(page.getByText('Empfohlene Empfindlichkeit:',{exact:false})).toBeVisible({timeout:20000});await page.keyboard.press('Escape');}
 await page.evaluate(()=>{window.__analysis=[];window.__stopTestAudio();});
 await expect.poll(()=>page.evaluate(()=>{const f=window.__analysis.at(-1);return f?.activity==='quiet'&&f.bpm===null&&f.locked===false;}),{timeout:10000}).toBe(true);
 await page.evaluate(()=>window.__testAudioContext.close());
});
test('concert drawer identifies the estimated source without cluttering the stage',async({page})=>{
 await installConcertMocksV1130(page,{position:14000,playing:true,advancing:true,genre:'house'});
 await page.addInitScript(()=>localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',microphoneEnabled:false,lyricsVisible:true,geniusSongInsightsEnabledV447:false})));
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await expect(page.getByRole('button')).toHaveCount(2);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();await expect(page.getByLabel('Musikanalyse',{exact:true})).toContainText('keine Audioanalyse aktiv');
});

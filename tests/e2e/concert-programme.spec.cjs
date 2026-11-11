const {test,expect}=require('./fixtures.cjs');const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test('programme follows real song IDs, variants restore and tab video survives the closed drawer',async({page})=>{
 test.setTimeout(180000);await installConcertMocksV1130(page,{position:17000,playing:true,advancing:true,genre:'house'});
 await page.addInitScript(()=>{
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false,avatarModelId:'sonic-neon-pulse',avatarMotionMode:'hybrid',geniusSongInsightsEnabledV447:false}));
  Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{configurable:true,value:async()=>{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;const ctx=canvas.getContext('2d'),stream=canvas.captureStream(10);let n=0;const timer=setInterval(()=>{ctx.fillStyle=n++%2?'#004488':'#442288';ctx.fillRect(0,0,320,180);if(stream.getVideoTracks()[0].readyState==='ended')clearInterval(timer);},100);return stream;}});
 });
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await page.getByRole('button',{name:'Show steuern',exact:true}).click();
 await page.getByLabel('Konzertprogramm',{exact:true}).fill('MockConcertV1130TrackA | Auftakt | neon');await page.getByRole('button',{name:'Programm speichern',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')).showStyle)).toBe('neon');
 await page.getByRole('button',{name:'Showvariante speichern',exact:true}).click();await expect(page.getByLabel('Gespeicherte Showvariante')).toContainText('Aurora');
 await page.getByRole('button',{name:'Gewählte Variante laden',exact:true}).click();await expect(page.getByText(/Letzte Regievariante geladen/)).toBeVisible();
 await page.getByRole('button',{name:'Showvideo aufnehmen',exact:true}).click();await expect(page.getByRole('button',{name:'Aufnahme stoppen',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button')).toHaveCount(2);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();await page.getByRole('button',{name:'Aufnahme stoppen',exact:true}).click();await expect(page.getByRole('link',{name:'Video herunterladen',exact:true})).toHaveAttribute('href',/^blob:/);
});

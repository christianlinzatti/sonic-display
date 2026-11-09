const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test('the incoming refrain lead is prepared while the build grows and lyric gaps stay quiet',async({page})=>{
 test.setTimeout(120000);
 const mock=await installConcertMocksV1130(page,{position:61000,playing:false});
 await page.addInitScript(()=>{
  localStorage.setItem('sonic-stage-crew-v4',JSON.stringify({enabled:true,reactions:true,mode:'adaptive'}));
  localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,lyricsImmersiveEnabled:false,lyricsStyle:'cinematic',microphoneEnabled:false}));
  localStorage.setItem('sonic-multi-avatar-stage-v326',JSON.stringify({enabled:true,count:3,songSync:false,trackId:'',bpm:120,snap:'bar',minSpacing:1.2,modelIds:['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass',''],cues:[]}));
 });
 const director=page.getByRole('complementary',{name:'Intelligente Show-Regie'});
 await page.goto('/');await expect(director).toHaveAttribute('data-show-staging','anticipation');
 await expect(director).toHaveAttribute('data-show-leader','1');
 await expect(director).toHaveAttribute('data-show-build','0.000');
 mock.setPlayback({position:63500});await page.reload();
 await expect(director).toHaveAttribute('data-show-leader','1');
 await expect.poll(async()=>Number(await director.getAttribute('data-show-build'))).toBeGreaterThan(.9);
 await expect(director).toHaveAttribute('data-show-accent','0.000');
 mock.setPlayback({position:64600});await page.reload();
 await expect(director).toHaveAttribute('data-show-staging','chorus');await expect(director).toHaveAttribute('data-show-leader','1');
 const text=page.getByRole('region',{name:'Songtext',exact:true});await expect(text).toHaveAttribute('data-lyric-presentation','anthem');
 mock.setPlayback({position:70000});await page.reload();
 await expect(director).toHaveAttribute('data-show-staging','breath');await expect(text).toHaveAttribute('data-lyric-presentation','none');
 expect(mock.calls.spotify).toBeGreaterThan(0);expect(mock.calls.lyrics).toBeGreaterThan(0);
});

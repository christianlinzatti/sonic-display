const {test,expect}=require('./audio-fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
test.use({audioVariant:'worker'});
require('../fixtures/measuredAudioBrowser.cjs')(test,expect,true);
test('concert drawer identifies the estimated source without cluttering the stage',async({page})=>{
 await installConcertMocksV1130(page,{position:14000,playing:true,advancing:true,genre:'house'});
 await page.addInitScript(()=>localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',microphoneEnabled:false,lyricsVisible:true,geniusSongInsightsEnabledV447:false})));
 await page.goto('/');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await expect(page.getByRole('button')).toHaveCount(2);
 await page.getByRole('button',{name:'Show steuern',exact:true}).click();await expect(page.getByLabel('Musikanalyse',{exact:true})).toContainText('keine Audioanalyse aktiv');
});

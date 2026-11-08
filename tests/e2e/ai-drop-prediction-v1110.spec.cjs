'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
// Runs against REAL next start on Chromium desktop & touch. No microphone
// permissions, external services or actual Govee hardware required.
test('V1110 Drop Radar never predicts without local opt-in microphone signal',async({page},testInfo)=>{
 const requests=[];
 page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const radar=dialog.getByRole('group',{name:'V1110 AI Drop Prediction'});
 await expect(radar).toBeVisible();
 await expect(radar.getByRole('button',{name:'Drop-Dramaturgie für nächste Vorschau vormerken'})).toBeDisabled();
 // The UI must reject certainty, without requiring the older wording.
 await expect(radar).toContainText('weder einen echten Drop noch dessen Zeitpunkt sicher vorhersagen');
 await expect(radar).toContainText('Keine automatische Lichtsteuerung');
 expect(requests).toEqual([]);
 await testInfo.attach('v1110-drop-radar-privacy-screenshot',{body:await radar.screenshot(),contentType:'image/png'});
});
test('V1110 standard offline remix still previews seven scenes without any automatic device activation',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const radar=producer.getByRole('group',{name:'V1110 AI Drop Prediction'});
 await expect(radar).toBeVisible();
 await producer.getByRole('button',{name:'Offline-Remix ausprobieren'}).click();
 const preview=producer.locator('[aria-label="V1106 Show Remix Vorschau"]');
 await expect(preview).toBeVisible();
 await expect(preview.locator('li')).toHaveCount(7);
 await expect(radar.getByRole('button',{name:'Drop-Dramaturgie für nächste Vorschau vormerken'})).toBeDisabled();
 await testInfo.attach('v1110-drop-preview-screenshot',{body:await preview.screenshot(),contentType:'image/png'});
});

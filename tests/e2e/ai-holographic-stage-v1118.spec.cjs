'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Desktop and touch against REAL Next production, no devices or accounts required.
test('V1118 holographic director creates seven optical scenes without modifying saved show or calling AI',async({page},testInfo)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const holo=producer.getByRole('group',{name:'V1118 AI Holographic Stage Director'});
 await expect(holo).toBeVisible();
 await holo.getByRole('combobox',{name:'Hologramm-Regiestil'}).selectOption('cosmic');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await holo.getByRole('button',{name:'V1118 Hologramm-Show jetzt proben'}).click();
 const preview=producer.getByRole('region',{name:'V1118 Holographic Stage Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1118 sieben holografische Szenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1118 Hologramm-Qualität'})).toContainText('Atempause');
 await expect(preview.getByRole('status',{name:'V1118 Aktueller Hologramm-Fokus'})).toContainText('Regieprobe');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await testInfo.attach('v1118-holo-optical-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1118 optical rehearsal requires separate approval and existing director for real virtual effects',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const holo=producer.getByRole('group',{name:'V1118 AI Holographic Stage Director'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaHolographicConcertEnabledV1068??false,STORE);
 await holo.getByRole('button',{name:'V1118 Hologramm-Show jetzt proben'}).click();
 await expect(producer.getByRole('region',{name:'V1118 Holographic Stage Partitur'})).toBeVisible();
 await producer.getByRole('button',{name:'V1118 vorhandene virtuelle Hologramm-Show aktivieren'}).click();
 await expect(producer.getByRole('status').filter({hasText:'V1118 benötigt den aktivierten'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaHolographicConcertEnabledV1068??false,STORE);
 expect(after).toEqual(before);
});

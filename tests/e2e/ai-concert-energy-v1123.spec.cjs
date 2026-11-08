'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Real production Chromium desktop + touch, no external permission, AI API or devices.
test('V1123 local five-channel energy rehearsal leaves saved show untouched',async({page},info)=>{
 const calls=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))calls.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const remix=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const energy=remix.getByRole('group',{name:'V1123 AI Concert Energy Director'});
 await expect(energy).toBeVisible();
 await energy.getByRole('combobox',{name:'Energiedramaturgie'}).selectOption('festival');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await energy.getByRole('button',{name:'V1123 Konzertenergie jetzt proben'}).click();
 const preview=remix.getByRole('region',{name:'V1123 Concert Energy Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1123 sieben Energieszenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1123 Energiequalität'})).toContainText('fünf koordinierte Regiekanäle');
 await expect(preview.getByRole('status',{name:'V1123 Aktuelle Konzertenergie'})).toContainText('keine aktuelle Lautstärkemessung');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(calls).toEqual([]);
 await info.attach('v1123-energy-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1123 live energy activation is blocked if current show director has not been enabled',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const remix=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const energy=remix.getByRole('group',{name:'V1123 AI Concert Energy Director'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaSmartConcertFlowEnabledV1071??false,STORE);
 await energy.getByRole('button',{name:'V1123 Konzertenergie jetzt proben'}).click();
 const preview=remix.getByRole('region',{name:'V1123 Concert Energy Partitur'});
 await preview.getByRole('button',{name:'V1123 vorhandene virtuelle Konzertregie aktivieren'}).click();
 await expect(remix.getByRole('status').filter({hasText:'V1123 benötigt Show Designer'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaSmartConcertFlowEnabledV1071??false,STORE);
 expect(after).toBe(before);
});

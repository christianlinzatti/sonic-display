'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Real production Chromium desktop and touch; no external device, AI API or audio permission.
test('V1122 preview builds seven bounded virtual atmosphere scenes without saving plan or issuing API calls',async({page},info)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const remix=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const atmosphere=remix.getByRole('group',{name:'V1122 AI Concert Atmosphere Director'});
 await atmosphere.getByRole('combobox',{name:'Atmosphärenstil'}).selectOption('ethereal');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await atmosphere.getByRole('button',{name:'V1122 Atmosphäre jetzt proben'}).click();
 const preview=remix.getByRole('region',{name:'V1122 Concert Atmosphere Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1122 sieben Atmosphärenszenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1122 Atmosphärenqualität'})).toContainText('Lyrics-Sicht geschützt');
 await expect(preview.getByRole('status',{name:'V1122 Aktuelle Atmosphäre'})).toContainText('virtuelle Regieprobe');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await info.attach('v1122-virtual-atmosphere-preview',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1122 cannot activate virtual atmosphere while show director is disabled',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const remix=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const atmosphere=remix.getByRole('group',{name:'V1122 AI Concert Atmosphere Director'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaAtmosphereDirectorEnabledV1045??false,STORE);
 await atmosphere.getByRole('button',{name:'V1122 Atmosphäre jetzt proben'}).click();
 const preview=remix.getByRole('region',{name:'V1122 Concert Atmosphere Partitur'});
 await preview.getByRole('button',{name:'V1122 vorhandene virtuelle Atmosphäre aktivieren'}).click();
 await expect(remix.getByRole('status').filter({hasText:'V1122 benötigt 360°-Show Designer'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaAtmosphereDirectorEnabledV1045??false,STORE);
 expect(after).toBe(before);
});

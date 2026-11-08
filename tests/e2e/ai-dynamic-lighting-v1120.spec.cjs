'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Runs against production next start in Chromium desktop and touch: no device connection.
test('V1120 lighting rehearsal is local, reversible and does not save an unapproved show',async({page},testInfo)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const lighting=group.getByRole('group',{name:'V1120 AI Dynamic Lighting Conductor'});
 await expect(lighting).toBeVisible();
 await lighting.getByRole('combobox',{name:'Virtueller Licht-Regiestil'}).selectOption('holographic');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await lighting.getByRole('button',{name:'V1120 Lichtshow jetzt proben'}).click();
 const preview=group.getByRole('region',{name:'V1120 Dynamic Lighting Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1120 sieben Lichtszenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1120 Licht-Qualität'})).toContainText('ruhige Atempause');
 await expect(preview.getByRole('status',{name:'V1120 Aktueller Lichtfokus'})).toContainText('virtuelle Lichtprobe');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await testInfo.attach('v1120-virtual-lighting-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1120 separate virtual lighting opt-in refuses inactive show director',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const lighting=group.getByRole('group',{name:'V1120 AI Dynamic Lighting Conductor'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaLightingChoreographerEnabledV1060??false,STORE);
 await lighting.getByRole('button',{name:'V1120 Lichtshow jetzt proben'}).click();
 await expect(group.getByRole('region',{name:'V1120 Dynamic Lighting Partitur'})).toBeVisible();
 await group.getByRole('button',{name:'V1120 vorhandene virtuelle Lichtregie aktivieren'}).click();
 await expect(group.getByRole('status').filter({hasText:'V1120 benötigt den 360°-Show Designer'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaLightingChoreographerEnabledV1060??false,STORE);
 expect(after).toEqual(before);
});

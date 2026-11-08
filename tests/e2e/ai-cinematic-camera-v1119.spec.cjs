'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Chromium desktop/touch against real next start, without external services.
test('V1119 cinematic camera rehearsal is offline, editable and preserves saved concert',async({page},testInfo)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const camera=group.getByRole('group',{name:'V1119 AI Cinematic Camera Director'});
 await expect(camera).toBeVisible();
 await camera.getByRole('combobox',{name:'Kamera-Regiestil'}).selectOption('immersive');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await camera.getByRole('button',{name:'V1119 Kamerafahrt jetzt proben'}).click();
 const preview=group.getByRole('region',{name:'V1119 Cinematic Camera Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1119 sieben Kameraszenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1119 Kamera-Qualität'})).toContainText('ruhige Atempause');
 await expect(preview.getByRole('status',{name:'V1119 Aktueller Kamerafokus'})).toContainText('Kameraprobe');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await testInfo.attach('v1119-cinematic-camera-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1119 virtual live camera opt-in is blocked without the real show director',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const camera=group.getByRole('group',{name:'V1119 AI Cinematic Camera Director'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaCameraDirectorEnabledV1072??false,STORE);
 await camera.getByRole('button',{name:'V1119 Kamerafahrt jetzt proben'}).click();
 await expect(group.getByRole('region',{name:'V1119 Cinematic Camera Partitur'})).toBeVisible();
 await group.getByRole('button',{name:'V1119 vorhandene filmische Kamerafahrten aktivieren'}).click();
 await expect(group.getByRole('status').filter({hasText:'V1119 benötigt den aktiven'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaCameraDirectorEnabledV1072??false,STORE);
 expect(after).toEqual(before);
});

'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Runs on REAL next start for both configured Chromium desktop and touch.
test('V1117 360-degree stage transformation is a non-mutating local rehearsal',async({page},testInfo)=>{
 const requests=[];
 page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const stage=producer.getByRole('group',{name:'V1117 AI Stage Transformation'});
 await expect(stage).toBeVisible();
 await stage.getByRole('combobox',{name:'Bühnenverwandlungsstil'}).selectOption('floating');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await stage.getByRole('button',{name:'V1117 Bühnenverwandlung jetzt proben'}).click();
 const preview=producer.getByRole('region',{name:'V1117 Stage Transformation Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1117 sieben Bühnenverwandlungen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1117 Bühnenqualität'})).toContainText('weiche Übergänge');
 await expect(preview.getByRole('status',{name:'V1117 Aktuelle Bühnenszene'})).toContainText('Regieprobe');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await testInfo.attach('v1117-stage-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1117 stage preview applies only on confirmation and restores authored plan',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const stage=producer.getByRole('group',{name:'V1117 AI Stage Transformation'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await stage.getByRole('combobox',{name:'Bühnenverwandlungsstil'}).selectOption('monumental');
 await stage.getByRole('button',{name:'V1117 Bühnenverwandlung jetzt proben'}).click();
 await expect(producer.getByRole('region',{name:'V1117 Stage Transformation Partitur'})).toBeVisible();
 // Require the existing explicit V1106 save approval; no real devices are accessed.
 await producer.getByRole('button',{name:'Diese sieben Szenen in meinen Showplan übernehmen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040?.segments?.length??0,STORE)).toBe(7);
 await producer.getByRole('button',{name:'Letzten Remix rückgängig machen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
});

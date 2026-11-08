'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const KEY='sonic-display-ui-preferences-v1';
test('V1106 AI Creative Producer: offline 7-act preview, explicit apply and undo on 360 stage',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 await expect(producer).toBeVisible();
 const original=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,KEY);
 await producer.getByRole('button',{name:'Offline-Remix ausprobieren'}).click();
 const preview=producer.locator('[aria-label="V1106 Show Remix Vorschau"]');
 await expect(preview.locator('li')).toHaveCount(7);
 await testInfo.attach('v1106-preview',{body:await producer.screenshot(),contentType:'image/png'});
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,KEY)).toEqual(original);
 await producer.getByRole('button',{name:'Diese sieben Szenen in meinen Showplan übernehmen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040?.segments?.length??0,KEY)).toBe(7);
 await expect(producer.getByRole('button',{name:'Letzten Remix rückgängig machen'})).toBeVisible();
 await producer.getByRole('button',{name:'Letzten Remix rückgängig machen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,KEY)).toEqual(original);
});
test('V1106 AI endpoint rejects cross-origin requests before any AI call',async({request})=>{
 const response=await request.post('/api/ai/show-remix',{
  headers:{Origin:'https://attacker.example','Content-Type':'application/json'},
  data:{prompt:'dramatischer stage remix',genre:'rap',intensityCap:65},
 });
 expect(response.status()).toBe(403);
});

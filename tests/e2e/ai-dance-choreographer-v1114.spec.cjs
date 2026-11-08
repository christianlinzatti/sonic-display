'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const PREFS='sonic-display-ui-preferences-v1';
// Real desktop/touch Chrome; no OpenAI, microphone or hardware access.
test('V1114 dance rehearsal shows seven scenes and three performers without saving',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const director=producer.getByRole('group',{name:'V1114 AI Dance Choreographer'});
 await expect(director).toBeVisible();
 await director.getByRole('combobox',{name:'Choreografie-Stil'}).selectOption('festival');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,PREFS);
 await director.getByRole('button',{name:'V1114 Tanzchoreografie jetzt proben'}).click();
 const score=producer.getByRole('region',{name:'V1114 Dance Choreographer Partitur'});
 await expect(score).toBeVisible();
 await expect(score.getByRole('list',{name:'V1114 sieben Tanzszenen'}).locator(':scope > li')).toHaveCount(7);
 await expect(score.getByRole('note',{name:'V1114 Tanzqualität'})).toContainText('kontrollierte Übergänge');
 await expect(score.getByRole('status',{name:'V1114 Aktuelle Tanzszene'})).toBeVisible();
 await expect(score.getByText(/Festival Nova/).first()).toBeVisible();
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,PREFS)).toEqual(before);
 await testInfo.attach('v1114-dance-rehearsal-screenshot',{body:await score.screenshot(),contentType:'image/png'});
});
test('V1114 stage crew automatic real-clip mode requires consent and undo restores settings',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const director=producer.getByRole('group',{name:'V1114 AI Dance Choreographer'});
 await director.getByRole('button',{name:'V1114 Tanzchoreografie jetzt proben'}).click();
 const score=producer.getByRole('region',{name:'V1114 Dance Choreographer Partitur'});
 const crewBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')||'null'));
 await score.getByRole('button',{name:'V1114 Stage-Crew-Automatik für echte GLB-Clips aktivieren'}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')||'{}')?.mode)).toBe('story');
 await director.getByRole('button',{name:'Früheren Stage-Crew-Modus wiederherstellen'}).click();
 const old=crewBefore?.mode??'individual';
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-stage-crew-v4')||'{}')?.mode)).toBe(old);
 await testInfo.attach('v1114-crew-undo-screenshot',{body:await director.screenshot(),contentType:'image/png'});
});

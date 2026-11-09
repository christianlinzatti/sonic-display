'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
test('V1124 offline audience rehearsal shows seven waves without saving a show or requesting AI',async({page},info)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const root=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const form=root.getByRole('group',{name:'V1124 AI Audience Energy Sync'});
 await expect(form).toBeVisible();
 await form.getByRole('combobox',{name:'Publikumsinszenierung'}).selectOption('festival');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await form.getByRole('button',{name:'V1124 Publikumswellen jetzt proben'}).click();
 const preview=root.getByRole('region',{name:'V1124 Audience Energy Sync Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1124 sieben Publikumswellen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1124 Publikumsqualität'})).toContainText('ruhige Atempause');
 await expect(preview.getByRole('status',{name:'V1124 Aktuelle Publikumswelle'})).toContainText('keine Messung');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await info.attach('v1124-audience-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1124 refuses live audience opt-in without enabled concert director and crowd',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const root=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const form=root.getByRole('group',{name:'V1124 AI Audience Energy Sync'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaAudienceExperienceEnabledV1073??false,STORE);
 await form.getByRole('button',{name:'V1124 Publikumswellen jetzt proben'}).click();
 await root.getByRole('region',{name:'V1124 Audience Energy Sync Partitur'})
  .getByRole('button',{name:'V1124 vorhandene virtuelle Publikumsregie aktivieren'}).click();
 await expect(root.getByRole('status').filter({hasText:'V1124 benötigt Show Designer'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaAudienceExperienceEnabledV1073??false,STORE);
 expect(after).toBe(before);
});

'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
// Desktop and touch run against the real production build, no microphone or accounts.
test('V1127 crowd optimization preserves safe V1125 preview and seven fixed scenes',async({page},info)=>{
 const requests=[];
 page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const festival=producer.getByRole('group',{name:'V1125 AI Festival Crowd Director 2.0'});
 await expect(festival).toBeVisible();
 await festival.getByRole('combobox',{name:'Räumliche Publikumsformation'}).selectOption('stadium');
 await festival.getByRole('button',{name:'V1125 Acht-Sektoren-Festival jetzt proben'}).click();
 const preview=producer.getByRole('region',{name:'V1125 Festival Crowd Director Partitur'});
 await expect(preview.getByRole('list',{name:'V1125 sieben Festival-Szenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1125 Festival-Qualität'})).toContainText('8 feste Crowd-Sektoren');
 expect(requests).toEqual([]);
 await info.attach('v1127-fixed-crowd-preview',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1127 keeps manually controlled crowd opt-in protected',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const festival=producer.getByRole('group',{name:'V1125 AI Festival Crowd Director 2.0'});
 await festival.getByRole('button',{name:'V1125 Acht-Sektoren-Festival jetzt proben'}).click();
 const preview=producer.getByRole('region',{name:'V1125 Festival Crowd Director Partitur'});
 await preview.getByRole('button',{name:'V1125 virtuelle Acht-Sektoren-Regie aktivieren'}).click();
 await expect(producer.getByRole('status').filter({hasText:'V1125 benötigt Show Designer'})).toBeVisible();
});

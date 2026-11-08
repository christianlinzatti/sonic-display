'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Real production Chromium desktop/touch. No external devices, accounts or permissions.
test('V1112 editable Stage Crew personalities produce a safe rehearsal, without changing saved show',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const group=producer.getByRole('group',{name:'V1112 AI Avatar Personality'});
 await expect(group).toBeVisible();
 await group.getByRole('combobox',{name:'Neon Pulse Bühnenpersönlichkeit'}).selectOption('mystery');
 await group.getByRole('combobox',{name:'Festival Nova Bühnenpersönlichkeit'}).selectOption('frontman');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await group.getByRole('button',{name:'V1112 Avatar-Performance jetzt proben'}).click();
 const preview=producer.getByRole('region',{name:'V1112 Avatar Personality Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1112 sieben Charakter-Szenen'}).locator('li')).toHaveCount(7);
 await expect(preview.getByRole('note',{name:'V1112 Charakter-Qualität'})).toContainText('kontrollierte Übergänge');
 // The focus follows the current rehearsal position, not a fixed artist.
 // Validate that the current scene's featured performer belongs to its
 // actual cue, regardless of where the scrubber starts on desktop or touch.
 const current=await preview.getByRole('status',{name:'V1112 Aktueller Avatar-Fokus'}).innerText();
 const match=/Szene ([1-7]): (Neon Pulse|Festival Nova|Chrome Beat|Alle drei zusammen) · Kamera (\w+) · Tanz (\w+)/.exec(current);
 expect(match,'current rehearsal cue should identify the scene and artist').not.toBeNull();
 const scene=preview.getByRole('list',{name:'V1112 sieben Charakter-Szenen'}).locator('li').nth(Number(match[1])-1);
 await expect(scene).toContainText('Szene '+match[1]);
 if(match[2]!=='Alle drei zusammen')await expect(scene).toContainText(match[2]);
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 await testInfo.attach('v1112-personality-rehearsal-screenshot',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1112 intentional approval adjusts existing timeline modes and undo restores saved plan',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const group=producer.getByRole('group',{name:'V1112 AI Avatar Personality'});
 await group.getByRole('combobox',{name:'Neon Pulse Bühnenpersönlichkeit'}).selectOption('mystery');
 await group.getByRole('checkbox',{name:'Charakterregie auch auf neue Offline-/OpenAI-Entwürfe anwenden'}).check();
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await producer.getByRole('button',{name:'Offline-Remix ausprobieren'}).click();
 const preview=producer.getByRole('region',{name:'V1106 Show Remix Vorschau'});
 await expect(preview.getByRole('list',{name:'V1112 sieben Charakter-Szenen'}).locator('li')).toHaveCount(7);
 await preview.getByRole('button',{name:'Diese sieben Szenen in meinen Showplan übernehmen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040?.segments?.[1]?.camera??null,STORE)).toBe('orbit');
 await producer.getByRole('button',{name:'Letzten Remix rückgängig machen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 await testInfo.attach('v1112-personality-approved-undo-screenshot',{body:await group.screenshot(),contentType:'image/png'});
});

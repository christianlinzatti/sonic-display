'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORAGE='sonic-display-ui-preferences-v1';

// Production Next.js + real Chromium desktop/touch; no external AI, microphone
// permissions or Govee hardware required. Passing cases attach fresh images.
test('V1109 story arc creates seven cinematic beats without changing the stored show',async({page},testInfo)=>{
 const settings=await openSettings(page,'avatar');
 await settings.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=settings.getByRole('group',{name:'V1106 KI Show Remix'});
 const story=producer.getByRole('group',{name:'V1109 AI Concert Story Engine'});
 await expect(story).toBeVisible();
 await story.getByRole('combobox',{name:'Erzählbogen'}).selectOption('mystery');
 await story.getByRole('combobox',{name:'Spannungsverteilung'}).selectOption('slow-burn');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORAGE);
 await story.getByRole('button',{name:'Storybogen lokal entwerfen'}).click();
 const preview=producer.locator('[aria-label="V1106 Show Remix Vorschau"]');
 const beats=preview.getByRole('list',{name:'V1109 sieben Storyphasen'});
 await expect(beats.locator('li')).toHaveCount(7);
 await expect(preview).toContainText('Rätsel, Enthüllung und Finale');
 await expect(preview.getByRole('note',{name:'V1109 Story-Qualitätscheck'})).toContainText('sanfte Übergänge');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORAGE)).toEqual(before);
 await testInfo.attach('v1109-story-preview-screenshot',{body:await preview.screenshot(),contentType:'image/png'});
});

test('V1109 optional story remix applies only after consent and supports undo',async({page},testInfo)=>{
 const settings=await openSettings(page,'avatar');
 await settings.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const producer=settings.getByRole('group',{name:'V1106 KI Show Remix'});
 const story=producer.getByRole('group',{name:'V1109 AI Concert Story Engine'});
 await story.getByRole('checkbox',{name:'Storybogen auch auf neue Offline-/OpenAI-Remixe anwenden'}).check();
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORAGE);
 await producer.getByRole('button',{name:'Offline-Remix ausprobieren'}).click();
 const preview=producer.locator('[aria-label="V1106 Show Remix Vorschau"]');
 await expect(preview.getByRole('list',{name:'V1109 sieben Storyphasen'}).locator('li')).toHaveCount(7);
 await preview.getByRole('button',{name:'Diese sieben Szenen in meinen Showplan übernehmen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040?.segments?.length??0,STORAGE)).toBe(7);
 await producer.getByRole('button',{name:'Letzten Remix rückgängig machen'}).click();
 await expect.poll(()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORAGE)).toEqual(before);
 await testInfo.attach('v1109-story-undo-screenshot',{body:await story.screenshot(),contentType:'image/png'});
});

'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
const STORE='sonic-display-ui-preferences-v1';
// Runs against REAL Next production Chromium desktop and touch. No hardware, audio or cloud.
test('V1121 previews six disjoint transitions locally with a scrubbed boundary',async({page},testInfo)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const transitions=group.getByRole('group',{name:'V1121 AI Immersive Scene Transitions'});
 await expect(transitions).toBeVisible();
 await transitions.getByRole('combobox',{name:'Übergangs-Regiestil'}).selectOption('holographic');
 await transitions.getByRole('combobox',{name:'Übergangslänge'}).selectOption('long');
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE);
 await transitions.getByRole('button',{name:'V1121 Übergänge jetzt proben'}).click();
 const preview=group.getByRole('region',{name:'V1121 Immersive Scene Transitions Partitur'});
 await expect(preview).toBeVisible();
 await expect(preview.getByRole('list',{name:'V1121 sechs Szenenübergänge'}).locator('li')).toHaveCount(6);
 await expect(preview.getByRole('note',{name:'V1121 Übergangsqualität'})).toContainText('keine überlappenden Zeitfenster');
 // Rehearsal can be set explicitly to the authored 8.5%-boundary without Spotify.
 await preview.getByRole('slider',{name:'V1121 Probenposition'}).evaluate(el=>{
  const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  setter.call(el,'8.5');el.dispatchEvent(new Event('input',{bubbles:true}));
  el.dispatchEvent(new Event('change',{bubbles:true}));
 });
 await expect(preview.getByRole('status',{name:'V1121 Aktueller Übergang'})).toContainText('Übergang 1');
 expect(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaShowPlanV1040??null,STORE)).toEqual(before);
 expect(requests).toEqual([]);
 await testInfo.attach('v1121-seam-rehearsal',{body:await preview.screenshot(),contentType:'image/png'});
});
test('V1121 virtual renderer opt-in is refused while show director is inactive',async({page})=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const transitions=group.getByRole('group',{name:'V1121 AI Immersive Scene Transitions'});
 const before=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaSmartConcertFlowEnabledV1071??false,STORE);
 await transitions.getByRole('button',{name:'V1121 Übergänge jetzt proben'}).click();
 const preview=group.getByRole('region',{name:'V1121 Immersive Scene Transitions Partitur'});
 await expect(preview).toBeVisible();
 await preview.getByRole('button',{name:'V1121 vorhandene virtuelle Übergangsregie aktivieren'}).click();
 await expect(group.getByRole('status').filter({hasText:'V1121 benötigt Show Designer'})).toBeVisible();
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'{}').arenaSmartConcertFlowEnabledV1071??false,STORE);
 expect(after).toBe(before);
});

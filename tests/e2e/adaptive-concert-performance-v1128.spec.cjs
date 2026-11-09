'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');
// Real Next.js production build with Chromium desktop and touch, no microphone or accounts.
test('V1128 adaptive stage remains available without granting permission or changing showplan',async({page},info)=>{
 const requests=[];page.on('request',r=>{if(r.url().includes('/api/ai/show-remix'))requests.push(r.url());});
 const dialog=await openSettings(page,'diagnostics');
 await expect(dialog).toBeVisible();
 // The 3D performance settings are in the diagnostics section.
 const status=dialog.getByRole('status',{name:'V1128 adaptive concert FX status'});
 await expect(status).toBeVisible();
 await expect(status).toContainText('V1128 Adaptive Concert Performance');
 await expect(status).toContainText('Govee-Hardware');
 expect(requests).toEqual([]);
 await info.attach('v1128-adaptive-settings',{body:await status.screenshot(),contentType:'image/png'});
});
test('V1128 manual performance profile does not trigger adaptive scene transitions',async({page})=>{
 const dialog=await openSettings(page,'diagnostics');
 const mode=dialog.locator('#performance-mode');
 await expect(mode).toBeVisible();
 await mode.selectOption('balanced');
 const status=dialog.getByRole('status',{name:'V1128 adaptive concert FX status'});
 await expect(status).toContainText('full');
 await mode.selectOption('auto');
});

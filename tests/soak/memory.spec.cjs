const {test,expect}=require('@playwright/test');
const minutes=Number(process.env.SONIC_SOAK_MINUTES||60);
test('production avatar resources remain bounded across repeated mount and model changes',async({page},info)=>{
 test.setTimeout((minutes+3)*60000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cdp=await page.context().newCDPSession(page);
 await page.goto('/');
 const sample=async(cycle)=>{
  // React and the WebGL renderer finish teardown asynchronously. Sample after that work,
  // then a second GC; an immediate GC can itself postpone pending renderer cleanup.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForTimeout(750);await cdp.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(250);await cdp.send('HeapProfiler.collectGarbage');return {cycle,at:Date.now(),...(await cdp.send('Runtime.getHeapUsage')),...(await cdp.send('Memory.getDOMCounters'))};};
 const cycle=async()=>{
  await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Sonic Display Einstellungen'});await dialog.locator('[data-v571-tab="avatar"]').click();
  await dialog.getByRole('button',{name:/sonic-playwright-reference/}).click();
  const preview=dialog.locator('.settings-avatar-preview');await expect(preview.getByRole('heading',{name:'sonic-playwright-reference',exact:true})).toBeVisible();
  await expect(preview.locator('canvas')).toBeVisible();
  const play=preview.getByRole('button',{name:'▶ Tanz testen',exact:true});await expect(play).toBeEnabled();
  await play.click();await expect(preview.getByRole('button',{name:'⏸ Tanz pausieren',exact:true})).toHaveAttribute('aria-pressed','true');
  await preview.getByRole('button',{name:'⏸ Tanz pausieren',exact:true}).click();
  await dialog.getByRole('button',{name:/^Procedural/}).click();await expect(preview.getByRole('heading',{name:'Procedural',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Einstellungen schließen',exact:true}).click();await expect(dialog).not.toBeVisible();
 };
 // Exclude initial module compilation and first asset decode from leak growth.
 for(let i=0;i<4;i++)await cycle();
 const samples=[await sample(0)],until=Date.now()+minutes*60000;let cycles=0;
 do{await cycle();cycles++;if(cycles%5===0)samples.push(await sample(cycles));}while(Date.now()<until);
 samples.push(await sample(cycles));
 const first=samples[0],last=samples.at(-1);
 const report={minutes,cycles,samples,heapGrowth:last.usedSize-first.usedSize,domGrowth:last.nodes-first.nodes,scope:'Chromium JS heap and DOM after GC; not a GPU VRAM measurement'};
 await info.attach('memory-report',{body:Buffer.from(JSON.stringify(report,null,2)),contentType:'application/json'});
 expect(errors).toEqual([]);expect(cycles).toBeGreaterThan(1);
 expect(report.heapGrowth).toBeLessThan(Math.max(32*1024*1024,first.usedSize*0.4));
 expect(report.domGrowth).toBeLessThan(2000);
});

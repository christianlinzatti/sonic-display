const {test,expect,openSettings}=require('./fixtures.cjs');
const {createHash}=require('node:crypto');
const manifest=require('../../public/avatars/imported/manifest.json');

test('all thirteen imported originals and real previews are available once in the avatar catalog',async({request})=>{
 const response=await request.get('/api/avatars');expect(response.status()).toBe(200);
 const catalog=await response.json(),models=[...catalog.defaults,...catalog.models];
 expect(models.filter(model=>model.id.startsWith('sonic-import-'))).toHaveLength(13);
 for(const entry of manifest){
  const matches=models.filter(model=>model.id===entry.id);expect(matches).toHaveLength(1);
  const model=matches[0];expect(model.label).toBe(entry.label);expect(model.category).toBe('Importierte Avatare');
  const asset=await request.get(model.url);expect(asset.status()).toBe(200);
  expect(createHash('sha256').update(await asset.body()).digest('hex')).toBe(entry.sha256);
  const preview=await request.get(model.preview);expect(preview.status()).toBe(200);
  expect(preview.headers()['content-type']).toContain('image/png');
 }
});

test('imported gallery filters all models, renders their rigs and saves the selected performer',async({page},info)=>{
 test.setTimeout(180000);
 const dialog=await openSettings(page,'avatar');
 await dialog.getByLabel('Modelle filtern',{exact:true}).fill('Importierte Avatare');
 await expect(dialog.locator('.avatar-card')).toHaveCount(13);
 for(const entry of manifest){
  const card=dialog.locator('.avatar-card').filter({has:page.getByText(entry.label,{exact:true})});
  await expect(card).toHaveCount(1);
  await expect.poll(()=>card.locator('img').evaluate(img=>img.complete&&img.naturalWidth===384)).toBe(true);
 }
 for(const label of ['Nova V1','Chrome V1','Performer V2']){
  const entry=manifest.find(model=>model.label===label);
  const card=dialog.locator('.avatar-card').filter({has:page.getByText(label,{exact:true})});await card.click();
  await expect(card).toHaveAttribute('aria-pressed','true');
  await expect(dialog.locator('.settings-avatar-preview').getByRole('heading',{name:label,exact:true})).toBeVisible();
  const studio=dialog.getByRole('group',{name:'Dance Studio · Animation Timeline V93',exact:true});
  const animation=studio.getByRole('combobox',{name:'Animation',exact:true});
  await expect(animation.locator('option')).toHaveCount(entry.clips.length);
  await animation.selectOption(`embedded:${entry.clips.indexOf('Dance_Groove')}`);
  const scrubber=studio.getByLabel('Animation scrubben');await scrubber.focus();await scrubber.press('Home');
  const canvas=studio.locator('canvas');await expect(canvas).toBeVisible();await canvas.scrollIntoViewIfNeeded();
  const before=await canvas.screenshot();await scrubber.press('PageUp');
  await expect.poll(async()=>!(await canvas.screenshot()).equals(before)).toBe(true);
  const screenshot=await canvas.screenshot();
  const visible=await page.evaluate(async source=>{
   const image=new Image();image.src=source;await image.decode();
   const target=document.createElement('canvas');target.width=image.width;target.height=image.height;
   const context=target.getContext('2d');context.drawImage(image,0,0);
   const pixels=context.getImageData(0,0,target.width,target.height).data;let minY=target.height,maxY=-1,count=0;
   for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])>80){const y=Math.floor(i/4/target.width);minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
   return {minY,maxY,count,height:target.height};
  },`data:image/png;base64,${screenshot.toString('base64')}`);
  expect(visible.count).toBeGreaterThan(100);expect(visible.minY).toBeGreaterThan(4);expect(visible.maxY).toBeLessThan(visible.height-4);
  await info.attach(entry.id,{body:screenshot,contentType:'image/png'});
 }
 await page.reload();const again=await openSettings(page,'avatar');
 await expect(again.locator('.settings-avatar-preview').getByRole('heading',{name:'Performer V2',exact:true})).toBeVisible();
});

'use strict';
const {test,expect,openSettings}=require('./fixtures.cjs');

// Real Next.js production server, Chromium desktop and touch. No microphone
// permission, credentials, recording or external AI service needed.
test('V1108 local emotion analysis remains opt-in and disabled without microphone',async({page},testInfo)=>{
 const requests=[];
 page.on('request',request=>{if(request.url().includes('/api/ai/show-remix'))requests.push(request.url());});
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const group=dialog.getByRole('group',{name:'V1108 Music Emotion Intelligence'});
 await expect(group).toBeVisible();
 await expect(group.getByRole('button',{name:'Lokale Musikanalyse starten'})).toBeDisabled();
 await expect(group.getByRole('button',{name:'Regievorschlag bewusst übernehmen'})).toBeDisabled();
 await expect(group).toContainText('Keine Audioaufzeichnung');
 await expect(group).toContainText('keine Audioübertragung');
 expect(requests).toEqual([]);
 await testInfo.attach('v1108-opt-in-privacy-screenshot',{body:await group.screenshot(),contentType:'image/png'});
});

test('V1108 manual mood remains editable and offline show preview never applies automatically',async({page},testInfo)=>{
 const dialog=await openSettings(page,'avatar');
 await dialog.getByRole('combobox',{name:'Bühnenstil',exact:true}).selectOption('arena360');
 const creator=dialog.getByRole('group',{name:'V1106 KI Show Remix'});
 const controls=creator.getByRole('group',{name:'V1107 KI Regiefeinschliff'});
 await controls.getByRole('combobox',{name:'Musikalischer Stimmungshinweis (optional)'}).selectOption('intense');
 await creator.getByRole('button',{name:'Offline-Remix ausprobieren'}).click();
 const preview=creator.locator('[aria-label="V1106 Show Remix Vorschau"]');
 await expect(preview.locator('li')).toHaveCount(7);
 await expect(preview).toContainText('Lokaler Entwurf');
 await expect(creator.getByText('Lokaler Remix: keine Netzwerk- oder KI-Anfrage.',{exact:false})).toBeVisible();
 await testInfo.attach('v1108-offline-concert-preview-screenshot',{body:await preview.screenshot(),contentType:'image/png'});
});

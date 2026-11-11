const {test,expect}=require('./fixtures.cjs');
const {installConcertMocksV1130}=require('../fixtures/concertMocksV1130.cjs');
async function seed(page){
 await installConcertMocksV1130(page,{position:14000,playing:false,genre:'rock'});
 await page.addInitScript(()=>{
  if(!localStorage.getItem('sonic-display-ui-preferences-v1'))localStorage.setItem('sonic-display-ui-preferences-v1',JSON.stringify({visualizerMode:'wave',lyricsVisible:true,microphoneEnabled:false,geniusSongInsightsEnabledV447:false,avatarModelId:'sonic-neon-pulse'}));
 });
 await page.goto('/');await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Sonic Display Einstellungen'});
 await expect(dialog.getByRole('searchbox',{name:'Einstellungen suchen'})).toBeFocused();return dialog;
}
test('settings start with compact essentials, preserve edits and adapt to the viewport',async({page},testInfo)=>{
 test.setTimeout(120000);const dialog=await seed(page);
 await expect(dialog.getByRole('heading',{name:'Schnellzugriff',exact:true})).toBeVisible();
 await expect(dialog.locator('.settings-overview fieldset')).toHaveCount(4);
 const title=await dialog.getByRole('heading',{name:'Einstellungen',exact:true}).boundingBox();expect(await page.evaluate(p=>!!document.elementFromPoint(p.x+4,p.y+p.height/2)?.closest('[aria-label="Sonic Display Einstellungen"]'),title)).toBe(true);
 await expect(dialog.getByRole('searchbox',{name:'Einstellungen suchen'})).toBeFocused();
 await expect(dialog.getByText('Show gestalten',{exact:true})).toBeVisible();await expect(dialog.getByText('Verbindungen',{exact:true}).first()).toBeVisible();
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await dialog.getByLabel('Ruhige Darstellung',{exact:true}).check();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sonic-display-ui-preferences-v1')).reducedMotion)).toBe(true);
 await dialog.getByLabel('Songabhängige Outfit-Looks',{exact:true}).uncheck();
 await page.screenshot({path:testInfo.outputPath('settings-overview.png')});
 await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'⚙ Settings',exact:true})).toBeFocused();
 await page.reload();await page.getByRole('button',{name:'⚙ Settings',exact:true}).click();
 await expect(dialog.getByLabel('Ruhige Darstellung',{exact:true})).toBeChecked();await expect(dialog.getByLabel('Songabhängige Outfit-Looks',{exact:true})).not.toBeChecked();
});
test('search finds actual functions and focuses their full studio without losing saved values',async({page})=>{
 test.setTimeout(150000);const dialog=await seed(page),search=dialog.getByRole('searchbox',{name:'Einstellungen suchen'});
 await search.fill('Garderobe');await expect(dialog.getByRole('button',{name:'Kleidung & Outfits',exact:false})).toBeVisible();
 await dialog.getByRole('button',{name:'Kleidung & Outfits',exact:false}).click();
 const target=dialog.locator('fieldset[data-settings-target]');await expect(target).toBeFocused();await expect(target.getByLabel('Avatar-Kleidung')).toBeVisible();
 await search.fill('Crew');await dialog.getByRole('button',{name:'Crew & Konzertshow',exact:false}).click();await expect(dialog.locator('section[data-settings-target]')).toBeFocused();
 await search.fill('lyrics schrift');await expect(dialog.getByRole('button',{name:'Lyrics gestalten',exact:false})).toBeVisible();await dialog.getByRole('button',{name:'Lyrics gestalten',exact:false}).click();
 await expect(dialog.locator('fieldset[data-settings-target]')).toBeFocused();await expect(dialog.locator('fieldset[data-settings-target]')).toContainText('Lyrics · Animation');
 await search.fill('zzzz-no-such-setting');await expect(dialog.getByText(/Keine passende Kategorie/)).toBeVisible();await expect(dialog.locator('[data-v571-tab]')).toHaveCount(0);await expect(dialog.locator('.settings-overview')).toHaveCount(0);
 await search.fill('Mikrofon');await dialog.locator('[data-v571-tab="audio"]').click();await expect(search).toHaveValue('');await expect(dialog.getByRole('heading',{name:'Mikrofon & Beat',exact:true})).toBeVisible();await dialog.locator('[data-v571-tab="overview"]').click();await expect(dialog.getByRole('heading',{name:'Schnellzugriff',exact:true})).toBeVisible();
});
test('concert controls group everyday tasks and disclose programme and timing only on demand',async({page},testInfo)=>{
 test.setTimeout(120000);await seed(page);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Konzertmodus starten',exact:true}).click();await page.getByRole('button',{name:'Show steuern',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Konzertshow steuern',exact:true});
 for(const name of ['Bühne & Effekte','Crew & Outfits','Lyrics','Govee-Raumlicht'])await expect(dialog.getByRole('group',{name,exact:true})).toBeVisible();
 await expect(dialog.getByLabel('Konzertprogramm',{exact:true})).not.toBeVisible();await expect(dialog.getByLabel('Anzeigeverzögerung',{exact:true})).not.toBeVisible();await expect(dialog.getByRole('button',{name:'Showvideo aufnehmen',exact:true})).toBeVisible();
 await dialog.getByText('Programm & Showvarianten',{exact:true}).focus();await page.keyboard.press('Enter');await dialog.getByLabel('Konzertprogramm',{exact:true}).fill('mock | Test | neon');
 await dialog.getByText('Programm & Showvarianten',{exact:true}).click();await dialog.getByText('Programm & Showvarianten',{exact:true}).click();await expect(dialog.getByLabel('Konzertprogramm',{exact:true})).toHaveValue('mock | Test | neon');
 await dialog.getByText('Timing & Kalibrierung',{exact:true}).click();await expect(dialog.getByLabel('Anzeigeverzögerung',{exact:true})).toBeVisible();
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('concert-settings.png')});
 await page.keyboard.press('Escape');await expect(page.getByRole('button')).toHaveCount(2);
});

test('phone keeps the quick controls readable and category navigation within the dialog',async({page},testInfo)=>{
 test.setTimeout(120000);await page.setViewportSize({width:390,height:844});const dialog=await seed(page);
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await dialog.getByLabel('Songtext anzeigen',{exact:true}).scrollIntoViewIfNeeded();await expect(dialog.getByLabel('Songtext anzeigen',{exact:true})).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('phone-settings.png')});
 await dialog.locator('[data-v571-tab="audio"]').click();await expect(dialog.getByRole('heading',{name:'Mikrofon & Beat',exact:true})).toBeVisible();
});

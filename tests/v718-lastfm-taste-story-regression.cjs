'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const filename='lib/lastfm-taste-story-v718.ts';
const source=fs.readFileSync(filename,'utf8');
const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal((result.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'V718 TypeScript syntax');
const mod={};vm.runInNewContext(result.outputText,{exports:mod,Date,Math,Number,String,Array,Object,JSON,Intl,RangeError,Map,Set}, {filename});
const {buildLastFmTasteStoryV718:build,selectLastFmStoryYearV718:select,compareLastFmStoryYearsV718:compare}=mod;
const e=(at,artist='Artist',title='Song')=>({artist,title,album:'Album',playedAt:at,url:null,cover:null});
const now=new Date('2026-10-29T12:00:00.000Z');
let checks=0;function t(name,fn){try{fn();checks++;}catch(err){err.message=`V718 ${name}: ${err.message}`;throw err;}}
let story=build([],now);
t('empty',()=>assert.equal(story.total,0));
t('empty years',()=>assert.equal(story.years.length,0));
t('empty first',()=>assert.equal(story.firstYear,null));
t('empty record',()=>assert.equal(story.mostPlayedYear,null));
t('empty select',()=>assert.equal(select(story,2026),null));
t('empty compare',()=>assert.equal(compare(story,2026).delta,null));
const sample=[
 e('2023-12-31T12:00:00.000Z','Rock','Old'),
 e('2024-01-02T12:00:00.000Z','Rap','A'),
 e('2024-01-03T12:00:00.000Z','Rap','A'),
 e('2024-02-10T12:00:00.000Z','Pop','B'),
 e('2024-02-11T12:00:00.000Z','Rock','Old'),
 e('2026-01-02T12:00:00.000Z','Rap','A'),
 e('2026-02-02T12:00:00.000Z','hardTEKK','C'),
 e('2026-10-02T12:00:00.000Z','Rap','A')];
story=build(sample,now);
t('all events',()=>assert.equal(story.total,8));
t('first year',()=>assert.equal(story.firstYear,2023));
t('last year',()=>assert.equal(story.latestYear,2026));
t('years include missing middle',()=>assert.equal(story.years.length,4));
t('year 2025 blank',()=>assert.equal(select(story,2025).plays,0));
t('2025 months twelve',()=>assert.equal(select(story,2025).months.length,12));
t('2023 one artist',()=>assert.equal(select(story,2023).artists,1));
t('2024 four plays',()=>assert.equal(select(story,2024).plays,4));
t('2024 different artists',()=>assert.equal(select(story,2024).artists,3));
t('2024 distinct songs',()=>assert.equal(select(story,2024).songs,3));
t('2024 active days',()=>assert.equal(select(story,2024).activeDays,4));
t('2024 first seen artists',()=>assert.equal(select(story,2024).firstSeenArtists,2));
t('2024 returning artists',()=>assert.equal(select(story,2024).returningArtists,1));
t('2024 retained from prev',()=>assert.equal(select(story,2024).retainedArtists,1));
t('2024 year continuity',()=>assert.equal(select(story,2024).continuityPercent,33));
t('2024 annual favorite',()=>assert.equal(select(story,2024).topArtists[0].artist,'Rap'));
t('2024 favorite plays',()=>assert.equal(select(story,2024).topArtists[0].plays,2));
t('2024 favorite song',()=>assert.equal(select(story,2024).topSongs[0].title,'A'));
t('2024 january counts',()=>assert.equal(select(story,2024).months[0].plays,2));
t('2024 february counts',()=>assert.equal(select(story,2024).months[1].plays,2));
t('2024 november empty',()=>assert.equal(select(story,2024).months[10].plays,0));
t('2025 no misleading continuity',()=>assert.equal(select(story,2025).continuityPercent,null));
t('2026 no comparison when 2025 missing',()=>assert.equal(compare(story,2026).delta,null));
t('2024 compared to 2023',()=>assert.equal(compare(story,2024).delta,3));
t('2024 comparison percent',()=>assert.equal(compare(story,2024).continuityPercent,33));
t('first year no preceding baseline',()=>assert.equal(compare(story,2023).previous,null));
t('peak year',()=>assert.equal(story.mostPlayedYear,2024));
t('exploratory year',()=>assert.equal(story.mostExploratoryYear,2024));
t('diverse year',()=>assert.equal(story.mostDiverseYear,2024));
t('recent top artist first observed year',()=>assert.equal(select(story,2026).topArtists[0].firstObservedYear,2024));
t('recent top artist not in 2025',()=>assert.equal(select(story,2026).topArtists[0].presentPreviousYear,false));
t('prior years zero should not create fake plays',()=>assert.equal(story.years.reduce((s,y)=>s+y.plays,0),8));
t('latest matches ISO',()=>assert.equal(select(story,2024).lastAt,'2024-02-11T12:00:00.000Z'));
t('no invalid requested year',()=>assert.equal(select(story,2026.5),null));
t('no out-of-bounds requested year',()=>assert.equal(select(story,1999),null));
t('invalid events excluded',()=>assert.equal(build([...sample,e('broken'),e('2027-01-01T12:00:00.000Z')],now).total,8));
t('impossible ISO rejected',()=>assert.equal(build([e('2026-02-30T12:00:00.000Z')],now).total,0));
t('blank label rejected',()=>assert.equal(build([e('2026-02-01T12:00:00.000Z',' ','x')],now).total,0));
t('control character rejected',()=>assert.equal(build([e('2026-02-01T12:00:00.000Z','x\ny','x')],now).total,0));
t('case normalization',()=>{const x=build([e('2024-03-01T12:00:00.000Z','BAND','SONG'),e('2024-03-02T12:00:00.000Z','band','song')],now);assert.equal(x.years[0].artists,1);assert.equal(x.years[0].songs,1);});
t('cross-year spelling normalized',()=>{const x=build([e('2024-03-01T12:00:00.000Z','BAND'),e('2025-03-02T12:00:00.000Z','band')],now);assert.equal(x.years[1].firstSeenArtists,0);assert.equal(x.years[1].continuityPercent,100);});
t('most recent spelling wins',()=>{const x=build([e('2026-03-04T12:00:00.000Z','band'),e('2026-03-02T12:00:00.000Z','BAND')],now);assert.equal(x.years[0].topArtists[0].artist,'band');});
t('independent of input order',()=>{const a=build(sample,now),b=build(sample.slice().reverse(),now);assert.equal(JSON.stringify(a),JSON.stringify(b));});
t('does not mutate input',()=>{const items=Object.freeze(sample.map(x=>Object.freeze(x)));build(items,now);assert.equal(items[0].artist,'Rock');});
t('large archive',()=>{const x=build(Array.from({length:15000},(_,i)=>e(`2026-10-${String(i%28+1).padStart(2,'0')}T12:00:00.000Z`)),now);assert.equal(x.total,15000);assert.equal(x.years[0].plays,15000);});
t('tie selects most recent record',()=>{const x=build([e('2024-01-01T10:00:00.000Z'),e('2025-01-01T10:00:00.000Z')],now);assert.equal(x.mostPlayedYear,2025);});
const priorTZ=process.env.TZ;
try{
 process.env.TZ='Europe/Vienna';
 t('local New Year at midnight differs from UTC',()=>{const x=build([e('2025-12-31T23:30:00.000Z')],now);assert.equal(x.years[0].year,2026);});
 t('early UTC 2000 in western local 1999 excluded',()=>{process.env.TZ='America/Los_Angeles';try{const x=build([e('2000-01-01T00:00:00.000Z')],now);assert.equal(x.total,0);}finally{process.env.TZ='Europe/Vienna';}});
 t('local December day at year boundary',()=>{const x=build([e('2026-01-01T00:20:00.000Z'),e('2025-12-31T23:30:00.000Z')],now);assert.equal(x.years[0].activeDays,1);});
 t('DST forward same month and two days',()=>{const x=build([e('2026-03-28T22:30:00.000Z'),e('2026-03-29T22:30:00.000Z')],now);assert.equal(x.years[0].activeDays,2);assert.equal(x.years[0].months[2].plays,2);});
 t('DST backward local day',()=>{const x=build([e('2026-10-25T00:30:00.000Z'),e('2026-10-25T01:30:00.000Z')],now);assert.equal(x.years[0].activeDays,1);});
}finally{if(priorTZ===undefined)delete process.env.TZ;else process.env.TZ=priorTZ;}
const ui=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8');
const panel=fs.readFileSync('components/LastFmTasteStoryPanelV718.tsx','utf8');
const styles=fs.readFileSync('app/globals.css','utf8');
t('integrated on full archive',()=>assert(ui.includes('<LastFmTasteStoryPanelV718 events={archive.events}')));
t('year opens exact full local year',()=>{assert(ui.includes('setFromDate(`${year}-01-01`)'));assert(ui.includes('setToDate(`${year}-12-31`)'));});
t('year clears previous song filter',()=>assert(ui.includes("setTerm('');setArtistFilter(artist);setPeriod('custom')")));
t('year sets correct calendar',()=>assert(ui.includes('setCalendarMonth(`${year}-01`)')));
t('month uses previous tested helper',()=>assert(ui.includes('onOpenMonth={openMilestoneMonth}')));
t('artist jump includes artist and year',()=>assert(ui.includes('onOpenArtist={(year,artist)=>openStoryYear(year,artist)}')));
t('chronicle focus preserved',()=>assert(ui.includes("document.getElementById('lastfm-history-chronicle-v716')")));
t('link in header',()=>assert(ui.includes('href="#lastfm-taste-story-v718"')));
t('interactive year is accessible',()=>assert(panel.includes('aria-pressed={selectedYear===y.year}')));
t('months are accessible',()=>assert(panel.includes('aria-label={`${months[index]} ${selected.year}:')));
t('archive gap disclaimers',()=>assert(panel.includes('Synchronisierungslücken')));
t('genres are not guessed',()=>assert(panel.includes('keine Genres')));
t('UI is read-only',()=>assert(!/fetch\s*\(|post\s*\(|sendBeacon|localStorage|indexedDB/.test(panel+source)));
t('styles for touch',()=>assert(styles.includes('.lastfm-story-months-v718 button')));
t('retains previous milestone panel',()=>assert(ui.includes('<LastFmMilestonesPanelV717 events={archive.events}')));
t('retains prior evolution panel',()=>assert(ui.includes('<LastFmTasteEvolutionPanelV714 events={archive.events}/>')));
console.log(`PASS: V718 Music Taste Story – ${checks} checks.`);

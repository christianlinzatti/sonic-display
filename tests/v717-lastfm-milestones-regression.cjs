'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const filename='lib/lastfm-milestones-v717.ts';
const source=fs.readFileSync(filename,'utf8');
const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal((result.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'V717 syntax');
const calendarSource=fs.readFileSync('lib/lastfm-history-calendar-v716.ts','utf8');
const calendarCode=ts.transpileModule(calendarSource,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const cal={};vm.runInNewContext(calendarCode,{exports:cal,Date,Math,Number,String,Array,Object,JSON,Intl,RangeError}, {filename:'lastfm-history-calendar-v716.ts'});
const mod={};vm.runInNewContext(result.outputText,{exports:mod,require:(p)=>{assert.equal(p,'./lastfm-history-calendar-v716');return cal;},Date,Math,Number,String,Array,Object,JSON,Intl,RangeError,Map,Set}, {filename});
const {lastFmMilestonesV717:analyse,compareLastFmMonthsV717:compare}=mod;
const e=(at,artist='Artist',title='Track')=>({artist,title,album:'Album',playedAt:at,url:null,cover:null});
const now=new Date('2026-10-29T12:00:00.000Z');
let checks=0;function t(name,fn){try{fn();checks++;}catch(error){error.message=`V717 ${name}: ${error.message}`;throw error;}}
const empty=analyse([],now);
t('empty count',()=>assert.equal(empty.total,0));
t('empty streak',()=>assert.equal(empty.longestStreak,null));
t('empty current streak',()=>assert.equal(empty.currentStreak,null));
t('empty peak',()=>assert.equal(empty.peakDay,null));
t('empty discoveries',()=>assert.equal(empty.rediscoveries.length,0));
t('empty first month baseline',()=>assert.equal(compare(empty,'2026-10',now).previous,null));
t('invalid month rejected',()=>assert.throws(()=>compare(empty,'2026-13',now),/Ungültiger/));
t('2000 january valid even with no previous month',()=>assert.equal(compare(empty,'2000-01',now).previous,null));
const sample=[
 e('2026-08-01T12:00:00Z','Capital','A'),e('2026-08-01T13:00:00Z','Capital','A'),
 e('2026-08-02T12:00:00Z','Capital','B'),
 e('2026-08-04T12:00:00Z','Artist','C'),
 e('2026-09-01T12:00:00Z','Artist','C'),
 e('2026-09-02T12:00:00Z','Artist','C'),
 e('2026-10-29T09:00:00Z','Artist','C')];
const r=analyse(sample,now);
t('counts all valid',()=>assert.equal(r.total,7));
t('counts unique days',()=>assert.equal(r.activeDays,6));
t('longest streak two',()=>assert.equal(r.longestStreak.days,2));
t('longest streak most recent tie',()=>assert.equal(r.longestStreak.start,'2026-09-01'));
t('current streak today',()=>assert.equal(r.currentStreak.days,1));
t('first day',()=>assert.equal(r.firstDay,'2026-08-01'));
t('last day',()=>assert.equal(r.lastDay,'2026-10-29'));
t('peak day',()=>assert.equal(r.peakDay.plays,2));
t('peak day selected',()=>assert.equal(r.peakDay.day,'2026-08-01'));
t('peak month',()=>assert.equal(r.peakMonth.month,'2026-08'));
t('peak artist',()=>assert.equal(r.topArtist.artist,'Artist'));
t('peak song',()=>assert.equal(r.topSong.title,'C'));
t('three months',()=>assert.equal(r.months.length,3));
t('August unique songs',()=>assert.equal(r.months[0].songs,3));
t('August unique artists',()=>assert.equal(r.months[0].artists,2));
t('August active days',()=>assert.equal(r.months[0].activeDays,3));
t('September baseline',()=>assert.equal(compare(r,'2026-09',now).previous.plays,4));
t('October vs September delta',()=>assert.equal(compare(r,'2026-10',now).change.plays,-1));
t('current month partial flag',()=>assert.equal(compare(r,'2026-10',now).isCurrentMonth,true));
t('older month not current',()=>assert.equal(compare(r,'2026-08',now).isCurrentMonth,false));
t('first archived month no baseline',()=>assert.equal(compare(r,'2026-08',now).previous,null));
t('missing month within range counts zero',()=>{const x=analyse([e('2026-08-01T12:00:00Z'),e('2026-10-01T12:00:00Z')],now);assert.equal(compare(x,'2026-10',now).previous.plays,0);});
t('change of artist count',()=>assert.equal(compare(r,'2026-09',now).change.artists,-1));
t('out of order input sorted',()=>assert.equal(analyse(sample.slice().reverse(),now).longestStreak.start,'2026-09-01'));
t('input not mutated',()=>{const frozen=Object.freeze(sample.map(x=>Object.freeze(x)));analyse(frozen,now);assert.equal(frozen[0].title,'A');});
t('reject invalid and future dates',()=>assert.equal(analyse([...sample,e('invalid'),e('2027-01-01T00:00:00Z')],now).total,7));
t('reject blank artist or title',()=>assert.equal(analyse([e('2026-08-01T12:00:00Z','  '),e('2026-08-01T12:00:00Z','X','')],now).total,0));
t('large archive',()=>assert.equal(analyse(Array.from({length:15000},()=>e('2026-10-01T12:00:00Z')),now).peakDay.plays,15000));
const rediscovery=analyse([e('2025-11-01T09:00:00Z','Band','Song'),e('2026-01-29T09:00:00Z','Band','Song'),e('2026-01-30T09:00:00Z','Band','Song'),e('2026-05-01T09:00:00Z','band','song')],now);
t('rediscovery 89 days excluded',()=>assert.equal(rediscovery.rediscoveries.length,1));
t('rediscovery tracks most recent gap',()=>assert.equal(rediscovery.rediscoveries[0].day,'2026-05-01'));
t('rediscovery gap exact',()=>assert.equal(rediscovery.rediscoveries[0].gapDays,91));
t('case normalized song identity',()=>assert.equal(rediscovery.topSong.plays,4));
t('all rediscoveries sorted recent first',()=>{const x=analyse([e('2024-01-01T10:00:00Z','B','One'),e('2024-01-01T10:00:00Z','B','Two'),e('2025-01-01T10:00:00Z','B','One'),e('2026-01-01T10:00:00Z','B','Two')],now);assert.equal(x.rediscoveries[0].title,'Two');});
t('deduplicate repeated rediscoveries of same song',()=>{const x=analyse([e('2024-01-01T10:00:00Z'),e('2025-01-01T10:00:00Z'),e('2026-01-01T10:00:00Z')],now);assert.equal(x.rediscoveries.length,1);assert.equal(x.rediscoveries[0].day,'2026-01-01');});
t('stale streak is not live',()=>assert.equal(analyse([e('2020-01-01T10:00:00Z')],now).currentStreak,null));
const priorTZ=process.env.TZ;
try{
 process.env.TZ='Europe/Vienna';
 t('DST spring consecutive local dates',()=>{const x=analyse([e('2026-03-28T23:10:00Z'),e('2026-03-29T22:10:00Z')],now);assert.equal(x.longestStreak.days,2);});
 t('DST autumn consecutive local dates',()=>{const x=analyse([e('2026-10-24T22:10:00Z'),e('2026-10-25T23:10:00Z')],now);assert.equal(x.longestStreak.days,2);});
 t('same local day in autumn twice',()=>{const x=analyse([e('2026-10-25T00:30:00Z'),e('2026-10-25T01:30:00Z')],now);assert.equal(x.activeDays,1);});
 t('local month roll',()=>{const x=analyse([e('2026-09-30T22:30:00Z')],now);assert.equal(x.months[0].month,'2026-10');});
 t('yesterday still live streak',()=>{const x=analyse([e('2026-10-28T11:00:00Z')],now);assert.equal(x.currentStreak.days,1);});
 t('two days ago is not live',()=>{const x=analyse([e('2026-10-27T11:00:00Z')],now);assert.equal(x.currentStreak,null);});
 t('discovery uses local calendar days',()=>{const x=analyse([e('2026-01-01T23:15:00Z'),e('2026-04-01T22:15:00Z')],now);assert.equal(x.rediscoveries[0].gapDays,90);});
}finally{if(priorTZ===undefined)delete process.env.TZ;else process.env.TZ=priorTZ;}
const ui=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8');
const panel=fs.readFileSync('components/LastFmMilestonesPanelV717.tsx','utf8');
t('UI inserted beside calendar',()=>assert(ui.includes('<LastFmMilestonesPanelV717 events={archive.events} month={shownMonth}')));
t('UI opens record days without old filters',()=>assert(ui.includes("setArtistFilter('');selectHistoryDay(day);")));
t('UI opens record months',()=>assert(ui.includes('onSelectMonth={openMilestoneMonth}')));
t('UI month dates inclusive',()=>assert(ui.includes('setToDate(`${month}-${lastDay}`)')));
t('UI offers song jump',()=>assert(ui.includes('setArtistFilter(song.artist);setTerm(song.title);selectHistoryDay(song.day);')));
t('UI excludes duplicate scrobble posts',()=>assert(!/fetch\(|post\(/i.test(panel+source)));
t('UI retains earlier history',()=>assert(ui.includes('<LastFmWrappedPanelV712 events={archive.events}/>')));
t('UI shows month differences',()=>assert(panel.includes('current.change[field]')));
t('UI shows caveat',()=>assert(panel.includes('Fehlende Scrobbles')));
t('UI accessible clickable records',()=>assert(panel.includes('type="button"')));
t('core contains no storage calls',()=>assert(!/localStorage|indexedDB|sessionStorage|\bwindow\.|\bdocument\./.test(source)));
console.log(`PASS: V717 History Milestones – ${checks} checks.`);

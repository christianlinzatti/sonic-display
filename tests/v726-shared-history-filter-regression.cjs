'use strict';
process.env.TZ='Europe/Vienna';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const file='lib/lastfm-shared-history-filter-v726.ts';
const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(code.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const context={exports:{},Date,Math,Number,String,Array,Object,JSON,Intl,Map,Set,Boolean};
vm.runInNewContext(code.outputText,context,{filename:file});
const {buildLastFmSharedFilterV726:filter,listLastFmFilterYearsV726:years,V726_DEFAULT_SELECTION:defaults}=context.exports;
const sel=(patch={})=>({...defaults,...patch});
const ev=(at,artist='Rap',title='Track')=>({playedAt:at,artist,title,album:'Album',url:null,cover:null});
let checks=0;
function test(name,fn){try{fn();checks++;}catch(error){error.message=`V726 ${name}: ${error.message}`;throw error;}}
const source=[
 ev('2026-03-28T23:30:00Z','Artist-A','First'), // 2026-03-29 00:30 Vienna
 ev('2026-03-29T21:30:00Z','Artist-A','Second'),// 2026-03-29 23:30 Vienna
 ev('2026-03-30T01:00:00Z','Artist-B','Third'),
 ev('2026-03-23T12:00:00Z','Artist-A','Monday'),
 ev('2026-03-22T12:00:00Z','Artist-B','Earlier'),
 ev('2024-02-29T13:00:00Z','Artist-A','Leap'),
 ev('2025-07-15T08:00:00Z','ARTIST-A','Old'),
];
const before=JSON.stringify(source);
const all=filter(source,sel());
for(const [label,value] of Object.entries({error:null,sourceTotal:7,anchorDay:'2026-03-30',label:'Gesamtes Archiv'}))test('all '+label,()=>assert.equal(all[label],value));
test('all count',()=>assert.equal(all.events.length,7));
test('all chronological order',()=>assert.equal(all.events[0].title,'Third'));
test('nonmutating',()=>assert.equal(JSON.stringify(source),before));
test('year list',()=>assert.deepEqual(Array.from(all.years),[2026,2025,2024]));
test('years function',()=>assert.deepEqual(Array.from(years(source)),[2026,2025,2024]));
test('artist list distinct',()=>assert.deepEqual(Array.from(all.artists),['Artist-A','Artist-B']));
for(const [days,expected] of [[7,3],[30,5],[90,5]]){
 const result=filter(source,sel({range:'days',days}));
 test(days+' calendar inclusive',()=>assert.equal(result.events.length,expected));
 test(days+' anchored end',()=>assert.equal(result.toDay,'2026-03-30'));
 test(days+' label',()=>assert(result.label.includes(String(days))));
 test(days+' no future dates',()=>assert(result.events.every(e=>e.playedAt<'2027')));
}
test('DST seven start',()=>assert.equal(filter(source,sel({range:'days',days:7})).fromDay,'2026-03-24'));
test('DST seven keeps both March 29 events',()=>assert.equal(filter(source,sel({range:'days',days:7})).events.filter(x=>x.title==='First'||x.title==='Second').length,2));
test('DST seven excludes March 23',()=>assert(!filter(source,sel({range:'days',days:7})).events.some(x=>x.title==='Monday')));
test('DST 90 keeps March 22',()=>assert(filter(source,sel({range:'days',days:90})).events.some(x=>x.title==='Earlier')));
for(const [y,n] of [[2024,1],[2025,1],[2026,5],[2023,0]]){
 const out=filter(source,sel({range:'year',year:y}));
 test('year '+y,()=>assert.equal(out.events.length,n));
 test('year '+y+' start',()=>assert.equal(out.fromDay,`${y}-01-01`));
 test('year '+y+' end',()=>assert.equal(out.toDay,`${y}-12-31`));
}
for(const [from,to,expected] of [['2024-02-29','2024-02-29',1],['2026-03-29','2026-03-29',2],['2026-03-30','2026-03-30',1],['2026-03-23','2026-03-29',3],['2026-04-01','2026-04-30',0]]){
 const out=filter(source,sel({range:'custom',from,to}));
 test('custom '+from+' '+to,()=>assert.equal(out.events.length,expected));
 test('custom '+from+' '+to+' no error',()=>assert.equal(out.error,null));
}
for(const [from,to] of [['2026-02-30','2026-03-01'],['2025-02-29','2025-03-01'],['2026-04-31','2026-05-01'],['1999-12-31','2026-01-01'],['2026-13-01','2026-03-01'],['2026-00-10','2026-03-01'],['2026-01-00','2026-03-01'],['2026-03-02',''],['','2026-03-29'],['2026-03-30','2026-03-29'],['2026-3-01','2026-03-02']]){
 const out=filter(source,sel({range:'custom',from,to}));
 test('invalid custom '+from+' '+to,()=>assert(out.error));
 test('invalid custom does not leak archive',()=>assert.equal(out.events.length,0));
}
for(const [artist,n] of [['Artist-A',5],['  artist-a  ',5],['ARTIST-B',2],['Unknown',0]]){
 const r=filter(source,sel({artist}));
 test('artist '+artist,()=>assert.equal(r.events.length,n));
 test('artist '+artist+' label',()=>assert(r.label.includes(artist.trim())));
}
test('combined filter and artist',()=>assert.equal(filter(source,sel({range:'year',year:2026,artist:'artist-b'})).events.length,2));
test('combined custom filter and artist',()=>assert.equal(filter(source,sel({range:'custom',from:'2026-03-29',to:'2026-03-29',artist:'artist-a'})).events.length,2));
test('unicode NFKC',()=>assert.equal(filter([ev('2026-03-30T10:00:00Z','ＦＯＯ')],sel({artist:'foo'})).events.length,1));
test('bad year zero',()=>assert(filter(source,sel({range:'year',year:0})).error));
test('bad year float',()=>assert(filter(source,sel({range:'year',year:2025.5})).error));
test('bad year negative',()=>assert(filter(source,sel({range:'year',year:-1})).error));
test('bad year too large',()=>assert(filter(source,sel({range:'year',year:10000})).error));
test('bad 12 days',()=>assert(filter(source,sel({range:'days',days:12})).error));
test('bad unknown mode',()=>assert(filter(source,sel({range:'zoom'})).error));
test('bad artist length',()=>assert(filter(source,sel({artist:'a'.repeat(161)})).error));
test('null selection defaults',()=>assert.equal(filter(source,null).events.length,7));
test('empty is empty',()=>assert.equal(filter([],sel()).events.length,0));
test('empty latest days',()=>assert.equal(filter([],sel({range:'days',days:7})).events.length,0));
test('empty year choices',()=>assert.equal(years([]).length,0));
test('null dataset',()=>assert.equal(filter(null,sel()).events.length,0));
test('invalid timestamps ignored',()=>assert.equal(filter([ev('bad'),ev('2026-03-30T11:00:00Z')],sel()).events.length,1));
test('invalid blank artist ignored',()=>assert.equal(filter([ev('2026-03-30T11:00:00Z','  ')],sel()).events.length,0));
test('invalid blank title ignored',()=>assert.equal(filter([ev('2026-03-30T11:00:00Z','Rap',' ')],sel()).events.length,0));
test('invalid null event ignored',()=>assert.equal(filter([null],sel()).events.length,0));
test('not mutated by consecutive calls',()=>{filter(source,sel({range:'year',year:2025}));assert.equal(JSON.stringify(source),before)});
test('DST autumn fallback both same local day',()=>{
 const autumn=filter([ev('2026-10-25T00:30:00Z'),ev('2026-10-25T01:30:00Z')],sel({range:'custom',from:'2026-10-25',to:'2026-10-25'}));assert.equal(autumn.events.length,2);
});
test('leap day plus one excludes leap',()=>assert.equal(filter(source,sel({range:'custom',from:'2024-03-01',to:'2024-03-30'})).events.length,0));
test('year boundary local Vienna',()=>{
 const r=filter([ev('2025-12-31T23:30:00Z','Rap','2026 local'),ev('2025-12-31T22:30:00Z','Rap','2025 local')],sel({range:'year',year:2026}));assert.equal(r.events.length,1);assert.equal(r.events[0].title,'2026 local');
});
test('empty source date not invented',()=>assert.equal(filter([],sel({range:'days',days:7})).anchorDay,null));
// Focused source contracts: UI truly passes one filtered dataset to both consumers.
const main=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8');
const home=fs.readFileSync('components/LastFmPersonalInsightsDashboardV722.tsx','utf8');
const ui=fs.readFileSync('components/LastFmSharedHistoryFilterV726.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
for(const [name,content] of Object.entries({main,home,ui,css}))test(name+' nonempty',()=>assert(content.length>100));
for(const piece of ["import {LastFmSharedHistoryFilterV726}","buildLastFmSharedFilterV726(archive?.events??[],sharedSelection)",'<LastFmSharedHistoryFilterV726 result={sharedResult} selection={sharedSelection} onChange={applySharedSelectionV726}',"<LastFmPersonalInsightsDashboardV722 key={user} account={user} events={sharedResult.events}","filterLastFmHistoryV715(sharedResult.events","calendarBoundsV716(sharedResult.events)","setSharedSelection({...V726_DEFAULT_SELECTION}"])
 test('wired: '+piece.slice(0,45),()=>assert(main.includes(piece)));
test('dashboard labels scoped',()=>assert(home.includes('periodLabel={')===false&&home.includes('Filter: {periodLabel}')));
test('search preserving chronology',()=>assert(main.includes("query:term,period,from:fromDate,to:toDate,artist:artistFilter")));
test('date picker',()=>assert(ui.includes('type="date"')));
test('years picker',()=>assert(ui.includes('years.map(y=>')));
test('artist picker',()=>assert(ui.includes('type="search"')));
test('status live',()=>assert(ui.includes('role="status"')));
test('error explicit',()=>assert(ui.includes('role="alert"')));
test('keyboard focus',()=>assert(css.includes('.lastfm-shared-filter-v726 button:focus-visible')));
test('44px controls',()=>assert(css.includes('min-height:44px')));
test('mobile',()=>assert(css.includes('@media(max-width:640px){.lastfm-shared-filter-v726')));
test('no network or writes in filter',()=>assert(!/\bfetch\s*\(|\bwrite\w*History|\bappendLongterm|\bmergeLastFm|api\/lastfm/i.test(fs.readFileSync(file,'utf8')+ui)));
test('README updated',()=>assert(fs.readFileSync('README.md','utf8').includes('V726')));
test('documentation',()=>assert(fs.existsSync('docs/versions/V726-INTELLIGENT-HISTORY-FILTERS.md')));
test('verification',()=>assert(fs.existsSync('docs/versions/V726-VERIFICATION.md')));
test('version and scripts',()=>{const pkg=require('../package.json');require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(726);assert(pkg.scripts['test:quick'].includes('npm run test:v726 && npm run test:v726:types && npm run test:v726:ui-types &&'));});
console.log(`PASS: V726 Intelligent History Filters – ${checks} checks.`);

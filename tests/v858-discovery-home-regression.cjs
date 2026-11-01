'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
const load=(filename,deps={})=>{
 const src=fs.readFileSync(filename,'utf8');
 const compiled=ts.transpileModule(src,{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const module={exports:{}};
 new Function('module','exports','require',compiled.outputText)(module,module.exports,(name)=>{if(Object.hasOwn(deps,name))return deps[name];throw new Error(`Unknown import ${name}`)});
 return module.exports;
};
const monthly=load('lib/lastfm-monthly-insights-v856.ts');
const discovery=load('lib/lastfm-personal-discovery-v857.ts');
const home=load('lib/lastfm-discovery-dashboard-v858.ts',{'./lastfm-monthly-insights-v856':monthly,'./lastfm-personal-discovery-v857':discovery});
const now=new Date('2026-11-20T10:00:00.000Z');
function E(artist,title,iso){return {artist,title,album:'Album',playedAt:iso,url:null,cover:null};}
function make(artist,title,month,count,day=10){return Array.from({length:count},(_,i)=>E(artist,title,`${month}-${String(day).padStart(2,'0')}T12:${String(i%60).padStart(2,'0')}:00.000Z`));}
const history=[
 ...make('Rap Artist','Comeback','2026-07',1),
 ...make('Rap Artist','Classic','2026-10',12),...make('Other','Old','2026-10',10),
 ...make('Rap Artist','Classic','2026-11',20),...make('Newcomer','New Track','2026-11',3),...make('Other','Old','2026-11',3),
 ...make('Rap Artist','Comeback','2026-11',1)
];
const result=home.buildLastFmDiscoveryHomeV858(history,'2026-11',now,'UTC');
assert.equal(result.total,50);assert.equal(result.current.plays,27);assert.equal(result.current.artists,3);assert.equal(result.current.tracks,4);
assert.equal(result.selected,'2026-11');assert.equal(result.previous.plays,22);
assert.equal(result.topArtists[0].artist,'Rap Artist');assert.equal(result.topArtists[0].plays,21);
assert.equal(result.rising[0].artist,'Rap Artist');assert(result.rising[0].changePoints>0);
assert.equal(result.newcomers[0].artist,'Newcomer');assert.equal(result.comeback.title,'Comeback');assert(result.comeback.gapDays>=90);
assert.equal(result.chart.length,12);assert.equal(result.chart.at(-1).month,'2026-11');assert(result.months.includes('2026-09'));
const selectedGap=home.buildLastFmDiscoveryHomeV858(history,'2026-09',now,'UTC');assert.equal(selectedGap.selected,'2026-09');assert.equal(selectedGap.current.plays,0);
const defaultMonth=home.buildLastFmDiscoveryHomeV858(history,'',now,'UTC');assert.equal(defaultMonth.selected,'2026-11');
const oldOnly=home.buildLastFmDiscoveryHomeV858(make('Artist','Song','2025-08',1),'',now,'UTC');assert.equal(oldOnly.selected,'2025-08');assert.equal(oldOnly.chart.length,12);
const empty=home.buildLastFmDiscoveryHomeV858([], '',now,'UTC');assert.equal(empty.hasEvents,false);assert.equal(empty.selected,'');assert.equal(empty.topArtists.length,0);
const future=home.buildLastFmDiscoveryHomeV858([E('X','Y','2026-12-02T00:00:00.000Z')],'',now,'UTC');assert.equal(future.hasEvents,false);
const invalid=home.buildLastFmDiscoveryHomeV858([E('X','Y','2026-02-30T00:00:00.000Z')],'',now,'UTC');assert.equal(invalid.total,0);
const frozen=Object.freeze(history.map(x=>Object.freeze({...x})));const original=JSON.stringify(frozen);home.buildLastFmDiscoveryHomeV858(frozen,'2026-11',now,'Europe/Vienna');assert.equal(JSON.stringify(frozen),original);
const midnight=[E('Artist','Song','2026-10-31T23:30:00.000Z')];assert.equal(home.buildLastFmDiscoveryHomeV858(midnight,'',now,'Europe/Vienna').selected,'2026-11');assert.equal(home.buildLastFmDiscoveryHomeV858(midnight,'',now,'UTC').selected,'2026-10');
const core=fs.readFileSync('lib/lastfm-discovery-dashboard-v858.ts','utf8'),ui=fs.readFileSync('components/LastFmDiscoveryHomeV858.tsx','utf8');
const parent=fs.readFileSync('components/LastFmHistoryPanelV706.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8');
for(const file of ['components/LastFmDiscoveryHomeV858.tsx','components/LastFmHistoryPanelV706.tsx'])assert.equal(ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);
for(const required of ['lastfm-home-v858','lastfm-discovery-home-v858','data.chart.map','data.topArtists.map','data.newcomers.map','data.comeback','onOpenArtist','onOpenSong','aria-label'])assert(ui.includes(required),required);
assert(parent.includes('LastFmDiscoveryHomeV858 key={`home-v858-${user}`} events={archive.events}'),'Per-account archive input');
assert(!/\bfetch\s*\(|localStorage|indexedDB|sessionStorage|\bwindow\./.test(core+ui),'No new API calls, persistent state, or background history polling');
for(const required of ['.lastfm-home-v858','.lastfm-home-chart-v858','.lastfm-home-insights-v858','@media(max-width:720px)','@media(prefers-reduced-motion:reduce)'])assert(css.includes(required));
const pkg=require('../package.json'),lock=require('../package-lock.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=858,'V858+ release compatibility');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
for(const name of ['build:preflight','check:fast','check:release','prebuild'])assert(pkg.scripts[name].includes('npm run test:v858 && npm run test:v858:types && npm run test:v858:ui-types && npm run test:v857 &&'),name);
console.log('PASS V858: month selection, artist share, rediscovery, missing/invalid dates, Vienna time zone, 12-month chart, no writes or new API calls, touch UI, version and gates');

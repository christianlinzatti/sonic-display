'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ts=require('./typescript-loader.cjs');
const sandboxExports={};
const src=fs.readFileSync('lib/recently-played-insights-v673.ts','utf8');
const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(js,{exports:sandboxExports,Set,Map,Math,Number,Date,Array,String},{filename:'recently-played-insights-v673.ts'});
const aggregate=sandboxExports.historyInsightsV673;
const song=(id,artist,time,title=id)=>({id,artist,title,album:'Album',albumCoverUrl:null,spotifyUrl:`https://open.spotify.com/track/${id}`,durationMs:230000,playedAt:time});
let passed=0;
function test(label,fn){try{fn();passed++;}catch(e){e.message=`V673 ${label}: ${e.message}`;throw e;}}
const source=[
 song('abc','Rap Artist','2026-10-27T01:00:00.000Z','One'),
 song('abc','Rap Artist','2026-10-27T02:00:00.000Z','One'),
 song('def','Techno Duo','2026-10-27T07:00:00.000Z','Two'),
 song('abc','Rap Artist','2026-10-28T14:00:00.000Z','One'),
 song('ghi','Rap Artist, Guest','2026-10-28T21:00:00.000Z','Three'),
];
// Deterministic UTC date interpretation for aggregate tests, independent of test machine time zone.
const utcDate=iso=>{const d=new Date(iso);return {getTime:()=>d.getTime(),getFullYear:()=>d.getUTCFullYear(),getMonth:()=>d.getUTCMonth(),getDate:()=>d.getUTCDate(),getHours:()=>d.getUTCHours()};};
const data=aggregate(source,utcDate);
test('all playback events counted; repeated songs retained',()=>{assert.equal(data.plays,5);assert.equal(data.uniqueSongs,3);assert.equal(data.repeatPlays,2);});
test('top songs correct with repeat count',()=>{assert.equal(data.topSongs[0].id,'abc');assert.equal(data.topSongs[0].plays,3);assert.equal(data.topSongs.length,3);});
test('artist credit grouping does not split feature artists',()=>{assert.equal(data.uniqueArtistCredits,3);assert.equal(data.topArtists[0].name,'Rap Artist');assert.equal(data.topArtists[0].plays,3);assert(data.topArtists.some(x=>x.name==='Rap Artist, Guest'));});
test('days and time of day count properly',()=>{assert.equal(data.days,2);assert.deepEqual(Array.from(data.periods,p=>p.plays),[2,1,1,1]);assert.equal(data.periods.reduce((sum,p)=>sum+p.plays,0),data.plays);});
test('empty input provides no fake insights',()=>{const x=aggregate([],utcDate);assert.equal(x.plays,0);assert.equal(x.topArtists.length,0);assert.equal(x.days,0);});
test('invalid play timestamp ignored',()=>{assert.equal(aggregate([...source,song('x','Fake','bad-date')],utcDate).plays,5);});
test('top lists bounded to five',()=>{const many=Array.from({length:16},(_,i)=>song(`id${i}`,`Artist ${i}`,`2026-10-28T16:00:00.000Z`));const x=aggregate(many,utcDate);assert.equal(x.topSongs.length,5);assert.equal(x.topArtists.length,5);});
test('original input not modified',()=>{assert.equal(source.length,5);assert.equal(source[0].playedAt,'2026-10-27T01:00:00.000Z');});
const ui=fs.readFileSync('components/RecentlyPlayedV672.tsx','utf8'),css=fs.readFileSync('app/globals.css','utf8'),api=fs.readFileSync('app/api/spotify/recently-played/route.ts','utf8'),pkg=require('../package.json');
test('history and highlights both selectable and labelled',()=>{for(const token of ['historyInsightsV673(tracks)','Hör-Highlights','Chronik','aria-pressed','HistoryInsightsPanelV673','Momentaufnahme'])assert(ui.includes(token),token);});
test('stats are based on loaded events, no extra API access or storage',()=>{assert(ui.includes('historyInsightsV673(tracks)'));assert(!src.includes('localStorage')&&!src.includes('fetch('));assert(api.includes('no-store'));});
test('responsive charts and accessible rankings',()=>{for(const token of ['recent-insight-metrics-v673','recent-insight-panels-v673','recent-insight-period-grid-v673'])assert(css.includes(token));assert(ui.includes('<ol className="recent-insight-songs-v673">'));});
test('V673 quality checks in release script',()=>{assert(pkg.scripts['check:release'].includes('test:v673'));assert(pkg.scripts['test:smoke:v673'].includes('test:smoke:v672'));});
console.log(`PASS V673 listening history insights: ${passed} checks`);

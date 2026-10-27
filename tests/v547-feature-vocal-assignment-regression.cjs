"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeVocalTimeSegmentsV496:normalize,resolveVocalTimeCueV496:resolve,normalizeVocalTimeLibraryV496:library}=load('components/visualizer/vocalTimeDirectorV496');
const {projectFeatureVocalTimelineV547:project,snapVocalTimestampV547:snap}=load('components/visualizer/featureVocalTimelineV547');
const base={startMs:500,endMs:4000,leadSlot:0,partnerSlot:1,style:'solo',strength:80,roleV547:'verse',singerSlotsV547:[0]};
const feat={startMs:4000,endMs:6100,leadSlot:1,partnerSlot:0,style:'solo',strength:70,roleV547:'feature',singerSlotsV547:[1]};
const adlib={startMs:1400,endMs:2050,leadSlot:2,partnerSlot:0,style:'solo',strength:45,roleV547:'adlib',singerSlotsV547:[2]};
const hook={startMs:6500,endMs:10000,leadSlot:0,partnerSlot:2,style:'hook',strength:78,roleV547:'hook',singerSlotsV547:[0,2]};
const values=[base,adlib,feat,hook];
assert.deepEqual(normalize(values),values,'new metadata survives normalization, including order');
function at(ms,patch={}){return resolve({trackId:'song-A',progressMs:ms,playing:true,count:4,enabled:true,segments:values,...patch});}
assert.deepEqual(at(1300).singingSlots,[0]);
assert.deepEqual(at(1600).singingSlots,[0,2],'overlay adds only its marked voice');
assert.equal(at(1600).leadSlot,0,'adlib may not steal lead and camera focus');
assert.deepEqual(at(2200).singingSlots,[0]);
assert.deepEqual(at(4100).singingSlots,[1]);
assert.equal(at(4100).handoffFrom,0,'lead switch retains handoff');
assert.equal(at(4800).handoffFrom,null);
assert.deepEqual(at(7000).singingSlots,[0,2],'selected hook performers, not all');
assert.deepEqual(at(7000,{count:2}).singingSlots,[0],'missing GLB performer is skipped');
assert.equal(at(4000).leadSlot,1,'time interval is end-exclusive');
assert.equal(at(10000).active,false);
assert.equal(at(1600,{playing:false}).active,false);
assert.equal(at(1600,{manualPriority:true}).active,false);
assert.equal(at(1600,{enabled:false}).active,false);
assert.equal(at(1600,{trackId:''}).active,false);
assert.equal(at(NaN).active,false);
assert.equal(at(400,{segments:[adlib]}).active,false);
assert.deepEqual(at(1600,{segments:[adlib]}).singingSlots,[2],'isolated adlib is standalone voice');
const last={...base,startMs:1200,endMs:2100,leadSlot:3,roleV547:'feature',singerSlotsV547:[3]};
assert.equal(at(1650,{segments:[base,adlib,last]}).leadSlot,3,'last base edit wins');
assert.deepEqual(at(1650,{segments:[base,adlib,last]}).singingSlots,[3,2]);
const bad=[{...adlib,roleV547:'AI'}, {...adlib,style:'duet'},{...hook,style:'solo'},
 {...hook,singerSlotsV547:[]},{...hook,singerSlotsV547:[2,2]},
 {...hook,singerSlotsV547:[0,4]},{...hook,singerSlotsV547:[2]},
 {...hook,singerSlotsV547:[0,'2']},{...hook,singerSlotsV547:[0,1,2,3,4]},
 {...adlib,singerSlotsV547:[0,2]}, {...base,endMs:0},
 {...base,startMs:-1},{...base,strength:Infinity}];
for(const item of bad)assert.equal(normalize([item]).length,0,JSON.stringify(item));
const original={startMs:0,endMs:1000,leadSlot:0,partnerSlot:1,style:'solo',strength:100};
assert.deepEqual(normalize([original])[0],original,'older V496 records stay identical');
assert.equal(resolve({trackId:'song-A',progressMs:500,playing:true,count:2,enabled:true,segments:[original]}).leadSlot,0);
assert.deepEqual(library({'song-A':values})['song-A'],values,'per-track storage compatible');
assert.equal(library({constructor:values}).constructor,undefined,'prototype poisoning rejected');
const lanes=project(values,10000,4);
assert.equal(lanes.length,5,'solo + adlib + solo + two hook lanes');
assert.equal(lanes.find(l=>l.id===1).isAdlib,true);
assert.deepEqual(lanes.filter(l=>l.id===3).map(l=>l.slot),[0,2]);
assert.equal(project(values,10000,2).length,3,'invisible lanes omitted');
assert.deepEqual(project(values,0),[]);
assert.equal(snap(1426,10000,10),1430);
assert.equal(snap(-9,10000),0);
assert.equal(snap(20000,10000),10000);
let checked=0;
for(let i=0;i<12800;i++){
 const t=i%10500;const r=at(t);
 assert(Number.isFinite(r.emphasis)&&r.emphasis>=0&&r.emphasis<=1);
 assert(r.singingSlots.every(s=>Number.isInteger(s)&&s>=0&&s<4));
 assert(r.leadSlot>=0&&r.leadSlot<4);
 checked++;
}
const source=fs.readFileSync('components/visualizer/VocalTimeEditorV496.tsx','utf8');
for(const text of ['V547 · Feature Vocal Assignment Studio','projectFeatureVocalTimelineV547','Adlib / Backing','Gemeinsame Hook',
 'Wer singt die Hook?','Start = aktuelle Zeit','Live-Zeit verwenden','Die Vorschau verändert die Spotify-Position nicht',
 'vocalTimeSegmentsV496','aria-label="V547 visuelle Sänger-Timeline"'])assert(source.includes(text),text);
for(const file of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx','StageCameraDirectorV289.tsx']){
 const text=fs.readFileSync('components/visualizer/'+file,'utf8');
 assert(text.includes('resolveVocalTimeCueV496('));assert(text.includes('timeCueV496.active?timeCueV496:legacyDuetCueV416'));
}
const pkg=require('../package.json');assert(Number(pkg.version.split('-v')[1])>=547);
assert(pkg.scripts['build:preflight'].includes('npm run test:v547 && npm run test:v547:types &&'));
console.log('PASS V547: 12800 timeline ticks, tracks, adlibs, selective hooks, old data, priority, visual editor and stage wiring');

'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const director=load('components/visualizer/vocalTimeDirectorV496');
const {normalizeVocalTimeSegmentsV496:normalize,resolveVocalTimeCueV496:cue,normalizeVocalTimeLibraryV496:library}=director;
const data=[
 {startMs:0,endMs:900,leadSlot:0,partnerSlot:1,style:'solo',strength:85},
 {startMs:900,endMs:2500,leadSlot:1,partnerSlot:0,style:'duet',strength:75},
 {startMs:2500,endMs:4000,leadSlot:2,partnerSlot:3,style:'hook',strength:60},
];
assert.deepEqual(normalize(data),data);
assert.equal(normalize([{}]).length,0);
assert.equal(normalize([{...data[0],startMs:-1}]).length,0);
assert.equal(normalize([{...data[0],endMs:0}]).length,0);
assert.equal(normalize([{...data[0],endMs:36000001}]).length,0);
assert.equal(normalize([{...data[0],leadSlot:4}]).length,0);
assert.equal(normalize([{...data[0],strength:Infinity}]).length,0);
assert.equal(normalize([{...data[1],partnerSlot:1}]).length,0);
assert.equal(normalize([{...data[0],style:'random'}]).length,0);
assert.equal(normalize([{...data[0],endMs:1000}],900).length,0);
assert.equal(normalize(Array.from({length:200},()=>data[0])).length,120);
assert.equal(normalize([{...data[0],strength:145}])[0].strength,100);
const normalLib=library({'track-id':data,__proto__:data,'another':[{...data[0],endMs:0}]});
assert.deepEqual(normalLib['track-id'],data);
assert.equal(normalLib.another,undefined);
assert.equal(Object.getPrototypeOf(library({'constructor':data})),null);
assert.equal(library({'constructor':data}).constructor,undefined);
function get(time,patch={}){return cue({trackId:'track-id',progressMs:time,playing:true,count:4,enabled:true,segments:data,...patch});}
assert.equal(get(0).active,true);
assert.deepEqual(get(450).singingSlots,[0]);
assert.equal(get(900).leadSlot,1);
assert.deepEqual(get(950).singingSlots,[1,0]);
assert.equal(get(950).handoffFrom,0);
assert.equal(get(1550).handoffFrom,null);
assert.deepEqual(get(2600).singingSlots,[0,1,2,3]);
assert.equal(get(3999).active,true);
assert.equal(get(4000).active,false);
assert.equal(get(450,{count:1}).active,false);
assert.equal(get(950,{count:2}).active,true);
assert.deepEqual(get(2600,{count:3}).singingSlots,[0,1,2],'hooks only use visible slots');
assert.equal(get(450,{playing:false}).active,false);
assert.equal(get(450,{enabled:false}).active,false);
assert.equal(get(450,{manualPriority:true}).active,false);
assert.equal(get(450,{trackId:''}).active,false);
assert.equal(get(450,{progressMs:NaN}).active,false);
assert.equal(get(450,{progressMs:-1}).active,false);
assert.equal(get(450,{segments:[]}).active,false);
assert.equal(get(950,{reducedMotion:true}).emphasis,0);
assert.equal(get(950,{reducedMotion:true}).handoffFrom,null);
const overlapping=[...data,{...data[0],startMs:200,endMs:700,leadSlot:3}];
assert.equal(get(350,{segments:overlapping}).leadSlot,3,'last manual edit wins');
assert.equal(get(750,{segments:overlapping}).leadSlot,0);
let active=0,changes=0,last=-1;
const longSegments=Array.from({length:15},(_,i)=>({startMs:i*120000,endMs:(i+1)*120000,leadSlot:i%4,partnerSlot:(i+1)%4,style:i%2?'duet':'solo',strength:65}));
for(let tick=0;tick<108000;tick++){
 const result=get(tick*1000/60,{segments:longSegments});
 assert(result.count===4);
 if(result.active){active++;if(last!==-1&&result.leadSlot!==last)changes++;last=result.leadSlot;}
}
assert(active>100000&&changes<=15,'30 minute timebase is deterministic and bounded');
const source=(file)=>fs.readFileSync('components/visualizer/'+file,'utf8');
assert(source('VisualizerStage.tsx').includes('vocalTimeSegmentsV496:track?.id?'));
assert(source('VisualizerStage.tsx').includes('vocalTimeEnabledV496:preferences.vocalTimeEnabledV496'));
assert(source('registry.tsx').includes('vocalTimeSegmentsV496?:'));
for(const name of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx']){
 const s=source(name);
 assert(s.includes('resolveVocalTimeCueV496('),name+' must resolve actual time cues');
 assert(s.includes('!manualCueV385.active'),name+' manual singer priority');
 assert(s.includes('!timeCueV496.active'),name+' older cue fallback');
 assert(s.includes('timeCueV496.active?timeCueV496:legacyDuetCueV416'),name+' precedence');
 assert(s.includes('manualVocalCueRefV385.current=liveSingerCueV416'),name+' existing lips');
 assert(s.includes('applyRapDuetInteractionV416('),name+' existing camera/gestures');
}
assert(source('StageCameraDirectorV289.tsx').includes('resolveVocalTimeCueV496('));
assert(source('StageCameraDirectorV289.tsx').includes('timeCueV496.active?timeCueV496:legacyDuetCueV416'));
assert(source('StageCameraDirectorV289.tsx').includes('manualPriority:!automaticShot'));
assert(source('useGltfVocalMotionV492.ts').includes('track.id===propsLipSyncV367.vocalTimeTrackIdV496'));
assert(source('ProceduralDancerAvatarV492.tsx').includes('track.id===lipSync.vocalTimeTrackIdV496'));
assert(fs.readFileSync('components/SonicDisplay.tsx','utf8').includes('preferences.vocalTimeEnabledV496===true'));
assert(source('RapDuetStudioPanelV416.tsx').includes('<VocalTimeEditorV496/>'));
assert(source('VocalTimeEditorV496.tsx').includes('Start = aktuelle Zeit'));
assert(source('VocalTimeEditorV496.tsx').includes('Die Vorschau verändert die Spotify-Position nicht'));
assert(fs.readFileSync('types/music.ts','utf8').includes('vocalTimeSegmentsV496?'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=496,'V496 and later release versions preserve singer time-cue contract');
assert(pkg.scripts['build:preflight'].includes('npm run test:v496 && npm run test:v496:types && npm run test:v495'));
console.log('PASS V496: manual timestamp singer timeline, duet/hook lip masks, seek, validation, integration, 30-minute simulation');

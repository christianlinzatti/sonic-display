'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineRapGestureV1062:gesture,rapMouthRateV1062:rate,rapFaceAccentV1062:face}=
 load('lib/advancedRapPerformanceV1062');
const accent={active:true,source:'word',confidence:'lyrics-word',role:'lead',lineIndex:0,wordIndex:1,
 head:.029,chest:.042,arms:.066,side:1};
const base={active:true,evidence:'timed-word',style:'steady',accent};
const lyrics={synced:true,lines:[{startMs:1200,endMs:2800,words:[
 {text:'Der',startMs:1220,endMs:1450},{text:'Beat',startMs:1470,endMs:1880},
 {text:'kommt',startMs:1900,endMs:2420}]}]};
const p={enabled:true,strength:60,trackId:'rap-song-A',lyrics,effectiveTimeMs:1650,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',section:'hook'};
const enhanced=gesture(base,p);
assert.notEqual(enhanced,base,'verified word cue receives small add-on');
assert(enhanced.accent.head>accent.head&&enhanced.accent.head<=.055);
assert(enhanced.accent.chest>accent.chest&&enhanced.accent.chest<=.09);
assert(enhanced.accent.arms>accent.arms&&enhanced.accent.arms<=.11);
assert.deepEqual(enhanced,gesture(base,p),'pure repeatable result');
assert.deepEqual(accent,base.accent,'base must never mutate');
assert.equal(enhanced.accent.side,base.accent.side,'no left/right switching');
for(const change of [
 {enabled:false},{strength:0},{strength:NaN},{playing:false},{reducedMotion:true},
 {manualPriority:true},{tier:'low'},{trackId:null},{trackId:''},{effectiveTimeMs:NaN},
 {effectiveTimeMs:1200},{effectiveTimeMs:1881},{lyrics:null},
 {lyrics:{...lyrics,synced:false}},
 {lyrics:{synced:true,lines:[]}},
 {lyrics:{synced:true,lines:[{...lyrics.lines[0],words:[]}]}}
]) assert.strictEqual(gesture(base,{...p,...change}),base,JSON.stringify(change));
for(const off of [{active:false},{evidence:'none'},{accent:{...accent,source:'beat'}},
 {accent:{...accent,confidence:'estimated'}},{accent:{...accent,active:false}}])
 assert.strictEqual(gesture({...base,...off},p).active===false||gesture({...base,...off},p).accent===({...base,...off}).accent,true);
const cue={active:true,source:'verified-timed-word',wordStartMs:1470,wordEndMs:1880,onset:.75,release:.62};
const ctx={playing:true,rap:true,verifiedSinger:true,manualPriority:false,protectedMouth:false,
 reducedMotion:false,tier:'high',effectiveTimeMs:1650};
assert(rate(cue,ctx,'jaw',.1,.8,true,60)>1);
assert(rate(cue,ctx,'round',.8,.1,true,60)<1);
assert.equal(rate(cue,ctx,'lipsClosed',.2,.8,true,60),1,'bilabial seal remains owned by V415/V837');
for(const c of ['brow','smile','blink','squint'])assert.equal(rate(cue,ctx,c,.2,.8,true,60),1);
assert(face(.25,cue,ctx,'brow',true,60)>.25);
assert(face(.25,cue,ctx,'cheek',true,60)>.25);
assert(face(.25,cue,ctx,'squint',true,60)>.25);
for(const c of ['jaw','round','wide','lipsClosed','blink','smile'])
 assert.equal(face(.25,cue,ctx,c,true,60),.25,`not new ${c} owner`);
for(const change of [{playing:false},{rap:false},{verifiedSinger:false},
 {manualPriority:true},{protectedMouth:true},{reducedMotion:true},{tier:'low'},
 {effectiveTimeMs:NaN},{effectiveTimeMs:1400},{effectiveTimeMs:1900}]){
 const updated={...ctx,...change};
 assert.equal(rate(cue,updated,'jaw',.1,.8,true,60),1,JSON.stringify(change));
 assert.equal(face(.25,cue,updated,'brow',true,60),.25,JSON.stringify(change));
}
for(const c of [{active:false},{source:'none'},{onset:NaN},{release:Infinity},
 {wordStartMs:NaN},{wordEndMs:1500},{wordEndMs:4000}]){
 assert.equal(rate({...cue,...c},ctx,'jaw',.1,.8,true,60),1,JSON.stringify(c));
 assert.equal(face(.2,{...cue,...c},ctx,'brow',true,60),.2,JSON.stringify(c));
}
for(let i=0;i<10000;i++){
 const time=1470+i%430,st=i%105-15;
 const m=gesture(base,{...p,effectiveTimeMs:time,strength:st,tier:i%3===0?'balanced':'high'});
 for(const [k,limit] of [['head',.055],['chest',.09],['arms',.11]])
  assert(Number.isFinite(m.accent[k])&&m.accent[k]>=0&&m.accent[k]<=limit,k);
 const t={...ctx,effectiveTimeMs:time};
 for(const channel of ['jaw','round','wide','lipsClosed']){
  const mult=rate(cue,t,channel,0.1,.8,true,st);
  assert(Number.isFinite(mult)&&mult>=.95&&mult<=1.075,`mouth-rate ${i}`);
 }
 for(const channel of ['brow','cheek','squint','jaw','lipsClosed']){
  const target=face(.25,cue,t,channel,true,st);
  assert(Number.isFinite(target)&&target>=.25&&target<=.30,`face ${i}`);
 }
}
const source=read('lib/advancedRapPerformanceV1062.ts');
for(const bad of ['fetch(','Math.random(','Date.now(','setInterval(','setTimeout(',
 'WebSocket(','requestAnimationFrame(','localStorage','morphTargetInfluences','navigator.'])
 assert(!source.includes(bad),bad);
const gltf=read('components/visualizer/GltfDancerAvatarV492.tsx');
const hook=read('components/visualizer/useGltfVocalMotionV492.ts');
const vocal=read('components/visualizer/VocalRigV368.tsx');
assert(hook.includes('refineRapGestureV1062(advancedRapV1023,'));
assert(hook.indexOf('refineRapGestureV1062(advancedRapV1023,')<hook.indexOf('correctAutomaticAccentV515(wordDanceV567'));
assert(vocal.includes('rapMouthRateV1062(articulationV837,mouthContextV1023'));
assert(vocal.includes('rapFaceAccentV1062(directedTargetV632'));
assert(vocal.includes("c==='lipsClosed'"),'existing lip seal preserved');
assert(gltf.includes('arenaRapPerformanceEnabledV1062&&stageTheme'));
for(const f of ['context/UiPreferencesContext.tsx','types/music.ts','components/visualizer/registry.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(f).includes('arenaRapPerformanceEnabledV1062'),f);
assert(read('context/UiPreferencesContext.tsx').includes('arenaRapPerformanceEnabledV1062:false'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1062');assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1062-advanced-rap-performance-regression.cjs'));
console.log('PASS V1062: verified-word rap gestures + facial timing, manual/duet guards, 10k bounded samples and CI integration');

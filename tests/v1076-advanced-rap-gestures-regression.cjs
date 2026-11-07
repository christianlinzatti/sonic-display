#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {refineRapGesturesV1076:refine}=load('lib/advancedRapGesturesV1076');
const accent={active:true,source:'word',confidence:'lyrics-word',role:'lead',
 lineIndex:0,wordIndex:1,head:.029,chest:.041,arms:.064,side:1};
const base={active:true,evidence:'timed-word',style:'steady',accent};
const lyrics={synced:true,lines:[{startMs:1200,endMs:3100,words:[
 {text:'Der',startMs:1210,endMs:1460},{text:'Beat',startMs:1470,endMs:1720},
 {text:'rollt',startMs:1740,endMs:2190},{text:'weiter',startMs:2200,endMs:2680}]}]};
const p={enabled:true,strength:65,trackId:'rap-1076',lyrics,effectiveTimeMs:1590,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',section:'verse'};
const rapid=refine(base,p);
assert.notEqual(rapid,base,'verified rapid word gets an accent');
assert(rapid.accent.head>accent.head,'fast flow: head timing');
assert(rapid.accent.arms<accent.arms,'fast flow: compact arms');
assert.equal(rapid.accent.chest>=accent.chest,true);
assert.equal(rapid.accent.side,1,'preserve gesture direction');
assert.equal(rapid.accent.role,'lead','preserve singer');
assert.deepEqual(rapid,refine(base,p),'same song time means same accent');
assert.deepEqual(base.accent,accent,'pure input');
const long={...base,accent:{...accent,wordIndex:2}};
const hook=refine(long,{...p,effectiveTimeMs:1960,section:'hook'});
assert(hook.accent.arms>long.accent.arms&&hook.accent.chest>long.accent.chest,
 'long hook word uses an expressive, bounded accent');
// Different word lengths and line ends are explicitly handled without an audio guess.
const release={...base,accent:{...accent,wordIndex:3}};
const released=refine(release,{...p,effectiveTimeMs:2430,section:'verse'});
assert(released.accent.chest>release.accent.chest);
for(const change of [
 {enabled:false},{strength:0},{strength:81},{strength:NaN},{playing:false},
 {reducedMotion:true},{manualPriority:true},{tier:'low'},
 {trackId:''},{trackId:null},{effectiveTimeMs:NaN},
 {effectiveTimeMs:1300},{effectiveTimeMs:1740},
 {lyrics:null},{lyrics:{...lyrics,synced:false}},
 {lyrics:{synced:true,lines:[]}},{lyrics:{synced:true,lines:[{...lyrics.lines[0],words:[]}]}}
]) assert.strictEqual(refine(base,{...p,...change}),base,'fail-closed '+JSON.stringify(change));
for(const change of [
 {active:false},{evidence:'none'},
 {accent:{...accent,active:false}},{accent:{...accent,source:'beat'}},
 {accent:{...accent,confidence:'estimated'}},
 {accent:{...accent,arms:NaN}},{accent:{...accent,chest:Infinity}},
 {accent:{...accent,head:-1}},{accent:{...accent,arms:2}},
 {accent:{...accent,lineIndex:100}},{accent:{...accent,wordIndex:-1}}
]) {const badBase={...base,...change};assert.strictEqual(refine(badBase,p),badBase,
 'source safety '+JSON.stringify(change));}
let tested=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(let i=0;i<10000;i++){
  const index=i%4;
  const word=lyrics.lines[0].words[index];
  const candidate={...base,accent:{...accent,wordIndex:index,lineIndex:0}};
  const current=p.effectiveTimeMs;
  const result=refine(candidate,{...p,strength:(i%16)*5,
    effectiveTimeMs:word.startMs+(word.endMs-word.startMs)*((i%401)/401),
    tier:i%5===0?'balanced':'high',section:i%2===0?'verse':'hook'});
  tested++;
  for(const [field,max] of [['head',.055],['chest',.09],['arms',.11]]){
   const value=result.accent[field];
   assert(Number.isFinite(value)&&value>=0&&value<=max,field+' '+i);
  }
  assert.equal(result.accent.side,1);
  assert.equal(result.accent.role,'lead');
 }
}
assert.equal(tested,40000);
// Runtime wiring must occur after the V1023/V1062 authorization and before the V515 limiter.
const hookSource=read('components/visualizer/useGltfVocalMotionV492.ts');
assert(hookSource.includes('refineRapGesturesV1076(directedRapV1062,'));
assert(hookSource.indexOf('refineRapGestureV1062(advancedRapV1023,')<
 hookSource.indexOf('refineRapGesturesV1076(directedRapV1062,'));
assert(hookSource.indexOf('refineRapGesturesV1076(directedRapV1062,')<
 hookSource.indexOf('correctAutomaticAccentV515(wordDanceV567'));
assert(hookSource.includes('manualPriority:avatarMotionMode===\'choreography\''));
const dancer=read('components/visualizer/GltfDancerAvatarV492.tsx');
assert(dancer.includes("arenaRapGesturesEnabledV1076:arenaRapGesturesEnabledV1076&&stageTheme==='arena360'"));
for(const file of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaRapGesturesEnabledV1076'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaRapGesturesEnabledV1076:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1076 · Advanced Rap Gestures 8.0'));
for(const forbidden of [/\bfetch\(/,/\bDate\.now\(/,/\bMath\.random\(/,/\bsetTimeout\(/,
 /\bsetInterval\(/,/\brequestAnimationFrame\(/,/\bWebSocket\b/,/\bAudioContext\b/,
 /\bmorphTargetInfluences\b/,/\bgetWorldPosition\(/])
 assert(!forbidden.test(read('lib/advancedRapGesturesV1076.ts')),'no side effects '+forbidden);
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1076-advanced-rap-gestures-regression.cjs'),file);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1076,'V1076 regression supports subsequent releases');
assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1076: 40,000 gesture samples, word phrasing, verified cast, manual priority, bounded channels and CI wiring');

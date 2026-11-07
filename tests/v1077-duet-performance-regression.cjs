#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {refineDuetPerformanceV1077:refine}=load('lib/arena360DuetPerformanceV1077');
const accent={active:true,source:'word',confidence:'lyrics-word',role:'duet',
 lineIndex:0,wordIndex:1,head:.028,chest:.045,arms:.063,side:1};
const base={active:true,evidence:'timed-word',style:'open',accent};
const lyrics={synced:true,lines:[{startMs:1000,endMs:3400,words:[
 {text:'Wir',startMs:1000,endMs:1380},{text:'singen',startMs:1410,endMs:1800},
 {text:'zusammen',startMs:1810,endMs:2220},{text:'jetzt',startMs:2260,endMs:2670}]}]};
const duet={active:true,lineIndex:0,leadSlot:0,partnerSlot:1,singingSlots:[0,1],
 handoffFrom:null,phase:1,emphasis:.8,startMs:1000,endMs:3400,
 source:'word-timed',count:2,style:'duet'};
const input={enabled:true,strength:60,trackId:'track-1077',lyrics,effectiveTimeMs:1580,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',section:'verse',
 slot:0,count:2,casting:duet};
const lead=refine(base,input),partner=refine(base,{...input,slot:1});
assert.notStrictEqual(lead,base,'cast-bound duo changes only its verified singer');
assert(lead.accent.chest>accent.chest&&lead.accent.arms>accent.arms);
assert(partner.accent.chest>accent.chest&&partner.accent.arms<accent.arms,
 'duet lead and partner need distinct gestures');
assert.notEqual(lead.accent.side,partner.accent.side,'directional, bounded partner cue');
assert.deepEqual(refine(base,input),lead,'deterministic');
assert.deepEqual(base.accent,accent,'no mutation of input');
const hook={...duet,style:'hook',partnerSlot:null,singingSlots:[0,1],phase:1};
const group0=refine(base,{...input,casting:hook,slot:0});
const group1=refine(base,{...input,casting:hook,slot:1});
assert(group0.accent.arms>accent.arms&&group1.accent.arms>accent.arms,'shared hooks');
assert.notEqual(group0.accent.chest,group1.accent.chest,'subtle slot staggering');
assert.equal(group0.accent.side,accent.side,'hook retains authored arm side');
const reply={...duet,style:'reply',leadSlot:1,partnerSlot:0,
 singingSlots:[1],handoffFrom:0,phase:.5};
const replyOut=refine(base,{...input,casting:reply,slot:1});
assert(replyOut.accent.head>accent.head,'reply performer reacts to verified handoff');
assert.strictEqual(refine(base,{...input,casting:reply,slot:0}),base,
 'inactive singer never receives partner movement');
const manual={...duet,style:undefined,role:'hook',partnerSlot:undefined};
assert.notStrictEqual(refine(base,{...input,casting:manual}),base,
 'verified V385 manually assigned hook cast is supported');
for(const change of [
 {enabled:false},{strength:0},{strength:81},{strength:NaN},{playing:false},
 {reducedMotion:true},{manualPriority:true},{tier:'low'},
 {trackId:''},{trackId:null},{effectiveTimeMs:NaN},{effectiveTimeMs:2200},
 {slot:-1},{slot:3},{count:1},{count:5},{casting:null},
 {lyrics:null},{lyrics:{...lyrics,synced:false}},
 {lyrics:{synced:true,lines:[]}},
 {lyrics:{synced:true,lines:[{...lyrics.lines[0],words:[]}]}}
])assert.strictEqual(refine(base,{...input,...change}),base,'fail closed '+JSON.stringify(change));
for(const cast of [
 {...duet,active:false},{...duet,lineIndex:1},
 {...duet,leadSlot:4},{...duet,partnerSlot:4},
 {...duet,singingSlots:[0]}, {...duet,singingSlots:[0,0]},
 {...duet,singingSlots:[2]}, {...duet,count:3},
 {...duet,style:'solo'}, {...duet,phase:NaN},
 {...duet,startMs:NaN}, {...duet,endMs:999},
 {...duet,endMs:20000}, {...duet,emphasis:Infinity},
 {...duet,handoffFrom:5},
])assert.strictEqual(refine(base,{...input,casting:cast}),base,'invalid cast '+JSON.stringify(cast));
for(const change of [
 {active:false},{evidence:'none'},
 {accent:{...accent,active:false}},{accent:{...accent,source:'beat'}},
 {accent:{...accent,confidence:'guessed'}},
 {accent:{...accent,lineIndex:2}},{accent:{...accent,wordIndex:-1}},
 {accent:{...accent,head:Infinity}},{accent:{...accent,arms:-1}},
 {accent:{...accent,chest:.9}}
]){const bad={...base,...change};assert.strictEqual(refine(bad,input),bad,'invalid word '+JSON.stringify(change));}
let count=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(let i=0;i<10000;i++){
  const wordIndex=i%4,word=lyrics.lines[0].words[wordIndex];
  const sampleBase={...base,accent:{...accent,wordIndex,side:i%2===0?1:-1}};
  const sampled=refine(sampleBase,{...input,
   effectiveTimeMs:word.startMs+(word.endMs-word.startMs)*((i%311)/311),
   slot:i%2,casting:i%3===0?hook:i%3===1?duet:reply,
   tier:i%7===0?'balanced':'high',strength:(i%16)*5});
  count++;
  for(const [key,max] of [['head',.055],['chest',.09],['arms',.11]]){
   assert(Number.isFinite(sampled.accent[key])&&sampled.accent[key]>=0&&sampled.accent[key]<=max,
    genre+' '+key+' '+i);
  }
  assert.equal(sampled.accent.role,sampleBase.accent.role,'never reassign vocals');
  assert(Number.isFinite(sampled.accent.side)&&Math.abs(sampled.accent.side)<=1);
 }
}
assert.equal(count,40000);
// The GitHub ZIP importer protects workflow files, so enforce the complete
// preference-to-GLB pipeline and prevent a feature appearing only in UI.
for(const file of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/GltfDancerAvatarV492.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaDuetPerformanceEnabledV1077'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaDuetPerformanceEnabledV1077:false'));
const hookSrc=read('components/visualizer/useGltfVocalMotionV492.ts');
assert(hookSrc.includes('refineDuetPerformanceV1077(directedRapV1076,'));
assert(hookSrc.includes('casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472'));
assert(hookSrc.indexOf('refineRapGesturesV1076(directedRapV1062,')<
 hookSrc.indexOf('refineDuetPerformanceV1077(directedRapV1076,'));
assert(hookSrc.indexOf('refineDuetPerformanceV1077(directedRapV1076,')<
 hookSrc.indexOf('correctAutomaticAccentV515(wordDanceV567'));
assert(read('components/visualizer/GltfDancerAvatarV492.tsx').includes(
 "arenaDuetPerformanceEnabledV1077:arenaDuetPerformanceEnabledV1077&&stageTheme==='arena360'"));
for(const forbidden of [/fetch\(/, /Math\.random\(/, /Date\.now\(/, /setTimeout\(/,
 /setInterval\(/,/requestAnimationFrame\(/,/WebSocket/,/AudioContext/,/morphTargetInfluences/,
 /getWorldPosition\(/])assert(!forbidden.test(read('lib/arena360DuetPerformanceV1077.ts')),String(forbidden));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1077-duet-performance-regression.cjs'),file);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=1077);
assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
console.log(`PASS V1077: ${count.toLocaleString('en-US')} duet probes, verified singer casting, lead/reply/hooks, manual priority, zero role/IK/lip changes`);

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentStageLightingV1026:plan,STAGE_LIGHT_OFF_V1026:OFF}=load('components/visualizer/intelligentStageLightingV1026');
const acts=[
 {index:0,startMs:0,endMs:10000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:10000,endMs:20000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:2,startMs:20000,endMs:30000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:3,startMs:30000,endMs:40000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:4,startMs:40000,endMs:50000,section:'break',chapter:'respite',motif:'breath',repetition:0}];
const verified={source:'verified-v600',trackId:'track-1026',durationMs:50000,genre:'rap',acts,endingSupported:false};
const cue={active:true,source:'verified-v600',act:0,chapter:'setup',motif:'portrait',repetition:0,transition:1,dynamics:{}};
const cinematic={active:true,reason:'verified-act',actIndex:0,sceneIndex:0,repetition:0,intent:'portrait',blend:1,dynamics:{}};
const i={narrative:{plan:verified,cue},cinematic,trackId:'track-1026',durationMs:50000,positionMs:5000,
 playing:true,reactive:true,reducedMotion:false,tier:'high',genre:'Deutschrap',manualLighting:false,manualFx:false,
 seekBlocked:false,blackout:false,lyricsProtected:false,lyricsVisible:false,vocalFocus:true,groupCount:2,
 focusSlot:0,partnerSlot:null,energy:.7,kick:.8};
const get=(patch={})=>plan({...i,...patch});
const portrait=get();assert(portrait.active&&portrait.mood==='portrait'&&portrait.focusSlot===0);
assert(portrait.keyGain>1&&portrait.fillGain>1&&portrait.beamGain<1);
assert.equal(portrait.reason,'verified');assert.equal(portrait.color,'#ffc18e');
const duet=get({partnerSlot:1,cinematic:{...cinematic,intent:'dialogue'}});
assert(duet.active&&duet.mood==='duet'&&duet.fillGain>portrait.fillGain);
const wrongSinger=get({focusSlot:4});assert(wrongSinger.active&&wrongSinger.focusSlot===null&&wrongSinger.mood==='breath');
const oneSinger=get({groupCount:1,partnerSlot:1});assert(oneSinger.mood==='portrait');
const withAct=(act,positionMs,intent)=>get({positionMs,narrative:{plan:verified,cue:{...cue,act}},
 cinematic:{...cinematic,actIndex:act,intent}});
const hook=withAct(1,15000,'wide');assert(hook.active&&hook.mood==='arena'&&hook.fillGain>1);
const drop=withAct(3,35000,'pulse');assert(drop.active&&drop.mood==='arena'&&drop.beamGain>1);
const noImpact=plan({...i,positionMs:35000,narrative:{plan:verified,cue:{...cue,act:3}},
 cinematic:{...cinematic,actIndex:3,intent:'pulse'},kick:0});
assert(noImpact.active&&noImpact.beamGain<=1.001,'no fabricated bass pulse');
const build=withAct(2,25000,'rise');assert(build.mood==='rising');
const calm=withAct(4,45000,'breath');assert(calm.mood==='breath'&&calm.beamGain<1);
const lyric=get({lyricsVisible:true});assert(lyric.active&&lyric.colorMix===0&&lyric.beamGain<1&&lyric.fillGain>1);
const motion=get({tier:'balanced'});assert(motion.active&&motion.colorMix<portrait.colorMix);
assert.equal(get({tier:'high',genre:'Hardtekk'}).color,'#ff568c');
assert.equal(get({tier:'high',genre:'Hardstyle'}).color,'#86c8ff');
assert.equal(get({tier:'high',genre:'NDH Industrial Metal'}).color,'#ffc9a0');
for(const [name,patch] of Object.entries({
 paused:{playing:false},idle:{reactive:false},manual:{manualLighting:true},manualFx:{manualFx:true},
 seek:{seekBlocked:true},blackout:{blackout:true},low:{tier:'low'},reduced:{reducedMotion:true},
 noPlan:{narrative:null},fakeSource:{narrative:{plan:{...verified,source:'unavailable'},cue}},
 wrongTrack:{trackId:'other'},wrongDuration:{durationMs:49000},invalidClock:{positionMs:NaN},
 expired:{positionMs:50000},badAudio:{energy:NaN},badKick:{kick:Infinity},
 inactive:{narrative:{plan:verified,cue:{...cue,active:false}}},
 fakeCue:{narrative:{plan:verified,cue:{...cue,source:'off'}}},
 missingCamera:{cinematic:null},fakeCamera:{cinematic:{...cinematic,reason:'off'}},
 wrongAct:{cinematic:{...cinematic,actIndex:4}},zeroBlend:{cinematic:{...cinematic,blend:0}},
 outOfBounds:{groupCount:5},badAct:{narrative:{plan:verified,cue:{...cue,act:100}}},
 })){const result=get(patch);assert(!result.active,`rejected ${name}`);assert.equal(result.keyGain,1);assert.equal(result.fillGain,1);assert.equal(result.beamGain,1);assert.equal(result.floorGain,1);assert.equal(result.colorMix,0);}
const boundary=get({positionMs:0});assert(!boundary.active,'no hard cut at an act start');
const early=get({positionMs:100});assert(early.active&&early.keyGain-1<portrait.keyGain-1);
const late=get({positionMs:9950});assert(late.active&&late.keyGain-1<portrait.keyGain-1);
for(const name of ['keyGain','fillGain','beamGain','floorGain']){
 const v=portrait[name];assert(Number.isFinite(v));assert(v>=.88&&v<=1.08,`bounded ${name}`);
}
assert.deepEqual(OFF,{active:false,mood:'off',reason:'protected',keyGain:1,fillGain:1,beamGain:1,
 floorGain:1,color:'#ffffff',colorMix:0,focusSlot:null});
const source=read('components/visualizer/intelligentStageLightingV1026.ts');
for(const forbidden of ['fetch(','localStorage','sessionStorage','setInterval(','setTimeout(',
 'new SpotLight','new PointLight','new Color','window.','goveeClient','spotifyApi'])assert(!source.includes(forbidden),forbidden);
const stage=read('components/visualizer/DynamicStage.tsx');
assert(stage.includes('const stageLightV1026=planIntelligentStageLightingV1026({'));
assert(stage.indexOf('const stageLightV1026=')>stage.indexOf('const lightingV749='));
for(const token of ['*stageLightV1026.keyGain','*stageLightV1026.fillGain',
 '* stageLightV1026.floorGain','* stageLightV1026.beamGain',
 'manualLighting:manualLightingV763||authoredLightsV386','seekBlocked:playback.positionMs<',
 'lyricsVisible:!!lyricsVisibleV813','colorMix>0&&!timelineCue.color'])assert(stage.includes(token),token);
assert.equal((stage.match(/useFrame\(/g)||[]).length,1,'reuse existing R3F loop');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,lock.version);assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1026);
assert.equal(pkg.sonicFeatureRelease,pkg.version.split('-')[1]);assert.equal(pkg.sonicRoadmapRelease,pkg.version.split('-')[1]);
assert(pkg.scripts.prebuild.includes('npm run test:v1026 &&'));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1026-intelligent-stage-lighting-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1026(root)'));
console.log('PASS V1026 verified lighting: portrait, duet, hooks/drops, lyrics, no hardware, manual/blackout/seek priorities and CI');

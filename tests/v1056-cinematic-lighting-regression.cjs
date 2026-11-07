'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planCinematicLightingV1056:plan}=load('lib/arena360CinematicLightingV1056');
const durationMs=210000,trackId='spotify:v1056-regression';
const showPlan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
function input(at=103000){return {enabled:true,stageIsArena:true,lightsEnabled:true,playing:true,
 reducedMotion:false,reactive:true,trackId,progressMs:at,durationMs,
 performanceTier:'high',strength:70,plan:showPlan,
 show:sampleArenaShowPlanV1040(showPlan,{enabled:true,playing:true,reducedMotion:false,
  progressMs:at,durationMs})};}
const first=plan(input());
assert.equal(first.active,true);assert.equal(first.reason,'planned');
assert.deepEqual(first,plan(input()),'pure, deterministic plan');
assert(first.gainA>.2&&first.gainA<=1&&first.gainB>.2&&first.gainB<=1);
assert(first.followWeight>=0&&first.followWeight<=.8);
const chapterTimes=[8000,28000,82000,108000,145000,174000,202000];
const cues=chapterTimes.map(t=>plan(input(t)));
assert(cues.every(c=>c.active),'all seven chapters are planned');
assert.deepEqual(cues.map(c=>c.focus),['center','lead','wide','duet','wide','lead','duet']);
assert(new Set(cues.map(c=>c.colorA)).size>=2,'song-dependent colors change between scenes');
assert(cues[1].followWeight>0&&cues[3].followWeight>0);
assert.equal(cues[0].followWeight,0,'intro has no inferred singer tracking');
assert.equal(cues[2].followWeight,0,'camera-wide chapter does not force performer tracking');
assert.equal(cues[4].followWeight,0,'interlude does not invent singing');
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const p=generateArenaShowPlanV1040({genre,durationMs}),cue=plan({...input(),plan:p,
  show:sampleArenaShowPlanV1040(p,{enabled:true,playing:true,reducedMotion:false,progressMs:103000,durationMs})});
 assert(cue.active&&/^#[0-9a-f]{6}$/i.test(cue.colorA)&&/^#[0-9a-f]{6}$/i.test(cue.colorB));
}
for(const patch of [{enabled:false},{stageIsArena:false},{lightsEnabled:false},{playing:false},
 {reducedMotion:true},{reactive:false},{performanceTier:'low'},{trackId:''},{progressMs:NaN},
 {durationMs:NaN},{durationMs:1000},{progressMs:-1},{progressMs:durationMs+1},
 {show:{...input().show,active:false}},{show:{...input().show,segmentIndex:50}},
 {show:{...input().show,fade:0}},{plan:null},{strength:0}]){
 const out=plan({...input(),...patch});assert.equal(out.active,false,JSON.stringify(patch));
 assert.equal(out.followWeight,0);assert.equal(out.gainA,1);assert.equal(out.gainB,1);
}
assert.equal(plan({...input(),reducedMotion:true}).reason,'motion');
assert.equal(plan({...input(),playing:false}).reason,'paused');
assert.equal(plan({...input(),performanceTier:'low'}).reason,'quality');
assert.equal(plan({...input(),progressMs:Infinity}).reason,'clock');
const balanced=plan({...input(),performanceTier:'balanced'});
assert(balanced.active&&balanced.followWeight<first.followWeight);
assert(plan({...input(),strength:200}).followWeight<=.8);
const moved=plan({...input(),trackId:'another-song'});
assert(moved.active&&moved.chapter===first.chapter);
for(let i=0;i<6000;i++){
 const at=1000+i*33.2,now=plan(input(at));
 assert(now.gainA>=.2&&now.gainA<=1&&now.gainB>=.2&&now.gainB<=1);
 assert(Number.isFinite(now.followWeight)&&now.followWeight<=.8);
}
const planner=read('lib/arena360CinematicLightingV1056.ts');
for(const forbidden of ['fetch(','setInterval(','setTimeout(','Math.random(','localStorage',
 'navigator.','WebSocket(','Date.now(','new SpotLight','new Camera'])
 assert(!planner.includes(forbidden),'no unsolicited side effect: '+forbidden);
const light=read('components/visualizer/stages/ArenaLightsV1032.tsx');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(light.includes('getWorldPosition(out)')&&light.includes('TRACKING_ROOT_NAME'),
 'follow a real rendered world-space actor with safe fallback');
assert(light.includes("actor.scale.x<.15"),'hidden partner must not attract beam');
assert(light.includes("Math.hypot(out.x,out.z)<=2.85"),'bounds on observed stage coordinates');
assert(light.includes('lightCueV1056?.active')&&stage.includes('planCinematicLightingV1056('));
assert(stage.includes('lightCueV1056={cinematicLightingV1056}')||stage.includes('lightCueV1056={coordinatedSpotsV1060}'));
assert(!stage.includes('coordinatedSpotsV1060')||stage.includes('cinematicLightingV1056.active'),'coordination must require active spots');
assert.equal((light.match(/<spotLight\b/g)||[]).length,2,'reuse exactly two existing spotlights');
assert(light.includes('tier!==\'low\'')&&light.includes("tier==='high'"),'respect existing light budget');
assert(light.includes('castShadow={false}'),'no shadow GPU regression');
assert(light.includes('1-Math.exp(-dt*5)')&&light.includes('color.lerp('),'smooth motion and colors');
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/registry.tsx',
 'components/visualizer/VisualizerStage.tsx','context/UiPreferencesContext.tsx',
 'types/music.ts','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaCinematicLightingEnabledV1056'),file+' has opt-in');
assert(read('context/UiPreferencesContext.tsx').includes('arenaCinematicLightingEnabledV1056:false'));
assert(read('components/visualizer/stages/index.tsx').includes('cinematicLightingStrengthV1056={cinematicLightingStrengthV1056}'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1056 · Cinematic Concert Lighting 2.0'));
console.log('PASS V1056 · seven show looks, real-avatar follow, default-off, paused/quality safeguards, bounded beams, no extra lights/Govee/camera, renderer wiring');

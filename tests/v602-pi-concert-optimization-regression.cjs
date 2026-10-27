'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planPiConcertVisualQualityV602:plan,capPiConcertDprV602:cap,planPiConcertStageFxV602:apply}=load('components/visualizer/piConcertOptimizationV602');
const {initialPiConcertBudgetV479:init,advancePiConcertBudgetV479:advance}=load('services/monitoring/piConcertBudgetV479');
const {planAdvancedConcertStageFxV601:fx}=load('components/visualizer/advancedConcertStageFxV601');
const {DEFAULT_CONCERT_DETAILS_V555:settings}=load('components/visualizer/concertDetailEffectsV555');
const hints={likelyPi:true};
const pi=(level,enabled=true)=>({...init('pi-balanced',hints),enabled,level});
const input=(level='balanced',count=4,more={})=>({budget:pi(level),avatarCount:count,autoQuality:true,manualLighting:false,reactive:true,...more});
const cue={hook:true,density:.15,backdropOpacity:.25,projectedWord:'HOOK',pattern:1,adlib:'',adlibOpacity:0,rhymeWord:'',rhymeColor:null,arcSlots:null,arcOpacity:0};
const scene=(sec='hook')=>fx({cue,settings,playing:true,reducedMotion:false,tier:'high',section:sec,manualLighting:false,reactive:true,lyricsProtected:false});
let passed=0;
function test(name,fn){try{fn();passed++}catch(err){err.message='V602 '+name+': '+err.message;throw err}}
test('disabled Pi never modifies quality',()=>assert.equal(plan(input('eco',4,{budget:pi('eco',false)})).active,false));
test('manual render mode always bypasses Pi reductions',()=>assert.equal(plan(input('eco',4,{autoQuality:false})).active,false));
test('full Pi tier is neutral',()=>assert.equal(plan(input('full')).active,false));
test('balanced duo is neutral',()=>assert.equal(plan(input('balanced',2)).active,false));
test('balanced solo is neutral',()=>assert.equal(plan(input('balanced',1)).active,false));
test('balanced triple activates low-cost details',()=>{const p=plan(input('balanced',3));assert(p.active&&p.dprCap<=1.05&&p.ledGain<1)});
test('balanced quartet activates quality overlay',()=>assert.equal(plan(input('balanced',4)).mode,'balanced'));
test('eco protects even solo performance',()=>{const p=plan(input('eco',1));assert.equal(p.mode,'eco');assert.equal(p.dprCap,.8)});
test('eco suppresses OPTIONAL sweep spotlight',()=>{const p=plan(input('eco'));assert.equal(p.spotlightGain,0)});
test('eco retains positive gobo and LED output',()=>{const p=plan(input('eco'));assert(p.ledGain>0&&p.goboGain>0)});
test('eco dims fog more than gobo',()=>{const p=plan(input('eco'));assert(p.fogGain<p.goboGain)});
test('manual light always preserves original shader strengths',()=>{for(const l of ['eco','balanced']){const p=plan(input(l,4,{manualLighting:true}));assert.equal(p.ledGain,1);assert.equal(p.fogGain,1);assert.equal(p.goboGain,1);assert.equal(p.spotlightGain,1)}});
test('reactive off preserves user static V556 effects',()=>{const p=plan(input('eco',4,{reactive:false}));assert.equal(p.ledGain,1);assert.equal(p.goboGain,1)});
test('authored lighting remains unchanged when the overlay is applied',()=>{const p=plan(input('eco',4,{manualLighting:true}));const s=scene();assert.deepEqual(apply(s,p),s)});
test('render DPR capped in eco auto mode',()=>assert.equal(cap(1.5,plan(input('eco')),true),.8));
test('render DPR never increased by Pi',()=>assert.equal(cap(.65,plan(input('eco')),true),.65));
test('manual render DPR remains untouched',()=>assert.equal(cap(1.4,plan(input('eco')),false),1.4));
test('balanced quartet limits DPR less severely than eco',()=>assert.equal(cap(1.5,plan(input('balanced')),true),1.05));
test('disabled profile does not limit DPR',()=>assert.equal(cap(1.5,plan(input('eco',4,{budget:pi('eco',false)})),true),1.5));
test('invalid DPR does not create fabricated valid value',()=>{assert(Number.isNaN(cap(NaN,plan(input('eco')),true)));assert.equal(cap(0,plan(input('eco')),true),0)});
test('V601 song structure survives Pi overlay',()=>{const q=apply(scene('drop'),plan(input('eco')));assert.equal(q.mode,'drop');assert.equal(q.evidence,'stage-cue');assert.equal(q.ledShape,2)});
test('projection words stay untouched on underpowered Pi',()=>{const s=scene('hook'),q=apply(s,plan(input('eco')));assert.equal(q.projectedWord,'HOOK');assert.equal(q.projection,s.projection)});
test('word timestamps cannot be changed by Pi overlay',()=>{const s=scene('hook'),q=apply(s,plan(input('eco')));assert(!Object.hasOwn(q,'progressMs'));assert(!Object.hasOwn(q,'activeIndex'))});
test('low quality is monotonically bounded by the original V601 FX',()=>{const s=scene('drop'),q=apply(s,plan(input('eco')));for(const k of ['gobo','pixelWall','floorFog','spotlight','sweep','speed'])assert(q[k]<=s[k]&&q[k]>=0)});
test('balanced quality remains brighter than eco for same show',()=>{const s=scene('hook'),eco=apply(s,plan(input('eco'))),mid=apply(s,plan(input('balanced')));for(const k of ['gobo','pixelWall','floorFog','spotlight'])assert(mid[k]>=eco[k])});
test('inactive policy preserves exact stage cue object',()=>{const s=scene();assert.equal(apply(s,plan(input('full'))),s)});
test('off stage stays off in eco',()=>{const s={...scene(),mode:'off',evidence:'off'};assert.equal(apply(s,plan(input('eco'))),s)});
test('input objects are never mutated',()=>{const p=plan(input('eco')),s=scene(),before=JSON.stringify(s);apply(s,p);assert.equal(JSON.stringify(s),before)});
test('non-finite avatar count is defensively limited',()=>{assert.equal(plan(input('balanced',NaN)).active,false);assert.equal(plan(input('eco',Infinity)).active,true)});
test('budget full disabled safety remains default even with expensive stage',()=>{const p=plan({budget:init('off',{likelyPi:false}),avatarCount:4,autoQuality:true,manualLighting:false,reactive:true});assert.equal(p.active,false)});
test('V479 existing sustained pressure lowers to eco',()=>{
 let b=init('pi-balanced',hints);for(let n=1;n<=5;n++)b=advance(b,{at:n*1000,fps:21,p95FrameMs:65,avatarCount:4,playing:true,visible:true});
 assert.equal(b.level,'eco');assert.equal(plan(input('eco',4,{budget:b})).mode,'eco');
});
test('V479 rejects missing foreground evidence rather than forcing eco',()=>{
 let b=init('pi-balanced',hints);for(let n=1;n<=8;n++)b=advance(b,{at:n*1000,fps:NaN,p95FrameMs:55,avatarCount:4,playing:true,visible:false});assert.equal(b.level,'balanced')
});
test('V479 reverts eco only after sustained recovery and cooldown',()=>{
 let b=init('pi-balanced',hints);for(let n=1;n<=5;n++)b=advance(b,{at:n*1000,fps:20,p95FrameMs:70,avatarCount:4,playing:true,visible:true});for(let n=6;n<=35;n++)b=advance(b,{at:n*1000,fps:52,p95FrameMs:18,avatarCount:4,playing:true,visible:true});assert.equal(b.level,'balanced')
});
test('no new Three shader pass, new renderer or animation loop',()=>{const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');assert.equal((s.match(/<shaderMaterial ref=/g)||[]).length,3);assert.equal((s.match(/useFrame\(/g)||[]).length,1);assert(s.includes('planPiConcertStageFxV602'))});
test('production stage supplies real avatar count to Pi quality',()=>{const s=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');assert(s.includes('avatarCount={groupOnV326?effectiveGroupSettingsV442.count:dual||auto||multiEnabled||Boolean(showFormation)?2:1}'))});
test('same measured V479 budget feeds resolution and FX',()=>{const s=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');assert(s.includes('samplePiConcertV479'));assert(s.includes('readPiConcertBudgetV479()'));assert(s.includes('capPiConcertDprV602'));assert(s.includes("mode==='auto'"))});
test('explicit performance setting kept',()=>{const s=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');assert(s.includes('<option value="high">'));assert(s.includes('<option value="balanced">'))});
test('no new network or local storage in Pi FX rule',()=>{const s=fs.readFileSync('components/visualizer/piConcertOptimizationV602.ts','utf8');assert.doesNotMatch(s,/fetch\(|requestAnimationFrame|setTimeout|setInterval|localStorage|Math\.random|WebSocket|navigator\.gpu/) });
test('FX explicit flags are untouched',()=>{const s=scene();const p=plan(input('eco'));const q=apply(s,p);assert.equal(q.ledShape,s.ledShape);assert.equal(q.projectedWord,s.projectedWord)});
let samples=0;for(const l of ['full','balanced','eco'])for(let avatars=1;avatars<=4;avatars++)for(let n=0;n<2600;n++){
 const quality=plan(input(l,avatars,{manualLighting:n%17===0,reactive:n%19!==0}));
 const base=fx({cue:{...cue,density:(n%100)/100},settings:{...settings,strength:n%101},playing:true,reducedMotion:n%31===0,tier:n%7===0?'low':'high',section:n%4===0?'hook':n%4===1?'drop':n%4===2?'verse':'build',manualLighting:n%17===0,reactive:n%19!==0,lyricsProtected:n%13===0});
 const result=apply(base,quality);
 for(const k of ['gobo','pixelWall','floorFog','spotlight','sweep','speed','projection'])assert(Number.isFinite(result[k])&&result[k]>=0&&result[k]<=base[k]+1e-9);
 assert.equal(result.projectedWord,base.projectedWord);
 const dp=cap(1.5,quality,true);assert(dp>0&&dp<=1.5);
 if(n%17===0)assert.equal(result.gobo,base.gobo);
 samples++;
}
test('31,200 mixed stage/quality/genre timing samples',()=>assert.equal(samples,31200));
console.log(`PASS V602: ${passed} regression groups, ${samples} validated budgeted FX states; no simulated GPU measurements.`);

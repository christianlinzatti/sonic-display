'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertExperienceV628:plan}=load('components/visualizer/concertExperienceV628');
const {planUltimateConcertDramaturgyV623}=load('components/visualizer/ultimateConcertDramaturgyV623');
let passed=0;
function test(name,fn){try{fn();passed++;}catch(error){error.message=`V628 ${name}: ${error.message}`;throw error;}}
const sections=['verse','hook','verse','build','hook','break','drop','verse','hook','break'];
const motifs=['portrait','ensemble','dialogue','crescendo','wide','breath','wide','portrait','ensemble','breath'];
const chapters=['setup','payoff','develop','rise','payoff','respite','payoff','develop','ending-arc','respite'];
const repetitions=[0,0,1,0,1,0,0,2,2,1];
const acts=sections.map((section,index)=>({index,section,chapter:chapters[index],motif:motifs[index],repetition:repetitions[index],startMs:index*25000+1000,endMs:(index+1)*25000+1000}));
const song={source:'verified-v600',trackId:'track-628',durationMs:252000,genre:'deutschrap',endingSupported:true,acts};
const current=(idx=0)=>({active:true,source:'verified-v600',act:idx,chapter:acts[idx].chapter,motif:acts[idx].motif,repetition:acts[idx].repetition,transition:.85});
const input=(idx=0,patch={})=>{
 const positionMs=acts[idx].startMs+10000;
 const defaults={narrative:{plan:song,cue:current(idx)},trackId:song.trackId,durationMs:song.durationMs,positionMs,
  section:acts[idx].section,playing:true,reducedMotion:false,tier:'high',energy:.8,kick:.7,
  lyricsProtected:false,manualDance:false,manualCamera:false,manualLighting:false};
 const x={...defaults,...patch};
 const base=planUltimateConcertDramaturgyV623({...x,enabled:true,vocalFocus:false});
 return {...x,base:patch.base??base};
};
const run=(idx=0,patch={})=>plan(input(idx,patch));
const NEUTRAL=x=>{assert.equal(x.active,false);assert.equal(x.moment,'off');assert.equal(x.strength,0);};
test('matching verified acts activate the finish pass',()=>assert(run(0).active));
test('original V623 priority and chapter preserved',()=>{const x=run(0);assert.equal(x.cue.priority,'vocal');assert.equal(x.cue.chapter,'setup');});
test('portrait starts with close-up editorial role',()=>assert.equal(run(0).moment,'close-up'));
test('duet motif has conversation role',()=>assert.equal(run(2).moment,'conversation'));
test('ensemble motif has ensemble role',()=>assert.equal(run(1).moment,'ensemble'));
test('wide motif has panorama role',()=>assert.equal(run(4).moment,'panorama'));
test('breath motif calms the composition',()=>assert.equal(run(5).moment,'breathing'));
test('crescendo motif ramps the existing composition',()=>assert.equal(run(3).moment,'crescendo'));
test('vocal foreground restrains camera and decoration',()=>{const x=input(0),r=plan(x);assert(r.cue.camera<=x.base.camera&&r.cue.decoration<x.base.decoration);});
test('lyric foreground restrains camera and decoration',()=>{const x=input(1,{lyricsProtected:true}),r=plan(x);assert.equal(r.cue.priority,'lyrics');assert(r.cue.decoration<=x.base.decoration);assert(r.cue.camera<=x.base.camera);assert(r.cue.dance<=x.base.dance);});
test('single verified second and third hooks have distinct balances',()=>{const a=run(1),b=run(4),c=run(8);assert.notDeepEqual([a.cue.dance,a.cue.camera,a.cue.decoration],[b.cue.dance,b.cue.camera,b.cue.decoration]);assert.notDeepEqual([b.cue.dance,b.cue.camera,b.cue.decoration],[c.cue.dance,c.cue.camera,c.cue.decoration]);});
test('quiet break reduces decoration and movement',()=>{const x=input(5),r=plan(x);assert(r.cue.decoration<x.base.decoration&&r.cue.dance<x.base.dance);});
test('unconfirmed drop cannot gain dance energy',()=>{const x=input(6,{kick:0}),r=plan(x);assert.equal(x.base.priority,'quiet');assert(r.cue.dance<=x.base.dance);});
test('confirmed drop retains its existing priorities',()=>{const x=run(6);assert.equal(x.cue.priority,'drop');assert.equal(x.act,6);});
test('unknown song cue cannot activate',()=>NEUTRAL(run(0,{narrative:null})));
test('wrong track cannot activate',()=>NEUTRAL(run(0,{trackId:'different'})));
test('stale section cannot activate',()=>NEUTRAL(run(1,{section:'verse'})));
test('inactive narrative cannot activate',()=>{const x=input(0);NEUTRAL(plan({...x,narrative:{plan:song,cue:{...current(0),active:false}}}));});
test('unverified narrative cannot activate',()=>{const x=input(0);NEUTRAL(plan({...x,narrative:{plan:{...song,source:'unavailable'},cue:current(0)}}));});
test('unverified narrative metadata cannot activate',()=>{const x=input(0);for(const patch of [{chapter:'rise'},{motif:'breath'},{repetition:5},{act:4}])NEUTRAL(plan({...x,narrative:{plan:song,cue:{...current(0),...patch}}}));});
test('V623 off cue remains off',()=>NEUTRAL(run(0,{base:{...input().base,active:false}})));
test('V623 stale act mismatch remains off',()=>NEUTRAL(run(0,{base:{...input().base,act:1}})));
test('invalid duration rejected',()=>{for(const v of [-1,0,Infinity,100,NaN])NEUTRAL(run(0,{durationMs:v}));});
test('out-of-range position rejected',()=>{for(const v of [-1,0,252000,Infinity,NaN])NEUTRAL(run(0,{positionMs:v}));});
test('act boundaries are respected',()=>{NEUTRAL(run(0,{positionMs:0}));NEUTRAL(run(0,{positionMs:acts[0].endMs}));});
test('invalid envelope rejected',()=>{const x=input(1);for(const v of [-1,NaN,Infinity,1.1])NEUTRAL(plan({...x,narrative:{plan:song,cue:{...current(1),transition:v}}}));});
test('base safety ranges rejected rather than normalised silently',()=>{const x=input(1);for(const prop of ['dance','camera','decoration','face','lyrics'])NEUTRAL(plan({...x,base:{...x.base,[prop]:Infinity}}));});
test('reduced motion stays neutral',()=>NEUTRAL(run(1,{reducedMotion:true})));
test('low tier stays neutral',()=>NEUTRAL(run(1,{tier:'low'})));
test('paused stays neutral',()=>NEUTRAL(run(1,{playing:false})));
test('manual dance is untouched',()=>{const x=input(1,{manualDance:true});assert.equal(plan(x).cue.dance,x.base.dance);});
test('manual camera is untouched',()=>{const x=input(1,{manualCamera:true});assert.equal(plan(x).cue.camera,x.base.camera);});
test('manual lighting and face remain untouched',()=>{const x=input(1,{manualLighting:true});const r=plan(x);assert.equal(r.cue.face,x.base.face);assert.equal(r.cue.decoration,x.base.decoration);});
test('zero transition adds no intensity',()=>{const x=input(1),r=plan({...x,narrative:{plan:song,cue:{...current(1),transition:0}}});assert.deepEqual(r.cue,x.base);});
test('act entry and exit fade extra modifications',()=>{for(const idx of [1,4,8]){const a=acts[idx];for(const pos of [a.startMs,a.endMs-0.001]){const x=input(idx,{positionMs:pos});const r=plan(x);assert(r.active);assert(Math.abs(r.cue.dance-x.base.dance)<.00002);}}});
test('replay and seek deterministic',()=>{const x=run(4);run(7);run(2);assert.deepEqual(run(4),x);});
test('plans, base and cue never mutated',()=>{const x=input(4),before=JSON.stringify(x);plan(x);assert.equal(JSON.stringify(x),before);});
test('preserves identity of inactive V623 score',()=>{const x=input(1,{base:{...input(1).base,active:false}});assert.equal(plan(x).cue,x.base);});
test('preserves existing lyric multiplier and chapter labels',()=>{for(let idx=0;idx<acts.length;idx++){const x=input(idx);const r=plan(x);assert.equal(r.cue.lyrics,x.base.lyrics);assert.equal(r.cue.chapter,x.base.chapter);assert.equal(r.cue.priority,x.base.priority);}});
test('over 12000 bounded independent song frames',()=>{
 let count=0;for(let idx=0;idx<acts.length;idx++)for(let t=acts[idx].startMs;t<acts[idx].endMs;t+=18){
  const x=input(idx,{positionMs:t}),r=plan(x);
  assert(r.active);for(const k of ['dance','camera','decoration','face','lyrics'])assert(Number.isFinite(r.cue[k]),`${idx}:${k}`);
  assert(r.cue.dance>=.97&&r.cue.dance<=1.035);assert(r.cue.camera>=.8&&r.cue.camera<=1);
  assert(r.cue.decoration>=.72&&r.cue.decoration<=1);assert(r.cue.face>=1&&r.cue.face<=1.02);
  assert(r.strength>=0&&r.strength<=1);count++;
 }
 assert(count>12000);console.log(`V628 verified ${count} song frames`);
});
test('one runtime score shared by all existing four V623 consumers',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('story:concertStoryV629')&&s.includes('const concertDramaturgyV623=concertEditionV642.cue'));assert(s.includes('experience:concertExperienceV628'));assert(s.includes('sampleIntelligentSongDramaturgyV629')); assert(s.includes('data-v628-moment'));assert(s.includes('data-v628-motif'));assert(s.includes('concertDramaturgyV623={concertDramaturgyV623}'));});
test('final camera safety and original lighting budgets still own rendering',()=>{const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(s.includes('guardAutomaticCameraV351(composedV620'));for(const f of ['DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx','ConcertDetailStageV555.tsx'])assert(fs.readFileSync(`components/visualizer/${f}`,'utf8').includes('composeConcertLightingV623('));});
test('no new costly renderer, clock, guessed singer or BPM',()=>{const s=fs.readFileSync('components/visualizer/concertExperienceV628.ts','utf8');for(const key of ['useFrame(','requestAnimationFrame(','setInterval(','setTimeout(','Math.random(','new PointLight(','new SpotLight(','new ShaderMaterial(','fetch(','localStorage'])assert(!s.includes(key),key);});
console.log(`PASS V628 Concert Experience 2.0: ${passed} regression groups`);

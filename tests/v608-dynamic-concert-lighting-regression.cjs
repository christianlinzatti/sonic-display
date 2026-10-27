'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planDynamicConcertLightingV608:plan}=load('components/visualizer/dynamicConcertLightingV608');
let groups=0;
const test=(name,fn)=>{try{fn();groups++}catch(e){e.message=`V608 ${name}: ${e.message}`;throw e}};
const acts=[
 {index:0,startMs:0,endMs:36000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:36000,endMs:48000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:2,startMs:48000,endMs:70000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:3,startMs:70000,endMs:100000,section:'verse',chapter:'develop',motif:'dialogue',repetition:1},
 {index:4,startMs:100000,endMs:122000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:5,startMs:122000,endMs:132000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:6,startMs:132000,endMs:164000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:7,startMs:164000,endMs:198000,section:'hook',chapter:'ending-arc',motif:'crescendo',repetition:2},
];
const arc={trackId:'v608-verified-track',durationMs:198000,genre:'hardstyle',source:'verified-v600',acts,endingSupported:true};
const cast={active:true,moment:'verse',leftSingerSlot:0,rightSingerSlot:null,focusStrength:.36};
const cueFor=(n,transition=1)=>({active:true,source:'verified-v600',act:n,chapter:acts[n].chapter,motif:acts[n].motif,repetition:acts[n].repetition,transition,dynamics:{dance:1,camera:1,lighting:1,lyrics:1}});
const input=(n=0,patch={})=>({narrative:{plan:arc,cue:cueFor(n)},trackId:arc.trackId,positionMs:(acts[n].startMs+acts[n].endMs)/2,durationMs:arc.durationMs,
 section:acts[n].section,mood:'rap',energy:.7,kick:.6,cast,
 playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,tier:'high',...patch});
const fx=(n=0,patch={})=>plan(input(n,patch));
const valNames=['key','fill','beam','spot','haze','sweep'];
const neutral=fx(0,{playing:false});
test('real verified act activates',()=>{let p=fx();assert(p.active);assert.equal(p.reason,'verified-act');assert.equal(p.phase,'verse')});
test('rap verse brightens existing face fill and dims atmospheric beams',()=>{const p=fx();assert(p.fill>1);assert(p.beam<1);assert(p.haze<1);assert(p.sweep<1)});
test('calm break never brightens auto beams',()=>{const p=fx(5);assert.equal(p.phase,'break');assert(p.beam<.99);assert(p.fogOffset>0)});
test('build has a modest upward cue with observed energy',()=>{const p=fx(1);assert(p.beam>1);assert(p.spot>1)});
test('hook accent is bounded with full evidence',()=>{const p=fx(2);assert.equal(p.phase,'hook');assert(p.beam>1&&p.spot>1)});
test('second hook shifts visual emphasis toward spots',()=>{const a=fx(2),b=fx(4);assert(b.spot>a.spot);assert(b.beam<a.beam)});
test('third hook retains distinct repeated structure',()=>{const a=fx(2),b=fx(7);assert.notDeepEqual(a,b);assert.equal(b.phase,'finale')});
test('real final act is only added to verified ending',()=>{const p=fx(7);assert(p.active);assert(p.spot>fx(4).spot)});
test('ending with no evidence has no finale marker',()=>{const p=fx(7,{narrative:{plan:{...arc,endingSupported:false},cue:cueFor(7)}});assert.notEqual(p.phase,'finale')});
test('hardstyle drop needs verified kick',()=>{const p=fx(6,{mood:'hardstyle',kick:.8,energy:.95});assert(p.beam>1&&p.sweep>1&&p.spot>1)});
test('hardtekk drop uses evidence without strobes',()=>{const p=fx(6,{mood:'hardtekk',kick:.8,energy:.95});assert(p.beam>1);assert(p.beam<=1.12)});
test('no measured kick does not produce fake drop peak',()=>{const p=fx(6,{mood:'hardstyle',kick:0});assert(p.beam<=1);assert(p.spot===1)});
test('no measured energy does not produce fake drop peak',()=>{const p=fx(6,{mood:'hardstyle',energy:0});assert(p.beam<=1)});
test('genre alone never invents a section',()=>assert(!fx(6,{section:'verse'}).active));
test('explicit handoff focuses confirmed slots',()=>{const p=fx(0,{cast:{...cast,moment:'handoff',leftSingerSlot:1,rightSingerSlot:0}});assert.equal(p.phase,'handoff');assert(p.focusBoost>0);assert(p.spot>fx().spot)});
test('valid two-artist ensemble is a duet focus',()=>{const p=fx(2,{cast:{...cast,moment:'ensemble',rightSingerSlot:1}});assert.equal(p.phase,'duet');assert(p.focusBoost>0)});
test('cast with unverified right performer cannot claim duet',()=>assert.equal(fx(2,{cast:{...cast,moment:'ensemble'}}).phase,'hook'));
test('cast with inactive singer focus cannot claim handoff',()=>assert.equal(fx(0,{cast:{...cast,active:false,moment:'handoff',rightSingerSlot:2}}).phase,'verse'));
test('lyrics always lower haze/sweep, even finale',()=>{for(const n of [0,2,6,7]){const p=fx(n,{lyricsProtected:true,mood:'hardstyle',kick:.9,energy:.9});assert(p.haze<=1);assert(p.sweep<=1);assert(p.fill>=1)}});
test('verified scene uses bounded fog visibility offset',()=>assert(fx(5).fogOffset<=1));
test('balanced quality less emphatic than high',()=>{const a=fx(2),b=fx(2,{tier:'balanced'});assert(Math.abs(b.beam-1)<Math.abs(a.beam-1));assert(Math.abs(b.spot-1)<Math.abs(a.spot-1))});
test('low tier returns exact neutral state',()=>assert.deepEqual(fx(2,{tier:'low'}),neutral));
test('authored light timeline preserved',()=>assert.deepEqual(fx(6,{authored:true}),neutral));
test('intentional blackout preserved',()=>assert.deepEqual(fx(6,{blackout:true}),neutral));
test('stage reactive off preserved',()=>assert.deepEqual(fx(2,{reactive:false}),neutral));
test('paused show preserved',()=>assert.deepEqual(fx(2,{playing:false}),neutral));
test('reduced motion preserved',()=>assert.deepEqual(fx(2,{reducedMotion:true}),neutral));
test('foreign playback track fails closed',()=>assert.deepEqual(fx(2,{trackId:'next-song'}),neutral));
test('foreign duration fails closed',()=>assert.deepEqual(fx(2,{durationMs:155555}),neutral));
test('unverified narrative plan fails closed',()=>assert.deepEqual(fx(2,{narrative:{plan:{...arc,source:'unavailable'},cue:cueFor(2)}}),neutral));
test('inactive narrative cue fails closed',()=>assert.deepEqual(fx(2,{narrative:{plan:arc,cue:{...cueFor(2),active:false}}}),neutral));
test('foreign cue source fails closed',()=>assert.deepEqual(fx(2,{narrative:{plan:arc,cue:{...cueFor(2),source:'off'}}}),neutral));
test('missing narrative fails closed',()=>assert.deepEqual(fx(2,{narrative:null}),neutral));
test('wrong cue chapter / motif / repetition not allowed',()=>{for(const c of [{chapter:'develop'},{motif:'dialogue'},{repetition:3}])assert.deepEqual(fx(2,{narrative:{plan:arc,cue:{...cueFor(2),...c}}}),neutral)});
test('wrong act number rejected',()=>{for(const k of [-1,NaN,8,2.1])assert.deepEqual(fx(2,{narrative:{plan:arc,cue:{...cueFor(2),act:k}}}),neutral)});
test('act outside time boundary rejected',()=>{for(const positionMs of [47999,70000,-1,Infinity,NaN])assert.deepEqual(fx(2,{positionMs}),neutral)});
test('section mismatch rejected, never relabels a verse',()=>assert.deepEqual(fx(4,{section:'verse'}),neutral));
test('invalid audio evidence rejected instead of injecting NaN',()=>{for(const energy of [-1,NaN,Infinity,1.2])assert.deepEqual(fx(2,{energy}),neutral);for(const kick of [-1,NaN,Infinity,1.2])assert.deepEqual(fx(2,{kick}),neutral)});
test('transition outside [0,1] is invalid',()=>{for(const transition of [-1,1.1,NaN,Infinity])assert.deepEqual(fx(2,{narrative:{plan:arc,cue:cueFor(2,transition)}}),neutral)});
test('near boundary starts with zero extra accent',()=>{const p=fx(2,{narrative:{plan:arc,cue:cueFor(2,0)}});assert(p.active);for(const k of valNames)assert.equal(p[k],1);assert.equal(p.focusBoost,0)});
test('deterministic and does not mutate input',()=>{const x=input(2),snapshot=JSON.stringify(x);assert.deepEqual(plan(x),plan(x));assert.equal(JSON.stringify(x),snapshot)});
test('no external network, audio or timers',()=>{const s=fs.readFileSync('components/visualizer/dynamicConcertLightingV608.ts','utf8');assert.doesNotMatch(s,/fetch\(|requestAnimationFrame|setInterval|Math\.random|localStorage|AudioContext|spotify\.com/)});
test('existing V308 rig is reused with both two source lights',()=>{const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');assert(s.includes('planDynamicConcertLightingV608('));assert(s.includes('*lightingV608.beam'));assert(s.includes('*lightingV608.haze'));assert(s.includes('*lightingV608.spot'));assert(s.includes('lightingV608.fogOffset'));assert(s.includes('lightingV608.focusBoost'));assert(s.includes('castShadow={false}'));});
test('real DynamicStage key/fill/beam/sweep reused with V604 verified cues',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(s.includes('planDynamicConcertLightingV608('));assert(s.includes('lightingV608.key'));assert(s.includes('lightingV608.fill'));assert(s.includes('lightingV608.sweep'));assert(s.includes('cameraSectionV608??atmosphereSection.current'));});
test('real ThreeAvatar passes explicit camera-driven section, not guessed timing',()=>{const s=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');assert(s.includes('cameraSectionV608={props.cameraDirectorSection}'));assert(s.includes('cameraNarrativeV605={props.cameraNarrativeV605}'));});
test('no new GPU lights, shader programs, lasers, frame loops in V608 pure module',()=>{const s=fs.readFileSync('components/visualizer/dynamicConcertLightingV608.ts','utf8');assert.doesNotMatch(s.replace(/\/\*[\s\S]*?\*\//g,''),/useFrame|new SpotLight|new ShaderMaterial|laser|strobe/i)});
let frames=0;
for(let i=0;i<35000;i++){
 const n=i%acts.length,at=acts[n].startMs+1+(i*97)%Math.max(1,acts[n].endMs-acts[n].startMs-2);
 const p=fx(n,{positionMs:at,mood:i%3?'rap':'hardstyle',kick:i%100/100,energy:i%80/80,
  lyricsProtected:i%7===0,tier:i%5===0?'balanced':'high',
  narrative:{plan:arc,cue:cueFor(n,((i*71)%100)/100)}});
 for(const k of valNames)assert(Number.isFinite(p[k])&&p[k]>=.78&&p[k]<=1.12);
 assert(Number.isFinite(p.fogOffset)&&p.fogOffset>=0&&p.fogOffset<=1);
 assert(Number.isFinite(p.focusBoost)&&p.focusBoost>=0&&p.focusBoost<=.07);
 frames++;
}
test('35,000 bounded long-song, lip and lighting frames',()=>assert.equal(frames,35000));
console.log(`PASS V608: ${groups} groups, ${frames} deterministic full-song lighting frames.`);

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedStageLightingV621:plan,composeStageFxV621:compose}=load('components/visualizer/advancedStageLightingV621');
let count=0;function test(name,cb){try{cb();count++;}catch(e){e.message=`V621 ${name}: ${e.message}`;throw e;}}
const acts=['verse','build','hook','verse','hook','break','drop'].map((section,index)=>({index,startMs:index*30000+1000,endMs:(index+1)*30000,section,
 chapter:section==='hook'||section==='drop'?'payoff':section==='break'?'respite':section==='build'?'rise':'develop',
 motif:index===4?'ensemble':index===6?'wide':'portrait',repetition:index===4?1:0}));
const narrativePlan={source:'verified-v600',trackId:'v621-track',durationMs:220000,genre:'hardstyle',endingSupported:false,acts};
function cue(i,transition=1){return {active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,repetition:acts[i].repetition,transition};}
function input(i=0,patch={}){return {narrative:{plan:narrativePlan,cue:cue(i)},trackId:'v621-track',durationMs:220000,
 positionMs:acts[i].startMs+15000,section:acts[i].section,genre:'hardstyle',energy:.8,kick:.8,
 playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',...patch};}
function fx(i=0,patch={}){return plan(input(i,patch));}
const neutral=fx(0,{playing:false});
const fields=['key','fill','beam','spot','haze','sweep','gobo','led','floorFog','projection'];
test('a verified song act activates the director',()=>assert(fx().active));
test('rap verse protects faces and reduces beams',()=>{const x=fx();assert(x.key>1&&x.fill>1&&x.beam<1&&x.haze<1);});
test('first hook emphasizes ensemble lighting',()=>{const x=fx(2);assert(x.spot>1&&x.led>1&&x.gobo>1);});
test('second hook chooses a different accent balance',()=>{const a=fx(2),b=fx(4);assert(b.spot>a.spot&&b.led>a.led&&b.beam<a.beam);});
test('three-avatar hooks lift spots more than solo',()=>assert(fx(2,{groupCount:3}).spot>fx(2,{groupCount:1}).spot));
test('build rises using real act progress and current energy',()=>{const a=fx(1,{positionMs:acts[1].startMs+100}),b=fx(1,{positionMs:acts[1].endMs-100});assert(b.beam>a.beam&&b.led>a.led);});
test('drop accents need measured energy and a real kick',()=>{const a=fx(6,{kick:0}),b=fx(6,{kick:.9});assert.equal(a.beam,1);assert(b.beam>1&&b.spot>1);});
test('hardtekk changes no singer or scene identity',()=>assert.equal(fx(6,{genre:'hardtekk'}).section,'drop'));
test('rock drop uses modest light emphasis',()=>assert(fx(6,{genre:'rock'}).beam<fx(6,{genre:'hardtekk'}).beam));
test('instrumental break calms haze and beams',()=>{const x=fx(5);assert(x.beam<1&&x.led<1&&x.sweep<1);});
test('lyrics suppress haze sweep LED Gobos and floor fog',()=>{for(const i of [0,1,2,4,5,6]){const x=fx(i,{lyricsProtected:true});assert(x.beam<=1&&x.haze<=1&&x.sweep<=1&&x.led<=1&&x.gobo<=1&&x.floorFog<=1);}});
test('lyrics keep existing face fill protected',()=>assert(fx(2,{lyricsProtected:true}).fill>=1));
test('vocal focus calms sweeps and preserves faces',()=>{const x=fx(1,{vocalFocus:true});assert(x.key>=1&&x.fill>=1&&x.sweep<1&&x.haze<1);});
test('balanced tier is less expressive',()=>{const a=fx(2),b=fx(2,{tier:'balanced'});assert(Math.abs(b.led-1)<Math.abs(a.led-1));});
test('no verified cue is neutral',()=>assert.deepEqual(fx(2,{narrative:null}),neutral));
test('stale song identifier is neutral',()=>assert.deepEqual(fx(2,{trackId:'next'}),neutral));
test('wrong duration is neutral',()=>assert.deepEqual(fx(2,{durationMs:123}),neutral));
test('paused player is neutral',()=>assert.deepEqual(fx(2,{playing:false}),neutral));
test('disabled reactive stage is neutral',()=>assert.deepEqual(fx(2,{reactive:false}),neutral));
test('user authored timeline is neutral',()=>assert.deepEqual(fx(2,{authored:true}),neutral));
test('authored blackout is neutral',()=>assert.deepEqual(fx(2,{blackout:true}),neutral));
test('reduced motion is neutral',()=>assert.deepEqual(fx(2,{reducedMotion:true}),neutral));
test('low quality is neutral',()=>assert.deepEqual(fx(2,{tier:'low'}),neutral));
test('disabled V600 source is neutral',()=>assert.deepEqual(fx(2,{narrative:{plan:{...narrativePlan,source:'unavailable'},cue:cue(2)}}),neutral));
test('disabled cue is neutral',()=>assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:{...cue(2),active:false}}}),neutral));
test('wrong cue source is neutral',()=>assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:{...cue(2),source:'off'}}}),neutral));
test('wrong act index is neutral',()=>assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:cue(1)}}),neutral));
test('wrong chapter, motif, repetition are neutral',()=>{for(const k of [{chapter:'setup'},{motif:'ensemble'},{repetition:3}])assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:{...cue(2),...k}}}),neutral)});
test('unknown live section cannot fake a hook',()=>assert.deepEqual(fx(2,{section:'verse'}),neutral));
test('invalid actor slot count is neutral',()=>{for(const n of [-1,0,5,NaN,Infinity])assert.deepEqual(fx(2,{groupCount:n}),neutral);});
test('out-of-range cue is neutral',()=>{for(const x of [-1,7,NaN,Infinity])assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:{...cue(2),act:x}}}),neutral);});
test('invalid cue fades are neutral',()=>{for(const x of [-1,1.01,NaN,Infinity])assert.deepEqual(fx(2,{narrative:{plan:narrativePlan,cue:cue(2,x)}}),neutral);});
test('invalid playback is neutral',()=>{for(const positionMs of [NaN,Infinity,-1,220000,400000])assert.deepEqual(fx(2,{positionMs}),neutral);});
test('position beyond act is neutral',()=>assert.deepEqual(fx(2,{positionMs:acts[2].endMs}),neutral));
test('invalid energy never produces NaN or highlights',()=>{for(const energy of [-1,NaN,Infinity,2])assert.deepEqual(fx(2,{energy}),neutral);});
test('invalid kick never produces NaN or highlights',()=>{for(const kick of [-1,NaN,Infinity,2])assert.deepEqual(fx(2,{kick}),neutral);});
test('zero transition gives exact neutral gains',()=>{const x=fx(2,{narrative:{plan:narrativePlan,cue:cue(2,0)}});assert(x.active);for(const k of fields)assert.equal(x[k],1);});
test('pure planner does not mutate its arguments',()=>{const i=input(2),before=JSON.stringify(i);plan(i);assert.equal(JSON.stringify(i),before);});
test('render plans are seek-order independent',()=>{const a=fx(4);fx(2);fx(6);fx(0);assert.deepEqual(fx(4),a);});
const stage={mode:'hook',evidence:'stage-cue',gobo:.1,pixelWall:.12,floorFog:.08,projection:.08,spotlight:.08,sweep:.6,speed:.5,ledShape:1,projectedWord:'YES'};
test('decorations follow existing V601 limits without allocating',()=>{const x=compose(stage,fx(2));assert.equal(x.mode,'hook');assert.equal(x.ledShape,1);assert.equal(x.projectedWord,'YES');assert(x.gobo<=.35&&x.pixelWall<=.35&&x.gobo+x.pixelWall+x.projection<=stage.gobo+stage.pixelWall+stage.projection+.00002);});
test('authored decoration unaffected by neutral plan',()=>assert.strictEqual(compose(stage,neutral),stage));
test('ambient manual decoration unaffected',()=>{const b={...stage,mode:'ambient'};assert.strictEqual(compose(b,fx(2)),b);});
test('off decorations unaffected',()=>{const b={...stage,mode:'off'};assert.strictEqual(compose(b,fx(2)),b);});
test('shared additive effects never exceed the preexisting budget',()=>{for(const i of [0,1,2,4,5,6]){const x=compose(stage,fx(i));assert(x.gobo+x.pixelWall+x.projection<=stage.gobo+stage.pixelWall+stage.projection+.00002);}});
test('missing effects never appear',()=>{const b={...stage,gobo:0,pixelWall:0,floorFog:0,spotlight:0,projection:0};const a=compose(b,fx(2));for(const k of ['gobo','pixelWall','floorFog','spotlight','projection'])assert.equal(a[k],0);});
test('protected lyrics lower existing decoration energy',()=>{const a=compose(stage,fx(2,{lyricsProtected:true}));assert(a.gobo<stage.gobo&&a.pixelWall<stage.pixelWall&&a.floorFog<stage.floorFog&&a.sweep<stage.sweep);});
test('decoration never modifies input',()=>{const b=JSON.stringify(stage);compose(stage,fx(2));assert.equal(JSON.stringify(stage),b);});
test('lamp rigs both reuse exactly one V621 pure planner',()=>{for(const file of ['DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx']){const x=fs.readFileSync('components/visualizer/'+file,'utf8');assert(x.includes('planAdvancedStageLightingV621('));assert(x.includes('lightingV621.beam'));assert(x.includes('lightingV621.sweep'));}});
test('LED gobo and floor fog go through the existing Pi limiter',()=>{const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');assert(s.includes('composeStageFxV621(planPiConcertStageFxV602('));assert(s.includes('playbackV621.trackId'));});
test('verified cue and audio passed through by real 3D avatar stage',()=>{const s=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');assert(s.includes('cameraNarrativeV605={props.cameraNarrativeV605} vocalFocusV621'));assert(s.includes('energyV621='));});
test('no independent timers, shaders, GPU resources, API or fake singers',()=>{const s=fs.readFileSync('components/visualizer/advancedStageLightingV621.ts','utf8');for(const forbidden of ['useFrame(', 'setInterval(', 'setTimeout(', 'Math.random(', 'fetch(', 'new SpotLight(', 'new ShaderMaterial(', 'document.', 'window.', 'localStorage'])assert(!s.includes(forbidden),forbidden);});
let samples=0;
for(let i=0;i<20000;i++){
  const n=i%acts.length,act=acts[n];
  const x=fx(n,{positionMs:act.startMs+1+((i*223)%(act.endMs-act.startMs-2)),
    energy:(i%101)/100,kick:((i*3)%101)/100,tier:i%3===0?'balanced':'high',
    lyricsProtected:i%7===0,vocalFocus:i%5===0,groupCount:1+(i%4),
    narrative:{plan:narrativePlan,cue:cue(n,(i%101)/100)}});
  for(const k of fields)assert(Number.isFinite(x[k])&&x[k]>=.62&&x[k]<=1.11,`${k} ${x[k]}`);
  const out=compose(stage,x);
  for(const k of ['gobo','pixelWall','floorFog','spotlight','projection','sweep','speed'])assert(Number.isFinite(out[k])&&out[k]>=0&&out[k]<=1,`${k} ${out[k]}`);
  samples++;
}
test('20,000 song-wide lighting/FX frames are bounded',()=>assert.equal(samples,20000));
console.log(`PASS V621: ${count} groups, ${samples} bounded lighting/FX samples`);

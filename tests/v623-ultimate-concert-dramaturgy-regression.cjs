"use strict";
const assert=require('node:assert/strict');const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planUltimateConcertDramaturgyV623:plan,composeConcertLightingV623:lighting,
 composeConcertLyricsV623:lyrics,NEUTRAL_CONCERT_DRAMATURGY_V623:OFF}=load('components/visualizer/ultimateConcertDramaturgyV623');
let passed=0;function test(name,fn){try{fn();passed++;}catch(e){e.message=`V623 ${name}: ${e.message}`;throw e;}}
const sections=['verse','hook','verse','build','hook','break','drop','verse'];
const acts=sections.map((section,index)=>({index,section,startMs:1000+index*30000,endMs:31000+index*30000,
 chapter:index===7?'ending-arc':section==='hook'||section==='drop'?'payoff':section==='break'?'respite':section==='build'?'rise':'develop',
 motif:section==='hook'?'ensemble':section==='break'?'breath':'portrait',repetition:index===4?1:index===2?1:0}));
const song={source:'verified-v600',trackId:'song-623',durationMs:250000,genre:'deutschrap',endingSupported:true,acts};
const cue=index=>({active:true,source:'verified-v600',act:index,chapter:acts[index].chapter,motif:acts[index].motif,
 repetition:acts[index].repetition,transition:1});
const inp=(index=0,patch={})=>({narrative:{plan:song,cue:cue(index)},trackId:song.trackId,durationMs:song.durationMs,
 positionMs:acts[index].startMs+10000,section:acts[index].section,playing:true,reducedMotion:false,
 tier:'high',energy:.8,kick:.75,lyricsProtected:false,manualDance:false,manualCamera:false,manualLighting:false,...patch});
const value=(idx=0,patch={})=>plan(inp(idx,patch));
test('verified verse prioritises vocals',()=>assert.equal(value(0).priority,'vocal'));
test('build follows real labelled rise',()=>assert.equal(value(3).priority,'build'));
test('first hook is ensemble',()=>assert.equal(value(1).priority,'ensemble'));
test('confirmed strong drop',()=>assert.equal(value(6).priority,'drop'));
test('unconfirmed kick never gets stronger dance',()=>{const x=value(6,{kick:.05});assert.equal(x.priority,'quiet');assert(x.dance<=1);});
test('ending is only labelled finale',()=>assert.equal(value(7).priority,'finale'));
test('respite is restrained',()=>{const x=value(5);assert.equal(x.priority,'quiet');assert(x.decoration<1);});
test('dense lyrics trump finale and hooks',()=>{for(const i of [1,6,7]){const x=value(i,{lyricsProtected:true});assert.equal(x.priority,'lyrics');assert(x.camera<1&&x.decoration<1);}});
test('vocal priority trumps hook',()=>assert.equal(value(1,{vocalFocus:true}).priority,'vocal'));
test('repeated hooks vary their pacing',()=>assert.notEqual(value(1).camera,value(4).camera));
test('build has an increasing dance envelope',()=>{const early=value(3,{positionMs:acts[3].startMs+100}),late=value(3,{positionMs:acts[3].endMs-100});assert(early.dance<late.dance);});
test('reduced motion means complete neutral',()=>assert.deepEqual(value(1,{reducedMotion:true}),OFF));
test('low tier means complete neutral',()=>assert.deepEqual(value(1,{tier:'low'}),OFF));
test('disabled means complete neutral',()=>assert.deepEqual(value(1,{enabled:false}),OFF));
test('paused means complete neutral',()=>assert.deepEqual(value(1,{playing:false}),OFF));
test('wrong track means complete neutral',()=>assert.deepEqual(value(1,{trackId:'not-this-song'}),OFF));
test('duration mismatch means complete neutral',()=>assert.deepEqual(value(1,{durationMs:150000}),OFF));
test('section mismatch means complete neutral',()=>assert.deepEqual(value(1,{section:'verse'}),OFF));
test('unverified song sections never direct performers',()=>assert.deepEqual(value(1,{narrative:{plan:{...song,source:'unavailable'},cue:cue(1)}}),OFF));
test('invalid cue source means complete neutral',()=>assert.deepEqual(value(1,{narrative:{plan:song,cue:{...cue(1),source:'off'}}}),OFF));
test('inactive cue means complete neutral',()=>assert.deepEqual(value(1,{narrative:{plan:song,cue:{...cue(1),active:false}}}),OFF));
test('reject stale act metadata',()=>{for(const c of [{act:7},{chapter:'develop'},{motif:'dialogue'},{repetition:4}])assert.deepEqual(value(1,{narrative:{plan:song,cue:{...cue(1),...c}}}),OFF);});
test('reject gap, start and song end',()=>{for(const positionMs of [-1,999,250000,Infinity,NaN])assert.deepEqual(value(1,{positionMs}),OFF);});
test('reject invalid kick, energy and transitions',()=>{for(const bad of [NaN,-.1,Infinity,1.1]){
 assert.deepEqual(value(6,{kick:bad}),OFF);assert.deepEqual(value(6,{energy:bad}),OFF);
 assert.deepEqual(value(6,{narrative:{plan:song,cue:{...cue(6),transition:bad}}}),OFF);
}});
test('zero-strength cue has neutral gains',()=>{const x=value(1,{narrative:{plan:song,cue:{...cue(1),transition:0}}});assert(x.active);for(const k of ['dance','camera','decoration','face','lyrics'])assert.equal(x[k],1);});
test('balanced tier dampens compared with high',()=>assert(value(1,{tier:'balanced'}).dance<value(1).dance));
test('manual dance gets no changes',()=>assert.equal(value(1,{manualDance:true}).dance,1));
test('manual camera gets no changes',()=>assert.equal(value(1,{manualCamera:true}).camera,1));
test('manual lighting gets no changes',()=>{const x=value(1,{manualLighting:true});assert.equal(x.decoration,1);assert.equal(x.face,1);});
test('limits and finiteness across complete song',()=>{
 let count=0;for(let k=0;k<acts.length;k++)for(let ms=acts[k].startMs;ms<acts[k].endMs;ms+=19){
 const x=value(k,{positionMs:ms,energy:.8,kick:.7});assert(x.active);
 assert(x.dance>=.97&&x.dance<=1.035);assert(x.camera>=.8&&x.camera<=1);
 assert(x.decoration>=.72&&x.decoration<=1);assert(x.face>=1&&x.face<=1.02);
 for(const v of [x.dance,x.camera,x.decoration,x.face,x.lyrics])assert(Number.isFinite(v));count++;}
 assert(count>12000);console.log(`V623 verified ${count} full-song decisions`);
});
test('seeking is deterministic',()=>{const x=value(4);value(0);value(7);value(6);assert.deepEqual(value(4),x);});
test('input never mutated',()=>{const x=inp(4),s=JSON.stringify(x);plan(x);assert.equal(JSON.stringify(x),s);});
const lightBase={active:true,section:'verse',key:1.03,fill:1.04,beam:1.07,spot:1.04,haze:1.04,sweep:1.03,gobo:1.06,led:1.08,floorFog:1.03,projection:1.04};
test('lighting calms decorative layers',()=>{const x=lighting(lightBase,value(0));assert(x.beam<lightBase.beam&&x.sweep<lightBase.sweep&&x.gobo<lightBase.gobo);});
test('lighting preserves face key',()=>{const x=lighting(lightBase,value(0,{vocalFocus:true}));assert(x.key>=lightBase.key&&x.fill>=lightBase.fill);});
test('lighting cannot create previously disabled effect',()=>{const x=lighting({...lightBase,beam:0,led:0},value(0));assert.equal(x.beam,0);assert.equal(x.led,0);});
test('lighting bypasses inactive and manual scene',()=>{assert.equal(lighting(lightBase,OFF),lightBase);assert.equal(lighting({...lightBase,active:false},value(0)).active,false);});
const lyr={active:true,mode:'verse',verifiedWords:true,maxWidthCh:40,plateOpacity:.3,hookUnderline:.1,wordGain:.14,calm:false};
test('lyrics maintain timing and readability',()=>{const x=lyrics(lyr,value(0,{lyricsProtected:true}));assert.equal(x.verifiedWords,lyr.verifiedWords);assert.equal(x.maxWidthCh,lyr.maxWidthCh);assert(x.plateOpacity>=lyr.plateOpacity);});
test('lyrics remains inactive when no evidence',()=>assert.equal(lyrics(lyr,OFF),lyr));
test('lyrics word gain not inflated',()=>assert(lyrics(lyr,value(1,{lyricsProtected:true})).wordGain<=lyr.wordGain));
test('runtime uses same priority in four existing lanes',()=>{
 const files=['components/visualizer/VisualizerStage.tsx','components/visualizer/StageCameraDirectorV289.tsx',
 'components/visualizer/DynamicStage.tsx','components/KineticLyrics.tsx'];
 for(const f of files)assert(fs.readFileSync(f,'utf8').includes('V623'),f);
 for(const f of ['DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx','ConcertDetailStageV555.tsx']){
  const s=fs.readFileSync(`components/visualizer/${f}`,'utf8');assert(s.includes('composeConcertLightingV623('),f);
 }
});
test('V351 remains final camera safety gate',()=>{const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(s.indexOf('guardAutomaticCameraV351(composedV620')>s.indexOf('const composedV620='));});
test('new score does not allocate graphics or create clocks',()=>{const s=fs.readFileSync('components/visualizer/ultimateConcertDramaturgyV623.ts','utf8');for(const t of ['useFrame(','requestAnimationFrame(','setInterval(','setTimeout(','Math.random(','new SpotLight(','new ShaderMaterial(','new Color(','fetch(','localStorage'])assert(!s.includes(t),t);});
console.log(`PASS V623 ultimate concert dramaturgy: ${passed} regression groups`);

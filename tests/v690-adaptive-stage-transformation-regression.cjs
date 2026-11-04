'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdaptiveStageTransformationV690:plan,NEUTRAL_ADAPTIVE_STAGE_V690:neutral}=load('components/visualizer/adaptiveStageTransformationV690');
const {planDynamicStageTransformationV622:baseStage}=load('components/visualizer/dynamicStageTransformationV622');
let groups=0,samples=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V690 ${name}: ${e.message}`;throw e;}};
const sections=['verse','build','hook','verse','break','build','drop','hook'];
const chapters=['setup','rise','payoff','develop','respite','rise','payoff','ending-arc'];
const acts=sections.map((section,index)=>({index,section,chapter:chapters[index],
  motif:chapters[index]==='ending-arc'?'crescendo':section==='break'?'breath':section==='hook'?'wide':section==='build'?'ensemble':'portrait',
  startMs:index*24000,endMs:(index+1)*24000,repetition:section==='hook'&&index===7?1:0}));
const song={trackId:'track-690',durationMs:192000,source:'verified-v600',genre:'deutschrap',endingSupported:true,acts};
const cue=i=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,
  motif:acts[i].motif,repetition:acts[i].repetition,transition:1});
const ctx=(i=0,change={})=>({narrative:{plan:song,cue:cue(i)},trackId:song.trackId,
  positionMs:acts[i].startMs+12000,durationMs:song.durationMs,section:acts[i].section,
  genre:'deutschrap',playing:true,reactive:true,reducedMotion:false,tier:'high',
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,visualsEnabled:true,groupCount:2,...change});
const P=(i=0,change={})=>{const c=ctx(i,change);return plan({...c,foundation:baseStage(c),...(change.foundation?{foundation:change.foundation}:{})});};
const off=(i=2,change={})=>assert.deepEqual(P(i,change),neutral);
const bounds=p=>{for(const k of ['act','morph','ambientMix','floorMix','warmth','fogClearance'])assert(Number.isFinite(p[k]),k);
 assert(p.morph>=0&&p.morph<=.75);assert(p.ambientMix>=0&&p.ambientMix<=.05);
 assert(p.floorMix>=0&&p.floorMix<=.055);assert(Math.abs(p.warmth)<=.35);assert(p.fogClearance>=0&&p.fogClearance<=.4);};
test('intimate setup',()=>{assert.equal(P(0).scale,'intimate');assert(P(0).morph<P(2).morph);});
test('build rising scene',()=>assert.equal(P(1).scale,'rising'));
test('hook arena scene',()=>assert.equal(P(2).scale,'arena'));
test('break retreat',()=>{assert.equal(P(4).scale,'breath');assert(P(4).morph<P(6).morph);});
test('drop arena scene',()=>assert.equal(P(6).scale,'arena'));
test('verified ending expands to finale',()=>{assert.equal(P(7).scale,'finale');assert(P(7).morph>P(2).morph);});
test('no false finale without documented ending',()=>{const p={...song,endingSupported:false};const x=ctx(7,{narrative:{plan:p,cue:cue(7)}});const y=plan({...x,foundation:baseStage(x)});assert.notEqual(y.scale,'finale');});
test('expansion gradually unfolds through a build',()=>{const a=P(5,{positionMs:acts[5].startMs+1000}),b=P(5,{positionMs:acts[5].startMs+12000});assert(b.morph>a.morph);});
test('contiguous boundaries are continuous within rounding',()=>{for(let i=1;i<8;i++){
 const left=P(i-1,{positionMs:acts[i-1].endMs-.00001});const right=P(i,{positionMs:acts[i].startMs});
 assert(Math.abs(left.morph-right.morph)<=.00002,`border ${i}: ${left.morph} != ${right.morph}`);
 }});
test('gap fades to neutral rather than connecting scenes',()=>{
 const aa=acts.map(a=>({...a}));aa[3].startMs+=1200;aa[2].endMs-=1200;
 const p={...song,acts:aa};const x=i=>{const c=ctx(i,{narrative:{plan:p,cue:{...cue(i)}}});return plan({...c,foundation:baseStage(c)});};
 const c=ctx(2,{narrative:{plan:p,cue:cue(2)},positionMs:aa[2].endMs-.001});
 const d=ctx(3,{narrative:{plan:p,cue:cue(3)},positionMs:aa[3].startMs});
 assert.equal(plan({...c,foundation:baseStage(c)}).morph,0);assert.equal(plan({...d,foundation:baseStage(d)}).morph,0);
 });
test('pause off',()=>off(2,{playing:false}));
test('nonreactive off',()=>off(2,{reactive:false}));
test('reduced motion off',()=>off(2,{reducedMotion:true}));
test('low tier off',()=>off(2,{tier:'low'}));
test('manual effect off',()=>off(2,{authored:true}));
test('blackout off',()=>off(2,{blackout:true}));
test('visuals disabled off',()=>off(2,{visualsEnabled:false}));
test('wrong track off',()=>off(2,{trackId:'another-track'}));
test('wrong duration off',()=>off(2,{durationMs:1000}));
test('unverified plan off',()=>off(2,{narrative:{plan:{...song,source:'unavailable'},cue:cue(2)}}));
test('unverified cue off',()=>off(2,{narrative:{plan:song,cue:{...cue(2),source:'off'}}}));
test('missing plan off',()=>off(2,{narrative:null}));
test('inactive cue off',()=>off(2,{narrative:{plan:song,cue:{...cue(2),active:false}}}));
test('wrong section off',()=>off(2,{section:'verse'}));
test('incorrect act off',()=>off(2,{narrative:{plan:song,cue:cue(1)}}));
test('wrong chapter off',()=>off(2,{narrative:{plan:song,cue:{...cue(2),chapter:'setup'}}}));
test('wrong motif off',()=>off(2,{narrative:{plan:song,cue:{...cue(2),motif:'breath'}}}));
test('wrong repetition off',()=>off(2,{narrative:{plan:song,cue:{...cue(2),repetition:400}}}));
test('invalid playback time off',()=>{for(const positionMs of [-1,NaN,Infinity,-Infinity,192000])off(2,{positionMs});});
test('invalid group sizes off',()=>{for(const groupCount of [0,-1,5,NaN,2.1,Infinity])off(2,{groupCount});});
test('invalid transition off',()=>{for(const transition of [-1,0,1.1,NaN,Infinity])off(2,{narrative:{plan:song,cue:{...cue(2),transition}}});});
test('inactive V622 foundation off',()=>{const c=ctx(2);off(2,{foundation:{...baseStage(c),active:false}});});
test('forged V622 act off',()=>{const c=ctx(2);off(2,{foundation:{...baseStage(c),act:1}});});
test('invalid V622 blend off',()=>{for(const blend of [NaN,Infinity,-1,1.1]){const c=ctx(2);off(2,{foundation:{...baseStage(c),blend}});}});
test('unsupported genre off',()=>off(2,{genre:'noise-mystery'}));
test('balanced tier lowers change',()=>assert(P(2,{tier:'balanced'}).morph<P(2).morph));
test('lyrics protected lowers scenery',()=>assert(P(2,{lyricsProtected:true}).morph<P(2).morph));
test('singer focus lowers scenery',()=>assert(P(2,{vocalFocus:true}).morph<P(2).morph));
test('four performers lower scenery',()=>assert(P(2,{groupCount:4}).morph<P(2,{groupCount:1}).morph));
test('different genres use different tint without changing role',()=>{
 const a=P(2,{genre:'hardtekk'}),b=P(2,{genre:'rock'});
 assert(a.warmth<b.warmth);assert.equal(a.morph,b.morph);assert.equal(a.scale,b.scale);
 });
test('no time-dependent random or new render path',()=>{
 const s=fs.readFileSync('components/visualizer/adaptiveStageTransformationV690.ts','utf8');
 for(const k of ['Math.random(', 'Date.now(', 'performance.now(', 'useFrame(', 'setTimeout(', 'setInterval(', 'fetch(', 'new Mesh(', 'new Color(', 'new ShaderMaterial('])assert(!s.includes(k),k);
});
test('reuses stage LED plane and floor/background without changing theme',()=>{
 const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 for(const k of ['planAdaptiveStageTransformationV690(', 'led.uniforms.uStageMorph.value=Math.min(.75,stageScaleV690.morph+musicMoodV691.morph','uStageMorph:{value:0}',
  'stageScaleV690.ambientMix','stageScaleV690.floorMix','palette.base','palette.floor'])assert(s.includes(k),k);
 assert(s.indexOf('const sceneMotifV647=')<s.indexOf('const stageScaleV690='));
});
test('shader keeps one plane, existing 0.15 alpha budget, central vignette',()=>{
 const s=fs.readFileSync('components/visualizer/cinematicStageEnvironmentsV647.ts','utf8');
 for(const k of ['uniform float uStageMorph;', 'float stageExpansion=clamp(uStageMorph,0.0,0.75)', 'float rim=max(', 'gl_FragColor=vec4(col,clamp(uOpacity*backdrop*vignette,0.0,.15))'])assert(s.includes(k),k);
 for(const k of ['sampler2D','texture2D','new Mesh(', 'requestAnimationFrame('])assert(!s.includes(k),k);
});
test('detail stage keeps original intensity and user settings',()=>{
 const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');
 assert(s.includes('stageScaleV690.ambientMix')&&s.includes('planAdaptiveStageTransformationV690('));
 assert(s.includes('visualV640.pixelWall')&&s.includes('manualLighting===true'));
});
test('atmosphere only changes owned fog far distance',()=>{
 const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');
 assert(s.includes('stageScaleV690.fogClearance')&&s.includes('scene.fog===fog'));
});
test('no native animations or stage preset modifications',()=>{
 const s=fs.readFileSync('components/visualizer/adaptiveStageTransformationV690.ts','utf8');
 for(const k of ['.animations=', '.theme=', '.preset=', 'Scene(', 'GLTFLoader', '.rotation.', 'camera.position'])assert(!s.includes(k),k);
});
test('deterministic seeking and pure input',()=>{
 const c=ctx(5);const before=JSON.stringify(c);const a=P(5);
 for(let i=7;i>=0;i--)P(i);
 assert.deepEqual(P(5),a);assert.equal(JSON.stringify(c),before);
});
test('empty boundaries fade down without taking over scene',()=>{
 const a=P(0,{positionMs:0});assert(a.active&&a.morph===0);
 const end=P(7,{positionMs:191999.99});assert(end.morph>=0);
});
for(let i=0;i<15000;i++){
 const act=i%8, ms=acts[act].startMs+(i*193)%23999, genre=['deutschrap','hardstyle','hardtekk','rock','pop','electronic'][i%6];
 const x=P(act,{positionMs:ms,genre,groupCount:1+i%4,tier:i%2?'balanced':'high',
   lyricsProtected:i%7===0,vocalFocus:i%11===0});
 assert(x.active);bounds(x);samples++;
}
test('15000 bounded time samples',()=>assert.equal(samples,15000));
test('release wiring',()=>{
 const p=require('../package.json');assert(/^0\.1\.0-v(69[0-9]|[7-9][0-9]{2})$/.test(p.version));
 assert(p.scripts['test:quick'].includes('npm run test:v690 &&'));
 assert(p.scripts['check:release'].includes('npm run test:v690:types'));
 assert(fs.existsSync('docs/versions/V690-ADAPTIVE-STAGE-TRANSFORMATION.md'));
 assert(fs.readFileSync('ARCHITECTURE.md','utf8').includes(`**Dokumentationsstand:** V${require('../package.json').version.split('-v')[1]}`));
});
console.log(`PASS V690 Adaptive Stage Transformation: ${groups} groups, ${samples} samples`);

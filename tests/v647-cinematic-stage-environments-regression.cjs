"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicStageEnvironmentV647:plan,NEUTRAL_CONCERT_ENVIRONMENT_V647:neutral,LED_WALL_FRAGMENT_V647:shader}=load('components/visualizer/cinematicStageEnvironmentsV647');
const {planDynamicStageTransformationV622:foundation}=load('components/visualizer/dynamicStageTransformationV622');
const {planDynamicConcertStagesV635:stage}=load('components/visualizer/dynamicConcertStagesV635');
let groups=0,frames=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V647 ${name}: ${e.message}`;throw e;}};
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,index)=>({index,section,startMs:1000+24000*index,endMs:25000+24000*index,
  chapter:section==='hook'||section==='drop'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
  motif:section==='hook'?'ensemble':section==='break'?'breath':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?[0,0,0,0,1,0,0,2][index]:0}));
const song={trackId:'v647-song',durationMs:200000,source:'verified-v600',genre:'hardtekk',endingSupported:false,acts};
const cue=(i)=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,repetition:acts[i].repetition,transition:1});
const core=(i=2,more={})=>({narrative:{plan:song,cue:cue(i)},trackId:'v647-song',positionMs:acts[i].startMs+9000,
 durationMs:song.durationMs,section:acts[i].section,genre:'hardtekk',playing:true,reactive:true,
 reducedMotion:false,tier:'high',authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,
 visualsEnabled:true,groupCount:2,energy:.75,kick:.8,...more});
const P=(i=2,more={})=>{const v=core(i,more);const f=foundation(v);const b=stage({...v,foundation:f});return plan({...v,base:b});};
const off=(i,more)=>assert.deepEqual(P(i,more),neutral);
const bounded=(x)=>{for(const k of ['act','style','variation','architecture','depth','motion'])assert(Number.isFinite(x[k]),k);
 assert(x.architecture>=0&&x.architecture<=.72);assert(x.depth>=0&&x.depth<=.64);assert(x.motion>=0&&x.motion<=.24);};
test('verified cue is live',()=>{const x=P();assert(x.active&&x.architecture>0&&x.depth>0)});
test('Deutschrap warehouse style',()=>{const x=P(2,{genre:'deutschrap'});assert.equal(x.style,0);assert.equal(x.name,'concrete-warehouse');});
test('Hardstyle truss style',()=>{const x=P(2,{genre:'hardstyle'});assert.equal(x.style,1);assert.equal(x.name,'festival-truss');});
test('Hardtekk tunnel style',()=>{const x=P(2,{genre:'hardtekk'});assert.equal(x.style,2);assert.equal(x.name,'rave-tunnel');});
test('Rock amplifiers style',()=>{const x=P(2,{genre:'rock'});assert.equal(x.style,3);assert.equal(x.name,'amplifier-wall');});
test('Pop prisms style',()=>{const x=P(2,{genre:'pop'});assert.equal(x.style,4);assert.equal(x.name,'prism-studio');});
test('Electronica neon vault style',()=>{const x=P(2,{genre:'electronic'});assert.equal(x.style,5);assert.equal(x.name,'neon-vault');});
test('case and accidental whitespace normalized',()=>assert.equal(P(2,{genre:' HARDTEKK '}).style,2));
test('unsupported genre leaves V635 untouched',()=>off(2,{genre:'punkparty'}));
test('absent genre leaves V635 untouched',()=>off(2,{genre:null}));
test('different genres have six distinct identifiers',()=>assert.equal(new Set(['deutschrap','hardstyle','hardtekk','rock','pop','electronic'].map(genre=>P(2,{genre}).style)).size,6));
test('different hooks receive a different architectural phrase',()=>{assert.notEqual(P(2).variation,P(4).variation);});
test('different song acts have determined variation',()=>{for(let i=0;i<8;i++)assert.equal(P(i).variation,(Math.floor(i/3)+acts[i].repetition)%3);});
test('build has less architecture than drop',()=>assert(P(1).architecture<P(6).architecture));
test('break architecture is quiet',()=>assert(P(5).architecture<P(2).architecture));
test('verse has less architecture than hook',()=>assert(P(0).architecture<P(2).architecture));
test('build and drop deliberately have different movement character',()=>assert(P(6).motion>P(1).motion));
test('lyric protection dims architecture and depth',()=>{const a=P(),b=P(2,{lyricsProtected:true});assert(b.architecture<a.architecture&&b.depth<a.depth);});
test('face closeup dims architectures',()=>assert(P(2,{vocalFocus:true}).architecture<P().architecture));
test('four performers reduce environmental distraction',()=>assert(P(2,{groupCount:4}).architecture<P(2,{groupCount:1}).architecture));
test('balanced performance tier reduces shader complexity',()=>assert(P(2,{tier:'balanced'}).architecture<P().architecture));
test('low tier disables architectural shader',()=>off(2,{tier:'low'}));
test('paused song disables architecture',()=>off(2,{playing:false}));
test('reduced motion disables architecture',()=>off(2,{reducedMotion:true}));
test('reactive disabled disables architecture',()=>off(2,{reactive:false}));
test('manual authored lighting disables architecture',()=>off(2,{authored:true}));
test('blackout disables architecture',()=>off(2,{blackout:true}));
test('manually disabled stage decoration keeps off',()=>off(2,{visualsEnabled:false}));
test('song mismatch never receives another environment',()=>off(2,{trackId:'other-song'}));
test('duration mismatch never receives an environment',()=>off(2,{durationMs:100000}));
test('missing verified narrative leaves original theme',()=>off(2,{narrative:null}));
test('unverified V600 narrative rejected',()=>off(2,{narrative:{plan:{...song,source:'unknown'},cue:cue(2)}}));
test('unverified cue rejected',()=>off(2,{narrative:{plan:song,cue:{...cue(2),source:'unknown'}}}));
test('invalid section rejected',()=>off(2,{section:'verse'}));
test('invalid chapter rejected',()=>off(2,{narrative:{plan:song,cue:{...cue(2),chapter:'break'}}}));
test('mismatched act rejected',()=>off(2,{narrative:{plan:song,cue:cue(1)}}));
test('unknown elapsed time neutral',()=>{for(const positionMs of [NaN,Infinity,-Infinity,-1,200000])off(2,{positionMs});});
test('incorrect grouping neutral',()=>{for(const groupCount of [0,5,NaN,1.5,Infinity])off(2,{groupCount});});
test('invalid transition gate neutral',()=>{for(const transition of [-1,0,NaN,Infinity,1.5])off(2,{narrative:{plan:song,cue:{...cue(2),transition}}});});
test('malformed singer-protected clock neutral',()=>off(2,{positionMs:3000}));
test('unverified duration neutral',()=>off(2,{durationMs:NaN}));
test('malformed rendered opacity neutral',()=>{const x=core();const f=foundation(x);const base=stage({...x,foundation:f});
 for(const opacity of [-1,NaN,Infinity,.4])assert.deepEqual(plan({...x,base:{...base,opacity}}),neutral);});
test('a forged active base with different act neutral',()=>{const x=core();const f=foundation(x);const base=stage({...x,foundation:f});assert.deepEqual(plan({...x,base:{...base,act:1}}),neutral);});
test('a stale base clock neutral',()=>{const x=core();const f=foundation(x);const base=stage({...x,foundation:f});assert.deepEqual(plan({...x,base:{...base,phase:5}}),neutral);});
test('faded section border has zero architecture',()=>{for(let i=0;i<8;i++)assert.equal(P(i,{positionMs:acts[i].startMs}).architecture,0);});
test('near end of section has near zero architecture',()=>{for(let i=0;i<8;i++)assert(P(i,{positionMs:acts[i].endMs-.001}).architecture<=.00001);});
test('seek stability with no history',()=>{const x=P(4);for(let i=0;i<8;i++)P(i);assert.deepEqual(P(4),x);});
test('no object mutations across planner',()=>{const x=core(),f=foundation(x),base=stage({...x,foundation:f}),before=JSON.stringify({x,base});plan({...x,base});assert.equal(JSON.stringify({x,base}),before);});
test('bounded across all verified acts',()=>{for(let i=0;i<8;i++)bounded(P(i));});
test('output only controls the EXISTING plane',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 for(const token of ['planCinematicStageEnvironmentV647(', 'LED_WALL_FRAGMENT_V647','uArchitecture.value=','uDepth.value=','uMotion.value=','ledBudgetV640'])assert(s.includes(token),token);
 assert(s.includes('ref={ledWallV635}'));assert(!s.includes('new WebGLRenderer('));});
test('shader is texture-free and single-plane',()=>{for(const token of ['uSceneStyle','uVariation','uArchitecture','uDepth','uMotion','uOpacity','uPattern','dotMask','vUv','vignette','gl_FragColor'])assert(shader.includes(token),token);
 for(const token of ['sampler2D','texture2D','discard','gl_FragDepth','for(','while('])assert(!shader.includes(token),token);});
test('architecture stays at perimeter for lyrics and singers',()=>assert(shader.includes('float rim=max(')&&shader.includes('art=clamp(architectural,0.0,1.0)*rim')));
test('shader clamps brightness and handles all six designs',()=>assert(shader.includes('clamp(uOpacity*backdrop*vignette,0.0,.15)')&&shader.includes('uSceneStyle<4.5')));
test('procedural shader has no new texture downloads',()=>{const s=fs.readFileSync('components/visualizer/cinematicStageEnvironmentsV647.ts','utf8');
 for(const x of ['requestAnimationFrame(', 'useFrame(', 'Math.random(', 'Date.now(', 'fetch(', 'new Mesh(', 'new SpotLight(', 'new Color(', 'localStorage'])assert(!s.includes(x),x);});
test('new scene motifs do not change user-selected stage theme',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(s.includes("visualsEnabled:theme!=='minimal'&&sceneFlags.extraLights"));
 assert(s.includes('palette.base')&&s.includes('palette.floor'));});
test("V640 adaptive trim still controls architecture",()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 for(const token of ['uArchitecture.value=sceneMotifV647.architecture*ledBudgetV640','uDepth.value=sceneMotifV647.depth*ledBudgetV640','ledWallV635.current.visible='])assert(s.includes(token),token);});
test('default architecture is zero in shader until evidence confirmed',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(s.includes('uArchitecture:{value:0}'));});
test('existing V635 stage planner unchanged and still invoked first',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(s.indexOf('const stageVisualV635=planDynamicConcertStagesV635(')<s.indexOf('const sceneMotifV647=planCinematicStageEnvironmentV647('));});
for(let i=0;i<12000;i++){
 const a=i%8,p=acts[a].startMs+(i*173)%23998,genre=['deutschrap','hardstyle','hardtekk','rock','pop','electronic'][i%6];
 const x=P(a,{positionMs:p,genre,groupCount:1+i%4,tier:i%2?'balanced':'high',
  lyricsProtected:i%7===0,vocalFocus:i%9===0});
 bounded(x);assert(x.active&&x.name&&x.style>=0&&x.style<=5&&x.variation>=0&&x.variation<=2);frames++;
}
test('12,000 real-clock section samples safe',()=>assert.equal(frames,12000));
console.log(`PASS V647: ${groups} regression groups, ${frames} simulated concert frames`);

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planProfessionalLightingV636:plan,composeProfessionalStageFxV636:compose,
  NEUTRAL_PRO_LIGHTING_V636:neutral}=load('components/visualizer/professionalLightingShowV636');
let groups=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V636 ${name}: ${e.message}`;throw e;}};
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,i)=>({index:i,section,startMs:1000+i*24000,endMs:25000+i*24000,
  chapter:section==='drop'||section==='hook'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
  motif:section==='hook'?'ensemble':section==='break'?'breath':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?[0,0,0,0,1,0,0,2][i]:0}));
const song={trackId:'track-636',durationMs:200000,source:'verified-v600',genre:'hardtekk',endingSupported:false,acts};
const cue=(i=0)=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,
  repetition:acts[i].repetition,transition:1});
const base=(i=0,change={})=>({narrative:{plan:song,cue:cue(i)},trackId:'track-636',
  positionMs:acts[i].startMs+9000,durationMs:song.durationMs,section:acts[i].section,
  genre:'hardtekk',playing:true,reactive:true,reducedMotion:false,tier:'high',enabled:true,
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,energy:.85,kick:.75,groupCount:2,...change});
const P=(i=0,c={})=>plan(base(i,c));
const off=(i=2,c={})=>assert.deepEqual(P(i,c),neutral);
const fx=(c={})=>({mode:'hook',gobo:.11,pixelWall:.15,projection:.06,floorFog:.08,
  spotlight:.12,sweep:.8,speed:.75,ledShape:1,projectedWord:'Test',evidence:'stage-cue',...c});
const finite=(p)=>{for(const k of ['act','beam','spot','haze','sweep','aimOffset','goboGain','goboVariant','goboMix','goboSpeed'])assert(Number.isFinite(p[k]),k);};
test('verified verse creates a portrait cue',()=>{const x=P(0);assert(x.active&&x.motif==='portrait');});
test('build is a rise',()=>assert.equal(P(1).motif,'rise'));
test('hook is an ensemble',()=>assert.equal(P(2).motif,'ensemble'));
test('break is a respite',()=>assert.equal(P(5).motif,'respite'));
test('verified hardtekk drop with measurable kick is impact',()=>assert.equal(P(6).motif,'impact'));
test('unconfirmed kick does not create a drop emphasis',()=>{const x=P(6,{kick:.01});assert.equal(x.motif,'respite');assert(x.beam<=1);});
test('unconfirmed energy does not create a drop impact',()=>assert.equal(P(6,{energy:.01}).motif,'respite'));
test('repeated hooks choose distinct floor-gobo patterns',()=>{assert.notEqual(P(2).goboVariant,P(4).goboVariant);assert.notEqual(P(4).goboVariant,P(7).goboVariant);});
test('verse uses muted gobo intensity',()=>assert(P(0).goboGain<1));
test('break uses calm beams, sweep and haze',()=>{const x=P(5);assert(x.beam<1&&x.sweep<1&&x.haze<1);});
test('large hook has stronger spot than break',()=>assert(P(2).spot>P(5).spot));
test('build ramps up after confirmed act begins',()=>{const early=P(1,{positionMs:acts[1].startMs+1500});const late=P(1,{positionMs:acts[1].startMs+13000});assert(late.beam>early.beam);});
test('hardstyle stronger kick emphasis only in verified drop',()=>{assert(P(6,{kick:.95}).beam>P(6,{kick:.32}).beam);assert.equal(P(0,{kick:1}).motif,'portrait');});
test('balanced mode reduces intensity',()=>assert(Math.abs(P(2,{tier:'balanced'}).beam-1)<Math.abs(P(2).beam-1)));
test('lyrics protected inhibits more gobos, beams and spotlight accent',()=>{const p=P(2,{lyricsProtected:true});assert(p.goboGain<=.95&&p.spot<=1&&p.beam<P(2).beam&&p.aimOffset===0);});
test('vocal portrait preserves singer aim',()=>assert.equal(P(2,{vocalFocus:true}).aimOffset,0));
test('spot sweep stays mild in all sections',()=>{for(let i=0;i<8;i++){let p=P(i);assert(p.aimOffset>=-.11&&p.aimOffset<=.11);assert(p.sweep>=.83&&p.sweep<=1.055);}});
test('all gains stay constrained',()=>{for(let i=0;i<8;i++){const p=P(i);finite(p);assert(p.beam>=.90&&p.beam<=1.065&&p.spot>=.92&&p.spot<=1.065&&p.haze>=.84&&p.haze<=1&&p.goboGain>=.77&&p.goboGain<=1.08&&p.goboMix<=.35);}});
test('not playing makes plan neutral',()=>off(2,{playing:false}));
test('reactive off makes plan neutral',()=>off(2,{reactive:false}));
test('user disabled lighting is respected',()=>off(2,{enabled:false}));
test('reduced motion makes plan neutral',()=>off(2,{reducedMotion:true}));
test('low-tier makes plan neutral',()=>off(2,{tier:'low'}));
test('manually authored lighting makes plan neutral',()=>off(2,{authored:true}));
test('blackout makes plan neutral',()=>off(2,{blackout:true}));
test('no narrative makes plan neutral',()=>off(2,{narrative:null}));
test('wrong track makes plan neutral',()=>off(2,{trackId:'wrong'}));
test('wrong duration makes plan neutral',()=>off(2,{durationMs:199999}));
test('unauthorized cue source makes plan neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),source:'off'}}}));
test('unauthorized plan source makes plan neutral',()=>off(2,{narrative:{plan:{...song,source:'unavailable'},cue:cue(2)}}));
test('inactive cue makes plan neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),active:false}}}));
test('incorrect cue act makes plan neutral',()=>off(2,{narrative:{plan:song,cue:cue(1)}}));
test('section mismatch makes plan neutral',()=>off(2,{section:'verse'}));
test('chapter mismatch makes plan neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),chapter:'respite'}}}));
test('motif mismatch makes plan neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),motif:'portrait'}}}));
test('repetition mismatch makes plan neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),repetition:1}}}));
test('invalid act repetition makes plan neutral',()=>{const a=acts.map(x=>({...x}));a[2].repetition=-1;off(2,{narrative:{plan:{...song,acts:a},cue:cue(2)}});});
test('invalid transition makes plan neutral',()=>{for(const transition of [0,-1,NaN,Infinity,1.001])off(2,{narrative:{plan:song,cue:{...cue(2),transition}}});});
test('nonfinite position neutral',()=>{for(const positionMs of [-1,NaN,Infinity,-Infinity,200000,999999])off(2,{positionMs});});
test('invalid energy and kick neutral',()=>{for(const v of [-1,2,NaN,Infinity]){off(2,{energy:v});off(2,{kick:v});}});
test('invalid group size neutral',()=>{for(const groupCount of [-1,0,5,NaN,2.5,Infinity])off(2,{groupCount});});
test('song-arc fade starts at zero',()=>{for(let i=0;i<8;i++){const x=P(i,{positionMs:acts[i].startMs});assert(x.active&&x.beam===1&&x.goboMix===0);}});
test('song-arc fade ends near zero',()=>{for(let i=0;i<8;i++){const x=P(i,{positionMs:acts[i].endMs-0.001});assert(Math.abs(x.beam-1)<.00001&&x.goboMix<=.00001);}});
test('no memory across seek order',()=>{const x=P(4);[7,1,5,0,3,2,6].forEach(i=>P(i));assert.deepEqual(P(4),x);});
test('planner never mutates input',()=>{const x=base(2),old=JSON.stringify(x);P(2);plan(x);assert.equal(JSON.stringify(x),old);});
test('floor gobo is not added when disabled in old budget',()=>{const x=fx({gobo:0});assert.equal(compose(x,P(2)).gobo,0);});
test('floor LED is not added if previously off',()=>{const x=fx({pixelWall:0});assert.equal(compose(x,P(2)).pixelWall,0);});
test('existing projector budget stays allocated',()=>{const x=fx();assert.equal(compose(x,P(2)).projection,x.projection);});
test('gobo+led+projection shared budget cannot increase',()=>{for(let i=0;i<8;i++){const x=fx();const y=compose(x,P(i));assert(y.gobo+y.pixelWall+y.projection<=x.gobo+x.pixelWall+x.projection+.00002);}});
test('none, off and ambient mode unchanged',()=>{for(const mode of ['off','ambient']){const x=fx({mode});assert.strictEqual(compose(x,P(2)),x);}});
test('neutral stage FX unchanged',()=>{const x=fx();assert.strictEqual(compose(x,neutral),x);});
test('no unbudgeted gobo spotlight',()=>{const x=fx({spotlight:0});assert.equal(compose(x,P(2)).spotlight,0);});
test('existing spotlight budget is never increased',()=>{for(let i=0;i<8;i++){let x=fx({spotlight:.12});assert(compose(x,P(i)).spotlight<=x.spotlight);}});
test('sweep never exceeds the originally permitted motion cap',()=>{for(let i=0;i<8;i++){let x=fx({sweep:.8});assert(compose(x,P(i)).sweep<=x.sweep);}});
test('no speed increase from new director',()=>{for(let i=0;i<8;i++){let x=fx();assert(compose(x,P(i)).speed<=x.speed);}});
test('protect the original floorFog, projected word, led shape, evidence',()=>{const x=fx(),y=compose(x,P(2));for(const k of ['floorFog','projectedWord','ledShape','evidence'])assert.equal(y[k],x[k]);});
test('stage FX respects previously disabled sweep',()=>assert.equal(compose(fx({sweep:0}),P(2)).sweep,0));
test('existing V308 rig actually uses live V636 lighting gains',()=>{const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');for(const k of ['planProfessionalLightingV636({','professionalLightV636.beam','professionalLightV636.spot','professionalLightV636.haze','professionalLightV636.sweep','professionalLightV636.aimOffset'])assert(s.includes(k),k);});
test('existing V555 floor-gobo shader reuses same geometry',()=>{const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');for(const k of ['planProfessionalLightingV636({','composeProfessionalStageFxV636(', 'uGoboVariant','uGoboMix','float preferred=uGoboVariant'])assert(s.includes(k),k);});
test('gobo shader uniforms are actually initialized on the existing shared material',()=>{
  const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');
  const common=s.match(/const common=useMemo\(\(\)=>\(\{([^\n]+)\}\)\,\[\]\)/);
  assert(common,'shared floor-gobo material uniform definition');
  assert(common[1].includes('uGoboVariant:{value:0}'),'gobo variant must be initialized before frame updates');
  assert(common[1].includes('uGoboMix:{value:0}'),'gobo mix must be initialized before frame updates');
  assert(s.includes('uniforms={common}'),'floor-gobo must use that same initialized material');
});
test('new stage plan contains no GPU objects, timers, network or random values',()=>{const s=fs.readFileSync('components/visualizer/professionalLightingShowV636.ts','utf8');for(const k of ['requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'useFrame(', 'new SpotLight(', 'new Mesh(', 'new Texture(', 'Math.random(', 'fetch(', 'Date.now(', 'performance.now('])assert(!s.includes(k),k);});
let samples=0;
for(let i=0;i<12000;i++){
 const idx=i%8,pos=acts[idx].startMs+(i*157)%24000;
 const x=P(idx,{positionMs:pos,energy:(i%100)/100,kick:(i%47)/46,genre:i%3?'hardtekk':'deutschrap',
   groupCount:1+i%4,tier:i%2?'high':'balanced',lyricsProtected:i%7===0,vocalFocus:i%11===0});
 finite(x);assert(x.beam>=.90&&x.beam<=1.065&&x.spot>=.92&&x.spot<=1.065&&x.haze>=.84&&x.haze<=1&&x.goboMix<=.35);
 const old=fx({gobo:(i%37)/200,pixelWall:(i%29)/200,projection:(i%11)/200});
 const y=compose(old,x);assert(y.gobo+y.pixelWall+y.projection<=old.gobo+old.pixelWall+old.projection+.00002);
 samples++;
}
test('12,000 diverse full-track lighting and gobo states stay safe',()=>assert.equal(samples,12000));
console.log(`PASS V636: ${groups} regression groups, ${samples} simulated verified lighting states`);

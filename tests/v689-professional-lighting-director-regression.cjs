'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planProfessionalLightingDirectorV689:plan,composeProfessionalStageFxV689:compose,
  NEUTRAL_LIGHTING_V689:neutral}=load('components/visualizer/professionalLightingDirectorV689');
let groups=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V689 ${name}: ${e.message}`;throw e;}};
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,i)=>({index:i,section,startMs:1000+i*24000,endMs:25000+i*24000,
  chapter:section==='drop'||section==='hook'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
  motif:section==='hook'?'ensemble':section==='break'?'breath':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?[0,0,0,0,1,0,0,2][i]:0}));
const song={trackId:'track-689',durationMs:200000,source:'verified-v600',genre:'hardtekk',endingSupported:false,acts};
const cue=(i=0)=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,
  repetition:acts[i].repetition,transition:1});
const base=(i=0,change={})=>({narrative:{plan:song,cue:cue(i)},trackId:'track-689',
  positionMs:acts[i].startMs+9000,durationMs:song.durationMs,section:acts[i].section,
  genre:'hardtekk',playing:true,reactive:true,reducedMotion:false,tier:'high',enabled:true,
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,energy:.85,kick:.75,groupCount:2,...change});
const P=(i=0,c={})=>plan(base(i,c));
const off=(i=2,c={})=>assert.deepEqual(P(i,c),neutral);
const fx=(c={})=>({mode:'hook',gobo:.11,pixelWall:.15,projection:.06,floorFog:.08,
  spotlight:.12,sweep:.8,speed:.75,ledShape:1,projectedWord:'Test',evidence:'stage-cue',...c});
const fields=['act','beam','spot','haze','sweep','aimOffset','gobo','wall','floorFog','goboVariant','goboMix','ledMotif','ledMix','beatPulse'];
const finite=(p)=>fields.forEach(k=>assert(Number.isFinite(p[k]),k));
const total=(p)=>p.gobo+p.pixelWall+p.projection;
test('verse portrait look',()=>assert.equal(P(0).look,'portrait'));
test('build rising look',()=>assert.equal(P(1).look,'rise'));
test('hook ensemble look',()=>assert.equal(P(2).look,'ensemble'));
test('break respite look',()=>assert.equal(P(5).look,'respite'));
test('verified impact look',()=>assert.equal(P(6).look,'impact'));
test('no kick cannot invent impact',()=>assert.notEqual(P(6,{kick:.01}).look,'impact'));
test('no energy cannot invent impact',()=>assert.notEqual(P(6,{energy:.01}).look,'impact'));
test('repeat hooks vary LED layouts',()=>{assert.notEqual(P(2).ledMotif,P(4).ledMotif);assert.notEqual(P(4).ledMotif,P(7).ledMotif);});
test('repeat hooks vary gobo layouts',()=>{assert.notEqual(P(2).goboVariant,P(4).goboVariant);assert.notEqual(P(4).goboVariant,P(7).goboVariant);});
test('verse leaves lyric foreground calmer',()=>{const p=P(0);assert(p.wall<1&&p.gobo<1&&p.haze<1&&p.sweep<1);});
test('break is more restrained than hooks',()=>{const b=P(5),h=P(2);assert(b.beam<h.beam&&b.wall<h.wall&&b.sweep<h.sweep);});
test('build gradually raises light intensity',()=>{const a=P(1,{positionMs:acts[1].startMs+2000}),b=P(1,{positionMs:acts[1].startMs+10000});assert(b.wall>a.wall&&b.beam>a.beam);});
test('higher verified kick changes impact without flashes',()=>{const a=P(6,{kick:.3}),b=P(6,{kick:.95});assert(b.beam>a.beam&&b.beatPulse>a.beatPulse);});
test('false drop has no rhythmic pulse',()=>assert.equal(P(6,{kick:.01}).beatPulse,0));
test('verse and break have no pulse',()=>{for(const i of [0,3,5])assert.equal(P(i).beatPulse,0);});
test('lyrics protection suppresses sweep aiming',()=>{const p=P(2,{lyricsProtected:true});assert.equal(p.aimOffset,0);assert(p.wall<=1&&p.haze<1);});
test('vocal portraits are never moved by the director',()=>assert.equal(P(2,{vocalFocus:true}).aimOffset,0));
test('genre affects only safe movement not timestamps',()=>{const rap=P(2,{genre:'deutschrap'}),hard=P(2,{genre:'hardtekk'});assert.equal(rap.act,hard.act);assert.notEqual(rap.aimOffset,hard.aimOffset);});
test('balanced tier reduces the theatrical attenuation',()=>{const a=P(5),b=P(5,{tier:'balanced'});assert(b.beam>a.beam);});
test('no playing neutral',()=>off(2,{playing:false}));
test('no reactive neutral',()=>off(2,{reactive:false}));
test('disabled decorations neutral',()=>off(2,{enabled:false}));
test('manual lighting neutral',()=>off(2,{authored:true}));
test('reduced motion neutral',()=>off(2,{reducedMotion:true}));
test('low tier neutral',()=>off(2,{tier:'low'}));
test('blackout neutral',()=>off(2,{blackout:true}));
test('unknown plan neutral',()=>off(2,{narrative:null}));
test('wrong track neutral',()=>off(2,{trackId:'somebody-else'}));
test('wrong duration neutral',()=>off(2,{durationMs:100000}));
test('wrong cue evidence neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),source:'unverified'}}}));
test('wrong plan evidence neutral',()=>off(2,{narrative:{plan:{...song,source:'off'},cue:cue(2)}}));
test('inactive act neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),active:false}}}));
test('incorrect act neutral',()=>off(2,{narrative:{plan:song,cue:cue(1)}}));
test('incorrect section neutral',()=>off(2,{section:'verse'}));
test('incorrect chapter neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),chapter:'develop'}}}));
test('incorrect repetition neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),repetition:9}}}));
test('invalid transition neutral',()=>{for(const transition of [-1,0,1.1,NaN,Infinity])off(2,{narrative:{plan:song,cue:{...cue(2),transition}}});});
test('invalid group sizes neutral',()=>{for(const groupCount of [-1,0,5,NaN,Infinity,2.7])off(2,{groupCount});});
test('invalid kick neutral',()=>{for(const kick of [-1,1.1,NaN,Infinity])off(6,{kick});});
test('invalid energy neutral',()=>{for(const energy of [-1,1.1,NaN,Infinity])off(6,{energy});});
test('invalid times neutral',()=>{for(const positionMs of [-1,NaN,Infinity,300000])off(2,{positionMs});});
test('act start has smooth neutral transition',()=>{for(let i=0;i<8;i++){const p=P(i,{positionMs:acts[i].startMs});assert(p.active&&p.wall===1&&p.beatPulse===0&&p.goboMix===0);}});
test('act end eases toward neutral',()=>{for(let i=0;i<8;i++){const p=P(i,{positionMs:acts[i].endMs-.0001});assert(Math.abs(p.beam-1)<.00001);}});
test('seek is deterministic',()=>{const a=P(4);[0,7,3,2,6,1,5].forEach(i=>P(i));assert.deepEqual(P(4),a);});
test('planner does not mutate input',()=>{const x=base(4),json=JSON.stringify(x);plan(x);assert.equal(JSON.stringify(x),json);});
test('all gains are nonamplifying and finite',()=>{for(let i=0;i<8;i++){const p=P(i);finite(p);for(const k of ['beam','spot','haze','sweep','gobo','wall','floorFog'])assert(p[k]>=0&&p[k]<=1,k);}});
test('gobo crossfade is bounded',()=>{for(let i=0;i<8;i++)assert(P(i).goboMix<=.35);});
test('LED crossfade is bounded',()=>{for(let i=0;i<8;i++)assert(P(i).ledMix<=.36);});
test('beat pulse never flashes LED completely',()=>{for(let i=0;i<8;i++)assert(P(i).beatPulse<=.15);});
test('two moving-head aim offsets are small',()=>{for(let i=0;i<8;i++)assert(Math.abs(P(i).aimOffset)<=.05);});
test('composer preserves zero-effect budgets',()=>{const x=fx({gobo:0,pixelWall:0,spotlight:0,floorFog:0,sweep:0});const y=compose(x,P(2));for(const k of ['gobo','pixelWall','spotlight','floorFog','sweep'])assert.equal(y[k],0);});
test('composer never increases an active budget',()=>{for(let i=0;i<8;i++){const x=fx(),y=compose(x,P(i));for(const k of ['gobo','pixelWall','spotlight','floorFog','sweep'])assert(y[k]<=x[k]+.000001,k);}});
test('composer preserves shared budget',()=>{for(let i=0;i<8;i++)assert(total(compose(fx(),P(i)))<=total(fx())+.000002);});
test('composer keeps the original lyrics projection',()=>{for(let i=0;i<8;i++){const x=fx(),y=compose(x,P(i));for(const k of ['projection','projectedWord','ledShape','speed','evidence','mode'])assert.deepEqual(y[k],x[k]);}});
test('neutral, off and ambient retain object identity',()=>{for(const x of [fx(),fx({mode:'off'}),fx({mode:'ambient'})])assert.strictEqual(compose(x,neutral),x);for(const mode of ['off','ambient']){const x=fx({mode});assert.strictEqual(compose(x,P(2)),x);}});
test('composer preserves source object',()=>{const x=fx(),old=JSON.stringify(x);compose(x,P(2));assert.equal(JSON.stringify(x),old);});
test('V308 physically drives existing paired light shafts and spots',()=>{const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');for(const k of ['planProfessionalLightingDirectorV689(professionalInputV689)','*coordinatedLightV689.beam','*coordinatedLightV689.haze','*coordinatedLightV689.sweep','*coordinatedLightV689.spot','coordinatedLightV689.aimOffset'])assert(s.includes(k),k);});
test('V555 integrates coordination after V636 and before V640',()=>{const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');for(const k of ['planProfessionalLightingDirectorV689(professionalInputV689)','composeProfessionalStageFxV689(balance,coordinatedLightV689)','coordinatedBalanceV689.gobo*decorationV640.gobo','coordinatedBalanceV689.pixelWall*decorationV640.led','coordinatedBalanceV689.floorFog*decorationV640.haze'])assert(s.includes(k),k);});
test('V555 wall shader has all new uniform initializers',()=>{const s=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');for(const k of ['uLedMotif:{value:0}','uLedMix:{value:0}','uBeatPulse:{value:0}','uniforms={wallUniforms}','uLedMotif,uLedMix,uBeatPulse','float ledColumns=','float ledDiagonals='])assert(s.includes(k),k);});
test('no new shaders or lights or extra frames',()=>{const s=fs.readFileSync('components/visualizer/professionalLightingDirectorV689.ts','utf8');for(const k of ['Math.random(', 'Date.now(', 'performance.now(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'useFrame(', 'new SpotLight(', 'new Mesh(', 'fetch(', 'navigator.', 'new ShaderMaterial('])assert(!s.includes(k),k);});
let simulated=0;
for(let i=0;i<15000;i++){
 const index=i%8,range=acts[index],positionMs=range.startMs+(i*347)%24000;
 const p=P(index,{positionMs,genre:i%2?'hardtekk':'deutschrap',energy:(i%100)/100,kick:(i%67)/66,
   lyricsProtected:i%11===0,vocalFocus:i%7===0,tier:i%2?'high':'balanced',groupCount:i%4+1});
 finite(p);
 const old=fx({gobo:(i%37)/200,pixelWall:(i%29)/200,projection:(i%11)/200,floorFog:(i%17)/250});
 const y=compose(old,p);
 assert(total(y)<=total(old)+.000003);
 for(const k of ['gobo','pixelWall','floorFog','spotlight','sweep'])assert(y[k]<=old[k]+.000003,k);
 if(p.active)for(const k of ['beam','spot','haze','sweep','gobo','wall','floorFog'])assert(p[k]>=0&&p[k]<=1);
 simulated++;
}
test('15,000 deterministic timestamps respect light limits',()=>assert.equal(simulated,15000));
console.log(`PASS V689: ${groups} test groups, ${simulated} simulated verified lighting samples`);

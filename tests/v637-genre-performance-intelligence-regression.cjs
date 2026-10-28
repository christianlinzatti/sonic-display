'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planGenrePerformanceV637:plan,composeGenrePerformanceV637:compose,NEUTRAL_GENRE_INTELLIGENCE_V637:NEUTRAL}=load('components/visualizer/genrePerformanceIntelligenceV637');
const {planGenreConcertV610:concert,resolveConcertGenreV610:resolve}=load('components/visualizer/genreConcertExperienceV610');
let tests=0,samples=0;
const test=(description,fn)=>{try{fn();tests++;}catch(e){e.message=`V637 ${description}: ${e.message}`;throw e;}};
const genres=['deutschrap','hardstyle','hardtekk','rock','pop'];
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,i)=>({index:i,section,startMs:i*24000,endMs:(i+1)*24000,
  chapter:section==='drop'||section==='hook'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
  motif:section==='hook'?'ensemble':section==='break'?'breath':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?({2:0,4:1,7:2})[i]:section==='verse'&&i===3?1:0}));
const song=(genre='deutschrap')=>({trackId:'v637-demo',durationMs:192000,genre,source:'verified-v600',endingSupported:false,acts});
const cue=(idx=0,transition=1)=>({active:true,act:idx,source:'verified-v600',chapter:acts[idx].chapter,
   motif:acts[idx].motif,repetition:acts[idx].repetition,transition});
const input=(idx=0,genre='deutschrap',opts={})=>({trackId:'v637-demo',durationMs:192000,
  positionMs:acts[idx].startMs+12000,section:acts[idx].section,genre,
  narrative:{plan:song(genre),cue:cue(idx)},
  energy:.84,kick:.75,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
  manualDance:false,manualCamera:false,manualLighting:false,...opts});
const run=(idx=0,genre='deutschrap',opts={})=>plan(input(idx,genre,opts),genre);
const result=(idx=0,genre='deutschrap',opts={})=>concert(input(idx,genre,opts));
const gains=['dance','cameraDrift','cameraRate','key','fill','beam','spot','haze','sweep'];
const no=(idx=2,genre='deutschrap',opts={})=>assert.deepEqual(run(idx,genre,opts),NEUTRAL);
const all=(fn)=>genres.forEach(fn);
test('all 5 distinct genres have a verified shared lane',()=>all(g=>{const x=run(2,g);assert(x.active);assert.equal(x.genre,g);}));
test('confirmed genre also composes into V610 real output',()=>all(g=>{const x=result(2,g);assert(x.active&&x.genre===g);}));
test('Deutschrap verse has portrait intent',()=>assert.equal(run(0).intent,'rap-portrait'));
test('second Deutschrap verse has dialog-friendly framing',()=>assert.equal(run(3).intent,'rap-dialogue'));
test('Deutschrap verse strongly reduces background sweep',()=>{const x=run(0);assert(x.sweep<1&&x.beam<1&&x.cameraFov<0);});
test('Deutschrap portrait gives small face illumination',()=>{const x=run(0);assert(x.key>1&&x.fill>1&&x.spot>1)});
test('first Deutschrap hook is ensemble, second portrait, third ensemble',()=>{assert.equal(run(2).intent,'rap-ensemble');assert.equal(run(4).intent,'rap-portrait');assert.equal(run(7).intent,'rap-ensemble');});
test('Deutschrap second hook focuses more closely than first',()=>assert(run(2).cameraFov>run(4).cameraFov));
test('Deutschrap hook alternates beams vs spotlights',()=>assert(run(2).beam>run(4).beam&&run(2).spot<run(4).spot));
test('Hardstyle drop is a supported festival impact',()=>assert.equal(run(6,'hardstyle').intent,'festival-drop'));
test('Hardtekk drop has dance accent above Hardstyle',()=>assert(run(6,'hardtekk').dance>run(6,'hardstyle').dance));
test('Hardtekk drop has stronger sweep than Hardstyle',()=>assert(run(6,'hardtekk').sweep>run(6,'hardstyle').sweep));
test('Hardstyle drop emphasizes beams more than Hardtekk',()=>assert(run(6,'hardstyle').beam>run(6,'hardtekk').beam));
test('Hardstyle build has appropriate rise intent',()=>assert.equal(run(1,'hardstyle').intent,'festival-rise'));
test('Hardtekk build reacts to confirmed elapsed time',()=>{const early=run(1,'hardtekk',{positionMs:acts[1].startMs+2000});const late=run(1,'hardtekk',{positionMs:acts[1].startMs+17000});assert(late.dance>early.dance&&late.sweep>early.sweep)});
test('Hardstyle repeated hooks alternate composition',()=>{assert(run(2,'hardstyle').cameraFov>run(4,'hardstyle').cameraFov);});
test('Hardtekk repeated hooks alternate composition',()=>{assert(run(2,'hardtekk').beam>run(4,'hardtekk').beam);});
test('Hardstyle verse is not a drop',()=>{const x=run(0,'hardstyle');assert(x.sweep<1&&x.beam<1)});
test('Rock verse stays grounded, without invented band instrument',()=>{const x=run(0,'rock');assert.equal(x.intent,'rock-grounded');assert(x.cameraFov>0)});
test('Rock hook becomes ensemble-wide',()=>{const x=run(2,'rock');assert.equal(x.intent,'rock-ensemble');assert(x.beam>1&&x.cameraFov>0)});
test('Rock hook alternates wide vs closer spotlight',()=>assert(run(2,'rock').cameraFov>run(4,'rock').cameraFov&&run(2,'rock').spot<run(4,'rock').spot));
test('Rock build grows in measured act duration',()=>{const a=run(1,'rock',{positionMs:26000}),b=run(1,'rock',{positionMs:40000});assert(b.beam>a.beam&&b.dance>a.dance)});
test('Pop verse preserves singer portrait',()=>{const x=run(0,'pop');assert.equal(x.intent,'pop-portrait');assert(x.cameraFov<0&&x.fill>1);});
test('Pop hooks alternate ensemble/portrait',()=>{assert.equal(run(2,'pop').intent,'pop-ensemble');assert.equal(run(4,'pop').intent,'pop-portrait');});
test('Pop chorus uses more face lighting than rock',()=>assert(run(2,'pop').fill>run(2,'rock').fill));
test('Pop verse is steadier than rock',()=>assert(run(0,'pop').cameraDrift<run(0,'rock').cameraDrift));
test('Each genre calms down on the actual break',()=>all(g=>{const a=run(5,g);assert(a.intent==='respite'&&a.dance<1&&a.sweep<1)}));
test('Unconfirmed drop never raises gains for any genre',()=>all(g=>{const x=run(6,g,{kick:.05});for(const k of gains)assert.equal(x[k],1,k+':'+g);assert.equal(x.cameraFov,0);}));
test('Unconfirmed energy never raises gains for any genre',()=>all(g=>{const x=run(6,g,{energy:.04});for(const k of gains)assert.equal(x[k],1,k+':'+g);assert.equal(x.cameraFov,0);}));
test('Unsupported drop does not energize V610 composition either',()=>all(g=>{const x=result(6,g,{kick:.05});for(const k of gains)assert.equal(x[k],1,k+':'+g);assert.equal(x.cameraFov,0);}));
test('Paused playback makes full overlay neutral',()=>all(g=>no(2,g,{playing:false})));
test('Reduced motion makes full overlay neutral',()=>all(g=>no(2,g,{reducedMotion:true})));
test('Low tier makes full overlay neutral',()=>all(g=>no(2,g,{tier:'low'})));
test('Missing narrative is neutral',()=>all(g=>no(2,g,{narrative:null})));
test('Mismatched track or duration is neutral',()=>all(g=>{no(2,g,{trackId:'wrong'});no(2,g,{durationMs:193000});}));
test('Unverified source is neutral',()=>all(g=>{no(2,g,{narrative:{plan:{...song(g),source:'guess'},cue:cue(2)}});no(2,g,{narrative:{plan:song(g),cue:{...cue(2),source:'guess'}}});}));
test('Invalid cue identity is neutral',()=>{for(const patch of [{chapter:'false'},{motif:'false'},{repetition:99},{act:17},{active:false}])no(2,'rock',{narrative:{plan:song('rock'),cue:{...cue(2),...patch}}});});
test('Act section mismatch is neutral',()=>no(2,'pop',{section:'verse'}));
test('Act time must contain playback position',()=>no(2,'rock',{positionMs:acts[1].startMs+1000}));
test('Invalid playback positions are rejected',()=>{for(const x of [-1,NaN,Infinity,192000])no(2,'rock',{positionMs:x})});
test('Invalid energy and kick are rejected',()=>{for(const x of [-1,NaN,Infinity,1.1]){no(2,'hardstyle',{kick:x});no(2,'pop',{energy:x});}});
test('Invalid transition is rejected',()=>{for(const x of [-1,NaN,Infinity,1.5])no(2,'rock',{narrative:{plan:song('rock'),cue:cue(2,x)}})});
test('Transition zero means no auto cue',()=>{const x=run(2,'rock',{narrative:{plan:song('rock'),cue:cue(2,0)}});for(const k of gains)assert.equal(x[k],1);assert.equal(x.cameraFov,0)});
test('Section start and end have exact zero effect',()=>{all(g=>{for(const positionMs of [acts[2].startMs,acts[2].endMs-0.001]){const x=run(2,g,{positionMs});for(const k of gains)assert.equal(x[k],1);assert.equal(x.cameraFov,0)}})});
test('Manual dance lane remains exact neutral',()=>all(g=>assert.equal(run(2,g,{manualDance:true}).dance,1)));
test('Manual camera lanes remain exact neutral',()=>all(g=>{const x=run(2,g,{manualCamera:true});assert.equal(x.cameraFov,0);assert.equal(x.cameraDrift,1);assert.equal(x.cameraRate,1)}));
test('Manual light lanes remain exact neutral',()=>all(g=>{const x=run(2,g,{manualLighting:true});for(const k of ['beam','spot','haze','sweep','key','fill'])assert.equal(x[k],1)}));
test('All manual lanes remain exact neutral after V610 composition',()=>all(g=>{const x=result(2,g,{manualDance:true,manualCamera:true,manualLighting:true});for(const k of gains)assert.equal(x[k],1,k+g);assert.equal(x.cameraFov,0)}));
test('Lyrics protection reduces camera and decoration consistently',()=>all(g=>{const a=run(2,g),b=run(2,g,{lyricsProtected:true});for(const k of ['dance','beam','spot','sweep'])assert(Math.abs(b[k]-1)<=Math.abs(a[k]-1)+.00001,k+g);assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov));}));
test('Balanced mode produces less accent',()=>all(g=>{const a=run(2,g),b=run(2,g,{tier:'balanced'});assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov));}));
test('Composition rejects inactive baseline',()=>{const base=result(2,'rock'),x=compose({...base,active:false},run(2,'rock'));assert.equal(x.active,false);});
test('Composition rejects incompatible genre or section',()=>{const base=result(2,'rock');assert.strictEqual(compose(base,run(2,'pop')),base);assert.strictEqual(compose(base,run(0,'rock')),base);});
test('Composition rejects inactive cue',()=>{const base=result(2,'rock');assert.strictEqual(compose(base,NEUTRAL),base);});
test('Every existing 4 renderer consumers uses updated V610',()=>{for(const f of ['VisualizerStage.tsx','StageCameraDirectorV289.tsx','DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx']){assert(fs.readFileSync('components/visualizer/'+f,'utf8').includes('planGenreConcertV610('),f)}const src=fs.readFileSync('components/visualizer/genreConcertExperienceV610.ts','utf8');assert(src.includes('composeGenrePerformanceV637(')&&src.includes('planGenrePerformanceV637(input,genre)'));});
test('No new renderer, clock, random, network or procedural data',()=>{const s=fs.readFileSync('components/visualizer/genrePerformanceIntelligenceV637.ts','utf8');for(const t of ['useFrame(', 'requestAnimationFrame(', 'new SpotLight(', 'new ShaderMaterial(', 'Date.now(', 'Math.random(', 'setInterval(', 'fetch(', 'new Audio(', 'setTimeout('])assert(!s.includes(t),t);});
test('Does not mutate inputs and is deterministic under seeking',()=>{const i=input(4,'rock'),before=JSON.stringify(i),a=result(4,'rock');result(2,'pop');result(6,'hardtekk');assert.deepEqual(result(4,'rock'),a);assert.equal(JSON.stringify(i),before);assert.deepEqual(plan(i,'rock'),plan(i,'rock'));});
test('Bounded real-time compositions across a full song and all genres',()=>{
 for(const g of genres)for(let i=0;i<8;i++)for(let p=acts[i].startMs;p<acts[i].endMs;p+=73){
   const opts={positionMs:p,energy:(samples%100)/99,kick:(samples%51)/50,lyricsProtected:samples%9===0,tier:samples%3===0?'balanced':'high'};
   const x=result(i,g,opts);
   assert(x.active,`${g}:${i}`);
   for(const k of gains)assert(Number.isFinite(x[k])&&x[k]>=.84&&x[k]<=1.14,`${g}:${i}:${p}:${k}:${x[k]}`);
   assert(Number.isFinite(x.cameraFov)&&x.cameraFov>=-.4&&x.cameraFov<=.8);
   samples++;
 }
 assert(samples>12000);
});
console.log(`PASS V637 Genre Performance Intelligence: ${tests} groups, ${samples} verified full-song states`);

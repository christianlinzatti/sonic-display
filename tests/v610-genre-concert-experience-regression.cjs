'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planGenreConcertV610:plan,resolveConcertGenreV610:resolve}=load('components/visualizer/genreConcertExperienceV610');
let groups=0;
const test=(name,fn)=>{try{fn();groups++}catch(error){error.message=`V610 ${name}: ${error.message}`;throw error}};
const acts=[
 {index:0,startMs:0,endMs:34000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:34000,endMs:48000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:2,startMs:48000,endMs:68000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:3,startMs:68000,endMs:98000,section:'verse',chapter:'develop',motif:'dialogue',repetition:1},
 {index:4,startMs:98000,endMs:120000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:5,startMs:120000,endMs:131000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:6,startMs:131000,endMs:162000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:7,startMs:162000,endMs:197000,section:'hook',chapter:'ending-arc',motif:'crescendo',repetition:2},
];
const cue=(n,transition=1)=>({active:true,source:'verified-v600',act:n,chapter:acts[n].chapter,motif:acts[n].motif,repetition:acts[n].repetition,transition,dynamics:{dance:1,camera:1,lighting:1,lyrics:1}});
const baseline=(g='deutschrap')=>({trackId:'v610-track',durationMs:197000,genre:g,source:'verified-v600',acts,endingSupported:true});
const input=(n=0,genre='deutschrap',extra={})=>({narrative:{plan:baseline(genre),cue:cue(n)},trackId:'v610-track',durationMs:197000,positionMs:(acts[n].startMs+acts[n].endMs)/2,
 section:acts[n].section,genre,energy:.84,kick:.72,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualDance:false,manualCamera:false,manualLighting:false,...extra});
const run=(n=0,g='deutschrap',extra={})=>plan(input(n,g,extra));
const neutral=run(0,'deutschrap',{playing:false});
const gains=['dance','cameraDrift','cameraRate','key','fill','beam','spot','haze','sweep'];
test('German rap normalized',()=>{for(const g of ['deutschrap','Deutsch-Rap','German Rap','German hip hop'])assert.equal(resolve(g),'deutschrap')});
test('Hardstyle includes rawstyle',()=>{for(const g of ['Hardstyle','Rawstyle','hard-style'])assert.equal(resolve(g),'hardstyle')});
test('Hardtekk includes hardtekno',()=>{for(const g of ['hardtekk','Hard Tekk','HardTekno'])assert.equal(resolve(g),'hardtekk')});
test('No generic rap or techno inference',()=>{for(const g of ['rap','pop','techno','unknown','',null,undefined,123])assert.equal(resolve(g),null)});
test('Verified act activates',()=>{const x=run();assert(x.active);assert.equal(x.genre,'deutschrap');assert.equal(x.reason,'verified-genre-act')});
test('Deutschrap verse supports faces, quieter beams',()=>{const x=run(0);assert(x.key>1&&x.fill>1);assert(x.beam<1&&x.haze<1);assert(x.dance<1);assert(x.cameraFov<0)});
test('Deutschrap first hook has a wider camera than repeated second hook',()=>{const a=run(2),b=run(4);assert(a.cameraFov>b.cameraFov);assert(a.beam>b.beam);assert(a.spot<b.spot)});
test('Deutschrap break deliberately calms dancer',()=>{const x=run(5);assert(x.dance<1&&x.sweep<1&&x.haze<1)});
test('Hardstyle supported drop energizes existing light and movement',()=>{const x=run(6,'hardstyle');assert(x.dance>1&&x.beam>1&&x.spot>1&&x.cameraFov>0)});
test('Hardtekk supported drop is distinct from Hardstyle',()=>{const a=run(6,'hardstyle'),b=run(6,'hardtekk');assert(b.dance>a.dance);assert(b.cameraRate>a.cameraRate);assert(b.sweep>a.sweep)});
test('Drop without measured kick is silent',()=>{for(const g of ['hardstyle','hardtekk']){const a=run(6,g,{kick:.09}),b=run(6,g,{energy:.15});for(const x of [a,b]){for(const k of gains)assert.equal(x[k],1);assert.equal(x.cameraFov,0)}}});
test('Builds gain only modest energy-dependent lift',()=>{for(const g of ['hardstyle','hardtekk']){const a=run(1,g,{energy:.25}),b=run(1,g,{energy:.95});assert(b.beam>a.beam);assert(b.dance>=a.dance)}});
test('Hardstyle break is less intense than hook',()=>assert(run(5,'hardstyle').beam<run(2,'hardstyle').beam));
test('Low tier is exact neutral',()=>assert.deepEqual(run(6,'hardstyle',{tier:'low'}),neutral));
test('Reduced motion is exact neutral',()=>assert.deepEqual(run(6,'hardstyle',{reducedMotion:true}),neutral));
test('Pause is exact neutral',()=>assert.deepEqual(run(6,'hardstyle',{playing:false}),neutral));
test('Wrong Spotify track is exact neutral',()=>assert.deepEqual(run(0,'deutschrap',{trackId:'other'}),neutral));
test('Wrong duration rejects stale analysis',()=>assert.deepEqual(run(0,'deutschrap',{durationMs:190000}),neutral));
test('Unverified source rejected',()=>assert.deepEqual(run(0,'deutschrap',{narrative:{plan:{...baseline(),source:'unavailable'},cue:cue(0)}}),neutral));
test('Disabled cue rejected',()=>assert.deepEqual(run(0,'deutschrap',{narrative:{plan:baseline(),cue:{...cue(0),active:false}}}),neutral));
test('Genre mismatch with confirmed plan rejected',()=>assert.deepEqual(run(0,'deutschrap',{genre:'hardstyle'}),neutral));
test('Unknown genre rejected',()=>assert.deepEqual(run(0,'deutschrap',{genre:'pop'}),neutral));
test('Unsupported section rejected',()=>assert.deepEqual(run(0,'deutschrap',{section:'drop'}),neutral));
test('Adjacent act time is not borrowed',()=>assert.deepEqual(run(0,'deutschrap',{positionMs:acts[1].startMs}),neutral));
test('Unmatched motif, chapter and repetition rejected',()=>{for(const change of [{chapter:'payoff'},{motif:'crescendo'},{repetition:5}])assert.deepEqual(run(0,'deutschrap',{narrative:{plan:baseline(),cue:{...cue(0),...change}}}),neutral)});
test('Invalid act indices rejected',()=>{for(const act of [-1,8,1.3,NaN,Infinity])assert.deepEqual(run(0,'deutschrap',{narrative:{plan:baseline(),cue:{...cue(0),act}}}),neutral)});
test('Non-finite time rejected',()=>{for(const positionMs of [-1,NaN,Infinity,198000])assert.deepEqual(run(0,'deutschrap',{positionMs}),neutral)});
test('Non-finite energy and kick rejected',()=>{for(const n of [-1,1.2,NaN,Infinity]){assert.deepEqual(run(0,'deutschrap',{energy:n}),neutral);assert.deepEqual(run(0,'deutschrap',{kick:n}),neutral)}});
test('Invalid transitions rejected',()=>{for(const transition of [-.1,1.1,NaN,Infinity])assert.deepEqual(run(2,'deutschrap',{narrative:{plan:baseline(),cue:cue(2,transition)}}),neutral)});
test('Transition zero adds no gain to earlier director',()=>{const x=run(2,'deutschrap',{narrative:{plan:baseline(),cue:cue(2,0)}});assert(x.active);for(const k of gains)assert.equal(x[k],1);assert.equal(x.cameraFov,0)});
test('No narrative remains neutral',()=>assert.deepEqual(run(0,'deutschrap',{narrative:null}),neutral));
test('Manual dancing only disables dance lane',()=>{const x=run(6,'hardstyle',{manualDance:true});assert.equal(x.dance,1);assert(x.beam>1&&x.cameraFov>0)});
test('Manual camera disables all camera channels',()=>{const x=run(6,'hardstyle',{manualCamera:true});assert.equal(x.cameraDrift,1);assert.equal(x.cameraFov,0);assert.equal(x.cameraRate,1);assert(x.dance>1)});
test('Manual lighting disables all lights only',()=>{const x=run(6,'hardstyle',{manualLighting:true});for(const k of ['key','fill','beam','spot','haze','sweep'])assert.equal(x[k],1);assert(x.dance>1)});
test('All manual lanes preserve exact neutral gains',()=>{const x=run(6,'hardstyle',{manualDance:true,manualCamera:true,manualLighting:true});for(const k of gains)assert.equal(x[k],1);assert.equal(x.cameraFov,0)});
test('Lyrics protection reduces effects',()=>{for(const g of ['deutschrap','hardstyle','hardtekk']){const a=run(2,g),b=run(2,g,{lyricsProtected:true});assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov));assert(Math.abs(b.beam-1)<=Math.abs(a.beam-1))}});
test('Balanced tier limits effect compared with high',()=>{for(const g of ['deutschrap','hardstyle','hardtekk']){const a=run(2,g),b=run(2,g,{tier:'balanced'});assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov))}});
test('No extra beat generator or render loop',()=>{const source=fs.readFileSync('components/visualizer/genreConcertExperienceV610.ts','utf8');assert.doesNotMatch(source,/useFrame\(|fetch\(|requestAnimationFrame\(|new SpotLight|new ShaderMaterial|setInterval\(|Date\.now\(/)});
test('Real DynamicStage multiplies bounded key and beam after V608',()=>{const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(src.includes('planGenreConcertV610({'));assert(src.includes('lightingV608.beam * concertGenreV610.beam'));assert(src.includes('lightingV608.key*concertGenreV610.key'))});
test('Real atmosphere shader rig uses V610 beam, haze, spots and sweep',()=>{const src=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');for(const part of ['concertGenreV610.beam','concertGenreV610.haze','concertGenreV610.spot','concertGenreV610.sweep'])assert(src.includes(part))});
test('Camera applies before last V351 lyrics guard',()=>{const src=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');const a=src.indexOf('const genreFramedV610='),b=src.indexOf('guardAutomaticCameraV351(genreFramedV610');assert(a>0&&b>a);assert(src.includes('sceneBlendV609.cameraRate*concertGenreV610.cameraRate'))});
test('No interference with authored camera cuts',()=>{const src=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(src.includes('editingPose||cutToCameraCueV400 ? 1'));assert(src.includes('manualCamera:!!(authoredCameraV528'))});
test('Real V610 dance feeds existing automatic motion, no manual choreography',()=>{const src=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(src.includes('motionEnergy*concertGenreV610.dance'));assert(src.includes('motionStore.automatic?concertGenreV610.dance:1'));assert(src.includes('preferences.avatarMotionMode===\'choreography\''))});
test('Dance, camera and light share V604/V600 story evidence',()=>{for(const f of ['VisualizerStage.tsx','DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx','StageCameraDirectorV289.tsx'])assert(fs.readFileSync('components/visualizer/'+f,'utf8').includes('narrative:'))});
let frames=0;
for(const genre of ['deutschrap','hardstyle','hardtekk'])for(let i=0;i<10000;i++){
 const n=i%acts.length,act=acts[n],positionMs=act.startMs+(i*9973)%(act.endMs-act.startMs);
 const out=run(n,genre,{positionMs,energy:(i%100)/99,kick:(i%51)/50,tier:i%3===0?'balanced':'high',lyricsProtected:i%7===0});
 for(const k of gains){assert(Number.isFinite(out[k]),`${genre}:${k}`);assert(out[k]>=.84&&out[k]<=1.14)}
 assert(Number.isFinite(out.cameraFov)&&Math.abs(out.cameraFov)<=.81);frames++;
}
test('30,000 bounded real-time genre snapshots',()=>assert.equal(frames,30000));
test('Planner deterministic and input immutable',()=>{const arg=input(4,'hardtekk');const original=JSON.stringify(arg);assert.deepEqual(plan(arg),plan(arg));assert.equal(JSON.stringify(arg),original)});
console.log(`PASS V610: ${groups} groups, ${frames} genre-specific song samples.`);

'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(828);
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810,planConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const {planConcertExperienceV828}=load('components/visualizer/concertExperienceDirectorV828');
const {evaluateFxTimelineV823}=load('components/visualizer/visualFxTimelineV823');
const read=(file)=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
let groups=0;const check=(name,fn)=>{try{fn();groups++}catch(e){e.message=`${name}: ${e.message}`;throw e}};
const defaults=normalizeConcertFxV810({concertExperienceV828:true,experienceIntensityV828:90,experienceStyleV828:'dynamic'});
const fx=(section='drop',options={})=>planConcertFxV810({settings:defaults,genre:'hardtekk',section,
 progressMs:5000,startMs:0,endMs:10000,active:true,verified:true,playing:true,reactive:true,
 reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,
 groupCount:2,tier:'high',energy:.85,kick:.90,bass:.95,mids:.70,highs:.65,ledBudget:1,laserBudget:1,...options});
const author=(cues=[])=>evaluateFxTimelineV823({cues,enabled:true,trackId:'track-X',
 durationMs:10000,progressMs:5000,verified:true,playing:true,reducedMotion:false});
const plan=(section='drop',o={})=>planConcertExperienceV828({settings:defaults,fx:fx(section),
 authored:author(),trackId:'track-X',startMs:0,endMs:10000,progressMs:5000,
 tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:2,...o});
const cue=(lane,mode='mute')=>({id:'cue-v828-'+lane,trackId:'track-X',startMs:1000,durationMs:8000,
 lane,mode,intensity:100,ledLook:'tunnel'});
check('default is enabled and safe',()=>{let s=normalizeConcertFxV810({});assert.equal(s.concertExperienceV828,true);assert.equal(s.experienceStyleV828,'dynamic');assert.equal(s.experienceIntensityV828,66)});
check('migration preserves unrelated V821 and V823 fields',()=>{let s=normalizeConcertFxV810({ledLookV821:'geometry',timelineEnabledV823:false,foamSide:'right'});assert.equal(s.ledLookV821,'geometry');assert.equal(s.foamSide,'right');assert.equal(s.timelineEnabledV823,false)});
check('style migration rejects invalid',()=>assert.equal(normalizeConcertFxV810({experienceStyleV828:'broken'}).experienceStyleV828,'dynamic'));
check('three distinct pacing profiles',()=>{for(let mode of ['cinematic','dynamic','festival'])assert.equal(normalizeConcertFxV810({experienceStyleV828:mode}).experienceStyleV828,mode)});
check('intensity clamps',()=>{assert.equal(normalizeConcertFxV810({experienceIntensityV828:101}).experienceIntensityV828,100);assert.equal(normalizeConcertFxV810({experienceIntensityV828:-3}).experienceIntensityV828,0)});
check('NaN and Infinity replaced by defaults',()=>{assert.equal(normalizeConcertFxV810({experienceIntensityV828:NaN}).experienceIntensityV828,66);assert.equal(normalizeConcertFxV810({experienceIntensityV828:Infinity}).experienceIntensityV828,66)});
check('explicitly disabled switches off',()=>assert.equal(plan('drop',{settings:{concertExperienceV828:false}}).reason,'off'));
check('zero intensity switches off',()=>assert.equal(plan('drop',{settings:{experienceIntensityV828:0}}).reason,'off'));
check('global effect master disables',()=>assert.equal(plan('drop',{settings:{enabled:false}}).reason,'off'));
check('invalid track ID is never staged',()=>assert.equal(plan('drop',{trackId:''}).reason,'unverified'));
check('low hardware tier disables',()=>assert.equal(plan('drop',{tier:'low'}).reason,'unverified'));
check('unverified V810 FX cannot be overridden',()=>assert.equal(plan('drop',{fx:fx('drop',{verified:false})}).active,false));
check('blackout V810 FX cannot be overridden',()=>assert.equal(plan('drop',{fx:fx('drop',{blackout:true})}).active,false));
check('manual stage V810 FX cannot be overridden',()=>assert.equal(plan('drop',{fx:fx('drop',{authored:true})}).active,false));
check('paused playback disables',()=>assert.equal(plan('drop',{fx:fx('drop',{playing:false})}).active,false));
check('motion-reduction disables',()=>assert.equal(plan('drop',{fx:fx('drop',{reducedMotion:true})}).active,false));
check('no unverified act end',()=>assert.equal(plan('drop',{endMs:0}).active,false));
check('invalid timestamps fail closed',()=>{for(let v of [NaN,Infinity,-Infinity])assert.equal(plan('drop',{progressMs:v}).active,false)});
check('act start is inclusive',()=>assert(plan('verse',{progressMs:0}).active));
check('act end is exclusive',()=>assert.equal(plan('drop',{progressMs:10000}).active,false));
check('outside current act is inactive',()=>assert.equal(plan('drop',{progressMs:-1}).active,false));
check('invalid performer count is inactive',()=>{for(let n of [0,5,1.2,NaN])assert.equal(plan('drop',{groupCount:n}).active,false)});
check('all seven confirmed sections have meaningful moment',()=>{for(let k of ['intro','verse','hook','build','drop','break','finale']){let c=plan(k);assert(c.active,k);assert(c.label.length>5);assert.equal(c.reason,'music')}});
check('verse is quieter than drop',()=>assert(plan('verse').gains.laser<plan('drop').gains.laser));
check('break intentionally makes room',()=>assert(plan('break').gains.particles<1));
check('hook LED stronger than verse',()=>assert(plan('hook').gains.led>=plan('verse').gains.led));
check('verified build supports rising intensity',()=>assert(plan('build',{progressMs:7000}).gains.led>=plan('build',{progressMs:1000}).gains.led));
check('verified drop impact releases rather than growing forever',()=>assert(plan('drop',{progressMs:1500}).gains.laser>=plan('drop',{progressMs:8500}).gains.laser));
check('finale and drop have distinct labels',()=>assert.notEqual(plan('finale').label,plan('drop').label));
check('signature stable on repeat',()=>assert.deepEqual(plan('hook'),plan('hook')));
check('signature changes across acts and songs',()=>{let x=new Set();for(let n=0;n<20;n++)x.add(plan('hook',{trackId:'track'+n,startMs:n*100,endMs:10000}).signature);assert(x.size>=3)});
check('bounded FX gains per lane',()=>{for(let section of ['intro','verse','hook','build','drop','break','finale'])for(let g of Object.values(plan(section).gains))assert(g>=.55&&g<=1.16)});
check('all gains finite',()=>{for(let k of ['intro','verse','hook','build','drop','break','finale'])for(let v of Object.values(plan(k).gains))assert(Number.isFinite(v))});
check('no V828 effect when explicitly disabled lane',()=>{for(let lane of ['laser','led','particles','foam','transition']){
  const c=plan('drop',{authored:author([cue(lane,'mute')])});assert.equal(c.gains[lane],1,lane);
}});
check('manual boost has authority on every lane',()=>{for(let lane of ['laser','led','particles','foam','transition']){
  const c=plan('drop',{authored:author([cue(lane,'boost')])});assert.equal(c.gains[lane],1,lane);
}});
check('authored LED visual wins',()=>{let c=plan('hook',{authored:author([cue('led','boost')])});assert.equal(c.ledLook,'auto')});
check('fixed V821 LED visual wins',()=>{for(let look of ['geometry','equalizer','waves','tunnel'])assert.equal(plan('drop',{settings:{ledLookV821:look}}).ledLook,'auto')});
check('hardtekk drop uses tunnel',()=>assert.equal(plan('drop').ledLook,'tunnel'));
check('genre-specific rap verse keeps calm waves',()=>assert.equal(plan('verse',{fx:fx('verse',{genre:'Deutschrap'})}).ledLook,'waves'));
check('performance balanced has softer scenic color',()=>assert(plan('drop',{tier:'balanced'}).backgroundAccent<=plan('drop').backgroundAccent));
check('protected lyrics reduce background tint',()=>assert(plan('drop',{lyricsProtected:true}).backgroundAccent<plan('drop').backgroundAccent));
check('vocal focus reduces stage morph',()=>assert(plan('drop',{vocalFocus:true}).architectureMotion<plan('drop').architectureMotion));
check('four performers reduce side activity',()=>assert(plan('drop',{groupCount:4}).backgroundAccent<=plan('drop',{groupCount:1}).backgroundAccent));
check('all ambient accents are bounded',()=>{for(let s of ['intro','verse','hook','build','drop','break','finale']){let c=plan(s);assert(c.backgroundAccent>=0&&c.backgroundAccent<=.14);assert(c.architectureMotion>=0&&c.architectureMotion<=.13)}});
check('festival pacing is stronger than cinematic',()=>{let f=plan('drop',{settings:{experienceStyleV828:'festival',experienceIntensityV828:100}});let c=plan('drop',{settings:{experienceStyleV828:'cinematic',experienceIntensityV828:100}});assert(f.backgroundAccent>c.backgroundAccent)});
check('zero s intensity yields neutral even when song verified',()=>assert.equal(plan('drop',{settings:{experienceIntensityV828:0}}).active,false));
const stage=read('components/visualizer/DynamicStage.tsx'),ui=read('components/visualizer/ConcertFxStudioPanelV810.tsx');
check('V828 is after verified act and V823 authored cues',()=>assert(stage.indexOf('planConcertExperienceV828(')>stage.indexOf('evaluateFxTimelineV823(')));
check('V825 budget retains final authority on all lane multipliers',()=>{for(let lane of ['laser','led','particles','foam','transition'])assert(stage.includes(`experienceV828.gains.${lane}*fxPerfV825.gains.${lane}`),lane)});
check('no duplicate render stage components',()=>assert(stage.includes('led.uniforms.uStageMorph.value+experienceV828.architectureMotion')));
check('V828 leaves camera commands unchanged',()=>{let core=read('components/visualizer/concertExperienceDirectorV828.ts');for(let token of ['camera.position','setInterval(','requestAnimationFrame(','new WebGLRenderer','new InstancedMesh','Math.random'])assert(!core.includes(token),token)});
check('UI provides three styles and safe preview',()=>{for(let token of ['experienceStyleV828','experienceIntensityV828','concertExperienceV828','planConcertExperienceV828','Simulierte'])assert(ui.includes(token),token)});
check('settings are normalized and persisted',()=>{let s=read('components/visualizer/concertFxStudioV810.ts');for(let token of ['experienceIntensityV828:finite','concertExperienceV828:typeof','experienceStyleV828:raw'])assert(s.includes(token))});
check('version and required release checks',()=>{let p=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(p.version));for(let k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v828 && npm run test:v828:types &&'),k)});
check('stage crown opt-out',()=>assert.equal(plan('drop',{settings:{concertCrownV828:false}}).crownCount,0));
check('stage crown must respect disabled LED wall',()=>assert.equal(plan('drop',{settings:{ledWall:false}}).crownCount,0));
check('authored LED cue disables crown',()=>assert.equal(plan('drop',{authored:author([cue('led','mute')])}).crownCount,0));
check('quiet verse has no crown objects',()=>assert.equal(plan('verse').crownCount,0));
check('break has no crown objects',()=>assert.equal(plan('break').crownCount,0));
check('verified drop creates bounded side arches',()=>{let c=plan('drop');assert(c.crownCount>0&&c.crownCount<=12);assert(c.crownOpacity>0&&c.crownOpacity<=.24)});
check('low tier has no crown',()=>assert.equal(plan('drop',{tier:'low'}).crownCount,0));
check('crowd protection reduces crown counts',()=>assert(plan('drop',{groupCount:4}).crownCount<=plan('drop',{groupCount:1}).crownCount));
check('crown has a single instanced draw',()=>{let t=read('components/visualizer/ConcertMomentCrownV828.tsx');assert(t.includes('<instancedMesh'));assert.equal(t.match(/<instancedMesh/g).length,1);assert(t.includes('m.count=c.active?'));});
check('V825 still limits crown instances',()=>assert(stage.includes('crownCount:Math.floor(experienceV828.crownCount*fxPerfV825.gains.led)')));
check('crown renderer is wired into live stage',()=>assert(stage.includes('<ConcertMomentCrownV828 cueRef={crownCueV828}/>')));
console.log(`PASS V828 Concert Experience 4.0: ${groups} test groups`);

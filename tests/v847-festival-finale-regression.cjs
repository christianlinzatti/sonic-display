'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFestivalFinaleV847:plan,coordinateFestivalParticlesV847:reduce,FINALE_OFF_V847:off}=load('components/visualizer/festivalFinalePlannerV847');
const {normalizeConcertFxV810:normalize,DEFAULT_CONCERT_FX_V810:d,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
const {planReactiveParticlesV816:particles,PARTICLES_OFF_V816:pOff}=load('components/visualizer/reactiveParticlePlannerV816');
let count=0;
const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V847 ${name}: ${e.message}`;throw e;}};
const settings=normalize({intensity:100,festivalIntensityV844:100,festivalFinaleIntensityV847:100,
 festivalMetallicRainV847:true,festivalSparkWheelsV847:true,quality:'ultra'});
const fx=planFx({settings,genre:'hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.96,kick:.95,
 bass:.9,mids:.56,highs:.72,ledBudget:1,laserBudget:1});
const base={fx,settings,playing:true,reducedMotion:false,manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.96,kick:.95,
 budget:1,timelineGain:1,performanceGain:1,moment:'confetti'};
const rain=plan(base),wheels=plan({...base,moment:'sparks'});
test('FX cue comes from confirmed song',()=>assert.equal(fx.reason,'music'));
test('metallic rain in confetti window',()=>assert.equal(rain.moment,'metallic-rain'));
test('spark wheels in spark window',()=>assert.equal(wheels.moment,'spark-wheels'));
test('confetti count bounded',()=>assert(rain.rainCount>3&&rain.rainCount<=80));
test('wheels count bounded',()=>assert(wheels.wheelCount>=4&&wheels.wheelCount<=32));
test('exclusive wheel/rain',()=>assert(rain.wheelCount===0&&wheels.rainCount===0));
test('rain opacity bounded',()=>assert(rain.rainOpacity<=.38));
test('wheel opacity bounded',()=>assert(wheels.wheelOpacity<=.34));
test('seek stable and deterministic',()=>assert.deepEqual(plan({...base}),rain));
test('source not mutated',()=>{const before=JSON.stringify(base);plan(base);assert.equal(JSON.stringify(base),before)});
test('defaults rain active',()=>assert.equal(d.festivalMetallicRainV847,true));
test('defaults wheels active',()=>assert.equal(d.festivalSparkWheelsV847,true));
test('default palette mixed',()=>assert.equal(d.festivalMetallicPaletteV847,'mixed'));
test('default intensity moderate',()=>assert.equal(d.festivalFinaleIntensityV847,65));
for(const [name,patch] of Object.entries({
 'master off':{settings:{...settings,enabled:false}},
 'festival off':{settings:{...settings,festivalFxV844:false}},
 'reactive particles off':{settings:{...settings,reactiveParticles:false}},
 'unverified cue':{fx:{...fx,reason:'unverified'}},
 'inactive cue':{fx:{...fx,active:false}},
 'pause':{playing:false},
 'reduced motion':{reducedMotion:true},
 'manual light control':{manualLighting:true},
 'authored blackout':{blackout:true},
 'low tier':{tier:'low'},
 'no cast':{groupCount:0},
 'too many performers':{groupCount:5},
 'fractional cast':{groupCount:1.5},
 'missing energy':{energy:NaN},
 'invalid kick':{kick:Infinity},
 'negative phase':{fx:{...fx,phase:-1}},
 'nonfinite phase':{fx:{...fx,phase:NaN}},
 'zero budget':{budget:0},
 'nonfinite budget':{budget:Infinity},
 'zero timeline':{timelineGain:0},
 'zero performance':{performanceGain:0},
 'zero global intensity':{settings:{...settings,intensity:0}},
 'zero festival intensity':{settings:{...settings,festivalIntensityV844:0}},
 'zero V847 intensity':{settings:{...settings,festivalFinaleIntensityV847:0}},
 'CO2 hero':{moment:'co2'},
 'no hero':{moment:'none'}
})){test(`rain suppressed ${name}`,()=>assert.deepEqual(plan({...base,...patch}),off));
 test(`wheels suppressed ${name}`,()=>assert.deepEqual(plan({...base,moment:'sparks',...patch}),off));}
for(const [name,patch] of Object.entries({
 'confetti toggle off':{settings:{...settings,festivalConfettiV844:false}},
 'V816 confetti off':{settings:{...settings,particleConfetti:false}},
 'V847 rain off':{settings:{...settings,festivalMetallicRainV847:false}},
 'build has no rain':{fx:{...fx,section:'build'}},
 'verse has no rain':{fx:{...fx,section:'verse'}},
 'intro has no rain':{fx:{...fx,section:'intro'}},
 'energy insufficient':{energy:.30},
})){test(`rain off ${name}`,()=>assert.deepEqual(plan({...base,...patch}),off));}
test('sparks hero never enables rain',()=>assert.equal(plan({...base,moment:'sparks'}).rainCount,0));
for(const [name,patch] of Object.entries({
 'spark toggle off':{settings:{...settings,festivalSparksV844:false}},
 'V816 sparks off':{settings:{...settings,particleSparks:false}},
 'V847 wheels off':{settings:{...settings,festivalSparkWheelsV847:false}},
 'verse has no wheels':{fx:{...fx,section:'verse'}},
 'hook has no wheels':{fx:{...fx,section:'hook'}},
 'no genuine onset':{kick:.58},
 'low energy':{energy:.50},
})){test(`wheels off ${name}`,()=>assert.deepEqual(plan({...base,moment:'sparks',...patch}),off));}
test('confetti hero never enables wheels',()=>assert.equal(plan({...base,moment:'confetti'}).wheelCount,0));
test('rain intensity follows budget',()=>assert(plan({...base,budget:.45}).rainCount<rain.rainCount));
test('wheel intensity follows budget',()=>assert(plan({...base,moment:'sparks',budget:.45}).wheelCount<wheels.wheelCount));
test('rain follows timeline',()=>assert(plan({...base,timelineGain:.6}).rainCount<rain.rainCount));
test('wheels follow performance governor',()=>assert(plan({...base,moment:'sparks',performanceGain:.6}).wheelCount<wheels.wheelCount));
test('lyrics protect rain',()=>assert(plan({...base,lyricsProtected:true}).rainCount<rain.rainCount));
test('lyrics protect wheels',()=>assert(plan({...base,moment:'sparks',lyricsProtected:true}).wheelCount<wheels.wheelCount));
test('vocal focus reduces rain',()=>assert(plan({...base,vocalFocus:true}).rainCount<rain.rainCount));
test('ensemble reduces rain',()=>assert(plan({...base,groupCount:4}).rainCount<rain.rainCount));
test('balanced tier reduces rain',()=>assert(plan({...base,tier:'balanced'}).rainCount<rain.rainCount));
test('pop allows rain',()=>assert(plan({...base,fx:{...fx,genre:'pop'}}).rainCount>0));
test('rain at hook',()=>assert.equal(plan({...base,fx:{...fx,section:'hook'}}).moment,'metallic-rain'));
test('rain at finale',()=>assert.equal(plan({...base,fx:{...fx,section:'finale'}}).moment,'metallic-rain'));
test('wheels at build',()=>assert.equal(plan({...base,fx:{...fx,section:'build'},moment:'sparks'}).moment,'spark-wheels'));
test('wheels at finale',()=>assert.equal(plan({...base,fx:{...fx,section:'finale'},moment:'sparks'}).moment,'spark-wheels'));
test('normalizer gold',()=>assert.equal(normalize({festivalMetallicPaletteV847:'gold'}).festivalMetallicPaletteV847,'gold'));
test('normalizer silver',()=>assert.equal(normalize({festivalMetallicPaletteV847:'silver'}).festivalMetallicPaletteV847,'silver'));
test('normalizer invalid palette',()=>assert.equal(normalize({festivalMetallicPaletteV847:'neon'}).festivalMetallicPaletteV847,'mixed'));
test('normalizer intensity high',()=>assert.equal(normalize({festivalFinaleIntensityV847:999}).festivalFinaleIntensityV847,100));
test('normalizer intensity low',()=>assert.equal(normalize({festivalFinaleIntensityV847:-1}).festivalFinaleIntensityV847,0));
test('explicit rain opt out persists',()=>assert.equal(normalize({festivalMetallicRainV847:false}).festivalMetallicRainV847,false));
test('explicit wheels opt out persists',()=>assert.equal(normalize({festivalSparkWheelsV847:false}).festivalSparkWheelsV847,false));
test('null preference safe defaults',()=>assert.equal(normalize(null).festivalMetallicPaletteV847,'mixed'));
const existing=particles({fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.95,kick:.95,bass:.85,highs:.72,particleBudget:1});
test('existing particle cue actually active',()=>assert(existing.active));
test('rain dims existing confetti',()=>{const c={...existing,confetti:24,confettiOpacity:.28};assert(reduce(c,rain).confettiOpacity<c.confettiOpacity)});
test('wheels dim existing sparks',()=>{const c={...existing,sparks:24,sparkOpacity:.28};assert(reduce(c,wheels).sparkOpacity<c.sparkOpacity)});
test('no direct count or new particle enable',()=>{
 const r=reduce(existing,rain),w=reduce(existing,wheels);
 assert.equal(r.confetti,existing.confetti);assert.equal(w.sparks,existing.sparks);
 assert.equal(r.sparks,existing.sparks);assert.equal(w.confetti,existing.confetti);
});
test('no source mutation during coordination',()=>{const before=JSON.stringify(existing);reduce(existing,rain);assert.equal(JSON.stringify(existing),before)});
test('existing disabled cue stays disabled',()=>assert.strictEqual(reduce(pOff,rain),pOff));
test('off plan preserves existing',()=>assert.strictEqual(reduce(existing,off),existing));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const renderer=fs.readFileSync('components/visualizer/FestivalFinaleV847.tsx','utf8');
test('live stage mounts V847',()=>assert(stage.includes('<FestivalFinaleV847 cueRef={festivalFinaleCueV847}/>')));
test('stage uses verified V844 companion gate',()=>assert(stage.includes('festivalFinaleCueV847.current=planFestivalFinaleV847(companionInputsV8441)')));
test('stage coordinates particles after older gates',()=>assert(stage.indexOf('coordinateFestivalParticlesV847(')>stage.indexOf('fxPerfV825.gains.particles;')));
test('studio has 2 independently controllable toggles',()=>assert(ui.includes('festivalMetallicRainV847:e.target.checked')&&ui.includes('festivalSparkWheelsV847:e.target.checked')));
test('studio has intensity/palette controls',()=>assert(ui.includes('festivalFinaleIntensityV847:+e.target.value')&&ui.includes("festivalMetallicPaletteV847:e.target.value as ConcertFxSettingsV810['festivalMetallicPaletteV847']")));
test('two bounded instanced meshes',()=>assert.equal((renderer.match(/<instancedMesh /g)||[]).length,2));
test('caps in actual renderer',()=>assert(renderer.includes('args={[undefined,undefined,80]}')&&renderer.includes('args={[undefined,undefined,32]}')));
test('20Hz update cadence',()=>assert(renderer.includes("cadence.current<.05")));
test('one existing RAF callback',()=>assert.equal((renderer.match(/useFrame\(/g)||[]).length,1));
test('no allocation/timeout/random in frame',()=>assert(!/Math\.random\(|setTimeout\(|setInterval\(/.test(renderer)));
test('no real pyrotechnic commands',()=>assert(!/DMX|WebSerial|navigator\.serial|fetch\(/.test(renderer)));
test('no shadows',()=>assert.equal((renderer.match(/castShadow=\{false\}/g)||[]).length,2));
test('package and lock agree',()=>assert.equal(require('../package.json').version,require('../package-lock.json').version));
test('release chain preserves V846',()=>{const scripts=require('../package.json').scripts;
 for(const key of ['check:fast','check:release','build:preflight'])
  assert(scripts[key].startsWith('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848 && npm run test:v848:types && npm run test:v847 && npm run test:v847:types && npm run test:v846 && npm run test:v846:types &&'));
});
console.log(`PASS V847: ${count} festival finale test groups`);

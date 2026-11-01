"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFestivalSpecialFxV844:plan,mergeFestivalParticlesV844:merge,coordinateFestivalFoamV844:foamMix,FESTIVAL_OFF_V844:off}=load('components/visualizer/festivalSpecialFxPlannerV844');
const {DEFAULT_CONCERT_FX_V810:d,normalizeConcertFxV810:normalize,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
const {PARTICLES_OFF_V816:pOff,PARTICLE_CAPS_V816:caps,planReactiveParticlesV816:particles}=load('components/visualizer/reactiveParticlePlannerV816');
const settings=normalize({intensity:100,quality:'ultra',festivalIntensityV844:100,festivalStyleV844:'festival',festivalStrobeV844:true,festivalStrobeIntensityV844:50,festivalStrobeRateV844:2});
const fx=planFx({settings,genre:'hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.95,kick:.95,bass:.89,mids:.53,highs:.73,ledBudget:1,laserBudget:1});
const base={fx,settings,playing:true,reducedMotion:false,manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.95,kick:.95,
 particleBudget:1,foamBudget:1,timelineGain:1,performanceGain:1};
let count=0;
const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V844 ${name}: ${e.message}`;throw e;}};
const good=plan(base);
test('verified FX is music only',()=>assert.equal(fx.reason,'music'));
test('drop V844 active',()=>assert(good.active));
test('CO2 first drop window',()=>assert.equal(good.moment,'co2'));
test('bounded CO2 instances',()=>assert(good.co2Count>=2&&good.co2Count<=48));
test('bounded CO2 alpha',()=>assert(good.co2Opacity>=0&&good.co2Opacity<=.38));
test('not mutating source',()=>{const saved=JSON.stringify(base);plan(base);assert.equal(JSON.stringify(base),saved)});
test('deterministic planning',()=>assert.deepEqual(plan(base),good));
test('no covert strobe default',()=>assert.equal(d.festivalStrobeV844,false));
test('optional strobe output bounded',()=>assert(good.strobeGain>0&&good.strobeGain<=.12));
test('no overlay count unbounded',()=>assert(good.co2Count<=48));
test('config defaults festival on',()=>assert.equal(d.festivalFxV844,true));
for(const [name,patch] of Object.entries({
 'master disabled':{settings:{...settings,festivalFxV844:false}},
 'global disabled':{settings:{...settings,enabled:false}},
 'zero global intensity':{settings:{...settings,intensity:0}},
 'zero special intensity':{settings:{...settings,festivalIntensityV844:0}},
 'unverified cue':{fx:{...fx,reason:'unverified'}},
 'inactive FX cue':{fx:{...fx,active:false}},
 'not playing':{playing:false},
 'reduced motion':{reducedMotion:true},
 'manual lighting':{manualLighting:true},
 'authored blackout':{blackout:true},
 'low tier':{tier:'low'},
 'no cast':{groupCount:0},
 'too many performers':{groupCount:5},
 'fractional performers':{groupCount:1.5},
 'no music energy':{energy:0},
 'missing actual kick':{kick:0},
 'not a musical peak':{fx:{...fx,section:'verse'}},
 'intro':{fx:{...fx,section:'intro'}},
 'break':{fx:{...fx,section:'break'}},
 'zero LED/particle budget':{particleBudget:0},
 'zero foam budget':{foamBudget:0},
 'zero timeline budget':{timelineGain:0},
 'zero performance budget':{performanceGain:0},
 'non-finite phase':{fx:{...fx,phase:NaN}},
 'negative phase':{fx:{...fx,phase:-1}},
 'infinite energy':{energy:Infinity},
 'infinite kick':{kick:Infinity},
 'invalid timeline gain':{timelineGain:NaN},
 'invalid setting':{settings:{...settings,festivalIntensityV844:NaN}},
})){test(`fail-closed ${name}`,()=>assert.deepEqual(plan({...base,...patch}),off));}
for(const [name,section,phase,moment] of [
 ['build sparks','build',1,'sparks'],['hook confetti','hook',1,'confetti'],
 ['drop spark window','drop',2,'sparks'],['drop confetti window','drop',3.4,'confetti'],
 ['finale co2 window','finale',4.9,'co2'],
])test(name,()=>assert.equal(plan({...base,fx:{...fx,section,phase}}).moment,moment));
for(const [name,patch] of Object.entries({
 'CO2 off':{settings:{...settings,festivalCo2V844:false}},
 'spark off':{settings:{...settings,festivalSparksV844:false},fx:{...fx,phase:2}},
 'confetti off':{settings:{...settings,festivalConfettiV844:false},fx:{...fx,phase:3.4}},
}))test(`explicit effect opt-out ${name}`,()=>assert.equal(plan({...base,...patch}).moment,'none'));
test('lyrics protect visual power',()=>assert(plan({...base,lyricsProtected:true}).co2Count<=good.co2Count));
test('vocal focus protects visual power',()=>assert(plan({...base,vocalFocus:true}).co2Opacity<good.co2Opacity));
test('4 performers protects power',()=>assert(plan({...base,groupCount:4}).co2Opacity<good.co2Opacity));
test('low budget reduces instances',()=>assert(plan({...base,particleBudget:.3}).co2Count<good.co2Count));
test('fps governor reduces instances',()=>assert(plan({...base,performanceGain:.3}).co2Count<good.co2Count));
test('balanced style less intense',()=>assert(plan({...base,settings:{...settings,festivalStyleV844:'balanced'}}).co2Count<=good.co2Count));
test('genre differences are grounded',()=>assert(plan({...base,fx:{...fx,genre:'rap'}}).co2Count<good.co2Count));
test('strobe explicit disabled',()=>assert.equal(plan({...base,settings:{...settings,festivalStrobeV844:false}}).strobeGain,0));
test('strobe only high tier',()=>assert.equal(plan({...base,tier:'balanced'}).strobeGain,0));
test('strobe suppressed for lyrics',()=>assert.equal(plan({...base,lyricsProtected:true}).strobeGain,0));
test('strobe suppressed for vocal focus',()=>assert.equal(plan({...base,vocalFocus:true}).strobeGain,0));
test('strobe suppressed for ensemble',()=>assert.equal(plan({...base,groupCount:3}).strobeGain,0));
test('strobe suppressed for hook',()=>assert.equal(plan({...base,fx:{...fx,section:'hook'}}).strobeGain,0));
test('strobe suppressed for lower kick',()=>assert.equal(plan({...base,kick:.70}).strobeGain,0));
test('strobe pulse gap',()=>assert.equal(plan({...base,fx:{...fx,phase:5.13}}).strobeGain,0));
test('2Hz flash never more than two onsets in any 1s aligned window',()=>{let rises=0,was=false;for(let x=0;x<1;x+=.001){const a=plan({...base,fx:{...fx,phase:5+x}}).strobeGain>0;if(a&&!was)rises++;was=a;}assert(rises<=2)});
test('max strobe window 45ms',()=>assert.equal(plan({...base,fx:{...fx,phase:5.05}}).strobeGain,0));
for(const rate of [.5,1,2])test(`normalized Hz ${rate}`,()=>assert.equal(normalize({festivalStrobeRateV844:rate}).festivalStrobeRateV844,rate));
test('invalid hz normalized to 1',()=>assert.equal(normalize({festivalStrobeRateV844:12}).festivalStrobeRateV844,1));
test('strobe intensity capped at 50',()=>assert.equal(normalize({festivalStrobeIntensityV844:999}).festivalStrobeIntensityV844,50));
test('strobe opt-in survives normalization',()=>assert.equal(normalize({festivalStrobeV844:true}).festivalStrobeV844,true));
test('strobe opt-out survives normalization',()=>assert.equal(normalize({festivalStrobeV844:false}).festivalStrobeV844,false));
test('unknown style fallback',()=>assert.equal(normalize({festivalStyleV844:'unknown'}).festivalStyleV844,'balanced'));
test('null config still off strobe',()=>assert.equal(normalize(null).festivalStrobeV844,false));
const baseParticles=particles({fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.95,kick:.95,bass:.89,highs:.73,particleBudget:1});
test('baseline V816 particles active',()=>assert(baseParticles.active));
test('no mutation particle merge',()=>{const before=JSON.stringify(baseParticles);merge(baseParticles,good,settings);assert.equal(JSON.stringify(baseParticles),before)});
test('spark layer only reused instances',()=>{let f=plan({...base,fx:{...fx,phase:2}}),m=merge(baseParticles,f,settings);assert.equal(m.sparks,baseParticles.sparks);assert(m.sparkOpacity>=baseParticles.sparkOpacity&&m.sparkOpacity<=.62)});
test('confetti counts still V816 capped',()=>{let f=plan({...base,fx:{...fx,phase:3.4}}),m=merge(baseParticles,f,settings);assert(m.confetti>=baseParticles.confetti&&m.confetti<=caps.confetti&&m.confettiOpacity<=.52)});
test('CO2 hero dims competing spark/confetti',()=>{let m=merge(baseParticles,good,settings);assert(m.sparkOpacity<baseParticles.sparkOpacity&&m.confettiOpacity<=baseParticles.confettiOpacity)});
test('particle optout enforced',()=>assert.deepEqual(merge(baseParticles,good,{...settings,reactiveParticles:false}),baseParticles));
test('disabled V816 cue remains off',()=>assert.deepEqual(merge(pOff,good,settings),pOff));
test('disabled sparks not reenabled',()=>{let f=plan({...base,fx:{...fx,phase:2}});assert.equal(merge(baseParticles,f,{...settings,particleSparks:false}).sparkOpacity,baseParticles.sparkOpacity)});
test('disabled confetti not reenabled',()=>{let f=plan({...base,fx:{...fx,phase:3.4}});assert.equal(merge(baseParticles,f,{...settings,particleConfetti:false}).confetti,baseParticles.confetti)});
test('festival foam scheduler only reduces active cue',()=>{const c={active:true,bubbles:120,mist:80,opacity:.5,power:.5};const next=foamMix(c,good);assert(next.bubbles<c.bubbles&&next.mist<c.mist&&next.opacity<c.opacity&&next.power<c.power&&next.active);assert.equal(c.bubbles,120)});
test('festival foam scheduler preserves disabled cues',()=>{const c={active:false,bubbles:0,mist:0,opacity:0,power:0};assert.strictEqual(foamMix(c,good),c)});
test('festival foam scheduler preserves no-festival',()=>{const c={active:true,bubbles:40,mist:20,opacity:.5,power:.5};assert.strictEqual(foamMix(c,off),c)});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const render=fs.readFileSync('components/visualizer/FestivalCo2V844.tsx','utf8');
test('V844 stage is evaluated after FX performance budget',()=>assert(stage.indexOf('festivalCueV844.current=planFestivalSpecialFxV844')>stage.indexOf('const foamGainV823=')));
test('festival particles run before timeline gates',()=>assert(stage.indexOf('mergeFestivalParticlesV844(')<stage.indexOf('if(particlesCueV816.current.active&&beatV822.particles>0)')));
test('strobe only existing floor fixture',()=>assert(stage.includes('floorLight.current.intensity+festivalCueV844.current.strobeGain')));
test('Co2 has one instancedMesh',()=>assert.equal((render.match(/<instancedMesh /g)||[]).length,1));
test('CO2 stays outside center lane',()=>assert(render.includes('3.3+rise*.55')));
test('no per-frame geometry allocation',()=>assert.equal((render.match(/useFrame\(/g)||[]).length,1));
test('no random/timers',()=>assert(!render.includes('Math.random(')&&!render.includes('setInterval(')));
test('studio explicit strobe opt in and 2 Hz maximum',()=>assert(ui.includes('festivalStrobeV844')&&ui.includes('value="2"')&&ui.includes('Standard: AUS')));
test('stage contains real CO2 geometry',()=>assert(stage.includes('<FestivalCo2V844 cueRef={festivalCueV844}/>')));
test('settings saved through existing settings provider',()=>assert(fs.readFileSync('services/settings/unifiedBackup.ts','utf8').includes('sonic-display-ui-preferences-v1')));
test('package and lock versions identical',()=>assert.equal(require('../package-lock.json').version,require('../package.json').version));
test('production gates prepend V844',()=>{const p=require('../package.json').scripts;for(const x of ['check:fast','check:release','build:preflight'])assert(p[x].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848 && npm run test:v848:types && npm run test:v847 && npm run test:v847:types && npm run test:v846 && npm run test:v846:types && npm run test:v845 && npm run test:v845:types && npm run test:v844 && npm run test:v844:types &&'))});
console.log(`PASS V844: ${count} festival-special-FX & strobe test groups`);

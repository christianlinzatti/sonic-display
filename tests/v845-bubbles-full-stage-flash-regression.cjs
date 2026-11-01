"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSoapBubblesV8441:bubbles,planFullStageFlashV8441:flash,
 BUBBLES_OFF_V8441:bOff,FLASH_OFF_V8441:fOff}=load('components/visualizer/festivalBubblesFlashPlannerV8441');
const {DEFAULT_CONCERT_FX_V810:d,normalizeConcertFxV810:normalize,
 planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
let count=0;
function test(name,fn){try{fn();count++}catch(e){e.message=`V844.1 ${name}: ${e.message}`;throw e}}
const settings=normalize({intensity:100,festivalIntensityV844:100,
 festivalBubblesIntensityV8441:100,festivalBubbleStyleV8441:'floating',
 festivalFullStageFlashV8441:true,festivalFlashIntensityV8441:35,festivalFlashRateV8441:2});
const actualFx=planFx({settings,genre:'pop',section:'drop',progressMs:4000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.94,kick:.92,bass:.91,mids:.7,highs:.71,
 ledBudget:1,laserBudget:1});
const fx={...actualFx,phase:4};
const base={fx,settings,playing:true,reducedMotion:false,manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.92,kick:.96,
 budget:1,timelineGain:1,performanceGain:1,moment:'none'};
test('verified cue comes from music',()=>assert.equal(fx.reason,'music'));
test('bubbles enabled by default',()=>assert.equal(d.festivalSoapBubblesV8441,true));
test('flash disabled by default',()=>assert.equal(d.festivalFullStageFlashV8441,false));
test('defaults for calm flash rate',()=>assert.equal(d.festivalFlashRateV8441,.5));
test('independent of foam cannon',()=>assert(bubbles({...base,settings:{...settings,foamCannon:false}}).active));
test('bubbles active under verified drop',()=>assert(bubbles(base).active));
test('bounded bubble instances',()=>assert(bubbles(base).count<=64));
test('bubble alpha cap',()=>assert(bubbles(base).opacity<=.27));
test('bubble state deterministic',()=>assert.deepEqual(bubbles(base),bubbles(base)));
test('no source mutation',()=>{const before=JSON.stringify(base);bubbles(base);flash(base);assert.equal(JSON.stringify(base),before)});
test('flash only if explicitly checked',()=>assert(flash(base).active));
test('white wash capped',()=>assert(flash(base).opacity>0&&flash(base).opacity<=.16));
test('flash opt-out',()=>assert.deepEqual(flash({...base,settings:{...settings,festivalFullStageFlashV8441:false}}),fOff));
test('bubble opt-out',()=>assert.deepEqual(bubbles({...base,settings:{...settings,festivalSoapBubblesV8441:false}}),bOff));
for(const [name,patch] of Object.entries({
 'global FX disabled':{settings:{...settings,enabled:false}},
 'festival master disabled':{settings:{...settings,festivalFxV844:false}},
 'FX unverified':{fx:{...fx,reason:'unverified'}},
 'FX inactive':{fx:{...fx,active:false}},
 'playback stopped':{playing:false},
 'reduced motion':{reducedMotion:true},
 'manual light authority':{manualLighting:true},
 'authored blackout':{blackout:true},
 'invalid performer count':{groupCount:5},
 'no performer':{groupCount:0},
 'non-integer count':{groupCount:1.5},
 'invalid phase':{fx:{...fx,phase:NaN}},
 'negative phase':{fx:{...fx,phase:-2}},
 'no real music':{energy:NaN},
 'no actual kick':{kick:NaN},
 'zero particle budget':{budget:0},
 'zero performance budget':{performanceGain:0},
 'zero timeline budget':{timelineGain:0},
 'nonfinite timeline budget':{timelineGain:Infinity},
 'zero global intensity':{settings:{...settings,intensity:0}},
 'zero festival intensity':{settings:{...settings,festivalIntensityV844:0}}
})){
 test(`bubbles gated ${name}`,()=>assert.deepEqual(bubbles({...base,...patch}),bOff));
 test(`flash gated ${name}`,()=>assert.deepEqual(flash({...base,...patch}),fOff));
}
for(const [name,patch] of Object.entries({
 'tier low':{tier:'low'},'lyric focus':{lyricsProtected:true},
 'lead vocalist':{vocalFocus:true},'ensemble 3':{groupCount:3},
 'ensemble 4':{groupCount:4},'hook':{fx:{...fx,section:'hook'}},
 'verse':{fx:{...fx,section:'verse'}},'break':{fx:{...fx,section:'break'}},
 'energy below onset':{energy:.70},'kick below onset':{kick:.74},
 'off phase':{fx:{...fx,phase:4.12}},
 'balanced tier':{tier:'balanced'}
}))test(`flash suppressed ${name}`,()=>assert.deepEqual(flash({...base,...patch}),fOff));
test('bubble hero CO2 suppression',()=>assert.deepEqual(bubbles({...base,moment:'co2'}),bOff));
test('bubbles dim during confetti',()=>assert(bubbles({...base,moment:'confetti'}).count<bubbles(base).count));
test('bubbles dim during sparks',()=>assert(bubbles({...base,moment:'sparks'}).count<bubbles(base).count));
test('bubbles dim during lyrics',()=>assert(bubbles({...base,lyricsProtected:true}).count<bubbles(base).count));
test('bubbles dim when ensemble',()=>assert(bubbles({...base,groupCount:4}).count<bubbles(base).count));
test('bubbles quiet when no budget',()=>assert.deepEqual(bubbles({...base,budget:0}),bOff));
test('bubbles dim on budget reduction',()=>assert(bubbles({...base,budget:.5}).count<bubbles(base).count));
test('bubbles dim on performance budget reduction',()=>assert(bubbles({...base,performanceGain:.5}).count<bubbles(base).count));
test('pop more bubbles than hardtekk',()=>assert(bubbles({...base,fx:{...fx,genre:'hardtekk'}}).count<bubbles(base).count));
test('bubble style soft gives fewer',()=>assert(bubbles({...base,settings:{...settings,festivalBubbleStyleV8441:'soft'}}).count<bubbles(base).count));
test('bubble style festival gives more',()=>assert(bubbles({...base,settings:{...settings,festivalBubbleStyleV8441:'festival'}}).count>=bubbles(base).count));
test('bubble density zero',()=>assert.deepEqual(bubbles({...base,settings:{...settings,festivalBubblesIntensityV8441:0}}),bOff));
test('flash strength budget monotonic',()=>assert(flash({...base,budget:.5}).opacity<=flash(base).opacity));
test('flash strength timeline monotonic',()=>assert(flash({...base,timelineGain:.5}).opacity<=flash(base).opacity));
test('flash strength performance monotonic',()=>assert(flash({...base,performanceGain:.5}).opacity<=flash(base).opacity));
test('flash never runs for missing audio',()=>assert.deepEqual(flash({...base,energy:0,kick:0}),fOff));
test('flash max duration 35ms',()=>assert.deepEqual(flash({...base,fx:{...fx,phase:4.036}}),fOff));
test('flash max 2 onsets per second',()=>{let rises=0,last=false;for(let t=4;t<5;t+=.001){const on=flash({...base,fx:{...fx,phase:t}}).active;if(on&&!last)rises++;last=on}assert(rises<=2)});
for(const rate of [.5,1,2])test(`flash rate normalized ${rate}`,()=>assert.equal(normalize({festivalFlashRateV8441:rate}).festivalFlashRateV8441,rate));
test('bad flash rate clamps to default',()=>assert.equal(normalize({festivalFlashRateV8441:50}).festivalFlashRateV8441,.5));
test('flash intensity clamps high',()=>assert.equal(normalize({festivalFlashIntensityV8441:999}).festivalFlashIntensityV8441,35));
test('flash intensity clamps low',()=>assert.equal(normalize({festivalFlashIntensityV8441:-1}).festivalFlashIntensityV8441,0));
test('bubble intensity clamps high',()=>assert.equal(normalize({festivalBubblesIntensityV8441:200}).festivalBubblesIntensityV8441,100));
test('bubble style fallback',()=>assert.equal(normalize({festivalBubbleStyleV8441:'unknown'}).festivalBubbleStyleV8441,'floating'));
test('flash explicit setting persisted',()=>assert.equal(normalize({festivalFullStageFlashV8441:true}).festivalFullStageFlashV8441,true));
test('no flash from null preferences',()=>assert.equal(normalize(null).festivalFullStageFlashV8441,false));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const bubbleRender=fs.readFileSync('components/visualizer/SoapBubblesV8441.tsx','utf8');
const flashRender=fs.readFileSync('components/visualizer/FullStageFlashV8441.tsx','utf8');
test('stage houses both renderers',()=>assert(stage.includes('<SoapBubblesV8441')&&stage.includes('<FullStageFlashV8441')));
test('plans after V844 verified authority',()=>assert(stage.indexOf('festivalCueV844.current=planFestivalSpecialFxV844')<stage.indexOf('soapBubbleCueV8441.current=planSoapBubblesV8441')));
test('separate from foam particle renderer',()=>assert(stage.includes('<FoamCannonV817')));
test('flash and floor strobe mutually exclusive',()=>assert(stage.includes('festivalCueV844.current={...festivalCueV844.current,strobeGain:0}')));
test('flash requires separate opt in UI',()=>assert(ui.includes('festivalFullStageFlashV8441:e.target.checked')));
test('no moving flash preview in settings',()=>assert(ui.includes('Vorschau (nur Text, KEINE Blitze)')));
test('independent bubbles UI',()=>assert(ui.includes('festivalSoapBubblesV8441:e.target.checked')));
test('bubble instancing capped at 64',()=>assert(bubbleRender.includes('args={[undefined,undefined,64]}')));
test('no per-frame geometry allocation',()=>assert.equal((bubbleRender.match(/useFrame\(/g)||[]).length,1));
test('bubble shader ring transparency',()=>assert(bubbleRender.includes('smoothstep(.69,.93,r)')));
test('flash stage-only camera alignment',()=>assert(flashRender.includes('camera.getWorldDirection')));
test('flash has no DOM overlay',()=>assert(!flashRender.includes('document.')&&!flashRender.includes('createPortal')));
test('flash renders on top only of WebGL',()=>assert(flashRender.includes('renderOrder={9999}')));
test('flash alpha hard cap in actual renderer',()=>assert(flashRender.includes('Math.min(.16,cue.opacity)')));
test('release chain contains V844.1',()=>{const p=require('../package.json');for(const k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848 && npm run test:v848:types && npm run test:v847 && npm run test:v847:types && npm run test:v846 && npm run test:v846:types && npm run test:v845 && npm run test:v845:types'));});
console.log(`PASS V844.1: ${count} soap-bubble & full-stage-flash test groups`);

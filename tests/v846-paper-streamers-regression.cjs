"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planPaperStreamersV846:plan,STREAMERS_OFF_V846:off}=load('components/visualizer/festivalPaperStreamersPlannerV846');
const {DEFAULT_CONCERT_FX_V810:d,normalizeConcertFxV810:normalize,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
let count=0;
function test(name,fn){try{fn();count++}catch(e){e.message=`V846 ${name}: ${e.message}`;throw e;}}
const settings=normalize({intensity:100,festivalIntensityV844:100,festivalPaperStreamersV846:true,festivalStreamerIntensityV846:100,festivalStreamerStyleV846:'spiral'});
const actualFx=planFx({settings,genre:'pop',section:'finale',progressMs:6000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.94,kick:.92,bass:.88,mids:.7,highs:.72,
 ledBudget:1,laserBudget:1});
const fx={...actualFx,phase:6};
const base={fx,settings,playing:true,reducedMotion:false,manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.92,kick:.94,
 budget:1,timelineGain:1,performanceGain:1,moment:'none'};
test('streamers enabled by default',()=>assert.equal(d.festivalPaperStreamersV846,true));
test('streamer default intensity',()=>assert.equal(d.festivalStreamerIntensityV846,65));
test('streamer default style',()=>assert.equal(d.festivalStreamerStyleV846,'spiral'));
test('verified cue comes from music',()=>assert.equal(fx.reason,'music'));
test('streamers active in finale',()=>assert(plan(base).active));
test('bounded streamers count',()=>assert(plan(base).count<=56));
test('bounded streamer opacity',()=>assert(plan(base).opacity<=.34));
test('streamers deterministic',()=>assert.deepEqual(plan(base),plan(base)));
test('no source mutation',()=>{const before=JSON.stringify(base);plan(base);assert.equal(JSON.stringify(base),before)});
for(const [name,patch] of Object.entries({
 'global disabled':{settings:{...settings,enabled:false}},
 'festival disabled':{settings:{...settings,festivalFxV844:false}},
 'streamer opt-out':{settings:{...settings,festivalPaperStreamersV846:false}},
 'zero intensity':{settings:{...settings,festivalStreamerIntensityV846:0}},
 'unverified':{fx:{...fx,reason:'unverified'}},
 'inactive cue':{fx:{...fx,active:false}},
 'stopped':{playing:false},
 'reduced motion':{reducedMotion:true},
 'manual lighting':{manualLighting:true},
 'blackout':{blackout:true},
 'no performers':{groupCount:0},
 'too many performers':{groupCount:5},
 'fractional performers':{groupCount:1.5},
 'invalid phase':{fx:{...fx,phase:NaN}},
 'negative phase':{fx:{...fx,phase:-1}},
 'zero budget':{budget:0},
 'zero timeline':{timelineGain:0},
 'zero performance':{performanceGain:0},
 'co2 priority':{moment:'co2'},
 'missing energy':{energy:0}
}))test(`fail-closed ${name}`,()=>assert.deepEqual(plan({...base,...patch}),off));
test('lyrics protection dims streamers',()=>assert(plan({...base,lyricsProtected:true}).count<plan(base).count));
test('vocal focus dims streamers',()=>assert(plan({...base,vocalFocus:true}).count<plan(base).count));
test('ensemble dims streamers',()=>assert(plan({...base,groupCount:4}).count<plan(base).count));
test('confetti only dampens streamers',()=>{const x=plan({...base,moment:'confetti'});assert(x.active&&x.count<plan(base).count)});
test('sparks only dampen streamers',()=>{const x=plan({...base,moment:'sparks'});assert(x.active&&x.count<plan(base).count)});
test('classic style fewer than spiral',()=>assert(plan({...base,settings:{...settings,festivalStreamerStyleV846:'classic'}}).count<plan(base).count));
test('festival style at least spiral',()=>assert(plan({...base,settings:{...settings,festivalStreamerStyleV846:'festival'}}).count>=plan(base).count));
test('pop more than rap',()=>assert(plan({...base,fx:{...fx,genre:'rap'}}).count<plan(base).count));
test('verse weaker than finale',()=>assert(plan({...base,fx:{...fx,section:'verse'}}).count<plan(base).count));
test('drop remains active',()=>assert(plan({...base,fx:{...fx,section:'drop'}}).active));
test('hook remains active',()=>assert(plan({...base,fx:{...fx,section:'hook'}}).active));
test('style normalization classic',()=>assert.equal(normalize({festivalStreamerStyleV846:'classic'}).festivalStreamerStyleV846,'classic'));
test('style normalization festival',()=>assert.equal(normalize({festivalStreamerStyleV846:'festival'}).festivalStreamerStyleV846,'festival'));
test('style normalization fallback',()=>assert.equal(normalize({festivalStreamerStyleV846:'weird'}).festivalStreamerStyleV846,'spiral'));
test('intensity clamp high',()=>assert.equal(normalize({festivalStreamerIntensityV846:999}).festivalStreamerIntensityV846,100));
test('intensity clamp low',()=>assert.equal(normalize({festivalStreamerIntensityV846:-1}).festivalStreamerIntensityV846,0));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const render=fs.readFileSync('components/visualizer/PaperStreamersV846.tsx','utf8');
test('stage houses paper streamers',()=>assert(stage.includes('<PaperStreamersV846 cueRef={paperStreamersCueV846}/>')));
test('streamers planned after bubbles and flash inputs',()=>assert(stage.includes('paperStreamersCueV846.current=planPaperStreamersV846(companionInputsV8441)')));
test('UI has streamer checkbox',()=>assert(ui.includes('festivalPaperStreamersV846:e.target.checked')));
test('UI has streamer intensity slider',()=>assert(ui.includes('festivalStreamerIntensityV846:+e.target.value')));
test('UI has streamer style selector',()=>assert(ui.includes("festivalStreamerStyleV846:e.target.value as ConcertFxSettingsV810['festivalStreamerStyleV846']")));
test('renderer instance cap is 56',()=>assert(render.includes('args={[undefined,undefined,56]}')));
test('renderer is single useFrame loop',()=>assert.equal((render.match(/useFrame\(/g)||[]).length,1));
test('renderer has no randomness or timers',()=>assert(!render.includes('Math.random(')&&!render.includes('setInterval(')&&!render.includes('setTimeout(')));
test('release chain contains V846',()=>{const p=require('../package.json');for(const k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849 && npm run test:v849:types && npm run test:v848 && npm run test:v848:types && npm run test:v847 && npm run test:v847:types && npm run test:v846 && npm run test:v846:types && npm run test:v845 && npm run test:v845:types'));});
console.log(`PASS V846: ${count} paper-streamer test groups`);

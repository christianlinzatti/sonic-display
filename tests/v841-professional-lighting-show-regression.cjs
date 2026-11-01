'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(841);
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/professionalLightingExperienceV841');
const {normalizeConcertFxV810,DEFAULT_CONCERT_FX_V810}=load('components/visualizer/concertFxStudioV810');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
let tests=0;
const test=(name,fn)=>{try{fn();tests++}catch(e){e.message=`V841 ${name}: ${e.message}`;throw e}};
const verified={active:true,sceneIndex:2,pattern:'cross',sweep:.25,tilt:.04,beamGain:1.02,chase:2,depth:.4};
const settings={professionalLightingV841:true,lightingStrengthV841:65,lightingStyleV841:'balanced'};
const opts={settings,choreography:verified,section:'drop',positionMs:45670,durationMs:180000,sceneBlend:.8,
 enabledFx:true,playing:true,reducedMotion:false,tier:'high',manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,lasersEnabled:true,gobosAvailable:true,energy:.85,kick:.9,laserBudget:1,goboBudget:1};
const run=patch=>m.planProfessionalLightingV841({...opts,...patch});
const good=run();
test('verified live drop active',()=>assert(good.active));
test('verified provenance',()=>assert.equal(good.reason,'verified-v793'));
test('deterministic',()=>assert.deepEqual(run(),good));
test('gobo bounded',()=>assert(good.goboOpacity>0&&good.goboOpacity<=.105));
test('laser bounded',()=>assert(good.laserSpread>=1&&good.laserSpread<=1.65));
test('laser motion bounded',()=>assert(good.laserMotion>=0&&good.laserMotion<=.32));
test('angle bounded',()=>assert(good.angleAdd>=0&&good.angleAdd<=.021));
test('sweep bounded',()=>assert(good.sweepScale>=.7&&good.sweepScale<=1.12));
test('phase deterministic seek',()=>assert.deepEqual(run({positionMs:15000}),run({positionMs:15000})));
test('phase advances with song',()=>assert.notEqual(run({positionMs:15000}).goboPhase,good.goboPhase));
test('gobo drop grid',()=>assert.equal(good.goboPattern,4));
test('gobo next scene',()=>assert.equal(run({choreography:{...verified,sceneIndex:1}}).goboPattern,2));
test('verse lines',()=>assert.equal(run({section:'verse'}).goboPattern,1));
test('build rise',()=>assert.equal(run({section:'build'}).goboPattern,5));
test('hook grid',()=>assert.equal(run({section:'hook'}).goboPattern,4));
test('break rests',()=>assert.equal(run({section:'break'}).goboPattern,0));
test('verse subdued',()=>assert(run({section:'verse'}).goboOpacity<good.goboOpacity));
test('hook subdued',()=>assert(run({section:'hook'}).goboOpacity<good.goboOpacity));
test('build subdued',()=>assert(run({section:'build'}).goboOpacity<good.goboOpacity));
test('break subdued',()=>assert(run({section:'break'}).goboOpacity<good.goboOpacity));
test('cinematic subdued',()=>assert(run({settings:{...settings,lightingStyleV841:'cinematic'}}).goboOpacity<good.goboOpacity));
test('festival stronger',()=>assert(run({settings:{...settings,lightingStyleV841:'festival'}}).goboOpacity>good.goboOpacity));
test('balanced reduces quality',()=>assert(run({tier:'balanced'}).goboOpacity<good.goboOpacity));
test('lyrics protection',()=>assert(run({lyricsProtected:true}).goboOpacity<good.goboOpacity));
test('vocal protection',()=>assert(run({vocalFocus:true}).goboOpacity<good.goboOpacity));
test('no additional gobo when explicitly unavailable',()=>assert.equal(run({gobosAvailable:false}).goboOpacity,0));
test('no laser when disabled',()=>assert.equal(run({lasersEnabled:false}).laserMotion,0));
test('no laser when disabled spread neutral',()=>assert.equal(run({lasersEnabled:false}).laserSpread,1));
test('no laser when budget zero',()=>assert.equal(run({laserBudget:0}).laserSpread,1));
test('no gobo when budget zero',()=>assert.equal(run({goboBudget:0}).goboOpacity,0));
test('strength zero',()=>assert.equal(run({settings:{...settings,lightingStrengthV841:0}}).reason,'disabled'));
test('strength lowering monotonic',()=>assert(run({settings:{...settings,lightingStrengthV841:20}}).goboOpacity<good.goboOpacity));
test('zero intensity harmless',()=>assert.deepEqual(run({settings:{...settings,professionalLightingV841:false}}).reason,'disabled'));
for(const [name,patch,reason] of [
 ['paused',{playing:false},'protected'],['reduced motion',{reducedMotion:true},'protected'],['low tier',{tier:'low'},'protected'],
 ['authored',{manualLighting:true},'protected'],['blackout',{blackout:true},'protected'],['FX off',{enabledFx:false},'disabled'],
 ['choreo missing',{choreography:null},'unverified'],['choreo inactive',{choreography:{...verified,active:false}},'unverified'],
 ['invalid section',{section:'finale'},'unverified'],['invalid progress',{positionMs:NaN},'unverified'],
 ['negative progress',{positionMs:-1},'unverified'],['end excluded',{positionMs:180000},'unverified'],
 ['duration zero',{durationMs:0},'unverified'],['infinite duration',{durationMs:Infinity},'unverified'],
 ['scene not blended',{sceneBlend:0},'unverified'],['scene blend excess',{sceneBlend:1.1},'unverified'],
 ['invalid energy',{energy:NaN},'unverified'],['energy excess',{energy:1.01},'unverified'],
 ['kick missing',{kick:NaN},'unverified'],['kick negative',{kick:-.1},'unverified'],
 ['laser budget NaN',{laserBudget:NaN},'unverified'],['laser budget negative',{laserBudget:-.1},'unverified'],
 ['gobo budget excess',{goboBudget:1.1},'unverified'],['invalid settings',{settings:{...settings,lightingStrengthV841:111}},'unverified'],
 ['bad style',{settings:{...settings,lightingStyleV841:'unknown'}},'unverified'],
 ['invalid scene',{choreography:{...verified,sceneIndex:-1}},'unverified'],
 ['unbounded sweep',{choreography:{...verified,sweep:4}},'unverified'],
 ['unbounded depth',{choreography:{...verified,depth:2}},'unverified'],
 ['unbounded gain',{choreography:{...verified,beamGain:1.3}},'unverified'],
])test(name,()=>{const o=run(patch);assert(!o.active);assert.equal(o.reason,reason);assert.equal(o.goboOpacity,0);assert.equal(o.laserMotion,0)});
test('default enabled',()=>assert.equal(DEFAULT_CONCERT_FX_V810.professionalLightingV841,true));
test('default style',()=>assert.equal(normalizeConcertFxV810(null).lightingStyleV841,'balanced'));
test('normalization switches off',()=>assert.equal(normalizeConcertFxV810({professionalLightingV841:false}).professionalLightingV841,false));
test('normalize strength high',()=>assert.equal(normalizeConcertFxV810({lightingStrengthV841:140}).lightingStrengthV841,100));
test('normalize strength low',()=>assert.equal(normalizeConcertFxV810({lightingStrengthV841:-20}).lightingStrengthV841,0));
test('normalize NaN',()=>assert.equal(normalizeConcertFxV810({lightingStrengthV841:NaN}).lightingStrengthV841,65));
test('normalize cinematic',()=>assert.equal(normalizeConcertFxV810({lightingStyleV841:'cinematic'}).lightingStyleV841,'cinematic'));
test('normalize festival',()=>assert.equal(normalizeConcertFxV810({lightingStyleV841:'festival'}).lightingStyleV841,'festival'));
test('normalize wrong style',()=>assert.equal(normalizeConcertFxV810({lightingStyleV841:'toxic'}).lightingStyleV841,'balanced'));
const stage=read('components/visualizer/DynamicStage.tsx');
test('existing verified light choreographer',()=>assert(stage.includes('planAdvancedLightChoreographyV793({')));
test('new plan after verified plan',()=>assert(stage.indexOf('planProfessionalLightingV841({')>stage.indexOf('planAdvancedLightChoreographyV793({')));
test('no new lights',()=>assert(!stage.includes('v841-spotLight')&&!stage.includes('v841-pointLight')));
test('real existing spotlight',()=>assert(stage.includes('beam.current.angle+=(angle-beam.current.angle)*rate')));
test('existing gobo ref reused',()=>assert(stage.includes('goboMaterialV762.current.uniforms')));
test('existing laser ref reused',()=>assert(stage.includes('laserMaterialV811.current.uniforms.uFanSpread.value')));
test('manual cue guard',()=>assert(stage.includes('manualLighting:manualLightingV763||authoredLightsV386')));
test('laser V823 author guard',()=>assert(stage.includes('authoredFxV823.laser.boost<=.001')));
test('laser FX gating',()=>assert(stage.includes('laserGainV823>0')));
test('spotlight singer guard unchanged',()=>assert(stage.includes('const hasSingerBeam=lightAccentV386.focusSlot!==null')));
test('gobo opaque cap',()=>assert(read('components/visualizer/scenicGoboShaderV762.ts').includes('clamp(uOpacity*p*fade,0.,.15)')));
test('gobo new modes',()=>assert(read('components/visualizer/scenicGoboShaderV762.ts').includes('uPattern<4.5')));
test('laser retains center corridor',()=>assert(read('components/visualizer/laserMatrixShaderV811.ts').includes('float wings=smoothstep(.13,.38,abs(uv.x-.5))')));
test('shader has fan spread',()=>assert(read('components/visualizer/laserMatrixShaderV811.ts').includes('uFanSpread')));
test('no new frame loop in planner',()=>{const a=read('components/visualizer/professionalLightingExperienceV841.ts');for(const forbidden of ['useFrame(','setInterval(','setTimeout(','WebGLRenderer(','localStorage','fetch('])assert(!a.includes(forbidden),forbidden)});
test('studio settings',()=>assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('Professional Lighting Show 5.0')));
test('backup included through existing fx settings',()=>assert(read('services/settings/unifiedBackup.ts').includes('sonic-display-ui-preferences-v1')));
test('version',()=>assert(/^0\.1\.0-v\d+$/.test(require('../package.json').version)));
test('package lock',()=>assert(/^0\.1\.0-v\d+$/.test(require('../package-lock.json').version)));
test('release prefix',()=>{const p=require('../package.json');for(const key of ['check:fast','check:release','build:preflight'])assert(p.scripts[key].includes('npm run test:v841 && npm run test:v841:types &&'))});
test('automation retained',()=>assert(fs.existsSync(path.join(root,'.github/workflows/v832-continuous-validation.yml'))));
console.log(`PASS: V841 Professional Lighting Show – ${tests} test groups`);

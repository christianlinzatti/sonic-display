'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertFxV810,normalizeConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const {planLedWallExperienceV821,LED_WALL_OFF_V821}=load('components/visualizer/ledWallExperiencePlannerV821');
let tests=0;
function test(name,cb){try{cb();tests++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}}
const settings=normalizeConcertFxV810({intensity:100,ledIntensityV821:100,quality:'ultra'});
const fxArgs={settings,genre:'hardtekk',section:'verse',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.85,kick:.95,bass:.9,mids:.6,highs:.73,
 ledBudget:1,laserBudget:1};
const fx=(args={})=>planConcertFxV810({...fxArgs,...args});
const input={fx:fx(),settings,tier:'high',budget:1,lyricsProtected:false,vocalFocus:false,groupCount:1};
const plan=(args={})=>planLedWallExperienceV821({...input,...args});
test('Default settings normalize older saved backups without losing V810 features',()=>{
 const n=normalizeConcertFxV810({enabled:true,ledWall:true});
 assert(n.ledExperienceV821&&n.ledEqualizerV821&&n.ledGeometryV821&&n.ledDropVisualsV821);
 assert.equal(n.ledLookV821,'auto');assert.equal(n.ledIntensityV821,75);
 assert.equal(n.lasers,true);assert.equal(n.protectLyrics,true);
});
test('Input validation for custom style, intensity and malicious saves',()=>{
 for(const raw of [-50,500,NaN,Infinity]){
  const n=normalizeConcertFxV810({ledIntensityV821:raw});assert(n.ledIntensityV821>=0&&n.ledIntensityV821<=100);
 }
 assert.equal(normalizeConcertFxV810({ledLookV821:'invalid'}).ledLookV821,'auto');
 assert.equal(normalizeConcertFxV810({ledExperienceV821:false}).ledExperienceV821,false);
});
test('Verse uses equalizer, hook uses geometry, drop and finale tunnels, build waves',()=>{
 for(const [section,look] of [['verse',1],['hook',2],['drop',4],['finale',4],['build',3],['break',3],['intro',3]]){
  const cue=plan({fx:fx({section})});assert(cue.active,section);assert.equal(cue.look,look,section);
 }
});
test('Only confirmed music controls the LED experience',()=>{
 for(const override of [{verified:false},{active:false},{authored:true},{blackout:true},{playing:false},
  {reactive:false},{reducedMotion:true},{tier:'low'},{ledBudget:0},{progressMs:10000},
  {progressMs:0},{endMs:0},{startMs:11000}]){
  const cue=plan({fx:fx(override)});assert(!cue.active,JSON.stringify(override));
 }
});
test('Disabling all dependent feature switches shuts new effect off',()=>{
 for(const patch of [{enabled:false},{ledWall:false},{ledExperienceV821:false},{intensity:0},
 {ledIntensityV821:0},{ledEqualizerV821:false,ledGeometryV821:false,ledDropVisualsV821:false}]){
  assert(!plan({settings:{...settings,...patch}}).active,JSON.stringify(patch));
 }
});
test('User requested explicit mode overrides auto selection',()=>{
 for(const [mode,value] of [['equalizer',1],['geometry',2],['waves',3],['tunnel',4]]){
  const c=plan({settings:{...settings,ledLookV821:mode}});assert.equal(c.look,value);
 }
});
test('Feature switches provide graceful, deterministic fallback',()=>{
 assert.equal(plan({settings:{...settings,ledLookV821:'equalizer',ledEqualizerV821:false}}).look,2);
 assert.equal(plan({settings:{...settings,ledLookV821:'tunnel',ledDropVisualsV821:false}}).look,2);
 assert.equal(plan({settings:{...settings,ledLookV821:'tunnel',ledDropVisualsV821:false,ledGeometryV821:false}}).look,1);
 assert(!plan({settings:{...settings,ledLookV821:'equalizer',ledEqualizerV821:false,ledGeometryV821:false}}).active);
});
test('Drop accents only during permitted drops and finale',()=>{
 assert.equal(plan({fx:fx({section:'verse'})}).dropAccent,0);
 assert(plan({fx:fx({section:'drop'})}).dropAccent>0);
 assert.equal(plan({fx:fx({section:'drop'}),settings:{...settings,ledDropVisualsV821:false}}).dropAccent,0);
});
test('Spectral data materially changes equalizer amplitude and section cue',()=>{
 const low=plan({fx:fx({bass:.05,mids:.05,highs:.05})});
 const high=plan({fx:fx({bass:1,mids:1,highs:1})});
 assert(high.power>low.power);assert(high.bass>low.bass);
});
test('Three quality levels are monotonically bounded',()=>{
 const powers=['performance','balanced','ultra'].map(quality=>plan({settings:{...settings,quality}}).power);
 assert(powers[0]>0&&powers[0]<powers[1]&&powers[1]<powers[2]);
 assert(powers.every(v=>v>=0&&v<=.38));
});
test('Performance governor and device tier reduce fill cost',()=>{
 const top=plan().power;
 assert(plan({tier:'balanced'}).power<top);
 assert(plan({budget:.25}).power<top);
 assert(!plan({tier:'low'}).active);
});
test('Lyrics, cast size and vocal priority reduce brightness',()=>{
 const top=plan().power;
 assert(plan({lyricsProtected:true}).power<top);
 assert(plan({vocalFocus:true}).power<top);
 assert(plan({groupCount:4}).power<top);
});
test('Invalid numbers, group size and performance budget fail closed',()=>{
 for(const b of [0,-1,NaN,Infinity])assert.deepEqual(plan({budget:b}),LED_WALL_OFF_V821);
 for(const groupCount of [0,5,1.5,NaN])assert(!plan({groupCount}).active);
 assert(!plan({fx:{...fx(),phase:Infinity}}).active);
});
test('Plan is seek-stable and input is never mutated',()=>{
 const original=JSON.stringify(input);assert.deepEqual(plan(),plan());assert.equal(JSON.stringify(input),original);
 assert.equal(plan({fx:fx({progressMs:5200})}).phase,5.2);
});
test('One existing LED mesh and no added texture/renderer',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(stage.includes('fragmentShader={LED_WALL_FRAGMENT_V842}') &&
  fs.readFileSync('components/visualizer/ledWallExperienceShaderV842.ts','utf8').includes('LED_WALL_FRAGMENT_V821'));
 assert(stage.includes('planLedWallExperienceV821('));
 assert.equal((stage.match(/name="v821-led-wall"/g)||[]).length,0);
 for(const key of ['uLed21Power','uLed21Look','uLed21Bass','uLed21Mids','uLed21Highs','uLed21Drop']){
  assert(stage.includes(`led.uniforms.${key}.value`));assert(stage.includes(`${key}:{value:0}`));
 }
});
test('Shader is an additive V812 enhancement with capped alpha and portrait rim',()=>{
 const code=fs.readFileSync('components/visualizer/ledWallExperienceShaderV821.ts','utf8');
 assert(code.includes('LED_WALL_FRAGMENT_V812'));
 assert(code.includes('backdrop+=led21*clamp(uLed21Power,0.0,.38)*rim*.92'));
 assert(code.includes('float equalizer=')&&code.includes('float geometry=')&&code.includes('float dropPattern='));
 assert(!code.includes('discard;')&&!code.includes('gl_FragColor=vec4(1.0'));
});
test('Studio offers five looks, intensity and all feature toggles',()=>{
 const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 for(const k of ['ledExperienceV821','ledEqualizerV821','ledGeometryV821','ledDropVisualsV821',
  'ledIntensityV821','ledLookV821','planLedWallExperienceV821'])assert(ui.includes(k));
});
test('V812 parent safety and saved preferences remain intact',()=>{
 const context=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
 assert(context.includes('normalizeConcertFxV810(parsed.concertFxV810)'));
 const shader=fs.readFileSync('components/visualizer/reactiveLedWallV812.ts','utf8');
 assert(shader.includes('LED_WALL_FRAGMENT_V647'));
});
console.log(`PASS V821: ${tests} LED Wall Experience 2.0 regression groups`);

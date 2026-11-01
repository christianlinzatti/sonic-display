'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{
 fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
}).outputText,f);
const {planAdvancedLightChoreographyV793:plan,LIGHT_CHOREOGRAPHY_OFF_V793:OFF}=
 require('../components/visualizer/advancedLightChoreographerV793.ts');
const sections=['verse','hook','build','drop','break'];
const intents=['portrait','ensemble','rise','pulse','breath'];
const acts=sections.map((section,index)=>({index,section,startMs:index*16000,endMs:(index+1)*16000}));
const base=(i=1,opts={})=>({trackId:'track-793',durationMs:80000,positionMs:i*16000+8000,
 playing:true,reactive:true,reducedMotion:false,tier:'high',authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,genre:'hardtekk',energy:.8,kick:.7,
 scene:{active:true,reason:'verified-act',sceneIndex:i,actIndex:i,intent:intents[i],blend:1},
 narrative:{plan:{source:'verified-v600',trackId:'track-793',durationMs:80000,acts},
  cue:{active:true,source:'verified-v600',act:i}},...opts});
for(let i=0;i<5;i++){
 const cue=plan(base(i));
 assert(cue.active,`expected active ${sections[i]}`);
 assert.equal(cue.sceneIndex,i);
 assert.deepEqual(cue,plan(base(i)),'deterministic');
 assert(Math.abs(cue.sweep)<=.52 && Math.abs(cue.tilt)<=.16);
 assert(cue.beamGain>=1&&cue.beamGain<=1.055);
 assert(cue.depth>=0&&cue.depth<=.7);
}
assert.equal(plan(base(0)).pattern,'portrait');
assert.equal(plan(base(1)).pattern,'fan');
assert.equal(plan(base(2)).pattern,'rise');
assert.equal(plan(base(3)).pattern,'cross');
assert.equal(plan(base(4)).pattern,'rest');
assert(plan(base(3)).depth>plan(base(4)).depth,'drop more animated than break');
assert(plan(base(3,{genre:'hardstyle'})).depth>plan(base(3,{genre:'pop'})).depth);
assert(plan(base(3,{tier:'balanced'})).depth<plan(base(3)).depth);
assert(plan(base(3,{lyricsProtected:true})).depth<plan(base(3)).depth);
assert(plan(base(3,{vocalFocus:true})).depth<plan(base(3)).depth);
assert.equal(plan(base(3,{kick:0})).beamGain,1,'no fabricated kick accents');
assert.equal(plan(base(3,{scene:{...base(3).scene,blend:0}})),OFF,'no boundary jump');
for(const update of [
 {trackId:'other'}, {durationMs:79999},{playing:false},{reactive:false},
 {reducedMotion:true},{tier:'low'},{authored:true},{blackout:true},
 {positionMs:NaN},{positionMs:Infinity},{positionMs:-10},{positionMs:80000},
 {energy:NaN},{kick:Infinity},
 {scene:{...base().scene,active:false}},
 {scene:{...base().scene,reason:'invented'}},
 {scene:{...base().scene,actIndex:2}},
 {scene:{...base().scene,intent:'unknown'}},
 {scene:{...base().scene,blend:2}},
 {narrative:null},
 {narrative:{...base().narrative,plan:{...base().narrative.plan,source:'unverified'}}},
 {narrative:{...base().narrative,plan:{...base().narrative.plan,trackId:'different'}}},
 {narrative:{...base().narrative,cue:{...base().narrative.cue,act:2}}},
 ])assert.deepEqual(plan(base(1,update)),OFF,`fail closed ${Object.keys(update)[0]}`);
const root=path.resolve(__dirname,'..');
const required={
 'components/visualizer/DynamicStage.tsx':['planAdvancedLightChoreographyV793','lightChoreographyV793.current=choreographyV793',
   'beam.current.target=beamTargetV793.current','choreographyRefV793={lightChoreographyV793}',
   'hasSingerBeam','timelineCue.blackout>0','manualLightingV763'],
 'components/visualizer/ConcertArchitectureV789.tsx':['choreographyRefV793','choreography?.pattern','mesh.current.setColorAt'],
};
for(const [file,needles] of Object.entries(required)){
 const text=fs.readFileSync(path.join(root,file),'utf8');
 for(const needle of needles)assert(text.includes(needle),`${file}: ${needle}`);
}
const pkg=require('../package.json');
const compatibleVersion=Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]);assert(Number.isInteger(compatibleVersion)&&compatibleVersion>=793,`V793 requires project version >=793, found ${pkg.version}`);
for(const script of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[script].includes('npm run test:v793 && npm run test:v793:types && npm run test:v792'),script);
console.log('PASS V793: verified acts, genre/section patterns, actual kick gating, low tier, manual/lyrics/blackout protection, stage wiring');

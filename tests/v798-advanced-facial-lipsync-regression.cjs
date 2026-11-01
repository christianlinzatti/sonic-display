'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(798);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(f,deps={}){
  const file=path.join(root,f);
  const result=ts.transpileModule(read(f),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));
  mod.require=id=>Object.prototype.hasOwnProperty.call(deps,id)?deps[id]:require(id);
  mod._compile(result.outputText,file);
  return mod.exports;
}
const v=load('components/visualizer/advancedFacialStudioV798.ts');
let checks=0;function check(name,test){test();checks++;}
const mk=(name,suggestion,confidence='high')=>({id:`face#0::${name}`,name,meshName:'face',suggestion,confidence,normalizedRms:.008});
const full=[mk('jawOpen','jaw'),mk('mouthStretch','wide'),mk('mouthFunnel','round'),mk('mouthClose','lipsClosed')];
const readRig=(targets=full,jawBone=false,profile={})=>v.inspectMouthReadinessV798(targets,jawBone,profile);
check('complete GLB has all four actual channels',()=>{const r=readRig();assert.equal(r.covered,4);assert.equal(r.status,'ready');assert.equal(r.precisionSupported,true)});
check('missing mouth-close cannot claim precision',()=>{const r=readRig(full.slice(0,3));assert.equal(r.covered,3);assert.equal(r.precisionSupported,false);assert(r.warnings.some(x=>x.includes('lipsClosed')))});
check('jaw bone is recognized as fallback',()=>{const r=readRig(full.slice(1),true);assert.equal(r.channels.jaw,'bone');assert.equal(r.precisionSupported,true)});
check('mesh without jaw cannot claim precision',()=>{const r=readRig(full.slice(1),false);assert.equal(r.precisionSupported,false)});
check('a procedural or unavailable GLB warns',()=>{const r=readRig([],false);assert.equal(r.status,'unavailable');assert.equal(r.covered,0);assert(r.warnings.some(x=>x.includes('GLB')))});
check('explicit disabled mouth wins over a morph',()=>{const r=readRig(full,true,{mapping:{lipsClosed:'none',jaw:'none'}});assert.equal(r.channels.lipsClosed,'disabled');assert.equal(r.channels.jaw,'disabled');assert.equal(r.precisionSupported,false)});
check('manual mapping can restore unknown names',()=>{const r=readRig([mk('weirdA',null),mk('weirdB',null)],true,{mapping:{lipsClosed:'face#0::weirdB'}});assert.equal(r.channels.lipsClosed,'manual');assert.equal(r.precisionSupported,true)});
check('stale manual mapping fails closed even with an inferred match',()=>{const r=readRig(full,false,{mapping:{lipsClosed:'missing'}});assert.equal(r.channels.lipsClosed,'stale');assert.equal(r.precisionSupported,false)});
check('two explicit mappings cannot claim same morph twice',()=>{const r=readRig(full,false,{mapping:{jaw:full[0].id,lipsClosed:full[0].id}});assert.equal(r.channels.lipsClosed,'conflict');assert.equal(r.precisionSupported,false)});
check('inferred channel cannot steal manually mapped morph',()=>{const r=readRig(full,false,{mapping:{jaw:full[3].id}});assert.equal(r.channels.lipsClosed,'missing');assert.equal(r.precisionSupported,false)});
check('near-zero morph geometry is flagged',()=>{const r=readRig([{...full[0],normalizedRms:0},...full.slice(1)]);assert(r.warnings.some(x=>x.includes('extrem geringe')))});
check('lower confidence is explained',()=>{const r=readRig([mk('singleletterA','jaw','medium'),...full.slice(1)]);assert(r.warnings.some(x=>x.includes('mittlerer Sicherheit')))});
check('unknown geometry not overstated',()=>{const r=readRig([{...full[0],normalizedRms:null},...full.slice(1)]);assert(r.warnings.some(x=>x.includes('Geometrie')))});
check('missing channels are listed and counts stable for duplicates',()=>{const r=readRig([...full,full[1]]);assert.equal(r.covered,4);assert.equal(r.count,4)});
check('zero-gain lipsClosed is not a working closure even if mesh exists',()=>{const r=readRig(full,false,{gains:{lipsClosed:0}});assert.equal(r.channels.lipsClosed,'disabled');assert.equal(r.precisionSupported,false)});
check('zero-gain jaw is not a working jaw even with bone fallback',()=>{const r=readRig(full,true,{gains:{jaw:0}});assert.equal(r.channels.jaw,'disabled');assert.equal(r.precisionSupported,false)});
check('duplicate channel use is visible instead of claiming readiness',()=>{const r=readRig(full,false,{mapping:{wide:'face#0::mouthClose'}});assert.equal(r.precisionSupported,false);assert.equal(r.status,'limited');assert(r.warnings.some(w=>w.includes('nicht erkannt')||w.includes('bereits')||w.includes('Morph')))});
check('synthetic rapid demo stays finite, bounded and closes the jaw on PP',()=>{
 for(let i=0;i<2500;i++){const frame=v.sampleRapidRapDemoV798(i/325);for(const key of ['jaw','wide','round','lipsClosed','brow','cheek','blink'])assert(Number.isFinite(frame[key])&&frame[key]>=0&&frame[key]<=1,`${key} ${i}`);assert(frame.jaw<=1-frame.lipsClosed+.00001);}
 const seal=v.sampleRapidRapDemoV798(0);assert.equal(seal.lipsClosed,1);assert.equal(seal.jaw,0);
 assert.equal(v.sampleRapidRapDemoV798(NaN).jaw,0);
});
check('explicit V798 fast-rap simulation is bounded',()=>{
 for(const time of [0,.02,.14,.5,1.2,9.9,199.8]){
   const p=v.sampleRapidRapDemoV798(time);
   for(const key of ['jaw','wide','round','lipsClosed','brow','cheek','blink'])assert(Number.isFinite(p[key])&&p[key]>=0&&p[key]<=1,key);
   assert(p.jaw<=1-p.lipsClosed+1e-8,'closed lips never force jaw opening');
 }
});
check('fast rap simulation is deterministic and rejects invalid timestamps',()=>{
 assert.deepEqual(v.sampleRapidRapDemoV798(1.23),v.sampleRapidRapDemoV798(1.23));
 for(const t of [NaN,Infinity,-Infinity,-1])assert.deepEqual(v.sampleRapidRapDemoV798(t),v.sampleRapidRapDemoV798(-1));
});
check('normalization is opt-in and bounded',()=>{assert.deepEqual(v.normalizeRapMouthPrecisionV798(),{enabled:false,intensity:60});assert.deepEqual(v.normalizeRapMouthPrecisionV798({enabled:true,intensity:Infinity}),{enabled:true,intensity:60});assert.equal(v.normalizeRapMouthPrecisionV798({enabled:true,intensity:200}).intensity,100)});
const evidence={verifiedWord:true,rap:true,playing:true,authorisedSinger:true,manualPriority:false,authoredViseme:false,reducedMotion:false,lowTier:false,hasJaw:true,hasLipClosure:true};
const config={enabled:true,intensity:70};
const sample=(patch={},opts=config)=>v.planRapMouthPrecisionV798(opts,{...evidence,...patch});
check('verified rapper gains bounded attack/release',()=>{const p=sample();assert.equal(p.active,true);assert(p.attack>p.release);assert(p.release>=1);assert(p.attack<=2.65)});
check('same evidence yields deterministic result',()=>assert.deepEqual(sample(),sample()));
check('rap demo is explicitly simulated',()=>{const p=sample({verifiedWord:false,rap:false,playing:false,authorisedSinger:false,previewRap:true});assert.equal(p.active,true);assert.equal(p.reason,'simulated-rap')});
check('speed rates affect only mouth channels',()=>{for(const c of ['jaw','wide','round','lipsClosed'])assert(v.rapMouthRateV798(sample(),c,true)>1);for(const c of ['brow','blink','cheek','smile','squint'])assert.equal(v.rapMouthRateV798(sample(),c,true),1)});
check('release remains less pronounced than attack',()=>assert(v.rapMouthRateV798(sample(),'jaw',true)>v.rapMouthRateV798(sample(),'jaw',false)));
check('no tuning in disabled settings',()=>assert.deepEqual(sample({},{enabled:false,intensity:100}),v.RAP_MOUTH_OFF_V798));
check('zero intensity no tuning',()=>assert.deepEqual(sample({},{enabled:true,intensity:0}),v.RAP_MOUTH_OFF_V798));
for(const [label,patch] of Object.entries({silence:{verifiedWord:false},singing:{rap:false},paused:{playing:false},otherSinger:{authorisedSinger:false},manual:{manualPriority:true},viseme:{authoredViseme:true},reduced:{reducedMotion:true},slowHardware:{lowTier:true},noJaw:{hasJaw:false},noClosure:{hasLipClosure:false}})){
  check('fails closed: '+label,()=>assert.deepEqual(sample(patch),v.RAP_MOUTH_OFF_V798));
}
check('input immutable',()=>{const a=Object.freeze({...evidence});const b=Object.freeze({...config});sample(a,b);assert.deepEqual(a,evidence);assert.deepEqual(b,config)});
const rig=read('components/visualizer/VocalRigV368.tsx');
const studio=read('components/visualizer/FacialAnimationStudioV370.tsx');
const profile=read('components/visualizer/advancedFacialRigV383.ts');
check('runtime uses the same opt-in rate after verified sources',()=>{assert.match(rig,/planRapMouthPrecisionV798\(profileV370\?\.rapMouthPrecisionV798/);assert.match(rig,/rapMouthRateV798\(precisionV798,c,finalMouthTargetV644>current.current\[c\]\)/);assert.match(rig,/authoredViseme:\!\!manualVisemeV644/)});
check('fast rap audition uses the real GLB rig and not a second loop',()=>{assert(rig.includes('sampleRapidRapDemoV798(state.clock.elapsedTime)'));assert(studio.includes('▶ V798 Schnellrap-Probe'));assert(studio.includes('demo==="fast-rap"'))});
check('studio offers real rig status, disabled capabilities, a simulated rap demo',()=>{for(const key of ['inspectMouthReadinessV798','mouthReadinessV798?.channels','disabled={!mouthReadinessV798?.precisionSupported}','Rap-Simulation vergleichen'])assert(studio.includes(key),key)});
check('portable facial profile export and import include opt-in settings',()=>{assert.match(profile,/rapMouthPrecisionV798:normalizeRapMouthPrecisionV798/);assert.match(profile,/V798 aktiviert muss boolean sein/)});
check('legacy source remains registered',()=>{assert.match(read('components/visualizer/facialRigStudioV370.ts'),/rapMouthPrecisionV798\?:RapMouthPrecisionV798/)});
const legacy=load('components/visualizer/facialRigStudioV370.ts');
const v562=load('components/visualizer/advancedFacialCalibrationV562.ts');
const portable=load('components/visualizer/advancedFacialRigV383.ts',{'./facialRigStudioV370':legacy,'./advancedFacialCalibrationV562':v562,'./advancedFacialStudioV798':v});
check('V383 portable roundtrip with opt-in and previous V562',()=>{
  const input={mapping:{jaw:'none'},gains:{brow:.9},mouthCalibrationV562:{enabled:true,jawCeiling:.8,lipSeal:.9,vowelSeparation:.5},rapMouthPrecisionV798:{enabled:true,intensity:85}};
  const result=portable.importFacialProfileV383(portable.exportFacialProfileV383(input),[]);
  assert.deepEqual(result.profile,input);
});
check('legacy V383 import remains disabled by default',()=>{
  const result=portable.importFacialProfileV383(JSON.stringify({format:'sonic-facial-rig-v383',version:1,mapping:{},gains:{}}),[]);
  assert.equal(result.profile.rapMouthPrecisionV798,undefined);
});
check('invalid V798 import rejected',()=>{const raw={format:'sonic-facial-rig-v383',version:1,rapMouthPrecisionV798:{enabled:'true',intensity:70}};assert.throws(()=>portable.importFacialProfileV383(JSON.stringify(raw),[]),/V798/)});
check('numerical overflow gets clamped when imported',()=>{const raw={format:'sonic-facial-rig-v383',version:1,rapMouthPrecisionV798:{enabled:true,intensity:9999}};assert.equal(portable.importFacialProfileV383(JSON.stringify(raw),[]).profile.rapMouthPrecisionV798.intensity,100)});
const pkg=require('../package.json');
check('version, scripts, release gates',()=>{
 assert(/^0\.1\.0-v\d+$/.test(pkg.version));
 for(const k of ['build:preflight','check:fast','check:release']) {
   assert(pkg.scripts[k].includes('npm run test:v798 && npm run test:v798:types && npm run test:v797'),k);
   if(pkg.version==='0.1.0-v799')assert(pkg.scripts[k].startsWith('npm run test:v799 && npm run test:v799:types && npm run test:v798'),k);
   if(pkg.version==='0.1.0-v800')assert(pkg.scripts[k].startsWith('npm run test:v800 && npm run test:v800:types && npm run test:v799'),k);
   if(pkg.version==='0.1.0-v802')assert(pkg.scripts[k].startsWith('npm run test:v802 && npm run test:v802:types && npm run test:v801'),k);
   if(pkg.version==='0.1.0-v803')assert(pkg.scripts[k].startsWith('npm run test:v803 && npm run test:v803:types && npm run test:v802'),k);
   if(pkg.version==='0.1.0-v801')assert(pkg.scripts[k].startsWith('npm run test:v801 && npm run test:v801:types && npm run test:v800'),k);
 }
});
console.log(`PASS V798: ${checks} independent checks – GLB rig readiness, opt-in verified rap, preview, manual and viseme guards, legacy profile roundtrip, runtime wiring`);

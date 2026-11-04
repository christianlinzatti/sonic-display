'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const eventLog=[],local=new Map();
const mod={exports:{}};const file='lib/goveeBassReactiveV917.ts';
const out=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(out.diagnostics?.length||0,0);
vm.runInNewContext(out.outputText,{module:mod,exports:mod.exports,Event:class {constructor(type){this.type=type;}},window:{dispatchEvent:e=>eventLog.push(e.type)},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},require(){throw Error('Unexpected runtime import');}});
const bass=mod.exports;
const json=v=>JSON.parse(JSON.stringify(v));
const options={...json(bass.DEFAULT_GOVEE_BASS_V917),enabled:true};
const none={bass:0,kick:0,beatStrength:0};
const kick={bass:.95,kick:.9,beatStrength:1};
const roles=['wall','rhythm','neon','ambient'];
const base={brightness:50,color:{r:65,g:84,b:100}};
let count=0;function test(label,fn){fn();count++;process.stdout.write('PASS V917 '+label+'\n');}
test('defaults disable real light bass control',()=>{
 assert.equal(bass.DEFAULT_GOVEE_BASS_V917.enabled,false);
 assert.equal(bass.normalizeGoveeBassV917(null).enabled,false);
 assert.equal(bass.loadGoveeBassV917().enabled,false);
});
test('malformed settings never enable bass reactions',()=>{
 for(const raw of [null,{},[],{'enabled':'yes'},'yes'])assert.equal(bass.normalizeGoveeBassV917(raw).enabled,false);
});
test('settings normalization clamps ranges and nonfinite numbers',()=>{
 const v=bass.normalizeGoveeBassV917({enabled:true,intensity:200,threshold:-1,cooldownMs:Infinity,releaseMs:-200});
 assert.deepEqual(json(v),{enabled:true,intensity:100,threshold:20,cooldownMs:420,releaseMs:500});
});
test('storage persists preferences and notifies current tab',()=>{
 bass.saveGoveeBassV917({...options,intensity:85});
 assert.equal(bass.loadGoveeBassV917().intensity,85);assert.ok(eventLog.includes(bass.GOVEE_BASS_EVENT_V917));
 const obj=JSON.parse(local.get(bass.GOVEE_BASS_KEY_V917));assert.equal(obj.enabled,true);assert.equal(Object.keys(obj).length,5);
});
test('storage rejects malformed JSON cleanly',()=>{local.set(bass.GOVEE_BASS_KEY_V917,'{');assert.equal(bass.loadGoveeBassV917().enabled,false);});
test('inactive microphone produces no envelope or inferred beats',()=>{
 const e=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,options,false);
 assert.equal(e.hits,0);assert.equal(e.pulse,0);
});
test('disabled settings produce no envelope even for loud kicks',()=>{
 const e=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,{...options,enabled:false},true);
 assert.equal(e.hits,0);assert.equal(e.pulse,0);
});
test('one rising real kick creates exactly one onset',()=>{
 const start=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),none,1000,options,true);
 const e=bass.stepGoveeBassEnvelopeV917(start,kick,1120,options,true);
 assert.equal(e.hits,1);assert.ok(e.pulse>0);
 const repeated=bass.stepGoveeBassEnvelopeV917(e,kick,1240,options,true);
 assert.equal(repeated.hits,1);
});
test('kick cooldown suppresses rapid second rising spike',()=>{
 let e=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,options,true);
 e=bass.stepGoveeBassEnvelopeV917(e,none,1100,options,true);
 e=bass.stepGoveeBassEnvelopeV917(e,kick,1200,options,true);
 assert.equal(e.hits,1);
});
test('two separated spikes are detected as two real kicks',()=>{
 let e=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,options,true);
 e=bass.stepGoveeBassEnvelopeV917(e,none,1400,options,true);
 e=bass.stepGoveeBassEnvelopeV917(e,kick,1520,options,true);
 assert.equal(e.hits,2);
});
test('subthreshold bass and stationary high bass do not spam events',()=>{
 let e=bass.resetGoveeBassEnvelopeV917();
 for(let i=0;i<120;i++)e=bass.stepGoveeBassEnvelopeV917(e,{bass:.18,kick:.10,beatStrength:.1},1000+i*120,options,true);
 assert.equal(e.hits,0);
 e=bass.stepGoveeBassEnvelopeV917(e,kick,16000,options,true);const hits=e.hits;
 for(let i=1;i<=60;i++)e=bass.stepGoveeBassEnvelopeV917(e,kick,16000+i*120,options,true);
 assert.equal(e.hits,hits);
});
test('pulse decays continuously after a kick',()=>{
 let e=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,options,true);
 let old=e.pulse;
 for(let t=1200;t<=2500;t+=100){e=bass.stepGoveeBassEnvelopeV917(e,none,t,options,true);assert.ok(e.pulse<=old);old=e.pulse;}
 assert.ok(old<.25);
});
test('bad timestamps reset instead of inventing kick events',()=>{
 const prior=bass.stepGoveeBassEnvelopeV917(bass.resetGoveeBassEnvelopeV917(),kick,1000,options,true);
 for(const t of [NaN,-1,Infinity])assert.equal(bass.stepGoveeBassEnvelopeV917(prior,kick,t,options,true).hits,0);
});
test('color never changes and power is not part of a bass look',()=>{
 const e={...bass.EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:.8};
 const next=bass.applyGoveeBassLookV917(base,'rhythm',e,options,90,true);
 assert.deepEqual(json(next.color),json(base.color));assert.equal('on' in next,false);assert.ok(next.brightness>base.brightness);
});
test('disabled and inactive signals preserve old V916 look byte-for-byte',()=>{
 const e={...bass.EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:1};
 assert.deepEqual(json(bass.applyGoveeBassLookV917(base,'rhythm',e,{...options,enabled:false},90,true)),base);
 assert.deepEqual(json(bass.applyGoveeBassLookV917(base,'rhythm',e,options,90,false)),base);
});
test('role differentiation makes rhythm stronger than wall, neon and ambient',()=>{
 const e={...bass.EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:1};
 const out=roles.map(role=>bass.applyGoveeBassLookV917(base,role,e,options,90,true).brightness);
 assert.ok(out[1]>out[2]&&out[2]>out[0]&&out[0]>out[3]);
});
test('zero intensity cannot add brightness',()=>{
 const e={...bass.EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:1};
 assert.deepEqual(json(bass.applyGoveeBassLookV917(base,'rhythm',e,{...options,intensity:0},90,true)),base);
});
test('ceiling honors master brightness plus a small safe headroom',()=>{
 const e={...bass.EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:1};
 assert.equal(bass.applyGoveeBassLookV917({...base,brightness:90},'rhythm',e,options,30,true).brightness,42);
});
test('preview uses only pure functions and generates four distinct role outputs',()=>{
 const out=bass.previewGoveeBassV917(options,1,95);
 assert.deepEqual(json(out.map(r=>r.role)),roles);assert.equal(new Set(out.map(r=>r.look.brightness)).size,4);
});
test('4,000 deterministic envelope and intensity calculations',()=>{
 let e=bass.resetGoveeBassEnvelopeV917();
 for(let i=0;i<4000;i++){
  const metric=i%5===0?kick:none;const t=1000+i*120;
  const a=bass.stepGoveeBassEnvelopeV917(e,metric,t,options,true);
  const b=bass.stepGoveeBassEnvelopeV917(e,metric,t,options,true);
  assert.deepEqual(json(a),json(b));
  const look=bass.applyGoveeBassLookV917(base,roles[i%4],a,options,70,true);
  assert.ok(look.brightness>=20&&look.brightness<=82);
  e=a;
 }
});
test('real live integration is conditional and per-device groups stay in control',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 assert.match(sync,/stepGoveeBassEnvelopeV917/);
 assert.match(sync,/state\.microphoneActive/);
 assert.match(sync,/applyGoveeBassLookV917\(unboosted/);
 assert.match(sync,/applyGoveeGroupBrightnessV915\(base,group/);
 assert.match(sync,/window\.clearInterval\(sampler\)/);
 assert.match(sync,/GOVEE_BASS_EVENT_V917/);
 assert.doesNotMatch(sync,/action:'power'/);
});
test('settings panel shows explicit opt-in, microscope gating and preview only',()=>{
 const ui=read('components/GoveeBassStudioV917.tsx');
 assert.match(ui,/V917 · Bass Reactive Lighting 3\.0/);
 assert.match(ui,/checked=\{settings\.enabled\}/);
 assert.match(ui,/microphoneActive/);
 assert.match(ui,/previewGoveeBassV917/);
 assert.doesNotMatch(ui,/goveeBridgeRequestV909|\bfetch\(/);
 assert.match(read('components/GoveeLanPanelV909.tsx'),/<GoveeBassStudioV917/);
});
test('V910 bridge and V916 presets remain backward compatible',()=>{
 assert.ok(fs.existsSync(path.join(root,'scripts/govee-lan-bridge.cjs')));
 assert.equal(read('lib/goveeLightShowV912.ts').includes("govee-light-show-v912"),true);
 assert.equal(read('lib/goveePresetLibraryV916.ts').includes('GOVEE_PRESETS_V916'),true);
 assert.doesNotMatch(read(file),/Bearer|\.token\b|request\(|\bfetch\(/);
});
test('all edited TypeScript and TSX parse successfully',()=>{
 for(const file of ['lib/goveeBassReactiveV917.ts','components/GoveeBassStudioV917.tsx',
  'components/GoveeLanPanelV909.tsx','components/GoveeMusicSyncV909.tsx']){
  const parsed=ts.createSourceFile(file,read(file),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  assert.equal(parsed.parseDiagnostics.length,0,file);
 }
});
console.log(`V917 PASS ${count} test groups (4,000 deterministic samples)`);

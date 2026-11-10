'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const src=ts.transpileModule(read('lib/aiConcertCoordinationV1154.ts'),{
 fileName:'lib/aiConcertCoordinationV1154.ts',reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
});
assert.equal(src.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const stored=new Map(),window=new EventTarget(),mod={exports:{}};
const localStorage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,String(v))};
vm.runInNewContext(src.outputText,{module:mod,exports:mod.exports,window,localStorage,Event,Date,Math,JSON,Number,Object});
const api=mod.exports;
assert.equal(api.loadConcertCoordinationV1154().enabled,false);
assert.equal(api.normalizeConcertCoordinationV1154({enabled:true,strength:999}).strength,100);
assert.equal(api.normalizeConcertCoordinationV1154({enabled:true,strength:-20}).strength,0);
api.saveConcertCoordinationV1154({schema:'concert-coordination-v1154',enabled:true,strength:70});
assert.equal(api.loadConcertCoordinationV1154().strength,70);
const settings=api.loadConcertCoordinationV1154();
const input={settings,trackId:'song',progressMs:24000,durationMs:180000,
 phase:'hook',verified:true,transition:1,playing:true,reducedMotion:false,manualPriority:false,
 lyricsFocus:false,genre:'deutschrap'};
const make=extra=>api.planConcertCoordinationV1154({...input,...extra});
const active=make({});
assert.equal(active.active,true);
assert(active.crewFactor>=.5&&active.crewFactor<=1);
assert(active.lightFactor>=.75&&active.lightFactor<=1);
assert.equal(make({transition:0}).lightFactor,1,'section entry should ease in');
assert(make({transition:.5}).lightFactor<=1,'smoothed halfway through transition');
assert.equal(make({}).lightFactor,active.lightFactor,'deterministic');
for(const change of [{settings:{...settings,enabled:false}},{playing:false},{manualPriority:true},
 {reducedMotion:true},{verified:false},{trackId:' '},{progressMs:NaN},{progressMs:-1},
 {phase:'invented'},{transition:2},{transition:NaN},{progressMs:180000}]){
 const out=make(change);assert.equal(out.active,false,JSON.stringify(change));
 assert.equal(out.crewFactor,1);assert.equal(out.lightFactor,1);
}
const previous={active:true,expressionGain:.8,clip:'Dance_HipHop'};
const crew=api.applyConcertCrewV1154(previous,active);
assert.equal(crew.clip,previous.clip,'must preserve loaded clip');
assert(crew.expressionGain<=previous.expressionGain,'never boost movement');
assert.equal(api.applyConcertCrewV1154(previous,active,true),previous,'manual clip priority');
assert.equal(api.applyConcertCrewV1154(previous,make({verified:false})),previous);
const look={brightness:85,color:{r:100,g:50,b:220}};
const delivered=api.applyConcertLightV1154(look,active,65);
assert(delivered.brightness<=65&&delivered.brightness>=0);
assert.deepEqual(delivered.color,look.color);
assert.equal(api.applyConcertLightV1154(look,make({verified:false}),65),look,'unverified must stay unchanged');
assert.equal(api.applyConcertLightV1154(look,active,-1),look);
const quiet=make({phase:'break',lyricsFocus:true});
assert(quiet.lightFactor<=active.lightFactor);
assert(quiet.crewFactor<=active.crewFactor);
const crewCode=read('components/visualizer/useSonicCrew.ts');
for(const x of ['planConcertCoordinationV1154','applyConcertCrewV1154','input.manualPriority','input.reducedMotion'])assert(crewCode.includes(x),x);
const lightCode=read('components/GoveeMusicSyncV909.tsx');
for(const x of ['planConcertCoordinationV1154','applyConcertLightV1154','verified:verifiedPhaseV1027.verified',
  'manualPriority:Boolean(show)','governConcertLookV961(previous,coordinatedLookV1154',
  "goveeBridgeRequestV909(config,'/command'"]){assert(lightCode.includes(x),x);}
assert(lightCode.indexOf('applyConcertLightV1154(roomLookV1096')<lightCode.indexOf('governConcertLookV961(previous,coordinatedLookV1154'));
const ui=read('components/visualizer/SonicCrewControls.tsx');
for(const x of ['V1154 · KI-Konzertregie 3.0','saveConcertCoordinationV1154','coordination.enabled'])assert(ui.includes(x),x);
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1154-concert-coordination-regression.cjs'));
console.log('PASS V1154: default-off phase smoothing, verified-only Govee attenuation, adaptive crew expression, manual/reduced-motion gates, existing V961 governor and LAN pacing');

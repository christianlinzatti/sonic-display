'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const store=new Map(),events=[];
const fakeWindow={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},dispatchEvent:e=>events.push(e.type)};
function load(file,dependencies={}){
 const transpiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(transpiled.diagnostics?.length||0,0);
 const module={exports:{}};
 vm.runInNewContext(transpiled.outputText,{module,exports:module.exports,localStorage:fakeWindow.localStorage,window:fakeWindow,
  Event:class{constructor(type){this.type=type;}},require(id){if(Object.hasOwn(dependencies,id))return dependencies[id];throw Error('Unexpected import '+id);}},
  {filename:file,timeout:10000});
 return module.exports;
}
const genre=load('lib/goveeGenreLightV920.ts');
const g=load('lib/goveeLightEnergyV924.ts',{'@/lib/goveeGenreLightV920':genre});
const json=x=>JSON.parse(JSON.stringify(x));
const config={...json(g.DEFAULT_GOVEE_ENERGY_V924),enabled:true};
const base={color:{r:95,g:33,b:166},brightness:55};
const labels=['verse','hook','verse','hook','break','build','drop','hook','break'];
const mk=(labelsInput=labels,confidence=.98)=>({schema:'sonic-track-analysis-v318',trackId:'track-924',
 durationMs:labelsInput.length*10000,source:'imported',tempo:null,timeSignature:4,beats:[],bars:[],importedAt:0,
 sections:labelsInput.map((label,i)=>({label,startMs:i*10000,durationMs:10000,confidence}))});
const section=(data,time,confidence)=>{
 const cue=data.sections.find(s=>s.startMs<=time&&time<s.startMs+s.durationMs);
 return cue?{active:true,phase:cue.label,intensity:0,verifiedDropAhead:false,confidence:confidence??cue.confidence,reason:'V919 verified'}:null;
};
const plan=(time=15000,settings=config,data=mk(),genreInput='hardstyle')=>
 g.planGoveeEnergyV924(data,data.trackId,time,genreInput,section(data,time),settings);
const apply=(decision=plan(),settings=config,role='rhythm',b=base,master=75)=>
 g.applyGoveeEnergyV924(b,decision,role,settings,master);
let n=0;function test(name,run){run();n++;console.log('PASS V924 '+name);}
test('disabled by default and finite limits',()=>{assert.equal(g.DEFAULT_GOVEE_ENERGY_V924.enabled,false);assert.equal(g.DEFAULT_GOVEE_ENERGY_V924.maxChangePoints,9);});
test('malformed settings cannot enable',()=>{for(const x of [null,undefined,true,2,[],{enabled:'yes'},{enabled:1}])assert.equal(g.normalizeGoveeEnergyV924(x).enabled,false);});
test('mode whitelist, finite range and fallback',()=>{const x=json(g.normalizeGoveeEnergyV924({enabled:true,mode:'strobe',strength:NaN,contrast:999,maxChangePoints:40,recoveryWindowMs:-500,minConfidence:Infinity}));assert.equal(x.mode,'balanced');assert.equal(x.strength,65);assert.equal(x.contrast,100);assert.equal(x.maxChangePoints,12);assert.equal(x.recoveryWindowMs,15000);assert.equal(x.minConfidence,70);});
test('save/load emits browser update without token',()=>{g.saveGoveeEnergyV924({...config,mode:'cinematic'});assert.equal(g.loadGoveeEnergyV924().mode,'cinematic');assert.ok(events.includes(g.GOVEE_ENERGY_EVENT_V924));assert.doesNotMatch(store.get(g.GOVEE_ENERGY_KEY_V924),/token|endpoint|secret|selectedIps/i);});
test('corrupted storage fails closed',()=>{store.set(g.GOVEE_ENERGY_KEY_V924,'{oops');assert.equal(g.loadGoveeEnergyV924().enabled,false);});
test('feature off is identity',()=>{const x=g.planGoveeEnergyV924(mk(),'track-924',15500,'Deutschrap',section(mk(),15500),{...config,enabled:false});assert.equal(x.active,false);assert.deepEqual(json(apply(x)),base);});
test('strength zero is identity',()=>{assert.equal(plan(15000,{...config,strength:0}).active,false);});
test('max change zero is identity',()=>{assert.equal(plan(15000,{...config,maxChangePoints:0}).active,false);});
test('null analysis fails closed',()=>{assert.equal(g.planGoveeEnergyV924(null,'track-924',15000,'hardstyle',section(mk(),15000),config).active,false);});
test('wrong track ID fails closed',()=>{assert.equal(g.planGoveeEnergyV924(mk(),'other-track',15000,'hardstyle',section(mk(),15000),config).active,false);});
test('invalid progress and after-track value fail',()=>{for(const x of [-5,NaN,Infinity,-Infinity,mk().durationMs])assert.equal(plan(x).active,false);});
test('no V919 confirmation fails',()=>{assert.equal(g.planGoveeEnergyV924(mk(),'track-924',15000,'hardstyle',null,config).active,false);});
test('mismatched V919 label fails',()=>{assert.equal(g.planGoveeEnergyV924(mk(),'track-924',15000,'hardstyle',{...section(mk(),15000),phase:'drop'},config).active,false);});
test('mismatched section confidence fails',()=>{assert.equal(g.planGoveeEnergyV924(mk(),'track-924',15000,'hardstyle',{...section(mk(),15000),confidence:.75},config).active,false);});
test('low confidence section fails closed',()=>{assert.equal(plan(15000,{...config,minConfidence:80},mk(labels,.75)).active,false);});
test('exact confidence threshold accepted',()=>{assert.equal(plan(15000,{...config,minConfidence:75},mk(labels,.75)).active,true);});
test('invalid section times and labels fail',()=>{
 const a=mk();a.sections[0].startMs=Infinity;assert.equal(g.planGoveeEnergyV924(a,a.trackId,15000,'hardstyle',section(mk(),15000),config).active,false);
 const b=mk();b.sections[1].label='unknown';assert.equal(plan(15000,config,b).active,false);
});
test('hardstyle drop stronger than its verse',()=>{assert.ok(plan(65500).energy>plan(5500).energy);});
test('break creates recovery instead of another peak',()=>{assert.ok(plan(45500).energy<0);assert.ok(apply(plan(45500)).brightness<base.brightness);});
test('build-up rises toward verified drop',()=>{assert.ok(plan(50500).energy<plan(59000).energy);});
test('identical hooks receive weaker additional energy when close together',()=>{assert.ok(plan(15500).energy>plan(35500).energy);});
test('quiet break gives later peaks more headroom',()=>{
 const a=mk(['hook','hook','hook','hook','hook','hook','drop','hook']);
 const b=mk(['hook','break','verse','break','verse','build','drop','hook']);
 const energyA=plan(65500,config,a).energy,energyB=plan(65500,config,b).energy;
 assert.ok(energyB>energyA,`${energyA} ${energyB}`);
});
test('cinematic verse is quieter than festival verse',()=>{assert.ok(plan(6500,{...config,mode:'cinematic'}).energy<plan(6500,{...config,mode:'festival'}).energy);});
test('stronger contrast increases dynamic span',()=>{const h=plan(15500,{...config,contrast:100});const l=plan(15500,{...config,contrast:0});assert.ok(h.energy>l.energy);});
test('supported genre intensity is bounded and subtle',()=>{const hs=plan(65500,config,mk(),'hardstyle');const rock=plan(65500,config,mk(),'deutschrock');assert.ok(hs.energy>=rock.energy);});
test('unknown genre can use safe balanced fallback',()=>{assert.equal(plan(15500,config,mk(),'unknown-genre').active,true);});
test('pure planner is deterministic',()=>{assert.deepEqual(json(plan()),json(plan()));});
test('progress change of 1ms does not create a brightness jump',()=>{assert.ok(Math.abs(plan(15000).energy-plan(15001).energy)<.02);});
test('RGB preserved across entire song',()=>{for(let i=500;i<90000;i+=701){const out=apply(plan(i));assert.deepEqual(json(out.color),base.color);assert.equal('power' in out,false);}});
test('rhythm reacts more than ambient',()=>{const d=plan(65500);assert.ok(apply(d,config,'rhythm').brightness>=apply(d,config,'ambient').brightness);});
test('max additive change bounded to 12 points',()=>{for(let i=500;i<90000;i+=997){const result=apply(plan(i,{...config,strength:100,maxChangePoints:12}),{...config,strength:100,maxChangePoints:12});assert.ok(Math.abs(result.brightness-base.brightness)<=12,result.brightness);}});
test('dim master ceiling still respected without decreasing brighter stored cue',()=>{const out=apply(plan(65500),config,'rhythm',{...base,brightness:92},30);assert.ok(out.brightness>=92&&out.brightness<=100);});
test('dimming never creates artificial blackout',()=>{const out=apply(plan(45000),{...config,strength:100,maxChangePoints:12},'rhythm',{...base,brightness:23});assert.ok(out.brightness>=20);});
test('disabled decision never changes light',()=>{assert.deepEqual(json(apply({...plan(),active:false})),base);});
test('preview is synthetic and stable, contains all phases',()=>{const p=json(g.previewGoveeEnergyV924(config,'hardstyle','wall'));assert.equal(p.length,9);assert.ok(p.some(x=>x.label==='drop'));assert.ok(p.every(x=>x.decision.active&&x.brightness>=1&&x.brightness<=100));});
test('preview makes early and later hook brightness distinct',()=>{const p=json(g.previewGoveeEnergyV924(config,'hardstyle','rhythm'));assert.notEqual(p[1].brightness,p[3].brightness);});
test('5,000 song phase/role/intensity combinations keep sane bounds',()=>{
 const roles=['wall','rhythm','neon','ambient'];const styles=['balanced','cinematic','festival'];const genres=['deutschrap','hardtekk','hardstyle','deutschrock'];const a=mk();
 for(let i=0;i<5000;i++){
  const s={...config,mode:styles[i%3],strength:i%101,contrast:(i*7)%101,maxChangePoints:i%13,
   recoveryWindowMs:15000+(i%16)*5000};const pos=(i*237)%a.durationMs;
  const d=plan(pos,s,a,genres[i%4]);const b={...base,brightness:20+i%81};const out=apply(d,s,roles[i%4],b,30+i%71);
  assert.ok(out.brightness>=1&&out.brightness<=100&&Number.isInteger(out.brightness),i);
  assert.deepEqual(json(out.color),base.color);
 }
});
test('integration uses single existing LAN dispatch; group dimmer runs last',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 const lan=read('components/GoveeLanPanelV909.tsx');
 assert.match(sync,/const energyDecision=sectionDecision\?planGoveeEnergyV924/);
 assert.match(sync,/const energyLook=energyDecision\?\.active\?applyGoveeGroupBrightnessV915\(/);
 assert.match(sync,/applyGoveeEnergyV924\(/);
 assert.match(sync,/const deliveredLook=energyDecision\?\.active\?easeGoveeLookV911\(previous,energyLook\):look/);
 assert.match(sync,/value:finalLook/); // V958 preserves energy result and adds opt-in, post-mix safety gate
 assert.match(sync,/festivalDeliveredLook=deliveredLook/);
 assert.equal((sync.match(/'\/command','POST'/g)||[]).length,1);
 assert.match(lan,/GoveeLightEnergyStudioV924/);
});
test('settings are opt-in, integrated with the legacy sync dependency key',()=>{
 const sync=read('components/GoveeMusicSyncV909.tsx');
 const dependencies=sync.match(/},\[([^\]\n]+)\]\);\s*return null;\s*}/)?.[1]?.split(',');
 assert(dependencies,'single Govee send effect must declare dependencies');
 for(const name of ['config','showLibrary','groups','bassSettings','beatSettings',
  'sectionSettings','genreSettings','cinematicSettings','shockSettings',
  'neonSettings','energySettings','festivalSettings','spatialSettings',
  'calibrationSettings','roadmapSettings','syncSettingsV1027'])
   assert(dependencies.includes(name),'missing send effect dependency: '+name);
 assert.match(sync,/GOVEE_ENERGY_EVENT_V924/);
 assert.match(read('components/GoveeLightEnergyStudioV924.tsx'),/previewGoveeEnergyV924/);
});
test('build and CI keep v924 checks without removing v923 checks',()=>{
 const pkg=JSON.parse(read('package.json'));
 for(const command of ['test:v924','test:v924:types','test:v924:ui-types'])assert.ok(pkg.scripts[command]);
 assert.ok(pkg.scripts.prebuild.indexOf('test:v924')<pkg.scripts.prebuild.indexOf('test:v923'));
 const ci=read('.github/workflows/v832-continuous-validation.yml');assert.match(ci,/V924 Govee Intelligent Light Energy Director/);
 assert.match(ci,/V923 Govee Neon Pulse Experience/);
});
console.log(`V924 PASS: ${n} Testgruppen und 5000 deterministische Song-/Lichtzustände.`);

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compiled=(file,jsx=false)=>{
 const r=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!r.diagnostics?.some(x=>x.category===ts.DiagnosticCategory.Error),file+' failed parse');
 return r.outputText;
};
const run=(file,deps={})=>{
 const module={exports:{}};
 vm.runInNewContext(compiled(file),{module,exports:module.exports,Math,Number,JSON,Map,Set,
  require:name=>{if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);}});
 return module.exports;
};
const v982=run('lib/immersiveAiDirectorV982.ts');
const v983=run('lib/aiSongIntelligenceV983.ts',{'./immersiveAiDirectorV982':v982});
const v984=run('lib/aiConcertStoryV984.ts',{'./aiSongIntelligenceV983':v983,'./immersiveAiDirectorV982':v982});
const v986=run('lib/aiAtmosphereDesignerV986.ts',{
 './aiConcertStoryV984':v984,'./aiSongIntelligenceV983':v983,'./immersiveAiDirectorV982':v982});
const v354=run('services/stageContent/showTimelineV354.ts');
const v985=run('lib/predictiveShowTimelineV985.ts',{
 './aiConcertStoryV984':v984,'../services/stageContent/showTimelineV354':v354});
const v987=run('lib/goveeAtmosphereSyncV987.ts',{
 './aiAtmosphereDesignerV986':v986,'./predictiveShowTimelineV985':v985});
const insight=v983.localSongInsightV983({title:'Probe',artist:'Künstler',genre:'Deutschrap',durationMs:200000});
const story=v984.localConcertStoryV984(insight,'cinematic');
const plan=v986.localAtmospherePlanV986(story,insight.mood);
const now=3000000;
const snapshot={trackId:'track:987',durationMs:200000,progressMs:55000,playing:true,source:'verified-v604',
 scenes:[
  {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:10000,endMs:30000},
  {index:1,actIndex:1,section:'hook',intent:'ensemble',startMs:50000,endMs:70000},
  {index:2,actIndex:2,section:'build',intent:'rise',startMs:90000,endMs:110000},
  {index:3,actIndex:3,section:'drop',intent:'pulse',startMs:140000,endMs:160000},
  {index:4,actIndex:4,section:'break',intent:'breath',startMs:181000,endMs:196000}
 ]};
const policy={enabled:true,playing:true,visible:true};
const session=v987.createRoomAtmosphereSessionV987(plan,snapshot,snapshot.trackId,snapshot.durationMs,now);
const decide=(snap=snapshot,ses=session,flags=policy,progress=55000,time=now+3000)=>
 v987.planRoomAtmosphereV987(ses,snap,snapshot.trackId,snapshot.durationMs,progress,time,flags);
const look={color:{r:110,g:110,b:100},brightness:45};
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('PASS V987 '+name);};
test('explicit click creates a normalized, track-bound, memory-only session',()=>{
 assert(session);assert.equal(session.trackId,'track:987');assert.equal(session.durationMs,200000);
 assert.equal(session.approvedAt,now);assert.equal(session.plan.physicalControl,false);
 assert(v987.normalizeRoomAtmosphereSessionV987(session));
 assert.equal(v987.createRoomAtmosphereSessionV987({...plan,acts:[]},snapshot,snapshot.trackId,200000,now),null);
 assert.equal(v987.createRoomAtmosphereSessionV987(plan,{...snapshot,source:'unavailable'},snapshot.trackId,200000,now),null);
 assert.equal(v987.createRoomAtmosphereSessionV987(plan,{...snapshot,playing:false},snapshot.trackId,200000,now),null);
});
test('no stored or implied hardware consent from untrusted objects',()=>{
 for(const x of [null,{},[],{...session,approvedAt:0},{...session,durationMs:999},
  {...session,trackId:''},{...session,trackId:'x'.repeat(161)},
  {...session,plan:{...plan,acts:[]}},{...session,approvedAt:NaN}])
  assert.equal(v987.normalizeRoomAtmosphereSessionV987(x),null);
});
test('missing, mismatched, stale and expired contexts fail closed',()=>{
 for(const s of [null,{...session,trackId:'other'},{...session,durationMs:201000}])
  assert.equal(decide(snapshot,s).active,false);
 for(const s of [null,{...snapshot,source:'unavailable'},{...snapshot,playing:false},
  {...snapshot,trackId:'other'},{...snapshot,durationMs:201000},{...snapshot,progressMs:30000}])
  assert.equal(decide(s).active,false);
 assert(!decide(snapshot,session,policy,55000,now-1).active);
 assert(!decide(snapshot,session,policy,55000,now+3600001).active);
 assert(!decide(snapshot,session,policy,35000).active); // unverified scene gap
 assert(!decide(snapshot,session,policy,25000).active); // snapshot clock stale on seek
});
test('manual show, authored cues, voice, recovery and accessibility all win',()=>{
 for(const flag of ['savedShowActive','authoredStageActive','recovering','reducedMotion','voiceActive'])
  assert.equal(decide(snapshot,session,{...policy,[flag]:true}).active,false,flag);
 for(const flag of ['enabled','playing','visible'])
  assert.equal(decide(snapshot,session,{...policy,[flag]:false}).active,false,flag);
});
test('confirmed scenes map only to creative visual motifs, not invented beat times',()=>{
 for(let i=0;i<5;i++){
  const start=snapshot.scenes[i].startMs;
  const result=decide({...snapshot,progressMs:start+100},session,policy,start+100);
  assert(result.active);assert.equal(result.actIndex,Math.min(4,Math.floor(start/200000*5)));
  assert(result.accent.startsWith('#'));assert(result.tint<=.24);assert(result.dim<=.10);
 }
});
test('safe whole-lamp tint never increases brightness or bypasses group/master ceilings',()=>{
 const decision=decide();assert(decision.active);
 for(const role of ['wall','rhythm','neon','ambient']){
  const next=v987.applyRoomAtmosphereV987(look,undefined,decision,role,65);
  assert(next.brightness<=look.brightness);assert(next.brightness<=65);
  assert.notDeepEqual({...next.color},{...look.color});
 }
 const constrained=v987.applyRoomAtmosphereV987(look,undefined,decision,'wall',25);
 assert(constrained.brightness<=25);
});
test('previous look caps changes to 24 RGB levels per existing tick',()=>{
 const decision=decide();
 for(let i=0;i<10000;i++){
  const initial={color:{r:i%256,g:(i*3)%256,b:(i*7)%256},brightness:i%101};
  const previous={color:{r:(i*11)%256,g:(i*13)%256,b:(i*17)%256},brightness:i%101};
  const result=v987.applyRoomAtmosphereV987(initial,previous,decision,'neon',100);
  for(const c of ['r','g','b']){
   assert(result.color[c]>=0&&result.color[c]<=255);
   assert(Math.abs(result.color[c]-previous.color[c])<=24);
  }
  assert(result.brightness<=initial.brightness);
 }
});
test('invalid transform data and disabled decision preserve reference exactly',()=>{
 const disabled=decide(snapshot,session,{...policy,enabled:false});
 assert.strictEqual(v987.applyRoomAtmosphereV987(look,undefined,disabled,'wall',65),look);
 const choice=decide();
 for(const d of [{...choice,accent:'red'},{...choice,tint:2},{...choice,dim:1}])
  assert.strictEqual(v987.applyRoomAtmosphereV987(look,undefined,d,'wall',65),look);
 assert.strictEqual(v987.applyRoomAtmosphereV987(look,undefined,choice,'wall',NaN),look);
});
test('only existing V909 sender performs I/O; no independent driver is created',()=>{
 const source=read('lib/goveeAtmosphereSyncV987.ts').toLowerCase();
 for(const forbidden of ['fetch(', 'goveebridgerequest(', 'setinterval(', 'settimeout(',
  'websocket(', 'localstorage.', 'onoff', 'poweron'])assert(!source.includes(forbidden),forbidden);
 const sender=read('components/GoveeMusicSyncV909.tsx');
 assert(sender.includes('planRoomAtmosphereV987(roomAtmosphereV987.current'));
 assert(sender.includes('applyRoomAtmosphereV987(recoveryLookV961,previous,roomDecisionV987'));
 assert(sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
 assert(sender.indexOf('applyRoomAtmosphereV987(recoveryLookV961')<sender.indexOf('governConcertLookV961(previous,syncedLookV1027'));
});
test('UI requires a second explicit click and allows immediate revocation',()=>{
 const ui=read('components/visualizer/AtmosphereDesignerV986.tsx');
 for(const snippet of ['Govee-Raumlicht für diesen Song freigeben','Raumlicht-Sync sofort beenden',
  'createRoomAtmosphereSessionV987(plan,currentBridge,trackId,durationMs,Date.now())',
  'new CustomEvent(GOVEE_ROOM_ATMOSPHERE_EVENT_V987,{detail:null})',
  'if(!cfg.enabled||!cfg.autoSync||!cfg.token||cfg.selectedIps.length===0)',
  'setRoomApproved(true)'])assert(ui.includes(snippet),snippet);
 assert(!ui.includes('/api/govee/'));
});
test('all changed TS/TSX files parse using project TypeScript',()=>{
 for(const f of ['lib/goveeAtmosphereSyncV987.ts','components/GoveeMusicSyncV909.tsx',
  'components/visualizer/AtmosphereDesignerV986.tsx'])compiled(f,f.endsWith('.tsx'));
});
test('build and release metadata include V987 before V986',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(Number(pkg.sonicRoadmapRelease.slice(1))>=987);
 assert(pkg.scripts.prebuild.includes('npm run test:v987 && npm run test:v987:types &&'));
 assert(pkg.scripts['test:v987']);assert(pkg.scripts['test:v987:types']);
 assert(read('scripts/vercel-production-build.cjs').includes('V987 Govee Immersive Sync 2.0'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V987 Govee Immersive Sync 2.0'));
 assert(read('tests/tsconfig.v987-core.json').includes('goveeAtmosphereSyncV987.ts'));
});
console.log('V987 PASS '+checks+' regression groups + 10,000 deterministic lamp states');

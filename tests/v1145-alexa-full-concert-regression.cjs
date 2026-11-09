'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let ui={stageTheme:'neon',stageRotationEnabledV1031:false,arenaShowDirectorEnabledV1034:false,
 arenaFullSongDirectorEnabledV1035:false,arenaConcertDirectorEnabledV1048:false,
 arenaUltimateConcertEnabledV1052:false,arenaSmartConcertFlowEnabledV1071:false,
 avatarConcertDirectorModeV386:'off',reducedMotion:false};
let roadmap={schema:'ultimate-concert-v958',enabled:false,hardwareSync:true,virtualFx:false,
 transitionsV960:false,lightGovernorV961:false,narrativeV962:false,immersiveV966:false,
 energyArcV975:false,intelligentTransitionsV976:false,storytellingV977:false,
 atmosphereV978:false,liveShowDirectorV979:false,concertPresetV969:'off',
 timeline:{'song-1':[{atMs:30000,phase:'hook',camera:'close'}]},presets:[{id:'manual',name:'Original'}]};
let govee={enabled:true,autoSync:false,token:'token-unit-test',selectedIps:['192.168.1.10'],endpoint:'http://127.0.0.1:8765'};
let goveeConsent=false,updates=[],roadmapWrites=0,physicalRequests=0;
const storage=new Map(),window=new EventTarget();
const localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
const src=ts.transpileModule(read('lib/alexaFullConcertV1145.ts'),{fileName:'lib/alexaFullConcertV1145.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(src.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
vm.runInNewContext(src.outputText,{module:mod,exports:mod.exports,window,localStorage,Event,Date,Number,Object,JSON,
 require:id=>{
  if(id==='./ultimateConcertRoadmapV958')return {loadConcertRoadmapV958:()=>({...roadmap}),
   saveConcertRoadmapV958:value=>{roadmap=value;roadmapWrites++;}};
  if(id==='./goveeLanV909')return {loadGoveeConfigV909:()=>({...govee,selectedIps:[...govee.selectedIps]}),
   saveGoveeConfigV909:value=>{govee=value;}};
  if(id==='./goveePowerV1138')return {canExecuteGoveePowerV1138:c=>c.enabled&&!!c.token&&c.selectedIps.length>0};
  if(id==='./goveeMusicVoiceV1143')return {loadGoveeSyncConsentV1143:()=>({enabled:goveeConsent})};
  throw Error('Unexpected runtime dependency '+id);
 }});
const api=mod.exports;
const update=patch=>{updates.push(patch);ui={...ui,...patch};};
const options=extra=>({preferences:ui,updatePreferences:update,connected:true,playing:true,trackId:'song-1',...extra});
(async()=>{
 assert(!api.loadFullConcertConsentV1145().enabled);
 const now=Date.now(),fresh=(command,createdAt=now)=>({command,createdAt});
 let since=now-2000;
 const voiceOptions=extra=>({since,now:()=>Date.now(),allowed:()=>api.loadFullConcertConsentV1145().enabled,
  ...options(),...extra});
 assert(api.isFullConcertVoiceCommandV1145('concert-show-start'));
 assert(!api.isFullConcertVoiceCommandV1145('govee-power-on'));
 assert.throws(()=>api.executeAlexaFullConcertV1145(fresh('concert-show-start'),voiceOptions()),/widerrufen/);
 api.saveFullConcertConsentV1145(true,false);
 assert.throws(()=>api.runFullConcertV1145('concert-show-start',options({playing:false})),/Spotify/);
 assert(!api.readFullConcertSnapshotV1145(),'invalid start must not leave snapshot');
 const start=api.executeAlexaFullConcertV1145(fresh('concert-show-start'),voiceOptions());
 assert.equal(start.kind,'complete');assert.match(start.text,/360-Grad-Arena/);
 assert.equal(ui.stageTheme,'arena360');assert.equal(ui.arenaUltimateConcertEnabledV1052,true);
 assert.equal(ui.avatarConcertDirectorModeV386,'subtle');
 assert.equal(roadmap.enabled,true);assert.equal(roadmap.hardwareSync,false);
 assert.equal(roadmap.timeline['song-1'][0].camera,'close','authored cue must remain');
 assert.equal(roadmap.presets[0].name,'Original');
 assert.equal(govee.autoSync,false,'Govee must be unchanged without separate opt-in');
 assert.match(api.runFullConcertV1145('concert-show-start',options()),/bereits/);
 assert.equal(roadmapWrites,1,'duplicate start must be idempotent');
 const stop=api.executeAlexaFullConcertV1145(fresh('concert-show-stop'),voiceOptions());
 assert.match(stop.text,/beendet/);assert.equal(ui.stageTheme,'neon');assert.equal(roadmap.enabled,false);
 assert.equal(roadmap.hardwareSync,false,'voice must never re-enable roadmap hardware control');
 assert.equal(roadmap.timeline['song-1'][0].camera,'close');
 // Manual user changes to a show-owned field must survive Stop.
 api.runFullConcertV1145('concert-show-start',options());
 ui={...ui,stageTheme:'cyberpunk'};
 api.runFullConcertV1145('concert-show-stop',options());
 assert.equal(ui.stageTheme,'cyberpunk');
 // Reduced motion must not be overridden by show.
 ui={...ui,reducedMotion:true};
 api.runFullConcertV1145('concert-show-start',options());
 assert.equal(ui.stageRotationEnabledV1031,false);api.runFullConcertV1145('concert-show-stop',options());
 // Govee is opt-in twice; Alexa's consent alone cannot activate it.
 api.saveFullConcertConsentV1145(true,true);
 api.runFullConcertV1145('concert-show-start',options());assert.equal(govee.autoSync,false);
 api.runFullConcertV1145('concert-show-stop',options());
 goveeConsent=true;
 api.runFullConcertV1145('concert-show-start',options());assert.equal(govee.autoSync,true);
 api.runFullConcertV1145('concert-show-stop',options());assert.equal(govee.autoSync,false);
 assert.equal(physicalRequests,0,'full concert must not issue UDP power or network operations');
 assert.equal(api.readFullConcertSnapshotV1145(),null,'stop must clear owned snapshot');
 api.saveFullConcertConsentV1145(false);
 assert.throws(()=>api.executeAlexaFullConcertV1145(fresh('concert-show-start'),voiceOptions()),/widerrufen/);
 assert.throws(()=>api.executeAlexaFullConcertV1145(fresh('concert-show-start',now-60000),voiceOptions()),/abgelaufen|widerrufen/);
 const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel.intents;
 const lambda=require('../integrations/alexa/voice-v1008.cjs');
 for(const [intent,command] of [['FullConcertStartIntent','concert-show-start'],['FullConcertStopIntent','concert-show-stop']]){
  assert.equal(lambda.COMMANDS[intent],command);assert(model.find(x=>x.name===intent)?.samples.length>=4);
 }
 for(const f of ['components/AlexaSettingsV1137.tsx','components/AlexaVoiceControlV1008.tsx']){
  assert(read(f).includes('FullConcert'),f);
 }
 assert(read('components/AlexaVoiceControlV1008.tsx').includes("category==='show'"));
 assert(!read('app/api/alexa/govee-pending/route.ts').includes('concert-show-start'),'narrow Govee receiver must not be broadened');
 assert(read('scripts/vercel-production-build.cjs').includes('v1145-alexa-full-concert-regression.cjs'));
 console.log('PASS V1145: explicit voice opt-in, Spotify playing gate, 360° arena, protected manual timeline, separate Govee consent, reversible show, reduced motion');
})().catch(e=>{console.error(e);process.exitCode=1;});

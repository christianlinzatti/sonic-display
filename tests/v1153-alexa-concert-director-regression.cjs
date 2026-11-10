'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const tsFile=read('lib/alexaConcertVoiceDirectorV1153.ts');
const result=ts.transpileModule(tsFile,{fileName:'lib/alexaConcertVoiceDirectorV1153.ts',
 reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(result.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const priorUi={stageTheme:'arena360',arenaShowIntensityV1035:65,reducedMotion:false};
const priorRoad={schema:'ultimate-concert-v958',hardwareSync:false,concertPresetV969:'arena',
 voiceMoodV968:'auto',liveShowStyleV979:'adaptive',strength:50,energyArcStrengthV975:50,
 atmosphereStrengthV978:50,liveShowStrengthV979:50,timeline:{'song-one':[{atMs:5000,phase:'hook'}]},
 presets:[{id:'manual',name:'Custom Preset'}]};
let ui={...priorUi},road={...priorRoad},writes=0,uiWrites=0,hardwareCalls=0,quota=false;
const store=new Map(),window=new EventTarget();
const localStorage={
 getItem:key=>store.get(key)||null,
 setItem:(key,value)=>{if(quota)throw Error('Storage quota');store.set(key,String(value));},
 removeItem:key=>store.delete(key)
};
const mod={exports:{}};
vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,window,localStorage,Event,Date,Number,Object,Math,Set,JSON,
 require:id=>{
  assert.equal(id,'./ultimateConcertRoadmapV958');
  return {loadConcertRoadmapV958:()=>({...road}),saveConcertRoadmapV958:value=>{road={...value};writes++;}};
 }});
const api=mod.exports;
const update=patch=>{ui={...ui,...patch};uiWrites++;};
const allowed=()=>api.loadDirectorConsentV1153().enabled;
const options=extra=>({preferences:ui,updatePreferences:update,showActive:true,
 connected:true,playing:true,trackId:'song-one',allowed,...extra});
const cmd=(command,createdAt=Date.now())=>({command,createdAt});
const all=[
 'concert-director-stage-arena','concert-director-stage-festival','concert-director-stage-club',
 'concert-director-mood-warm','concert-director-mood-cool','concert-director-mood-neon','concert-director-mood-auto',
 'concert-director-energy-calm','concert-director-energy-balanced','concert-director-energy-intense'];
assert.equal(api.DIRECTOR_COMMANDS_V1153.length,10);
assert(all.every(c=>api.isAlexaDirectorCommandV1153(c)));
assert(!api.isAlexaDirectorCommandV1153('govee-power-on'));
assert.throws(()=>api.planVoiceDirectorV1153('concert-director-burn-the-world',false),/Unbekannter/);
for(const c of all){
 const plan=api.planVoiceDirectorV1153(c,false);
 assert.equal(plan.hardwareSync,false);
 assert(!Object.prototype.hasOwnProperty.call(plan.road,'hardwareSync'));
 assert(Object.keys(plan.road).every(x=>!['presets','timeline','roleOverrides'].includes(x)));
}
assert.equal(api.planVoiceDirectorV1153('concert-director-stage-festival',false).ui.stageTheme,'festival');
assert.equal(api.planVoiceDirectorV1153('concert-director-stage-club',false).ui.stageTheme,'neon');
assert.equal(api.planVoiceDirectorV1153('concert-director-mood-neon',false).road.voiceMoodV968,'neon');
assert.equal(api.planVoiceDirectorV1153('concert-director-energy-intense',false).road.strength,80);
assert.equal(api.planVoiceDirectorV1153('concert-director-energy-intense',true).road.strength,40);
assert.equal(api.planVoiceDirectorV1153('concert-director-energy-balanced',true).ui.arenaShowIntensityV1035,40);
assert(!api.loadDirectorConsentV1153().enabled,'independent opt-in default off');
assert.throws(()=>api.applyVoiceDirectorV1153(all[1],options()),/widerrufen/);
api.saveDirectorConsentV1153(true);
assert.throws(()=>api.applyVoiceDirectorV1153(all[1],options({showActive:false})),/zuerst/);
assert.throws(()=>api.applyVoiceDirectorV1153(all[1],options({playing:false})),/Spotify/);
assert.throws(()=>api.applyVoiceDirectorV1153(all[1],options({signal:{aborted:true}})),/widerrufen/);
assert.equal(writes,0);
quota=true;assert.throws(()=>api.applyVoiceDirectorV1153(all[1],options()),/Storage quota/);
assert.equal(writes,0);assert.equal(uiWrites,0);quota=false;
const since=Date.now()-1000;
const voice=extra=>({since,now:Date.now,allowed,...options(),...extra});
assert.throws(()=>api.executeAlexaDirectorV1153(cmd(all[1],Date.now()-65000),voice()),/abgelaufen/);
assert.throws(()=>api.executeAlexaDirectorV1153(cmd(all[1]),voice({since:Date.now()+20000})),/abgelaufen/);
const done=api.executeAlexaDirectorV1153(cmd(all[1]),voice());
assert.equal(done.kind,'complete');assert.equal(ui.stageTheme,'festival');
assert.equal(road.concertPresetV969,'festival');assert.equal(road.liveShowStyleV979,'festival');
assert.equal(road.timeline['song-one'][0].atMs,5000);assert.equal(road.presets[0].name,'Custom Preset');
assert.equal(road.hardwareSync,false);assert.equal(hardwareCalls,0);
api.applyVoiceDirectorV1153('concert-director-mood-neon',options());
assert.equal(road.voiceMoodV968,'neon');
api.applyVoiceDirectorV1153('concert-director-energy-intense',options());
assert.equal(ui.arenaShowIntensityV1035,80);assert.equal(road.strength,80);
api.applyVoiceDirectorV1153('concert-director-energy-calm',options());
assert.equal(ui.arenaShowIntensityV1035,25,'second voice override succeeds');
api.applyVoiceDirectorV1153('concert-director-stage-club',options());
assert.equal(ui.stageTheme,'neon','second stage override succeeds');
api.restoreVoiceDirectorV1153({preferences:ui,updatePreferences:update});
assert.equal(ui.stageTheme,'arena360');
assert.equal(ui.arenaShowIntensityV1035,65);
assert.equal(road.concertPresetV969,'arena');
assert.equal(road.voiceMoodV968,'auto');
assert.equal(road.strength,50);
assert.equal(store.has(api.ALEXA_DIRECTOR_SNAPSHOT_KEY_V1153),false);
assert.equal(road.hardwareSync,false);
// A later manual edit takes precedence; only other voice-owned fields restore.
api.applyVoiceDirectorV1153('concert-director-stage-festival',options());
api.applyVoiceDirectorV1153('concert-director-energy-intense',options());
ui={...ui,stageTheme:'rock',arenaShowIntensityV1035:36};
road={...road,voiceMoodV968:'warm',strength:71};
api.restoreVoiceDirectorV1153({preferences:ui,updatePreferences:update});
assert.equal(ui.stageTheme,'rock');assert.equal(ui.arenaShowIntensityV1035,36);
assert.equal(road.strength,71);assert.equal(road.concertPresetV969,'arena');
assert.equal(road.hardwareSync,false);
api.saveDirectorConsentV1153(false);
assert.throws(()=>api.executeAlexaDirectorV1153(cmd(all[0]),voice()),/widerrufen/);
const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
const lambda=require('../integrations/alexa/voice-v1008.cjs');
const names=['DirectorStageArenaIntent','DirectorStageFestivalIntent','DirectorStageClubIntent',
 'DirectorMoodWarmIntent','DirectorMoodCoolIntent','DirectorMoodNeonIntent','DirectorMoodAutoIntent',
 'DirectorEnergyCalmIntent','DirectorEnergyBalancedIntent','DirectorEnergyIntenseIntent'];
for(let i=0;i<names.length;i++){
 assert.equal(lambda.COMMANDS[names[i]],all[i],names[i]);
 assert(model.intents.some(x=>x.name===names[i]&&x.samples.length>=3),names[i]);
}
const classifier=require('./helpers/ts-loader-v404.cjs').load('lib/alexaCommandAvailabilityV1148');
const base={general:true,artist:false,display:false,power:false,sync:false,look:false,show:true,roomLooks:false,
 spotifyConnected:true,spotifyPlaying:true,goveeConfigured:false,goveeAutoSync:false,receiverToken:false};
assert.equal(classifier.classifyAlexaIntentV1148(names[0],{...base,director:true,concertActive:true}).kind,'local-ready');
assert.equal(classifier.classifyAlexaIntentV1148(names[0],{...base,director:false,concertActive:true}).kind,'needs-setup');
assert.equal(classifier.classifyAlexaIntentV1148(names[0],{...base,director:true,concertActive:false}).kind,'needs-setup');
const rx=read('components/AlexaVoiceControlV1008.tsx');
for(const marker of ['executeAlexaDirectorV1153','ALEXA_DIRECTOR_CONSENT_EVENT_V1153',
 'showActive:Boolean(readFullConcertSnapshotV1145())','category===\'director\''])
 assert(rx.includes(marker),'missing live receiver '+marker);
const stop=read('lib/alexaFullConcertV1145.ts');
assert(stop.indexOf('restoreVoiceDirectorV1153(')<stop.indexOf('restoreVirtualConcertSceneV1147();'));
assert(stop.includes('...directorUiRestored'));
assert(read('components/AlexaSettingsV1137.tsx').includes('AlexaConcertVoiceDirectorV1153'));
assert(read('scripts/vercel-production-build.cjs').includes('v1153-alexa-concert-director-regression.cjs'));
for(const path of ['app/api/alexa/govee-pending/route.ts','app/api/alexa/govee-result/route.ts'])
 assert(!read(path).includes('concert-director-'),'Govee-only receiver must not expose stage control');
console.log('PASS V1153: ten strict Alexa concert director cues, opt-ins, live music and show gates, reversible stage and road settings, manual overrides, reduced motion, no Govee power');

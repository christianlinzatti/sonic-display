'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const compiled=ts.transpileModule(read('lib/alexaCommandAvailabilityV1148.ts'),{
 fileName:'lib/alexaCommandAvailabilityV1148.ts',reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
});
assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};vm.runInNewContext(compiled.outputText,{module:mod,exports:mod.exports,Set,Object,Number,Error});
const classify=mod.exports.classifyAlexaIntentV1148;
const base={
 general:false,artist:false,display:false,power:false,sync:false,look:false,show:false,roomLooks:false,
 spotifyConnected:false,spotifyPlaying:false,goveeConfigured:false,goveeAutoSync:false,receiverToken:false
};
const yes={...base,general:true,artist:true,display:true,power:true,sync:true,look:true,show:true,roomLooks:true,
 spotifyConnected:true,spotifyPlaying:true,goveeConfigured:true,goveeAutoSync:true,receiverToken:true};
const kind=(name,options)=>classify(name,options).kind;
assert.equal(kind('LikeArtistIntent',base),'needs-setup');
assert.match(classify('LikeArtistIntent',base).reason,/Spotify verbinden/);
assert.equal(kind('LikeArtistIntent',{...yes,artist:false}),'needs-setup');
assert.equal(kind('LikeArtistIntent',yes),'local-ready');
assert.match(classify('LikeArtistIntent',yes).reason,/Berechtigungen.*nicht/);
assert.equal(kind('LyricsOffIntent',{...yes,display:false}),'needs-setup');
assert.equal(kind('LyricsOffIntent',yes),'local-ready');
assert.equal(kind('ArenaIntent',{...yes,general:false}),'needs-setup');
assert.match(classify('ArenaIntent',yes).reason,/Konzertstudio/);
assert.equal(kind('FullConcertStartIntent',{...yes,spotifyPlaying:false}),'needs-setup');
assert.equal(kind('FullConcertStopIntent',{...yes,spotifyPlaying:false}),'local-ready');
assert.equal(kind('ConcertSceneFinaleIntent',{...yes,show:false}),'needs-setup');
assert.equal(kind('ConcertSceneFinaleIntent',yes),'local-ready');
assert.equal(kind('GoveeBrightnessIntent',{...yes,spotifyConnected:false,receiverToken:true}),'local-ready');
assert.equal(kind('GoveeBrightnessIntent',{...yes,spotifyConnected:false,receiverToken:false}),'needs-setup');
assert.equal(kind('GoveeColorIntent',{...yes,look:false}),'needs-setup');
assert.equal(kind('GoveePowerOffIntent',{...yes,power:false}),'needs-setup');
assert.equal(kind('GoveeGroupOnIntent',yes),'local-ready');
assert.equal(kind('GoveeMusicSyncPauseIntent',{...yes,sync:false}),'needs-setup');
assert.equal(kind('GoveeMusicSyncPauseIntent',yes),'local-ready');
assert.equal(kind('GoveeArenaIntent',{...yes,goveeAutoSync:false}),'needs-setup');
assert.equal(kind('GoveeArenaIntent',{...yes,roomLooks:false}),'needs-setup');
assert.equal(kind('GoveeArenaIntent',yes),'local-ready');
assert.equal(kind('AllCommandsIntent',base),'skill-only');
assert.equal(kind('AMAZON.HelpIntent',base),'skill-only');
assert.equal(kind('LastVoiceResultIntent',base),'skill-only');
assert.equal(kind('a-new-unrecognized-skill-intent',yes),'unclassified');
const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
let count=0;
for(const intent of model.intents){
 if(intent.name==='AMAZON.FallbackIntent')continue;
 assert.notEqual(kind(intent.name,yes),'unclassified','Unclassified model intent '+intent.name);
 count++;
}
assert(count>=60,'Expected full published model catalog');
const ui=read('components/AlexaSettingsV1137.tsx');
for(const marker of ['AlexaCommandHelpV1137','classifyAlexaIntentV1148','Nur lokal vorbereitete Befehle anzeigen',
 'model.interactionModel.languageModel.intents','AWS-Lambda','useMusic','VOICE_SETTINGS_EVENT_V1008',
 'GOVEE_CONFIG_EVENT_V909','ALEXA_FULL_CONCERT_EVENT_V1145']){
 assert(ui.includes(marker),'Missing UI integration: '+marker);
}
assert(read('scripts/vercel-production-build.cjs').includes('v1148-alexa-context-help-regression.cjs'));
const receiver=read('tests/v1008-receiver-regression.cjs');
assert(receiver.includes("'@/lib/alexaConcertScenesV1147':"),'Legacy V1008 receiver must mock new scene module');
console.log('PASS V1148 contextual Alexa help: all '+count+' model intents classified, safe fail-closed defaults, per-feature opt-in, Spotify / Govee receiver fallback, skill limitations and searchable UI');

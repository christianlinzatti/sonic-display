'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function load(sourcePath,deps={}){
 const compiled=ts.transpileModule(read(sourcePath),{
  fileName:sourcePath,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}
 });
 assert.equal(compiled.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,'transpile diagnostics for '+sourcePath);
 const mod={exports:{}};
 vm.runInNewContext(compiled.outputText,{module:mod,exports:mod.exports,
  require:id=>{assert(id in deps,'Unexpected import '+id);return deps[id];},Set,Object,Number,Error,Date,JSON});
 return mod.exports;
}
const classifier=load('lib/alexaCommandAvailabilityV1148.ts');
const help=load('lib/alexaSpokenHelpV1151.ts',{'./alexaCommandAvailabilityV1148':classifier});
const base={general:true,artist:false,display:false,power:false,sync:false,look:false,show:false,
 roomLooks:false,spotifyConnected:false,spotifyPlaying:false,goveeConfigured:false,goveeAutoSync:false,
 receiverToken:false,visible:true,trackAvailable:false,concertActive:false};
assert.equal(help.isAlexaSpokenHelpCommandV1151('voice-context-help'),true);
assert.equal(help.isAlexaSpokenHelpCommandV1151('artist-follow'),false);
const find=c=>help.buildAlexaSpokenHelpV1151({...base,...c});
assert.equal(find({}).examples.length,0);
assert.equal(find({general:false,spotifyConnected:true,artist:true,display:true,goveeConfigured:true,look:true,receiverToken:true}).examples.length,0);
assert.equal(find({visible:false,spotifyConnected:true,show:true,spotifyPlaying:true,trackAvailable:true}).examples.length,0);
const sound=find({spotifyConnected:true,show:true,spotifyPlaying:true,trackAvailable:true,display:true,artist:true});
assert(sound.examples.includes('starte die komplette Konzertshow'));
assert(sound.examples.includes('Lyrics einblenden'));
assert(sound.examples.includes('like den Hauptkünstler'));
assert(!sound.examples.some(s=>s.toLowerCase().includes('govee')));
assert(!find({spotifyConnected:true,show:true,spotifyPlaying:true,trackAvailable:false}).examples.some(s=>s.includes('Konzertshow')));
assert(!find({spotifyConnected:true,show:true,spotifyPlaying:false,trackAvailable:true}).examples.some(s=>s.includes('Konzertshow')));
const active=find({spotifyConnected:true,show:true,spotifyPlaying:false,concertActive:true});
assert(active.examples.includes('beende die komplette Konzertshow'));
assert(!active.examples.includes('starte die komplette Konzertshow'));
const dark=find({receiverToken:true,goveeConfigured:true,look:true,sync:true,power:true});
assert(dark.examples.some(s=>s.includes('Govee')));
assert(!dark.examples.some(s=>s.includes('Lyrics')||s.includes('Künstler')||s.includes('Konzertshow')));
assert(dark.examples.includes('starte Govee Musiksynchronisation'));
const sync=find({receiverToken:true,goveeConfigured:true,sync:true,goveeAutoSync:true});
assert(sync.examples.includes('pausiere Govee Musiksynchronisation'));
assert(!sync.examples.includes('starte Govee Musiksynchronisation'));
const noToken=find({goveeConfigured:true,look:true,sync:true,power:true});
assert.equal(noToken.examples.length,0);
assert(!find({receiverToken:true,goveeConfigured:false,look:true,sync:true,power:true}).examples.length);
for(const c of [base,{...base,...sound},{...base,...dark}, {...base,spotifyConnected:true,show:true,artist:true,display:true,look:true,power:true,sync:true,receiverToken:true,spotifyPlaying:true,trackAvailable:true,goveeConfigured:true}]){
 const r=find(c);assert(r.text.length>0&&r.text.length<=1200);
 assert(!r.text.includes('192.168.')&&!r.text.includes('Bearer')&&!r.text.includes('token'));
 assert(r.examples.length<=4);
}
const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
const intent=model.intents.find(x=>x.name==='AvailableCommandsIntent');
assert(intent&&intent.samples.length>=5);
assert.equal(classifier.classifyAlexaIntentV1148('AvailableCommandsIntent',{...base,spotifyConnected:true}).kind,'local-ready');
assert.equal(classifier.classifyAlexaIntentV1148('AvailableCommandsIntent',{...base,general:false}).kind,'needs-setup');
assert.equal(classifier.classifyAlexaIntentV1148('AvailableCommandsIntent',{...base,receiverToken:true}).kind,'local-ready');
const voice=require('../integrations/alexa/voice-v1008.cjs');
assert.equal(voice.COMMANDS.AvailableCommandsIntent,'voice-context-help');
assert(read('lib/alexaVoiceV1008.ts').includes("'voice-context-help'"));
const component=read('components/AlexaVoiceControlV1008.tsx');
for(const marker of ['buildAlexaSpokenHelpV1151','readFullConcertSnapshotV1145','freshVoiceV1008(message,p.general.since','trackAvailable:','isAlexaSpokenHelpCommandV1151'])
 assert(component.includes(marker),'Missing receiver integration '+marker);
for(const p of ['app/api/alexa/govee-pending/route.ts','app/api/alexa/govee-result/route.ts'])
 assert(read(p).includes('isAlexaSpokenHelpCommandV1151'),'Govee-only help relay missing: '+p);
assert(read('components/AlexaSettingsV1137.tsx').includes("'AvailableCommandsIntent'"));
assert(read('scripts/vercel-production-build.cjs').includes('v1151-alexa-spoken-help-regression.cjs'));
console.log('PASS V1151: permission-scoped, time-of-request Alexa voice help, scene/sync context, Govee-only receiver and no private data');

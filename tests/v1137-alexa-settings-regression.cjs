'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {handler}=require('../integrations/alexa/handler.cjs');
const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const ui=read('components/AlexaSettingsV1137.tsx');
const settings=read('components/SettingsPanel.tsx');
const concert=read('components/AlexaConcertControlV967.tsx');
const main=read('integrations/alexa/handler.cjs');
(async()=>{
 assert.ok(settings.includes('AlexaSettingsV1137')&&settings.includes('tab === "alexa"'),'Own Alexa settings tab missing');
 assert.ok(ui.includes('AlexaCommandHelpV1137')&&ui.includes('model.interactionModel.languageModel.intents'),'Help must use the real interaction model');
 for(const key of ['ALEXA_LOCAL_ENABLED_KEY_V967','AlexaArtistPermissionV1007','AlexaToolsV1008','saveAlexaGoveeConsentV970'])assert.ok(ui.includes(key),key);
 for(const intent of model.intents){
  if(intent.name==='AMAZON.FallbackIntent')continue;
  assert.ok(ui.includes("'"+intent.name+"'"),'Intent not categorized: '+intent.name);
 }
 assert.equal(new Set(model.intents.map(v=>v.name)).size,model.intents.length,'Alexa intent names must be unique');
 assert.ok(model.intents.some(v=>v.name==='AllCommandsIntent'&&v.samples.includes('welche befehle gibt es')));
 assert.ok(main.includes("intent==='AllCommandsIntent'"),'Alexa spoken-help handler missing');
 assert.ok(concert.includes("window.addEventListener('sonic-display:alexa-local-status-v971',synchronize)"),'Concert permission must sync with settings');
 const env={...process.env};
 const skill='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
 try{
  Object.assign(process.env,{ALEXA_SKILL_ID:skill,ALEXA_ALLOWED_USER_ID:'owner',ALEXA_BRIDGE_SECRET:'unit-test-bridge-secret-at-least-32-characters',SONIC_DISPLAY_ORIGIN:'https://sonic-display.test'});
  const evt=name=>({session:{application:{applicationId:skill},user:{userId:'owner'}},request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}});
  const help=await handler(evt('AllCommandsIntent'));
  assert.match(help.response.outputSpeech.text,/Einstellungen/);
  assert.equal(help.response.shouldEndSession,false);
  const wrong=evt('AllCommandsIntent');wrong.session.user.userId='other';
  assert.match((await handler(wrong)).response.outputSpeech.text,/nicht freigeschaltet/);
 }finally{process.env=env;}
 console.log('PASS Alexa V1137: settings tab, permissions, complete model-backed searchable help and verified voice-help response');
})().catch(err=>{console.error(err);process.exitCode=1;});

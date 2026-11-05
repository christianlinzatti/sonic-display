#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {createHmac}=require('node:crypto');
const {handler,_internals:{ACTIONS}}=require('../integrations/alexa/handler.cjs');
const oldEnv={...process.env},oldFetch=global.fetch;
const id='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
const secret='sonic-v969-bridge-secret-length-0123456789';
const event=name=>({session:{application:{applicationId:id},user:{userId:'allowed-user'}},
 request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}});
(async()=>{
 try{
  Object.assign(process.env,{ALEXA_SKILL_ID:id,ALEXA_ALLOWED_USER_ID:'allowed-user',
   ALEXA_BRIDGE_SECRET:secret,SONIC_DISPLAY_ORIGIN:'https://sonic-display.test'});
  const pending=[];global.fetch=async(url,opts)=>{pending.push({url:String(url),...opts});return {ok:true,json:async()=>({queued:true})};};
  const mapping={RapPresetIntent:'preset-rap',HardtekkPresetIntent:'preset-hardtekk',
   RockPresetIntent:'preset-rock',CinemaPresetIntent:'preset-cinema',AutoPresetIntent:'preset-auto'};
  const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
  for(const [intent,command] of Object.entries(mapping)){
   assert.equal(ACTIONS[intent],command);assert(model.intents.some(i=>i.name===intent&&i.samples.length>=3));
   const response=await handler(event(intent));assert.match(response.response.outputSpeech.text,/gesendet/);
   const sent=pending.at(-1);assert.equal(sent.url,'https://sonic-display.test/api/alexa/command');
   assert.equal(JSON.parse(sent.body).command,command);
   const h=sent.headers;
   const signature=createHmac('sha256',secret).update(`${h['x-sonic-timestamp']}.${h['x-sonic-nonce']}.${sent.body}`).digest('hex');
   assert.equal(h['x-sonic-signature'],signature);
  }
  const count=pending.length;for(const name of ['RapPresetIntent','RockPresetIntent']){
   const wrong=event(name);wrong.session.user.userId='stranger';await handler(wrong);
  }await handler(event('SpotifyControlIntent'));
  assert.equal(pending.length,count,'Unknown/foreign commands reached network');
  console.log('V969 Alexa Lambda PASS 5 signed preset intents, model parity and unauthorized denials');
 }catch(e){console.error(e);process.exitCode=1;}finally{global.fetch=oldFetch;process.env=oldEnv;}
})();

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),{createHmac}=require('node:crypto');
const {handler,_internals:{ACTIONS}}=require('../integrations/alexa/handler.cjs');
const oldEnv={...process.env},oldFetch=global.fetch;
const skill='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
const secret='sonic-v970-bridge-secret-at-least-32-characters';
const event=name=>({session:{application:{applicationId:skill},user:{userId:'private-owner'}},
 request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}});
(async()=>{
 try{
  Object.assign(process.env,{ALEXA_SKILL_ID:skill,ALEXA_ALLOWED_USER_ID:'private-owner',
   ALEXA_BRIDGE_SECRET:secret,SONIC_DISPLAY_ORIGIN:'https://sonic-display.test'});
  const traffic=[];global.fetch=async (url,opts)=>{traffic.push({url:String(url),opts});return {ok:true,json:async()=>({queued:true})};};
  const allowed={GoveeArenaIntent:'govee-arena',GoveeFestivalIntent:'govee-festival',
   GoveeClubIntent:'govee-club',GoveeCalmIntent:'govee-calm',
   GoveeDimIntent:'govee-dim',GoveeAutoIntent:'govee-auto'};
  const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
  for(const [intent,command] of Object.entries(allowed)){
   assert.equal(ACTIONS[intent],command);
   assert(model.intents.some(x=>x.name===intent&&x.samples.length>=3));
   const result=await handler(event(intent));assert.match(result.response.outputSpeech.text,/gesendet/);
   const sent=traffic.at(-1);assert.equal(sent.url,'https://sonic-display.test/api/alexa/command');
   assert.equal(JSON.parse(sent.opts.body).command,command);
   const h=sent.opts.headers;
   const signature=createHmac('sha256',secret).update(`${h['x-sonic-timestamp']}.${h['x-sonic-nonce']}.${sent.opts.body}`).digest('hex');
   assert.equal(h['x-sonic-signature'],signature);
  }
  // Real LAN power uses the separately consented V1008 voice queue, not V970 looks.
  for(const [intent,command] of Object.entries({GoveePowerOnIntent:'govee-power-on',GoveePowerOffIntent:'govee-power-off'})){
   assert(!Object.hasOwn(ACTIONS,intent),'Power commands must use the guarded voice relay');
   assert(model.intents.some(x=>x.name===intent&&x.samples.length>=3));
   await handler(event(intent));
   const sent=traffic.at(-1);
   assert.equal(sent.url,'https://sonic-display.test/api/alexa/voice');
   assert.equal(JSON.parse(sent.opts.body).command,command);
   const h=sent.opts.headers;
   assert.equal(h['x-sonic-signature'],createHmac('sha256',secret).update(`${h['x-sonic-timestamp']}.${h['x-sonic-nonce']}.${sent.opts.body}`).digest('hex'));
  }
  const count=traffic.length;
  const otherUser=event('GoveeFestivalIntent');otherUser.session.user.userId='stranger';await handler(otherUser);
  const otherSkill=event('GoveeArenaIntent');otherSkill.session.application.applicationId='fake';await handler(otherSkill);
  const stale=event('GoveeCalmIntent');stale.request.timestamp='2021-01-01T00:00:00Z';await handler(stale);
  await handler(event('SpotifyPlayIntent'));
  assert.equal(traffic.length,count,'Rejected identity or unsupported commands reached the network');
  console.log('V970 Lambda PASS 6 room-light intents and 2 signed LAN power intents, German skill model and identity/replay protection');
 }catch(e){console.error(e);process.exitCode=1;}
 finally{global.fetch=oldFetch;process.env=oldEnv;}
})();

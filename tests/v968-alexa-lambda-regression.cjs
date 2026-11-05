#!/usr/bin/env node
'use strict';
/** V968: end-to-end Alexa intent mapping -> authenticated HMAC payload for every new action. */
const assert=require('node:assert/strict');
const {createHmac}=require('node:crypto');
const lambda=require('../integrations/alexa/handler.cjs');
const env={...process.env};const oldFetch=global.fetch;
const id='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
const secret='a-secret-long-enough-for-a-private-alexa-bridge-012345';
const event=name=>({session:{application:{applicationId:id},user:{userId:'private-owner'}},
 request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}});
(async()=>{
 try{
  process.env.ALEXA_SKILL_ID=id;
  process.env.ALEXA_ALLOWED_USER_ID='private-owner';
  process.env.ALEXA_BRIDGE_SECRET=secret;
  process.env.SONIC_DISPLAY_ORIGIN='https://sonic-display.test';
  const recorded=[];
  global.fetch=async (url,init)=>{recorded.push({url:String(url),...init});
   return {ok:true,json:async()=>({queued:true})};};
  const {ACTIONS}=lambda._internals;
  const newer=Object.entries(ACTIONS).filter(([,command])=>
   command.startsWith('zone-')||command.startsWith('mood-')||command.startsWith('effect-'));
  assert.equal(newer.length,14);
  for(const [intent,command] of newer){
   const result=await lambda.handler(event(intent));
   assert.match(result.response.outputSpeech.text,/gesendet/);
   const sent=recorded.at(-1);
   assert.equal(sent.url,'https://sonic-display.test/api/alexa/command');
   assert.equal(JSON.parse(sent.body).command,command);
   assert.deepEqual(Object.keys(JSON.parse(sent.body)),['command']);
   const headers=sent.headers;
   const expected=createHmac('sha256',secret).update(
    `${headers['x-sonic-timestamp']}.${headers['x-sonic-nonce']}.${sent.body}`).digest('hex');
   assert.equal(headers['x-sonic-signature'],expected);
  }
  const count=recorded.length;
  const stranger=event('ConfettiEffectIntent');stranger.session.user.userId='someone-else';
  await lambda.handler(stranger);assert.equal(recorded.length,count);
  const badSkill=event('NeonMoodIntent');badSkill.session.application.applicationId='invalid';
  await lambda.handler(badSkill);assert.equal(recorded.length,count);
  const unknown=event('ControlSpotifyIntent');await lambda.handler(unknown);
  assert.equal(recorded.length,count);
  console.log('V968 Lambda PASS 14 signed new intents + owner/skill/unknown-command denial');
 }catch(error){console.error(error);process.exitCode=1;}
 finally{global.fetch=oldFetch;process.env=env;}
})();

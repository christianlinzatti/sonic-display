'use strict';
const assert=require('node:assert/strict');
const {createHmac}=require('node:crypto');
const {load}=require('./helpers/ts-loader-v404.cjs');
const lib=load('lib/alexaArtistV1007');
const message={id:'12345678-1234-1234-1234-123456789abc',command:'artist-follow',createdAt:20000};
const A='2takcwOaAZWiXQijPHIx7B',B='74ASZWbe4lXaubB36ztrGX';
let count=0;
function check(name,fn){fn();count++;console.log('PASS V1007 '+name);}
check('exact, explicit follow/unfollow commands only',()=>{
 for(const v of ['artist-follow','artist-unfollow'])assert.equal(lib.isAlexaArtistCommandV1007(v),true);
 for(const v of ['like','play','artist-toggle','artist-follow ',null,{},1])assert.equal(lib.isAlexaArtistCommandV1007(v),false);
});
check('separate consent is opt-in and malformed data stays disabled',()=>{
 assert.deepEqual(lib.parseArtistVoiceConsentV1007('{"enabled":true,"since":1000}'),{enabled:true,since:1000});
 for(const raw of [null,'bad','{}','{"enabled":"true","since":1000}','{"enabled":true,"since":0}','{"enabled":true,"since":1.5}'])
  assert.equal(lib.parseArtistVoiceConsentV1007(raw).enabled,false);
});
check('fresh UUID command only after opt-in, no future or stale commands',()=>{
 assert.equal(lib.canApplyAlexaArtistV1007(message,19000,21000),true);
 for(const [raw,since,now] of [[message,0,21000],[message,22000,23000],[message,19000,19999],[message,19000,35001],
  [{...message,id:'bad'},19000,21000],[{...message,command:'play'},19000,21000],[{...message,createdAt:NaN},19000,21000]])
  assert.equal(lib.canApplyAlexaArtistV1007(raw,since,now),false);
});
const current={connected:true,track:{id:'track-id',artistDetails:[{id:A,name:'Primary artist'},{id:B,name:'Guest artist'}]}};
const response=(status,body)=>({ok:status>=200&&status<300,status,json:async()=>body});
async function execute(command='artist-follow',config={}){
 const calls=[];let now=21000,allowed=true;
 const result=await lib.executeAlexaArtistV1007({...message,command},{since:19000,now:()=>now,allowed:()=>allowed,
  signal:config.signal,fetcher:async(url,options)=>{
   calls.push({url,options});
   if(url==='/api/spotify/current'){
    if(config.revoke)allowed=false;if(config.expire)now=50000;
    return response(config.currentStatus||200,config.current??current);
   }
   return response(config.status||200,config.result??{artistId:A,following:command==='artist-follow'});
  }});
 return {result,calls};
}
(async()=>{
 const oldFetch=global.fetch,oldEnv={...process.env};
 try{
  for(const command of ['artist-follow','artist-unfollow']){
   const {result,calls}=await execute(command);
   assert.equal(result.following,command==='artist-follow');assert.equal(result.artistName,'Primary artist');
   assert.equal(calls.length,2);assert.equal(calls[1].url,'/api/spotify/artists/follow');
   assert.deepEqual(JSON.parse(calls[1].options.body),{artistId:A,follow:command==='artist-follow'});
   assert.equal(calls[1].options.method,'POST');count++;
  }
  for(const config of [{current:{connected:true,track:null}},{current:{connected:true,track:{artistDetails:[{id:'bad',name:'Bad'}]}}},
   {currentStatus:401},{revoke:true},{expire:true},{signal:AbortSignal.abort()},
   {status:403,result:{message:'Spotify neu verbinden'}},{status:429,result:{message:'Rate limit'}},
   {status:409,result:{message:'Unconfirmed'}},{result:{artistId:B,following:true}},{result:{artistId:A,following:false}}]){
   await assert.rejects(()=>execute('artist-follow',config));count++;
  }
  // No POST is allowed when consent or freshness changes while obtaining the current artist.
  for(const reason of ['revoke','expire','missing']){
   let n=0,allow=true,now=21000;
   await assert.rejects(()=>lib.executeAlexaArtistV1007(message,{since:19000,now:()=>now,allowed:()=>allow,fetcher:async()=>{
    n++;if(reason==='revoke')allow=false;if(reason==='expire')now=50000;
    return response(200,reason==='missing'?{connected:true,track:null}:current);
   }}));assert.equal(n,1);count++;
  }
  const skill='amzn1.ask.skill.00000000-0000-0000-0000-000000000000';
  const secret='test-alexa-artist-bridge-secret-at-least-32-chars';
  Object.assign(process.env,{ALEXA_SKILL_ID:skill,ALEXA_ALLOWED_USER_ID:'owner',ALEXA_BRIDGE_SECRET:secret,SONIC_DISPLAY_ORIGIN:'https://sonic-display.test'});
  const {handler}=require('../integrations/alexa/handler.cjs');
  const model=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel;
  let traffic=0;
  global.fetch=async(url,options)=>{
   traffic++;assert.equal(String(url),'https://sonic-display.test/api/alexa/voice');
   const headers=options.headers;
   assert.equal(headers['x-sonic-signature'],createHmac('sha256',secret).update(`${headers['x-sonic-timestamp']}.${headers['x-sonic-nonce']}.${options.body}`).digest('hex'));
   assert.deepEqual(Object.keys(JSON.parse(options.body)),['command']);
   return response(200,{queued:true});
  };
  const event=name=>({session:{application:{applicationId:skill},user:{userId:'owner'}},request:{type:'IntentRequest',timestamp:new Date().toISOString(),intent:{name}}});
  for(const [intent,command] of [['LikeArtistIntent','artist-follow'],['UnlikeArtistIntent','artist-unfollow']]){
   assert.ok(model.intents.find(x=>x.name===intent).samples.length>=5);
   const reply=await handler(event(intent));assert.match(reply.response.outputSpeech.text,/gesendet/);
   assert.doesNotMatch(reply.response.outputSpeech.text,/Du folgst jetzt/);count++;
  }
  const wrong=event('LikeArtistIntent');wrong.session.user.userId='other';await handler(wrong);assert.equal(traffic,2);count++;
  const utterances=model.intents.flatMap(x=>x.samples||[]);
  assert.ok(utterances.includes('bitte like den künstler'));assert.ok(utterances.includes('bitte entlike den künstler'));
  console.log(`V1007 PASS ${count} groups: opt-in, primary artist, follow/unfollow, expiry/revocation, readback and signed Alexa intents`);
 } finally {global.fetch=oldFetch;process.env=oldEnv;}
})().catch(error=>{console.error(error);process.exitCode=1;});

'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const lib=load('lib/alexaVoiceV1008');
const A='2takcwOaAZWiXQijPHIx7B',B='74ASZWbe4lXaubB36ztrGX',T='1234567890abcdefghij12';
const artists=[{id:A,name:'Primary'},{id:B,name:'Guest'}];
const base={id:'12345678-1234-1234-1234-123456789abc',command:'artist-follow',createdAt:20000};
const response=(v,status=200)=>({ok:status>=200&&status<300,status,json:async()=>v});
async function execute(command,config={}){
 let undo=config.undo||null;const calls=[],events=[];let state={[A]:false,[B]:true,...config.states};
 const options={since:19000,now:()=>21000,allowed:()=>config.allowed!==false,undo,saveUndo:v=>{undo=v;},notify:v=>events.push(v),fetcher:async function(url,init={}){
  assert.equal(this,undefined,'fetch must be invoked without an options-object receiver');
  calls.push({url,init});
  if(url==='/api/spotify/history-identity')return response({spotifyUserId:config.owner||'owner'});
  if(url==='/api/spotify/current')return response({connected:true,track:{id:config.track||T,artistDetails:config.artists||artists}});
  if(url.startsWith('/api/spotify/artists/follow?'))return response({statuses:state});
  if(url==='/api/spotify/artists/follow-batch'){
   const data=JSON.parse(init.body);const values=data.changes.map(c=>({artistId:c.artistId,before:state[c.artistId],following:c.follow}));
   if(config.batchFailure)return response({message:'Partial confirmation'},409);
   return response({confirmed:true,values});
  }
  assert.equal(url,'/api/spotify/artists/follow');const data=JSON.parse(init.body);return response(config.unconfirmed?{artistId:A,following:false}:{artistId:data.artistId,following:data.follow});
 }};
 const result=await lib.executeArtistVoiceV1008({...base,command,...(config.target?{target:config.target}:{})},options);
 return {result,calls,events,undo};
}
(async()=>{
 const selection=await execute('artist-follow');assert.equal(selection.result.kind,'selection');assert.equal(selection.calls.filter(c=>c.init.method==='POST').length,0);
 assert.equal(lib.validVoiceResultV1008(selection.result),true);
 const chosen=await execute('artist-follow',{target:{trackId:T,artistId:A}});assert.equal(chosen.result.kind,'complete');assert.equal(chosen.undo.before,false);assert.equal(chosen.events[0].following,true);
 await assert.rejects(()=>execute('artist-follow',{target:{trackId:'differenttrackid1234567',artistId:A}}),/geändert/);
 const status=await execute('artist-status',{target:{trackId:T,artistId:B}});assert.match(status.result.text,/bereits/);assert.equal(status.calls.filter(c=>c.init.method==='POST').length,0);
 const undo=await execute('artist-undo',{undo:chosen.undo,states:{[A]:true},track:'changedtrack12345678901'});
 assert.equal(undo.undo,null);assert.equal(undo.calls.some(c=>c.url==='/api/spotify/current'),false);assert.equal(undo.events[0].following,false);
 await assert.rejects(()=>execute('artist-undo',{undo:chosen.undo,owner:'different'}),/Spotify-Konto/);
 await assert.rejects(()=>execute('artist-undo',{undo:chosen.undo,states:{[A]:false}}),/inzwischen/);
 await assert.rejects(()=>execute('artist-follow',{artists:[artists[0]],unconfirmed:true}),/nicht bestätigt/);
 const all=await execute('artist-follow-all');
 const bulk=all.calls.find(c=>c.url.endsWith('follow-batch'));assert.equal(JSON.parse(bulk.init.body).changes.length,2);assert.equal(JSON.parse(bulk.init.body).trackId,T);
 assert.match(all.result.text,/allen 2/);assert.equal(all.undo.batch.length,1);assert.equal(all.undo.batch[0].artistId,A,'Already-followed guests must not be removed on undo');
 const reversed=await execute('artist-undo',{undo:all.undo,states:{[A]:true}});assert.equal(reversed.undo,null);assert.equal(JSON.parse(reversed.calls.find(c=>c.url.endsWith('follow-batch')).init.body).expected[A],true);
 await assert.rejects(()=>execute('artist-follow-all',{batchFailure:true}),/Partial/);
 await assert.rejects(()=>execute('artist-follow-all',{allowed:false}),/freigegeben/);
 assert.deepEqual(lib.displayPatchV1008('lyrics-off'),{lyricsVisible:false,lyricsImmersiveEnabled:false});
 assert.deepEqual(lib.displayPatchV1008('display-calm'),{reducedMotion:true});
 const updates=[];const result=await lib.executeDisplayVoiceV1008('avatar-next',{current:'procedural',allowed:()=>true,update:v=>updates.push(v),fetcher:async()=>response({defaults:[{id:'procedural',label:'Built-in',url:null},{id:'unconfigured',label:'No URL',url:null}],models:[{id:'local:ref.glb',label:'Reference',url:'/avatars/ref.glb'}]})});
 assert.deepEqual(updates,[{avatarModelId:'local:ref.glb'}]);assert.match(result.text,/Reference/);
 assert.equal(lib.nextVoiceAvatarV1008('procedural',{defaults:[{id:'procedural',label:'Built-in'}]}),null);
 assert.equal(lib.validVoiceResultV1008({...selection.result,trackId:'bad'}),false);
 assert.equal(lib.freshVoiceV1008(base,19000,51001),false);
 const {runVoiceV1008}=require('../integrations/alexa/voice-v1008.cjs');const {createHmac}=require('node:crypto');
 const secret='unit-test-secret-at-least-32-characters';let submitted;
 const lambda=(intent,result,attributes,slots)=>runVoiceV1008({session:{attributes},request:{intent:{name:intent,slots}}},{origin:'https://sonic-display.test',secret,sleep:async()=>{},fetcher:async(url,opts)=>{
  assert.equal(new URL(url).pathname,'/api/alexa/voice');const h=opts.headers;assert.equal(h['x-sonic-signature'],createHmac('sha256',secret).update(`${h['x-sonic-timestamp']}.${h['x-sonic-nonce']}.${opts.body}`).digest('hex'));
  const data=JSON.parse(opts.body);if(data.read)return response({result});submitted=data;return response({queued:true,id:base.id});
 }});
 const question=await lambda('LikeArtistIntent',selection.result);assert.equal(question.response.shouldEndSession,false);assert.equal(question.sessionAttributes.voiceArtistSelection.choices.length,2);
 await lambda('SelectArtistIntent',{kind:'complete',text:'Guest confirmed'},question.sessionAttributes,{ArtistNumber:{value:'2'}});assert.deepEqual(submitted.target,{artistId:B,trackId:T});
 const done=await lambda('FollowAllArtistsIntent',{kind:'complete',text:'Alle bestätigt'});assert.equal(submitted.command,'artist-follow-all');assert.equal(done.response.outputSpeech.text,'Alle bestätigt');
 const names=require('../integrations/alexa/interaction-model.de-DE.json').interactionModel.languageModel.intents;
 assert.equal(new Set(names.map(x=>x.name)).size,names.length);assert.ok(names.find(x=>x.name==='FollowAllArtistsIntent').samples.includes('bitte allen künstlern folgen'));
 console.log('PASS V1008 voice: selection, status, guarded undo, all-artists batch/undo, display controls, signed dialogs and German intents');
})().catch(e=>{console.error(e);process.exitCode=1;});

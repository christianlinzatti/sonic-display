'use strict';
if(process.env.NODE_ENV==='production') {const r=require('node:child_process').spawnSync(process.execPath,[__filename],{stdio:'inherit',env:{...process.env,NODE_ENV:'development'}});process.exit(r.status??1);}
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const React=require('react');const {act}=React;const Renderer=require('react-test-renderer');
const ts=require('./typescript-loader.cjs'),{load}=require('./helpers/ts-loader-v404.cjs');
const pure=load('lib/alexaVoiceV1008'),artist=load('lib/alexaArtistV1007');
const A='2takcwOaAZWiXQijPHIx7B',B='74ASZWbe4lXaubB36ztrGX',T='1234567890abcdefghij12';
const general='sonic-display:alexa-virtual-concert-v967',memory=new Map(),session=new Map(),intervals=new Map(),timeouts=new Map();let n=0;
const storage=map=>({getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)});
const window=new EventTarget();Object.assign(window,{setInterval:fn=>{intervals.set(++n,fn);return n;},clearInterval:id=>intervals.delete(id),setTimeout:fn=>{timeouts.set(++n,fn);return n;},clearTimeout:id=>timeouts.delete(id)});
const document=new EventTarget();document.visibilityState='visible';let message=null,bulk=0,requests=0;let states={[A]:false,[B]:true};const completed=[],patches=[];
const response=(v,status=200)=>({ok:status>=200&&status<300,status,json:async()=>v});
const fetcher=async(url,options={})=>{
 requests++;
 if(url==='/api/alexa/voice-pending')return response({commands:message?[message]:[]});
 if(url==='/api/alexa/voice-result'){const body=JSON.parse(options.body);if(body.phase==='claim')return response({token:'f2345678-1234-1234-1234-123456789abc'});completed.push(body.result);return response({saved:true});}
 if(url==='/api/spotify/history-identity')return response({spotifyUserId:'owner'});
 if(url==='/api/spotify/current')return response({connected:true,track:{id:T,artistDetails:[{id:A,name:'Primary'},{id:B,name:'Guest'}]}});
 if(url==='/api/spotify/artists/follow-batch'){bulk++;const body=JSON.parse(options.body);const values=body.changes.map(c=>{const before=states[c.artistId];states[c.artistId]=c.follow;return {artistId:c.artistId,before,following:c.follow};});return response({confirmed:true,values});}
 throw Error('Unexpected request '+url);
};
const deps={'@/lib/alexaConcertScenesV1147':{activateConcertSceneV1147:()=>{throw Error('Not authorized in legacy tests');},applyVirtualConcertSceneV1147:()=>{throw Error('Not authorized in legacy tests');}},'@/lib/goveeVoiceLookV1146':{GOVEE_LOOK_CONSENT_EVENT_V1146:'govee-look-v1146-change',loadGoveeLookConsentV1146:()=>({enabled:false,since:0}),isGoveeVoiceLookCommandV1146:c=>c==='govee-color'||c==='govee-brightness',executeAlexaGoveeVoiceLookV1146:async()=>{throw Error('Not authorized in legacy tests');}},'@/lib/alexaFullConcertV1145':{ALEXA_FULL_CONCERT_EVENT_V1145:'alexa-full-concert-event-test',loadFullConcertConsentV1145:()=>({enabled:false,since:0,includeGovee:false}),isFullConcertVoiceCommandV1145:c=>c==='concert-show-start'||c==='concert-show-stop',executeAlexaFullConcertV1145:()=>{throw Error('Not authorized in legacy tests');}},'@/lib/goveeMusicVoiceV1143':{GOVEE_SYNC_CONSENT_EVENT_V1143:'govee-sync-event-test',loadGoveeSyncConsentV1143:()=>({enabled:false,since:0}),isGoveeMusicVoiceCommandV1143:c=>c==='govee-sync-start'||c==='govee-sync-pause',isGoveeOnlyVoiceCommandV1143:c=>['govee-power-on','govee-power-off','govee-sync-start','govee-sync-pause'].includes(c),executeAlexaGoveeMusicSyncV1143:()=>{throw Error('Not authorized in legacy tests');}},'@/lib/goveePowerRoutingV1141':{executeAlexaGoveePowerV1141:async()=>{throw Error('Not authorized in legacy tests');}},'@/lib/alexaGoveeReceiverClientV1139':{ALEXA_GOVEE_RECEIVER_EVENT_V1139:'sonic-display:alexa-govee-receiver-token-changed-v1139',readAlexaGoveeReceiverTokenV1139:()=>'',alexaGoveeReceiverHeadersV1139:()=>({})},'@/lib/backgroundJsonV1009':{backgroundJsonV1009:(url,init)=>load('lib/backgroundJsonV1009').backgroundJsonV1009(url,init,12000,fetcher)},react:React,'react/jsx-runtime':require('react/jsx-runtime'),'@/context/MusicContext':{useMusic:()=>({connected:true})},'@/context/UiPreferencesContext':{useUiPreferences:()=>({preferences:{avatarModelId:'procedural'},updatePreferences:update})},'@/lib/alexaConcertV967':{ALEXA_LOCAL_ENABLED_KEY_V967:general},'@/lib/alexaArtistV1007':artist,'@/lib/alexaVoiceV1008':pure,'@/lib/goveePowerV1138':{GOVEE_POWER_CONSENT_EVENT_V1138:'sonic-display:alexa-govee-power-changed-v1138',loadGoveePowerConsentV1138:()=>({enabled:false,since:0}),isGoveePowerCommandV1138:command=>command==='govee-power-on'||command==='govee-power-off',executeAlexaGoveePowerV1138:async()=>{throw Error('Not authorized in V1008 tests');}}};
function update(patch){patches.push(patch);}
const mod={exports:{}};const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/AlexaVoiceControlV1008.tsx'),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext(source,{module:mod,exports:mod.exports,require:id=>{assert.ok(deps[id],id);return deps[id];},window,document,localStorage:storage(memory),sessionStorage:storage(session),fetch:fetcher,AbortController,CustomEvent,Date,console});
global.IS_REACT_ACT_ENVIRONMENT=true;let renderer;const settle=async()=>{for(let i=0;i<30;i++)await Promise.resolve();};
(async()=>{try{
 await act(async()=>{renderer=Renderer.create(React.createElement(mod.exports.AlexaVoiceControlV1008));await settle();});assert.equal(requests,0);
 const since=Date.now()-1000;for(const key of [general,artist.ALEXA_ARTIST_KEY_V1007,pure.VOICE_DISPLAY_KEY_V1008])memory.set(key,JSON.stringify({enabled:true,since}));
 message={id:'12345678-1234-1234-1234-123456789abc',command:'artist-follow-all',createdAt:Date.now()};
 await act(async()=>{window.dispatchEvent(new Event(pure.VOICE_SETTINGS_EVENT_V1008));await settle();});await act(settle);
 assert.equal(bulk,1);assert.match(completed.at(-1).text,/allen 2/);assert.equal(JSON.parse(session.get('sonic:alexa-undo-v1008')).batch.length,1);
 let poll=[...intervals.values()][0];await act(async()=>{poll();await settle();});assert.equal(bulk,1);
 message={...message,id:'22345678-1234-1234-1234-123456789abc',command:'artist-undo',createdAt:Date.now()};await act(async()=>{poll();await settle();});await act(settle);
 assert.equal(bulk,2);assert.equal(states[A],false);assert.equal(states[B],true);assert.equal(session.has('sonic:alexa-undo-v1008'),false);
 message={...message,id:'32345678-1234-1234-1234-123456789abc',command:'lyrics-off',createdAt:Date.now()};await act(async()=>{poll();await settle();});await act(settle);assert.deepEqual(patches.at(-1),{lyricsVisible:false,lyricsImmersiveEnabled:false});
 document.visibilityState='hidden';const count=requests;await act(async()=>{poll();await settle();});assert.equal(requests,count);document.visibilityState='visible';
 memory.set(artist.ALEXA_ARTIST_KEY_V1007,JSON.stringify({enabled:false,since:0}));message={...message,id:'42345678-1234-1234-1234-123456789abc',command:'artist-follow-all',createdAt:Date.now()};
 await act(async()=>{window.dispatchEvent(new Event(artist.ALEXA_ARTIST_EVENT_V1007));await settle();});await act(settle);assert.equal(bulk,2);assert.equal(completed.at(-1).kind,'error');
 console.log('PASS V1008 receiver: both permissions, claim before bulk action, dedupe, complete results, real undo snapshot, display patch, hidden tab and revocation');
 }finally{if(renderer)await act(async()=>renderer.unmount());delete global.IS_REACT_ACT_ENVIRONMENT;}
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
// Run React effect tests in development even when called by the production build gate.
if(process.env.NODE_ENV==='production') {
 const r=require('node:child_process').spawnSync(process.execPath,[__filename],{stdio:'inherit',env:{...process.env,NODE_ENV:'development'}});
 process.exit(r.status??1);
}
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const React=require('react');const {act}=React;
const Renderer=require('react-test-renderer');
const ts=require('./typescript-loader.cjs');
const lib=require('./helpers/ts-loader-v404.cjs').load('lib/alexaArtistV1007');
const general='sonic-display:alexa-virtual-concert-v967';
const store=new Map(),session=new Map(),intervals=new Map(),timeouts=new Map();let timerId=0;
const storage=map=>({getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value))});
const window=new EventTarget();Object.assign(window,{setInterval:fn=>{intervals.set(++timerId,fn);return timerId;},clearInterval:id=>intervals.delete(id),
 setTimeout:fn=>{timeouts.set(++timerId,fn);return timerId;},clearTimeout:id=>timeouts.delete(id)});
const document=new EventTarget();document.visibilityState='visible';
let connected=true,message=null,posts=[],requests=0;const changed=[];
window.addEventListener('sonic:artist-follow-changed-v359',event=>changed.push(event.detail));
const fetcher=async(url,options={})=>{
 requests++;
 if(url==='/api/alexa/pending')return {ok:true,json:async()=>({command:message})};
 if(url==='/api/spotify/current')return {ok:true,json:async()=>({connected:true,track:{artistDetails:[{id:'2takcwOaAZWiXQijPHIx7B',name:'Primary artist'}]}})};
 assert.equal(url,'/api/spotify/artists/follow');const body=JSON.parse(options.body);posts.push(body);
 return {ok:true,json:async()=>({artistId:body.artistId,following:body.follow})};
};
const dependencies={react:React,'react/jsx-runtime':require('react/jsx-runtime'),
 '@/context/MusicContext':{useMusic:()=>({connected})},
 '@/lib/alexaConcertV967':{ALEXA_LOCAL_ENABLED_KEY_V967:general},'@/lib/alexaArtistV1007':lib};
const moduleStub={exports:{}};
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../components/AlexaArtistControlV1007.tsx'),'utf8'),{
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext(code,{module:moduleStub,exports:moduleStub.exports,require:name=>{assert.ok(dependencies[name],name);return dependencies[name];},
 window,document,localStorage:storage(store),sessionStorage:storage(session),fetch:fetcher,AbortController,CustomEvent,Date,console});
const Component=moduleStub.exports.AlexaArtistControlV1007;
global.IS_REACT_ACT_ENVIRONMENT=true;
let renderer;
const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
(async()=>{
 try{
  await act(async()=>{renderer=Renderer.create(React.createElement(Component));await settle();});
  assert.equal(requests,0,'No polling before both permissions');
  const since=Date.now()-1000;
  store.set(general,JSON.stringify({enabled:true,since}));store.set(lib.ALEXA_ARTIST_KEY_V1007,JSON.stringify({enabled:true,since}));
  message={id:'12345678-1234-1234-1234-123456789abc',command:'artist-follow',createdAt:Date.now()};
  await act(async()=>{window.dispatchEvent(new Event(lib.ALEXA_ARTIST_EVENT_V1007));await settle();});
  await act(settle);
  assert.equal(posts.length,1);assert.equal(posts[0].follow,true);assert.equal(changed.length,1);
  assert.equal(changed[0].following,true);assert.match(JSON.stringify(renderer.toJSON()),/Du folgst jetzt Primary artist/);
  const poll=[...intervals.values()][0];assert.ok(poll);
  await act(async()=>{poll();await settle();});assert.equal(posts.length,1,'Repeated queue value is not applied twice');
  document.visibilityState='hidden';const before=requests;
  await act(async()=>{poll();await settle();});assert.equal(requests,before,'No background requests');document.visibilityState='visible';
  message={...message,id:'22345678-1234-1234-1234-123456789abc',command:'artist-unfollow',createdAt:Date.now()};
  await act(async()=>{poll();await settle();});await act(settle);
  assert.equal(posts.length,2);assert.equal(posts[1].follow,false);assert.equal(changed[1].following,false);
  store.set(lib.ALEXA_ARTIST_KEY_V1007,JSON.stringify({enabled:false,since:0}));
  await act(async()=>{window.dispatchEvent(new Event(lib.ALEXA_ARTIST_EVENT_V1007));await settle();});
  assert.equal(intervals.size,0);const after=requests;
  await act(async()=>{poll();await settle();});assert.equal(requests,after,'Revocation stops the old polling closure');
  console.log('PASS V1007 receiver: default off, both opt-ins, confirmed UI event, deduplication, visibility, unfollow and revocation');
 }finally{if(renderer)await act(async()=>renderer.unmount());delete global.IS_REACT_ACT_ENVIRONMENT;}
})().catch(error=>{console.error(error);process.exitCode=1;});

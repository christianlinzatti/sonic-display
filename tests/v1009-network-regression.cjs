'use strict';
const assert=require('node:assert/strict');
const loader=require('./helpers/loader-v733.cjs');
const query={title:'Song',artist:'Artist',album:'Album',duration:200};
(async()=>{
 const old=process.env.GENIUS_ACCESS_TOKEN;process.env.GENIUS_ACCESS_TOKEN='test-private-key';
 try{
  const native=loader()('services/lyrics/providers/genius');
  assert.equal(native.parseGeniusLyricsV1009('<div data-lyrics-container="true">One &amp; two<br>Three<script>SECRET</script></div><p>Other</p>'),'One & two\nThree');
  assert.equal(native.parseGeniusLyricsV1009('<div>No lyrics here</div>'),null);
  for(const url of ['https://evil.invalid/','https://genius.com.evil.invalid/','https://user:pass@genius.com/foo','http://genius.com/foo','https://genius.com:8443/foo'])assert.equal(native.safeGeniusLyricsUrlV1009(url),null);
  const calls=[];
  const load=loader({}, {fetch:async(url,options)=>{
   calls.push({url:String(url),options});assert(options.signal instanceof AbortSignal);
   if(calls.length===1)return new Response(JSON.stringify({response:{hits:[{result:{title:'Wrong',primary_artist:{name:'Other'},url:'https://genius.com/wrong'}},{result:{title:'Song',primary_artist:{name:'Artist'},url:'https://genius.com/song-lyrics'}}]}}));
   assert.equal(options.headers.Authorization,undefined,'private API key must never go to the public page');
   return new Response('<div data-lyrics-container="true">Actual<br>Lyrics</div>');
  }});
  const result=await load('services/lyrics/providers/genius').lookupGeniusLyrics(query);
  assert.equal(result.plainText,'Actual\nLyrics');assert.equal(result.synced,false);assert.equal(calls.length,2);assert(!calls[0].url.includes('test-private-key'));assert.equal(calls[0].options.headers.Authorization,'Bearer test-private-key');
  let redirects=0;
  const redirect=loader({}, {fetch:async()=>++redirects===1?new Response(JSON.stringify({response:{hits:[{result:{title:'Song',primary_artist:{name:'Artist'},url:'https://genius.com/song-lyrics'}}]}})):new Response(null,{status:302,headers:{Location:'https://private.invalid/admin'}})});
  assert.equal(await redirect('services/lyrics/providers/genius').lookupGeniusLyrics(query),null);assert.equal(redirects,2);
  let signal;const parent=new AbortController();
  const hanging=loader({}, {fetch:(_url,options)=>{signal=options.signal;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));}})('services/lyrics/providers/genius');
  const pending=hanging.lookupGeniusLyrics(query,parent.signal);await new Promise(r=>setImmediate(r));const rejected=assert.rejects(pending);parent.abort();await rejected;assert(signal.aborted);
  const {backgroundJsonV1009}=loader()('lib/backgroundJsonV1009');
  let transport;
  await assert.rejects(backgroundJsonV1009('/pending',{},15,async(_url,init)=>{transport=init.signal;return new Promise(()=>{});}),/Zeitlimit/);assert(transport.aborted);
  let bodySignal;await assert.rejects(backgroundJsonV1009('/body',{},15,async(_url,init)=>{bodySignal=init.signal;return {ok:true,status:200,json:()=>new Promise(()=>{})};}),/Zeitlimit/);assert(bodySignal.aborted,'deadline covers body reading too');
  const p=new AbortController();let called=false;p.abort();await assert.rejects(backgroundJsonV1009('/cancelled',{signal:p.signal},100,async()=>{called=true;}));assert(!called);
  const reply=await backgroundJsonV1009('/working',{},100,async()=>new Response('{"ready":true}'));assert.equal((await reply.json()).ready,true);
  console.log('PASS V1009: native Genius parsing, bounded body, no token in URL, redirect allowlist, transport cancellation and JSON-body deadlines');
 }finally{if(old===undefined)delete process.env.GENIUS_ACCESS_TOKEN;else process.env.GENIUS_ACCESS_TOKEN=old;}
})().catch(e=>{console.error(e);process.exitCode=1;});

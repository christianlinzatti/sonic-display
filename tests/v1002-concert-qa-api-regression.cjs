'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const compile=f=>ts.transpileModule(src(f),{fileName:f,reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const lib={exports:{}};
vm.runInNewContext(compile('components/visualizer/concertQualityAssuranceV1002.ts'),{module:lib,exports:lib.exports});
const model=lib.exports;
const api={exports:{}};
const env={OPENAI_API_KEY:'fake-for-test',OPENAI_MODEL:'gpt-4.1-mini'};
let token='',upstreamMode='valid',lastCall=null,called=0;
const fakeFetch=async(url,options)=>{
 called++;lastCall={url,options};
 if(upstreamMode==='error')return Response.json({error:'offline'},{status:503});
 const text=JSON.stringify(upstreamMode==='invalid'?{summary:'short',suggestions:[]}:
  {summary:'Prüfe zuerst die erfasste Planung und überprüfe anschließend FPS.',
   suggestions:['Mehr Kameravielfalt im bestätigten Szenenplan prüfen.']});
 return Response.json({output:[{type:'message',content:[{type:'output_text',text}]}]});
};
const fakeRequire=name=>{
 if(name==='next/server')return {NextResponse:{json:(body,opts={})=>Response.json(body,opts)}};
 if(name==='node:crypto')return require('node:crypto');
 if(name==='@/lib/spotify')return {getValidSession:async()=>token?{session:{accessToken:token,refreshToken:'NEVER_SEND'},refreshed:false}:null,ReauthRequiredError:class extends Error{}};
 if(name==='@/lib/session')return {setSessionCookie:()=>{}};
 if(name==='@/components/visualizer/concertQualityAssuranceV1002')return {normalizeQaAiResponseV1002:model.normalizeQaAiResponseV1002};
 throw Error('Unexpected import '+name);
};
vm.runInNewContext(compile('app/api/ai/concert-qa/route.ts'),{
 module:api,exports:api.exports,require:fakeRequire,Request,Response,URL,
 Number,Map,Set,Date,JSON,AbortSignal,process:{env},fetch:fakeFetch,
});
const payload={planAvailable:true,runtimeAvailable:true,structureScore:82,sceneCount:6,targetFps:45,
 fps:41,p95FrameMs:26.1,codes:['camera-variety','frame-variance']};
const request=(body=payload,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/ai/concert-qa',{
 method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
(async()=>{
 let passed=0;const test=(label)=>{passed++;console.log('PASS V1002 API '+label);};
 assert.equal((await api.exports.POST(request())).status,401);test('requires Spotify session');
 token='logged-in-test-1';
 let r=await api.exports.POST(request());assert.equal(r.status,200);
 assert.equal((await r.json()).review.suggestions.length,1);
 assert.equal(r.headers.get('Cache-Control'),'private, no-store');
 assert.equal(lastCall.url,'https://api.openai.com/v1/responses');
 const outbound=JSON.parse(lastCall.options.body);
 assert.equal(outbound.store,false);assert.equal(outbound.text.format.type,'json_schema');
 assert.deepEqual(outbound.input[0].content,JSON.stringify(payload));
 assert(!lastCall.options.body.includes(token)&&!lastCall.options.body.includes('NEVER_SEND'));
 test('returns only structured recommendations and sends no tokens');
 const before=called;
 assert.equal((await api.exports.POST(request(payload,'https://evil.invalid'))).status,403);
 for(const b of [{...payload,trackId:'private-song'}, {...payload,codes:['control-govee']},
  {...payload,fps:NaN}, {...payload,fps:Infinity}, {...payload,sceneCount:-2},
  {...payload,structureScore:104}, {...payload,planAvailable:false},
  {...payload,codes:['camera-variety','camera-variety']},
  {...payload,codes:['camera-variety'.repeat(500)]}]){
  const response=await api.exports.POST(request(b));assert.equal(response.status,400,JSON.stringify(b));
 }
 assert.equal(called,before);test('rejects cross-origin and invalid or private fields before upstream calls');
 token='logged-in-test-2';upstreamMode='invalid';
 assert.equal((await api.exports.POST(request())).status,502);
 token='logged-in-test-3';upstreamMode='error';
 assert.equal((await api.exports.POST(request())).status,502);
 test('rejects malformed AI output and unavailable provider');
 delete env.OPENAI_API_KEY;assert.equal((await api.exports.POST(request())).status,503);
 env.OPENAI_API_KEY='fake-for-test';test('no key gives 503 for local-only fallback');
 token='logged-in-test-4';upstreamMode='valid';let last;
 for(let i=0;i<6;i++)last=await api.exports.POST(request());
 assert.equal(last.status,429);test('per-session burst limit');
 const over=new Request('http://localhost:3000/api/ai/concert-qa',{
 method:'POST',headers:{origin:'http://localhost:3000','content-length':'3000'},body:'{}'});
 assert.equal((await api.exports.POST(over)).status,413);test('size limit before session or provider');
 console.log('PASS V1002 API '+passed+' groups');
})().catch(e=>{console.error(e);process.exitCode=1;});

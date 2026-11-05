#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compiled=(filename,jsx=false)=>{
 const result=ts.transpileModule(read(filename),{fileName:filename,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!result.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error),filename+' syntax');return result.outputText;
};
const run=(filename,dependencies={})=>{
 const module={exports:{}};
 vm.runInNewContext(compiled(filename),{module,exports:module.exports,
  require:name=>{if(dependencies[name])return dependencies[name];throw Error(name);}});
 return module.exports;
};
const v982=run('lib/immersiveAiDirectorV982.ts');
const core=run('lib/aiSongIntelligenceV983.ts',{'./immersiveAiDirectorV982':v982});
let checks=0;
function test(label,fn){const v=fn();if(v&&typeof v.then==='function')return v.then(()=>{checks++;console.log('PASS V983 '+label);});checks++;console.log('PASS V983 '+label);}
const context={title:'Beispielsong',artist:'Beispielartist',durationMs:220000,genre:'Hardtekk'};
const local=core.localSongInsightV983(context);
test('metadata validation checks boundary and malformed values',()=>{
 assert(core.normalizeSongContextV983(context));
 for(const value of [null,[],{}, {...context,title:''}, {...context,artist:'A\nB'},
  {...context,durationMs:NaN},{...context,durationMs:0},{...context,durationMs:5000000},
  {...context,title:'X'.repeat(130)},{...context,genre:'Y'.repeat(81)}])
  assert.equal(core.normalizeSongContextV983(value),null);
});
test('local response explicitly has no measurements',()=>{
 assert.equal(local.mood,'energetic');assert.equal(local.basis,'metadata-only');
 assert.equal(local.confidence,'creative-estimate');assert.equal(local.measuredBpm,null);
 assert.equal(local.verifiedSectionTimes,null);
 assert.deepEqual([...local.phases.map(x=>x.section)],['intro','verse','hook','drop','finale']);
 assert(core.localSongInsightV983({...context,genre:'Deutschrap'}).mood==='dark');
 assert(core.localSongInsightV983({...context,genre:'Deutschrock'}).mood==='anthemic');
});
test('normalize fails closed on unexpected effects, fake phases and bad energy',()=>{
 for(const value of [null,[],{}, {...local,mood:'unsafe'},
  {...local,phases:[...local.phases.slice(0,4)]},
  {...local,phases:local.phases.map((x,i)=>({...x,section:i===3?'verse':x.section}))},
  {...local,phases:local.phases.map(x=>({...x,energy:Infinity}))},
  {...local,phases:local.phases.map(x=>({...x,energy:100}))},
  {...local,explanation:''}])assert.equal(core.normalizeSongInsightV983(value),null);
 const n=core.normalizeSongInsightV983({...local,measuredBpm:180,
  verifiedSectionTimes:[0,32000],hardwareInstruction:'turn on Govee'});
 assert(n);assert.equal(n.measuredBpm,null);assert.equal(n.verifiedSectionTimes,null);
 assert(!('hardwareInstruction' in n));
});
test('V983 only produces bounded virtual V982 settings, no physical commands',()=>{
 const plan=core.immersivePlanFromInsightV983(local);assert(plan);
 assert.equal(plan.look,'reactor');assert.equal(plan.palette,'electric');
 assert(plan.fxIntensity<=45);assert(plan.stageIntensity<=65);
 assert.equal(plan.scenes.length,5);
 assert.equal(core.immersivePlanFromInsightV983({...local,phases:[]}),null);
});
test('all new TS/TSX modules parse',()=>{
 for(const name of ['lib/aiSongIntelligenceV983.ts','app/api/ai/song-intelligence/route.ts'])compiled(name);
 for(const name of ['components/visualizer/SongIntelligencePanelV983.tsx',
  'components/visualizer/LiveFxDeckV881.tsx','components/SonicDisplay.tsx'])compiled(name,true);
});
test('UI uses manual opt-in, safe track resets, no hardware and existing approval',()=>{
 const ui=read('components/visualizer/SongIntelligencePanelV983.tsx');
 for(const s of ['onApply(plan)','/api/ai/song-intelligence','controller.signal',
  'abort.current?.abort()','[trackId,title,artist,durationMs,genre]',
  'currentTrack.current','Keine Lyrics','Lokale Song-Idee','setApplied(true)'])assert(ui.includes(s),s);
 const host=read('components/visualizer/LiveFxDeckV881.tsx');
 assert(host.includes('SongIntelligencePanelV983'));assert(host.includes('onApply={applyImmersiveV982}'));
 assert(host.includes('canApply={settings.enabled&&settings.auto&&!motionOff}'));
 assert(read('components/SonicDisplay.tsx').includes('title={track.title} artist={track.artist}'));
 for(const s of ['navigator.bluetooth','govee/command','alexa/command','localStorage','eval('])
  assert(!ui.includes(s),s);
});
let token='test-a',count=0,upstream=200,outbound=null;
const mockEnv={OPENAI_API_KEY:'test-key',OPENAI_MODEL:'gpt-4.1-mini'};
const fakeFetch=async(url,options)=>{
 count++;outbound={url,options};
 return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(local)}]}]},{status:upstream});
};
const routeModule={exports:{}};
const sandbox={module:routeModule,exports:routeModule.exports,URL,Request,Response,AbortSignal,Date,Map,Number,JSON,process:{env:mockEnv},
 fetch:fakeFetch,require:name=>{
  if(name==='@/lib/spotify')return {getValidSession:async()=>token?{session:{accessToken:token,refreshToken:'secret-refresh'},refreshed:false}:null,ReauthRequiredError:class extends Error{}};
  if(name==='@/lib/session')return {setSessionCookie:()=>{}};
  if(name==='@/lib/aiSongIntelligenceV983')return core;
  if(name==='next/server')return {NextResponse:{json:(body,options={})=>Response.json(body,options)}};
  if(name==='node:crypto')return require('node:crypto');
  throw Error('unexpected dependency '+name);
 }};
vm.runInNewContext(compiled('app/api/ai/song-intelligence/route.ts'),sandbox);
const route=sandbox.module.exports;
const req=(body,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/ai/song-intelligence',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
(async()=>{
 await test('API needs a Spotify session and a configured key',async()=>{
  token='';const before=count;
  assert.equal((await route.POST(req(context))).status,401);assert.equal(count,before);
  token='test-a';delete mockEnv.OPENAI_API_KEY;
  assert.equal((await route.POST(req(context))).status,503);assert.equal(count,before);
  mockEnv.OPENAI_API_KEY='test-key';
 });
 await test('API only forwards explicit metadata and uses structured output',async()=>{
  const r=await route.POST(req(context));assert.equal(r.status,200);
  const body=await r.json();assert.equal(body.source,'ai');assert.equal(body.insight.basis,'metadata-only');
  assert.equal(r.headers.get('Cache-Control'),'private, no-store');
  assert.equal(outbound.url,'https://api.openai.com/v1/responses');
  const sent=JSON.parse(outbound.options.body);
  assert.equal(sent.store,false);assert.equal(sent.text.format.type,'json_schema');
  assert(sent.input[0].content.includes('Beispielsong'));
  for(const unsafe of ['test-a','secret-refresh','\"accessToken\"','\"lyrics\"','\"audioUrl\"'])
   assert(!outbound.options.body.includes(unsafe),'provider leaked '+unsafe);
  assert.equal(sent.tools,undefined);
 });
 await test('bad origin, oversized request and invalid inputs skip model',async()=>{
  const before=count;
  assert.equal((await route.POST(req(context,'https://bad.example'))).status,403);
  assert.equal((await route.POST(req({...context,durationMs:-1}))).status,400);
  assert.equal((await route.POST(req({...context,title:'X'.repeat(500)}))).status,400);
  assert.equal((await route.POST(req({...context,genre:'Y'.repeat(100)}))).status,400);
  const big=new Request('http://localhost:3000/api/ai/song-intelligence',{method:'POST',headers:{origin:'http://localhost:3000'},body:'x'.repeat(3100)});
  assert.equal((await route.POST(big)).status,413);assert.equal(count,before);
 });
 await test('upstream failure and burst control never create a fake AI result',async()=>{
  token='test-b';upstream=503;
  assert.equal((await route.POST(req(context))).status,502);upstream=200;
  token='test-c';let r;for(let i=0;i<5;i++)r=await route.POST(req(context));
  assert.equal(r.status,429);
 });
 await test('CI, focused npm scripts and version are registered',()=>{
  const pkg=JSON.parse(read('package.json'));assert.equal(pkg.sonicRoadmapRelease,'v983');
  assert(pkg.scripts['test:v983']);assert(pkg.scripts['test:v983:types']);
  assert(pkg.scripts.prebuild.startsWith('npm run test:v983 && npm run test:v983:types &&')); 
  assert(read('scripts/vercel-production-build.cjs').includes('V983 AI song intelligence'));
  assert(read('.github/workflows/v832-continuous-validation.yml').includes('V983 AI Song Intelligence'));
 });
 console.log('V983 PASS: '+checks+' checks');
})().catch(error=>{console.error(error);process.exitCode=1});

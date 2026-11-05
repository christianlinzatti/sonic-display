#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const compiled=(file,jsx=false)=>{
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 const errors=result.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error)||[];
 assert.equal(errors.length,0,errors.map(x=>x.messageText).join('\n'));
 return result.outputText;
};
const lib={exports:{}};
vm.runInNewContext(compiled('lib/liveConcertAssistantV998.ts'),{module:lib,exports:lib.exports});
const v=lib.exports;
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS V998 '+name);};
const base={atmosphere:{enabled:true,palette:'dream',intensity:55},
 stage:{enabled:true,look:'prism',intensity:60},camera:{enabled:true,mode:'story',intensity:55},
 fx:{enabled:true,auto:true,intensity:50}};
const plan=(actions)=>({title:'Regie',explanation:'Geprüfter virtueller Entwurf',actions});
const act=(target,field,value)=>({target,field,value});
const sample=plan([act('atmosphere','palette','noir'),act('camera','mode','performer'),
 act('fx','cap','25')]);
test('local fallback supports dark rap camera framing and FX reduction',()=>{
 const p=v.localLivePlanV998('Mach die Bühne düsterer, mehr Nahaufnahmen vom Rapper, weniger FX');
 assert(p.actions.some(a=>a.target==='atmosphere'&&a.value==='noir'));
 assert(p.actions.some(a=>a.target==='camera'&&a.value==='performer'));
 assert(p.actions.some(a=>a.target==='fx'&&a.value==='25'));
});
test('distinct local prompts never need network or pretend to measure audio',()=>{
 assert(v.localLivePlanV998('Hardtekk Neon Festival').actions.some(x=>x.value==='electric'));
 assert(v.localLivePlanV998('Deutschrock Arena').actions.some(x=>x.value==='rock-arena'));
 assert(v.localLivePlanV998('prism bunt').actions.some(x=>x.value==='dream'));
 assert.equal(v.localLivePlanV998('Spiele die Spotify-Playlist').actions.length,0);
 assert.equal(v.localLivePlanV998('Aktiviere Govee').actions.length,0);
});
test('normalizer accepts only whitelisted typed virtual changes',()=>{
 const p=v.normalizeLivePlanV998(sample);assert(p);assert.equal(p.actions.length,3);
 assert.equal(v.normalizeLivePlanV998({...sample,actions:[act('fx','cap','75')]}).actions[0].value,'75');
 assert.equal(v.normalizeLivePlanV998({...sample,title:'X'.repeat(99)+'\u0007'}).title.length,72);
});
test('malformed or device actions fail closed',()=>{
 for(const actions of [[act('govee','brightness','100')],[act('fx','trigger','shockwave')],
  [act('camera','intensity','Infinity')],[act('fx','cap','99')],[act('fx','cap','-1')],
  [act('camera','mode','laser')],[act('stage','look','strobe')],
  [act('fx','cap','15'),act('fx','cap','0')],Array.from({length:5},()=>act('fx','cap','5')),
  [null],['flash'],[{target:'fx',field:'cap',value:12}]]){
  assert.equal(v.normalizeLivePlanV998(plan(actions)),null,JSON.stringify(actions));
 }
 assert.equal(v.normalizeLivePlanV998({...sample,explanation:''}),null);
 assert.equal(v.normalizeLivePlanV998(null),null);
});
test('all-zero plan cannot change any settings',()=>{
 const result=v.resolveLiveChangesV998(plan([]),base);
 assert.equal(result.diffs.length,0);assert.equal(JSON.stringify(result.after),JSON.stringify(base));
});
test('dry run is immutable, deterministic, and produces exact before/after values',()=>{
 const before=JSON.stringify(base),r=v.resolveLiveChangesV998(sample,base);
 assert.equal(JSON.stringify(base),before);assert.equal(r.after.atmosphere.palette,'noir');
 assert.equal(r.after.camera.mode,'performer');assert.equal(r.after.fx.intensity,25);
 assert.equal(r.diffs.length,3);assert.equal(r.diffs[0].before,'dream');
 assert.equal(r.diffs[0].after,'noir');assert.equal(JSON.stringify(v.resolveLiveChangesV998(sample,base)),JSON.stringify(r));
});
test('disabled camera/stage/atmosphere/FX cannot be re-enabled',()=>{
 const all=plan([act('stage','intensity','75'),act('camera','mode','festival'),
  act('atmosphere','palette','noir'),act('fx','cap','10')]);
 const disabled={atmosphere:{...base.atmosphere,enabled:false},stage:{...base.stage,enabled:false},
  camera:{...base.camera,enabled:false},fx:{...base.fx,enabled:false}};
 const r=v.resolveLiveChangesV998(all,disabled);
 assert.equal(r.diffs.length,0);assert.equal(JSON.stringify(r.after),JSON.stringify(disabled));
});
test('FX cap never increases the previous intensity and manual FX remains off-limits',()=>{
 const requested=plan([act('fx','cap','75')]);
 assert.equal(v.resolveLiveChangesV998(requested,{...base,fx:{...base.fx,intensity:12}}).after.fx.intensity,12);
 assert.equal(v.resolveLiveChangesV998(plan([act('fx','cap','0')]),{...base,fx:{...base.fx,auto:false}}).diffs.length,0);
 assert.equal(v.resolveLiveChangesV998(plan([act('fx','cap','75')]),base).after.fx.intensity,50);
});
test('10,000 arbitrary valid intensity and off-state combinations stay bounded',()=>{
 for(let i=0;i<10000;i++){
  const newCap=i%76,old=i%101,enabled=i%2===0;
  const b={...base,fx:{enabled,auto:true,intensity:old}};
  const r=v.resolveLiveChangesV998(plan([act('fx','cap',String(newCap))]),b);
  assert.equal(r.after.fx.intensity,enabled?Math.min(old,newCap):old);
  assert(r.after.fx.intensity<=old);assert.equal(r.after.fx.enabled,enabled);
 }
});
test('transpilation covers API, UI and large Live FX integration',()=>{
 compiled('app/api/ai/live-concert/route.ts');
 compiled('components/visualizer/LiveConcertAssistantV998.tsx',true);
 compiled('components/visualizer/LiveFxDeckV881.tsx',true);
});
test('UI uses preview/approval, aborts stale requests, avoids automatic hardware commands',()=>{
 const ui=read('components/visualizer/LiveConcertAssistantV998.tsx');
 for(const part of ['onPreview(plan)','onApply(plan)','onUndo()','pending.current?.abort()',
  'key={`v998-${trackId}`}', 'Lokal entwerfen', 'Vorher → nachher', 'Keine automatische Ausführung']){
  const data=part.includes('key=')?read('components/visualizer/LiveFxDeckV881.tsx'):ui;
  assert(data.includes(part),part);
 }
 const wiring=read('components/visualizer/LiveFxDeckV881.tsx');
 for(const x of ['resolveLiveChangesV998(plan,snapshotLiveV998())',
  'setLiveUndoV998({trackId','JSON.stringify(cameraSettingsV992)',
  'setCameraSettingsV992(next.camera)','setAiUndoV982(null);setLiveUndoV998(null)'])
  assert(wiring.includes(x),'Missing wiring '+x);
 for(const f of ['app/api/ai/live-concert/route.ts','components/visualizer/LiveConcertAssistantV998.tsx',
  'lib/liveConcertAssistantV998.ts']){
  const src=read(f);
  for(const bad of ['alexa/command','govee/command','navigator.bluetooth','navigator.serial',
   'window.localStorage','eval(','new Function('])assert(!src.includes(bad),f+' '+bad);
 }
});
let token='';let requests=0;let lastCall;let upstreamMode='ok';
const fakeEnv={OPENAI_API_KEY:'test-only-api-key',OPENAI_MODEL:'gpt-4.1-mini'};
const apiModule={exports:{}};
const fakeFetch=async(url,options)=>{
 requests++;lastCall={url,options};
 if(upstreamMode==='fail')return Response.json({error:'offline'},{status:503});
 return Response.json({output:[{type:'message',content:[{type:'output_text',
  text:JSON.stringify(upstreamMode==='bad'?plan([act('govee','power','on')]):sample)}]}]});
};
const fakeRequire=name=>{
 if(name==='@/lib/spotify')return {getValidSession:async()=>token?{
  session:{accessToken:token,refreshToken:'private-token'},refreshed:false}:null,
  ReauthRequiredError:class extends Error{}};
 if(name==='@/lib/session')return {setSessionCookie:()=>{}};
 if(name==='@/lib/liveConcertAssistantV998')return {normalizeLivePlanV998:v.normalizeLivePlanV998};
 if(name==='next/server')return {NextResponse:{json:(body,opts={})=>Response.json(body,opts)}};
 if(name==='node:crypto')return require('node:crypto');
 throw Error('Unexpected require '+name);
};
vm.runInNewContext(compiled('app/api/ai/live-concert/route.ts'),{
 module:apiModule,exports:apiModule.exports,require:fakeRequire,fetch:fakeFetch,
 Request,Response,URL,AbortSignal,Number,Date,Map,JSON,process:{env:fakeEnv},
});
const api=apiModule.exports;
const req=(prompt='Mach das Konzert düsterer',genre='Deutschrap',origin='http://localhost:3000')=>
 new Request('http://localhost:3000/api/ai/live-concert',{
  method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify({prompt,genre})});
(async()=>{
 await (async()=>{
  token='';const noAuth=await api.POST(req());assert.equal(noAuth.status,401);
  token='token1';const res=await api.POST(req());assert.equal(res.status,200);
  assert.equal((await res.json()).plan.actions.length,3);
  assert.equal(res.headers.get('Cache-Control'),'private, no-store');
  const outgoing=JSON.parse(lastCall.options.body);
  assert.equal(outgoing.store,false);assert.equal(outgoing.tools,undefined);
  assert.equal(outgoing.text.format.type,'json_schema');
  assert(!lastCall.options.body.includes('token1'));
  assert(!lastCall.options.body.includes('private-token'));
  assert(!lastCall.options.body.includes('audio recording'));
  checks++;console.log('PASS V998 authenticated API uses structured suggestions only');
 })();
 const count=requests;
 assert.equal((await api.POST(req('Gut','Pop','https://evil.invalid'))).status,403);
 assert.equal((await api.POST(req('x','Pop'))).status,400);
 assert.equal((await api.POST(req('x'.repeat(451),'Pop'))).status,400);
 assert.equal((await api.POST(req('Ein guter Song','x'.repeat(76)))).status,400);
 assert.equal(requests,count);
 checks++;console.log('PASS V998 invalid requests rejected without upstream calls');
 delete fakeEnv.OPENAI_API_KEY;
 assert.equal((await api.POST(req())).status,503);
 fakeEnv.OPENAI_API_KEY='test-only-api-key';token='token2';upstreamMode='bad';
 assert.equal((await api.POST(req())).status,502);
 token='token3';upstreamMode='fail';assert.equal((await api.POST(req())).status,502);
 checks++;console.log('PASS V998 unavailable API and malicious AI output fail closed');
 upstreamMode='ok';token='rate-token';let last;
 for(let i=0;i<6;i++)last=await api.POST(req());
 assert.equal(last.status,429);checks++;console.log('PASS V998 per-session burst guard');
 const pkg=JSON.parse(read('package.json'));
 assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=998);
 assert.equal(pkg.sonicFeatureRelease,pkg.sonicRoadmapRelease);
 assert(pkg.scripts.prebuild.includes('test:v998'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v998-live-ai-concert-regression.cjs'));
 assert(read('.github/workflows/v998-live-concert-validation.yml').includes('test:v998'));
 checks++;console.log('PASS V998 build and CI gates wired');
 console.log('V998 PASS: '+checks+' groups');
})().catch(e=>{console.error(e);process.exitCode=1;});

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checked=0;function test(label,fn){const result=fn();if(result&&typeof result.then==='function')return result.then(()=>{
 console.log('PASS V982 '+label);checked++;});console.log('PASS V982 '+label);checked++;}
const compiled=(path,jsx=false)=>{const result=ts.transpileModule(read(path),{
 fileName:path,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,
 module:ts.ModuleKind.CommonJS,jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 const error=result.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error)||[];
 assert.equal(error.length,0,ts.formatDiagnostics(error,{getCurrentDirectory:()=>root,
 getCanonicalFileName:x=>x,getNewLine:()=>"\n"}));return result.outputText;};
const core=compiled('lib/immersiveAiDirectorV982.ts');
const lib={exports:{}};vm.runInNewContext(core,{module:lib,exports:lib.exports});const p=lib.exports;
const input=p.localImmersivePlanV982('Hardtekk sehr starke Drops','hardtekk');
test('the local plan covers exactly five ordered sections',()=>{
 assert.equal(input.look,'reactor');assert.equal(input.palette,'electric');assert.equal(input.pace,'festival');
 assert.deepEqual([...input.scenes.map(x=>x.section)],['intro','verse','hook','drop','finale']);
});
test('distinct genre defaults are applied without a network request',()=>{
 assert.equal(p.localImmersivePlanV982('Deutschrap','Deutschrap').look,'noir');
 assert.equal(p.localImmersivePlanV982('Deutschrock Arena','Deutschrock').look,'rock-arena');
 assert.equal(p.localImmersivePlanV982('sanfte Ballade','Pop').pace,'gentle');
});
test('a calm wish reduces the virtual FX cap',()=>{
 const quiet=p.localImmersivePlanV982('weniger, ruhig, emotional','hardstyle');
 assert(quiet.fxIntensity<input.fxIntensity);assert(quiet.stageIntensity<input.stageIntensity);
});
test('model results are strictly normalized and clamped',()=>{
 const value=p.normalizeImmersivePlanV982({...input,fxIntensity:999});assert.equal(value,null);
 const high=p.normalizeImmersivePlanV982({...input,fxIntensity:100,stageIntensity:100});
 assert.equal(high.stageIntensity,75);assert.equal(high.fxIntensity,75);
});
test('invalid, incomplete and model-manipulated plans fail closed',()=>{
 for(const x of [null,{},[],{...input,look:'laser-shoot'},
  {...input,scenes:input.scenes.slice(1)},
  {...input,scenes:[{...input.scenes[0],section:'finale'},...input.scenes.slice(1)]},
  {...input,fxIntensity:NaN}, {...input,fxIntensity:-1},
  {...input,explanation:''},{...input,scenes:[...input.scenes.slice(0,4),{section:'finale',description:''}]}])
  assert.equal(p.normalizeImmersivePlanV982(x),null);
});
test('untrusted text is bounded and extra fields cannot become actions',()=>{
 const plan=p.normalizeImmersivePlanV982({...input,title:'A'.repeat(1000)+'\u0007',
  arbitraryHardwareCommand:'turn on Govee',scenes:input.scenes.map(s=>({...s,description:'\u0001'+s.description.repeat(20)}))});
 assert(plan);assert.equal(plan.title.length,72);assert(!('arbitraryHardwareCommand' in plan));
 for(const s of plan.scenes){assert(s.description.length<=155);assert(!s.description.includes('\u0001'));}
});
test('depth portal stays behind the cast and off for quiet/invalid cues',()=>{
 const out={exports:{}};
 vm.runInNewContext(compiled('lib/immersiveDepthPortalV982.ts'),{module:out,exports:out.exports});
 const depth=out.exports.planImmersiveDepthV982;
 const cue={active:true,mood:'impact',sideGlowOpacity:.16,archScale:1};
 const rings=depth(cue);assert.equal(rings.length,3);
 assert(rings.every(r=>r.z<=-4.5&&r.z>=-6&&r.opacity>0&&r.opacity<=.055));
 assert.equal(depth({...cue,mood:'breathing'}).length,0);
 assert.equal(depth({...cue,active:false}).length,0);
 assert.equal(depth({...cue,sideGlowOpacity:NaN}).length,0);
 assert(read('components/visualizer/ImmersiveConcertEnvironmentV966.tsx').includes('depthRingsV982.map'));
});
test('all new TS/TSX modules parse with TypeScript',()=>{
 compiled('app/api/ai/immersive-show/route.ts');
 compiled('lib/immersiveDepthPortalV982.ts');
 compiled('components/visualizer/ImmersiveConcertEnvironmentV966.tsx',true);
 compiled('components/visualizer/ImmersiveAiDirectorV982.tsx',true);
 compiled('components/visualizer/LiveFxDeckV881.tsx',true);
});
test('AI panel has review, consent and abort-on-track-change guards',()=>{
 const ui=read('components/visualizer/ImmersiveAiDirectorV982.tsx');
 for(const part of ['onApply(plan)','onUndo()','controller.current?.abort()','[trackId]',
  'Lokal entwerfen','KI-Regie fragen','Keine Lyrics','Regelbasierter lokaler Vorschlag'])
  assert(ui.includes(part),'Missing UI guard '+part);
 const wiring=read('components/visualizer/LiveFxDeckV881.tsx');
 for(const part of ['ImmersiveAiDirectorV982','canApply={settings.enabled&&settings.auto&&!motionOff}',
  'setAtmosphereSettings(atmosphere)','setGenreStageSettingsV894(genreStage)',
  'Math.min(settings.intensity,plan.fxIntensity)','setAiUndoV982(null)','JSON.stringify(settings)'])
  assert(wiring.includes(part),'Missing integration '+part);
});
test('real-world device interfaces are not used by the new components',()=>{
 const source=read('components/visualizer/ImmersiveAiDirectorV982.tsx')+read('lib/immersiveAiDirectorV982.ts');
 for(const item of ['alexa/command','govee','navigator.bluetooth','navigator.serial','window.localStorage','eval(','new Function('])
  assert(!source.includes(item),'No direct device writes '+item);
});
let token='test-token';let network=0;let outgoing=null;let upstreamStatus=200;
const routeModule={exports:{}};
const fakeEnv={OPENAI_API_KEY:'unit-test-key',OPENAI_MODEL:'gpt-4.1-mini'};
const mockedFetch=async(url,options)=>{
 network++;outgoing={url,options};return Response.json({output:[{type:'message',content:[{
  type:'output_text',text:JSON.stringify(input)}]}]},{status:upstreamStatus});
};
const fakeRequire=(name)=>{
 if(name==='@/lib/spotify')return {getValidSession:async()=>token?{
  session:{accessToken:token,refreshToken:'refresh-token'},refreshed:false}:null,
  ReauthRequiredError:class extends Error{}};
 if(name==='@/lib/session')return {setSessionCookie:()=>{}};
 if(name==='@/lib/immersiveAiDirectorV982')return {normalizeImmersivePlanV982:p.normalizeImmersivePlanV982};
 if(name==='next/server')return {NextResponse:{json:(body,options={})=>Response.json(body,options)}};
 if(name==='node:crypto')return require('node:crypto');
 throw Error('Unexpected dependency '+name);
};
vm.runInNewContext(compiled('app/api/ai/immersive-show/route.ts'),{
 module:routeModule,exports:routeModule.exports,require:fakeRequire,fetch:mockedFetch,
 URL,Request,Response,AbortSignal,Date,Map,JSON,Number,process:{env:fakeEnv},
 });
const api=routeModule.exports;
const req=(body,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/ai/immersive-show',{
 method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
(async()=>{
 await test('route accepts only an authenticated, explicitly submitted prompt',async()=>{
  token='';const before=network;const noAuth=await api.POST(req({prompt:'Düsterer Rap',genre:'Rap'}));
  assert.equal(noAuth.status,401);assert.equal(network,before);
  token='auth1';const okay=await api.POST(req({prompt:'Düsterer Rap',genre:'Rap'}));
  assert.equal(okay.status,200);const result=await okay.json();assert.equal(result.source,'ai');
  assert.equal(result.plan.look,'reactor');assert.equal(result.plan.scenes.length,5);
  assert.equal(okay.headers.get('Cache-Control'),'private, no-store');
 });
 await test('only short prompt and genre are sent to provider, not Spotify tokens',async()=>{
  const body=JSON.parse(outgoing.options.body);
  assert.equal(outgoing.url,'https://api.openai.com/v1/responses');
  assert.equal(body.store,false);assert(!outgoing.options.body.includes('refresh-token'));
  assert(!outgoing.options.body.includes('auth1'));assert(!outgoing.options.body.includes('lyrics'));
  assert.equal(body.text.format.type,'json_schema');assert.equal(body.tools,undefined);
 });
 await test('invalid origin, length, prompt and payload do not contact provider',async()=>{
  const before=network;
  assert.equal((await api.POST(req({prompt:'Hello there',genre:'Pop'},'https://hostile.example'))).status,403);
  assert.equal((await api.POST(req({prompt:'x',genre:'Pop'}))).status,400);
  assert.equal((await api.POST(req({prompt:'x'.repeat(451),genre:'Pop'}))).status,400);
  assert.equal((await api.POST(req({prompt:'Hello there',genre:'A'.repeat(76)}))).status,400);
  assert.equal(network,before);
 });
 await test('unconfigured secret skips provider calls; upstream outages do not invent plans',async()=>{
  const before=network;delete fakeEnv.OPENAI_API_KEY;
  const noKey=await api.POST(req({prompt:'Düsteres Konzert',genre:'Rap'}));
  assert.equal(noKey.status,503);assert.equal(network,before);
  fakeEnv.OPENAI_API_KEY='unit-test-key';token='auth2';upstreamStatus=503;
  const bad=await api.POST(req({prompt:'Düsteres Konzert',genre:'Rap'}));
  assert.equal(bad.status,502);upstreamStatus=200;
 });
 await test('burst protection limits calls even with a valid session',async()=>{
  token='auth3';let last;
  for(let i=0;i<7;i++)last=await api.POST(req({prompt:'Epische Neonarena',genre:'Hardtekk'}));
  assert.equal(last.status,429);
 });
 await test('production Vercel preflight and versioned ZIP importer are registered',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=982);assert(pkg.scripts['test:v982']);
  assert(read('scripts/project-archive-import.py').includes('sonicRoadmapRelease'));
  assert(read('scripts/vercel-production-build.cjs').includes('V982 immersive AI director'));
  assert(read('.env.example').includes('OPENAI_API_KEY='));
 });
 console.log(`V982 PASS: ${checked} checks`);
})().catch(err=>{console.error(err);process.exitCode=1});

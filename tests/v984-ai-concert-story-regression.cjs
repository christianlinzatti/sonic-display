#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compiled=(file,jsx=false)=>{
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!result.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error),file+' syntax');
 return result.outputText;
};
const run=(file,dependencies={})=>{
 const module={exports:{}};
 vm.runInNewContext(compiled(file),{module,exports:module.exports,
  require:name=>{if(name in dependencies)return dependencies[name];throw Error('Unexpected '+name);}});
 return module.exports;
};
const v982=run('lib/immersiveAiDirectorV982.ts');
const v983=run('lib/aiSongIntelligenceV983.ts',{'./immersiveAiDirectorV982':v982});
const core=run('lib/aiConcertStoryV984.ts',{'./aiSongIntelligenceV983':v983,'./immersiveAiDirectorV982':v982});
const insight=v983.localSongInsightV983({title:'Testtrack',artist:'Demo',genre:'Hardtekk',durationMs:220000});
const local=core.localConcertStoryV984(insight,'festival');
let checks=0;
function test(label,fn){const result=fn();if(result&&typeof result.then==='function')
 return result.then(()=>{checks++;console.log('PASS V984 '+label);});
 checks++;console.log('PASS V984 '+label);}
test('every offline style has a cohesive five-act energy arc',()=>{
 for(const style of ['cinematic','festival','intimate']){
  const plan=core.localConcertStoryV984(insight,style);
  assert(plan);assert.equal(plan.acts.length,5);
  assert.deepEqual([...plan.acts.map(a=>a.section)],['intro','verse','hook','drop','finale']);
  assert.equal(plan.verifiedTiming,null);assert.equal(plan.basis,'metadata-only');
  assert.equal(plan.confidence,'creative-estimate');
  assert(plan.acts[3].energy>plan.acts[0].energy);
  assert(plan.acts[4].energy<plan.acts[3].energy);
  assert(plan.acts.every(a=>a.camera&&a.transition&&a.direction));
 }
 assert.notEqual(core.localConcertStoryV984(insight,'intimate').title,local.title);
});
test('validates only explicit style, five ordered acts and metadata interpretations',()=>{
 assert(core.normalizeStoryInputV984({style:'festival',insight}));
 for(const v of [null,[],{}, {style:'auto',insight},{style:'festival',insight:{...insight,phases:[]}}])
  assert.equal(core.normalizeStoryInputV984(v),null);
 for(const v of [null,[],{}, {...local,acts:[]},{...local,acts:local.acts.slice(1)},
  {...local,acts:[{...local.acts[0],section:'finale'},...local.acts.slice(1)]},
  {...local,acts:local.acts.map(a=>({...a,energy:Infinity}))},
  {...local,acts:local.acts.map(a=>({...a,energy:90}))},
  {...local,motif:''},{...local,acts:local.acts.map(a=>({...a,energy:32}))},
  {...local,acts:local.acts.map((a,i)=>({...a,energy:i===1?75:i===0?0:35}))}])
  assert.equal(core.normalizeConcertStoryV984(v),null);
});
test('rejects fabricated beat times and discards model-provided control fields',()=>{
 for(const fake of ['Drop bei 120 BPM','Kamera bei 01:25 schneiden','Start in 45 Sekunden'])
  assert.equal(core.normalizeConcertStoryV984({...local,arcDescription:fake}),null);
 const normalized=core.normalizeConcertStoryV984({...local,verifiedTiming:[0,20000],
  measuredBpm:160,controlGovee:true,acts:local.acts.map(a=>({...a,turnOnGovee:true}))});
 assert(normalized);assert.equal(normalized.verifiedTiming,null);
 assert(!('measuredBpm' in normalized));assert(!('controlGovee' in normalized));
 assert(normalized.acts.every(x=>!('turnOnGovee' in x)));
});
test('translates story into a bounded virtual V982 look, without timed triggers',()=>{
 const plan=core.immersivePlanFromStoryV984(local,insight);
 assert(plan);assert.equal(plan.look,'reactor');assert.equal(plan.palette,'electric');
 assert.equal(plan.scenes.length,5);
 assert(plan.scenes.every(scene=>scene.description.includes('Übergang:')));
 assert(plan.fxIntensity<=40);assert(plan.atmosphereIntensity<=65);
 assert(!('timeline' in plan));assert(!('hardware' in plan));
 assert.equal(core.immersivePlanFromStoryV984({...local,acts:[]},insight),null);
 assert.equal(core.immersivePlanFromStoryV984(local,{...insight,phases:[]}),null);
});
test('genres produce distinct motifs and no false audio proof',()=>{
 const rap=core.localConcertStoryV984(v983.localSongInsightV983({title:'Rap',artist:'A',genre:'Deutschrap',durationMs:200000}),'cinematic');
 const rock=core.localConcertStoryV984(v983.localSongInsightV983({title:'Rock',artist:'A',genre:'Deutschrock',durationMs:200000}),'cinematic');
 assert.notEqual(rap.motif,rock.motif);assert.notEqual(rock.motif,local.motif);
 assert(rap.arcDescription.includes('Keine Songstruktur'));
});
test('all V984 modules and their host TypeScript parse',()=>{
 for(const file of ['lib/aiConcertStoryV984.ts','app/api/ai/concert-story/route.ts'])compiled(file);
 for(const file of ['components/visualizer/ConcertStoryDirectorV984.tsx',
  'components/visualizer/SongIntelligencePanelV983.tsx',
  'components/visualizer/LiveFxDeckV881.tsx'])compiled(file,true);
});
test('UI is opt-in, aborts stale work, allows local generation, no hardware commands',()=>{
 const ui=read('components/visualizer/ConcertStoryDirectorV984.tsx');
 const v983ui=read('components/visualizer/SongIntelligencePanelV983.tsx');
 for(const guard of ['onApply(plan)','/api/ai/concert-story','abort.current?.abort()',
  '[trackId,insight]','currentTrack.current','currentInsight.current','credentials:\'same-origin\'',
  'Lokale Konzertgeschichte','Storyboard ohne verifizierte Song-Zeitpunkte',
  'canApply','setApplied(true)'])assert(ui.includes(guard),guard);
 assert(v983ui.includes('<ConcertStoryDirectorV984 trackId={trackId} insight={insight}'));
 assert(v983ui.includes('onApply={onApply} canApply={canApply}'));
 const host=read('components/visualizer/LiveFxDeckV881.tsx');
 assert(host.includes('onApply={applyImmersiveV982}'));
 assert(host.includes('setAiUndoV982({trackId'));
 for(const forbidden of ['navigator.bluetooth','govee/command','alexa/command','eval(','localStorage'])
  assert(!ui.includes(forbidden),forbidden);
});
let token='s1',count=0,status=200,outgoing=null;
const env={OPENAI_API_KEY:'test-secret-api-key',OPENAI_MODEL:'gpt-4.1-mini'};
const fakeFetch=async(url,options)=>{
 count++;outgoing={url,options};
 return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(local)}]}]},{status});
};
const routeModule={exports:{}};
vm.runInNewContext(compiled('app/api/ai/concert-story/route.ts'),{
 module:routeModule,exports:routeModule.exports,URL,Request,Response,AbortSignal,Date,Map,Number,JSON,
 process:{env},fetch:fakeFetch,
 require:name=>{
  if(name==='@/lib/spotify')return {getValidSession:async()=>token?{session:{accessToken:token,refreshToken:'refresh-private'},refreshed:false}:null,
   ReauthRequiredError:class extends Error{}};
  if(name==='@/lib/session')return {setSessionCookie:()=>{}};
  if(name==='@/lib/aiConcertStoryV984')return core;
  if(name==='next/server')return {NextResponse:{json:(body,opts={})=>Response.json(body,opts)}};
  if(name==='node:crypto')return require('node:crypto');
  throw Error('Unexpected '+name);
 }});
const route=routeModule.exports;
const req=(body,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/ai/concert-story',
 {method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)});
const input={style:'festival',insight};
(async()=>{
 await test('API requires Spotify session and configured model key',async()=>{
  token='';const before=count;assert.equal((await route.POST(req(input))).status,401);
  token='s1';delete env.OPENAI_API_KEY;assert.equal((await route.POST(req(input))).status,503);
  env.OPENAI_API_KEY='test-secret-api-key';assert.equal(count,before);
 });
 await test('strict schema, no secrets, no tools, no persistent AI output',async()=>{
  const response=await route.POST(req(input));assert.equal(response.status,200);
  const body=await response.json();assert.equal(body.source,'ai');
  assert.equal(body.story.verifiedTiming,null);
  assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  assert.equal(outgoing.url,'https://api.openai.com/v1/responses');
  const sent=JSON.parse(outgoing.options.body);
  assert.equal(sent.store,false);assert.equal(sent.text.format.type,'json_schema');
  assert.equal(sent.text.format.strict,true);assert.equal(sent.tools,undefined);
  assert(sent.input[0].content.includes('festival'));
  for(const value of ['refresh-private','test-secret-api-key','"accessToken"','"audioUrl"','"lyrics"'])
   assert(!outgoing.options.body.includes(value),'Sensitive leak: '+value);
 });
 await test('API rejects invalid, cross-origin and oversized requests before AI',async()=>{
  const before=count;
  assert.equal((await route.POST(req(input,'https://not-allowed.example'))).status,403);
  assert.equal((await route.POST(req({...input,style:'real-laser'}))).status,400);
  assert.equal((await route.POST(req({style:'festival',insight:{...insight,phases:[]}}))).status,400);
  const big=new Request('http://localhost:3000/api/ai/concert-story',
   {method:'POST',headers:{origin:'http://localhost:3000'},body:'x'.repeat(6700)});
  assert.equal((await route.POST(big)).status,413);assert.equal(count,before);
 });
 await test('API upstream failure and rate limiting fail closed',async()=>{
  token='s2';status=502;assert.equal((await route.POST(req(input))).status,502);
  status=200;token='s3';let res;
  for(let i=0;i<5;i++)res=await route.POST(req(input));
  assert.equal(res.status,429);
 });
 await test('V984 registered in build gate, CI workflow and scoped type check',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=984);
  assert(pkg.scripts.prebuild.includes('npm run test:v984 && npm run test:v984:types &&'));
  assert(pkg.scripts['test:v984']);assert(pkg.scripts['test:v984:types']);
  assert(read('scripts/vercel-production-build.cjs').includes('V984 AI concert story director'));
  assert(read('.github/workflows/v832-continuous-validation.yml').includes('V984 AI Concert Story Director'));
  const tsc=JSON.parse(read('tests/tsconfig.v984-core.json'));
  assert(tsc.files.includes('../lib/aiConcertStoryV984.ts'));
 });
 console.log('V984 PASS: '+checks+' checks');
})().catch(e=>{console.error(e);process.exitCode=1;});

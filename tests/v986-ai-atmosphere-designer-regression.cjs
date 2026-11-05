#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const compiled=(file,jsx=false)=>{
 const r=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!r.diagnostics?.some(x=>x.category===ts.DiagnosticCategory.Error),file+' syntax');
 return r.outputText;
};
const run=(file,deps={})=>{
 const module={exports:{}};
 vm.runInNewContext(compiled(file),{module,exports:module.exports,Math,Number,JSON,Map,Set,
  require:name=>{if(name in deps)return deps[name];throw Error('Unexpected dependency '+name);}});
 return module.exports;
};
const v982=run('lib/immersiveAiDirectorV982.ts');
const v983=run('lib/aiSongIntelligenceV983.ts',{'./immersiveAiDirectorV982':v982});
const v984=run('lib/aiConcertStoryV984.ts',{'./aiSongIntelligenceV983':v983,'./immersiveAiDirectorV982':v982});
const v986=run('lib/aiAtmosphereDesignerV986.ts',{
 './aiConcertStoryV984':v984,'./aiSongIntelligenceV983':v983,
 './immersiveAiDirectorV982':v982});
const v354=run('services/stageContent/showTimelineV354.ts');
const v985=run('lib/predictiveShowTimelineV985.ts',{
 './aiConcertStoryV984':v984,'../services/stageContent/showTimelineV354':v354});
const timeline=run('lib/atmosphereTimelineV986.ts',{
 './aiAtmosphereDesignerV986':v986,'./predictiveShowTimelineV985':v985,
 '../services/stageContent/showTimelineV354':v354});
const make=(genre,style='cinematic')=>{
 const insight=v983.localSongInsightV983({title:'Probe',artist:'Künstler',genre,durationMs:200000});
 const story=v984.localConcertStoryV984(insight,style);
 const plan=v986.localAtmospherePlanV986(story,insight.mood);
 return {insight,story,plan};
};
const {insight,story,plan}=make('Deutschrap');
const raw={trackId:'spotify:track:ABC',durationMs:200000,progressMs:50000,playing:true,
 source:'verified-v604',scenes:[
 {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:10000,endMs:30000},
 {index:1,actIndex:1,section:'hook',intent:'ensemble',startMs:50000,endMs:70000},
 {index:2,actIndex:2,section:'build',intent:'rise',startMs:90000,endMs:110000},
 {index:3,actIndex:3,section:'drop',intent:'pulse',startMs:140000,endMs:160000},
 {index:4,actIndex:4,section:'break',intent:'breath',startMs:181000,endMs:196000}
 ]};
let checks=0;
function test(label,fn){const result=fn();if(result&&typeof result.then==='function')
 return result.then(()=>{checks++;console.log('PASS V986 '+label);});
 checks++;console.log('PASS V986 '+label);}
test('offline plans for rap, hardtekk, rock and ballad are 5 coherent acts',()=>{
 const palettes={Deutschrap:'noir',Hardtekk:'electric',Deutschrock:'arena',Ballade:'dream'};
 for(const [genre,palette] of Object.entries(palettes)){
  const p=make(genre,'festival').plan;
  assert(p);assert.equal(p.acts.length,5);assert.equal(p.palette,palette);
  assert.equal(p.verifiedTiming,null);assert.equal(p.physicalControl,false);
  assert.equal(p.basis,'creative-storyboard');
  assert(p.acts.every(x=>x.virtualLight<=65&&x.haze<=35&&x.beams<=55));
  assert.deepEqual(Array.from(p.acts,x=>x.section),['intro','verse','hook','drop','finale']);
  assert(v986.normalizeAtmospherePlanV986(p));
 }
});
test('rejects malformed or out-of-palette model outputs',()=>{
 const bad=[null,[],{}, {...plan,palette:'physical'}, {...plan,acts:[]},
  {...plan,acts:plan.acts.slice(1)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,section:'finale'}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,accent:'cyan'}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,haze:75}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,beams:Infinity}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,virtualLight:-1}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,led:'strobe'}:a)},
  {...plan,acts:plan.acts.map((a,i)=>i===0?{...a,transition:'hard-flash'}:a)},
  {...plan,acts:plan.acts.map(a=>({...a,virtualLight:30}))},
  {...plan,acts:plan.acts.map((a,i)=>({...a,virtualLight:i===0?0:i===1?60:30}))},
 ];
 for(const v of bad)assert.equal(v986.normalizeAtmospherePlanV986(v),null);
});
test('normalizer strips invented hardware, BPM evidence and code-like fields',()=>{
 const r=v986.normalizeAtmospherePlanV986({...plan,
  controlGovee:true,beatTimestamp:123456,bpm:170,
  acts:plan.acts.map(x=>({...x,hardware:'laser',isLive:true,beatTimeMs:10000}))});
 assert(r);assert(!('controlGovee' in r));assert(!('beatTimestamp' in r));
 assert(r.acts.every(x=>!('hardware' in x)&&!('beatTimeMs' in x)));
 for(const text of ['Start bei 160 BPM','Lichtwechsel bei 01:25','Jetzt für 15 Sekunden'])
  assert.equal(v986.normalizeAtmospherePlanV986({...plan,description:text}),null);
});
test('input must be valid V984 storyboard and declared mood',()=>{
 assert(v986.normalizeAtmosphereInputV986({story,mood:'dark'}));
 assert.equal(v986.normalizeAtmosphereInputV986({story,mood:'govee'}),null);
 assert.equal(v986.normalizeAtmosphereInputV986({story:{...story,acts:[]},mood:'dark'}),null);
});
test('virtual approval outputs bounded existing V982 settings',()=>{
 const result=v986.immersivePlanFromAtmosphereV986(plan,story,insight);
 assert(result);assert.equal(result.palette,'noir');
 assert(result.fxIntensity<=35);assert(result.atmosphereIntensity<=65);
 assert(result.stageIntensity<=65);assert.equal(result.scenes.length,5);
 assert(result.scenes.every(x=>x.description.includes('LED-Idee:')));
 assert.equal(v986.immersivePlanFromAtmosphereV986({...plan,acts:[]},story,insight),null);
 assert.equal(v986.immersivePlanFromAtmosphereV986(plan,story,{...insight,phases:[]}),null);
 assert(!('hardware' in result));assert(!('timeMs' in result));
});
test('confirmed V604/V763 song identity and timestamps are mandatory',()=>{
 assert(v985.verifiedConcertSnapshotV985(raw,raw.trackId,raw.durationMs));
 const valid=timeline.proposeAtmosphereCuesV986(raw,plan,raw.trackId,raw.durationMs);
 assert.equal(valid.length,5);
 for(const wrong of [{...raw,source:'unavailable'},{...raw,trackId:'other'},
  {...raw,durationMs:250000},{...raw,scenes:[]}]){
  assert.equal(timeline.proposeAtmosphereCuesV986(wrong,plan,raw.trackId,raw.durationMs).length,0);
 }
 assert.equal(timeline.proposeAtmosphereCuesV986(raw,plan,'other',raw.durationMs).length,0);
 assert.equal(timeline.proposeAtmosphereCuesV986(raw,{...plan,acts:[]},raw.trackId,raw.durationMs).length,0);
});
test('only virtual lighting gains; no guessed times, no dangerous hardware',()=>{
 const cues=timeline.proposeAtmosphereCuesV986(raw,plan,raw.trackId,raw.durationMs);
 assert.deepEqual(Array.from(cues,x=>x.clip.startMs),raw.scenes.map(x=>x.startMs));
 assert.deepEqual(Array.from(cues,x=>x.actIndex),[0,1,2,3,4]);
 assert(cues.every(x=>x.clip.lane==='lighting'&&x.clip.value>=.65&&x.clip.value<=1.25));
 assert(cues.every(x=>x.clip.id.match(/^v986-\d+-lighting$/)));
 assert(cues.every(x=>x.clip.durationMs<=7000));
});
test('opt-in import does not enable score, overwrite manual clips or change songs',()=>{
 const base=v354.sanitizeTimelineV354({...v354.DEFAULT_TIMELINE_V354,
  trackId:raw.trackId,durationMs:raw.durationMs,clips:[]});
 const proposals=timeline.proposeAtmosphereCuesV986(raw,plan,raw.trackId,raw.durationMs);
 const selected=proposals.map(x=>x.clip.id);
 const r=timeline.importAtmosphereCuesV986(base,raw,plan,selected);
 assert.equal(r.added,5);assert.equal(r.score.enabled,false);
 assert.equal(r.score.clips.length,5);
 assert.equal(timeline.importAtmosphereCuesV986(r.score,raw,plan,selected).added,0);
 const existing={...base,clips:[{id:'manual',lane:'lighting',startMs:10000,durationMs:8000,
  value:1.1,label:'Manuell'}]};
 const manual=timeline.importAtmosphereCuesV986(existing,raw,plan,selected);
 assert.equal(manual.conflicts,1);assert.equal(manual.added,4);
 assert.equal(manual.score.clips[0].id,'manual');
 assert.equal(manual.score.clips[0].value,1.1);
 assert.equal(timeline.importAtmosphereCuesV986({...base,trackId:'other'},raw,plan,selected).added,0);
 assert.equal(timeline.importAtmosphereCuesV986(base,{...raw,source:'unavailable'},plan,selected).added,0);
 assert.equal(timeline.importAtmosphereCuesV986(base,raw,plan,['fake']).invalid,1);
 assert.equal(timeline.importAtmosphereCuesV986(base,raw,plan,Array(81).fill(selected[0])).added,0);
});
test('new files and integration compile by SWC-compatible TypeScript parsing',()=>{
 for(const p of ['lib/aiAtmosphereDesignerV986.ts','lib/atmosphereTimelineV986.ts',
  'app/api/ai/atmosphere/route.ts'])compiled(p);
 for(const p of ['components/visualizer/AtmosphereDesignerV986.tsx',
  'components/visualizer/ConcertStoryDirectorV984.tsx'])compiled(p,true);
});
test('UI is opt-in, cancelable, track-bound and physically inert',()=>{
 const ui=read('components/visualizer/AtmosphereDesignerV986.tsx');
 const parent=read('components/visualizer/ConcertStoryDirectorV984.tsx');
 for(const s of ['/api/ai/atmosphere','abort.current?.abort()',
  'current.current.trackId','onApply(virtual)','Lokale Lichtwelt erstellen',
  'verifiedConcertSnapshotV985','readTimelineV354()',
  'saveTimelineV354(result.score)','disabled={!canApply||!virtual||applied}'])assert(ui.includes(s),s);
 assert(parent.includes('<AtmosphereDesignerV986 '));
 for(const forbidden of ['navigator.bluetooth','/api/govee/','/api/alexa/','eval(','setInterval(','requestAnimationFrame('])
  assert(!ui.includes(forbidden),forbidden);
});
let token='s1',count=0,status=200,outgoing=null;
const env={OPENAI_API_KEY:'test-key-123',OPENAI_MODEL:'gpt-4.1-mini'};
const fakeFetch=async(url,options)=>{count++;outgoing={url,options};
 return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(plan)}]}]},{status});};
const routeModule={exports:{}};
vm.runInNewContext(compiled('app/api/ai/atmosphere/route.ts'),{
 module:routeModule,exports:routeModule.exports,URL,Request,Response,AbortSignal,Date,Map,Number,JSON,
 process:{env},fetch:fakeFetch,
 require:name=>{
  if(name==='@/lib/spotify')return {getValidSession:async()=>token?{session:{accessToken:token,refreshToken:'refresh-private'},refreshed:false}:null,
   ReauthRequiredError:class extends Error{}};
  if(name==='@/lib/session')return {setSessionCookie:()=>{}};
  if(name==='@/lib/aiAtmosphereDesignerV986')return v986;
  if(name==='next/server')return {NextResponse:{json:(body,opts={})=>Response.json(body,opts)}};
  if(name==='node:crypto')return require('node:crypto');
  throw Error('Unexpected '+name);
 }});
const route=routeModule.exports;
const request=(body,origin='http://localhost:3000')=>new Request('http://localhost:3000/api/ai/atmosphere',
 {method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const input={story,mood:insight.mood};
(async()=>{
 await test('API requires Spotify session and API configuration',async()=>{
  token='';const before=count;assert.equal((await route.POST(request(input))).status,401);
  token='s1';delete env.OPENAI_API_KEY;assert.equal((await route.POST(request(input))).status,503);
  env.OPENAI_API_KEY='test-key-123';assert.equal(count,before);
 });
 await test('API uses strict JSON schema without leaking secrets or storing outputs',async()=>{
  const response=await route.POST(request(input));assert.equal(response.status,200);
  assert.equal(response.headers.get('Cache-Control'),'private, no-store');
  const body=await response.json();assert.equal(body.atmosphere.physicalControl,false);
  assert.equal(outgoing.url,'https://api.openai.com/v1/responses');
  const payload=JSON.parse(outgoing.options.body);
  assert.equal(payload.store,false);assert.equal(payload.text.format.strict,true);
  assert.equal(payload.text.format.type,'json_schema');assert.equal(payload.tools,undefined);
  for(const secret of ['test-key-123','refresh-private','accessToken','audioUrl','lyrics'])
   assert(!outgoing.options.body.includes(secret),'Leaked '+secret);
 });
 await test('API rejects cross-origin, invalid storyboard and excessive payload',async()=>{
  const before=count;
  assert.equal((await route.POST(request(input,'https://other.example'))).status,403);
  assert.equal((await route.POST(request({...input,mood:'laser'}))).status,400);
  assert.equal((await route.POST(request({mood:'dark',story:{...story,acts:[]}}))).status,400);
  const big=new Request('http://localhost:3000/api/ai/atmosphere',{
   method:'POST',headers:{origin:'http://localhost:3000'},body:'x'.repeat(8600)});
  assert.equal((await route.POST(big)).status,413);assert.equal(count,before);
 });
 await test('upstream failure is contained; per-session request limit works',async()=>{
  token='s2';status=502;assert.equal((await route.POST(request(input))).status,502);
  token='s3';status=200;let response;
  for(let i=0;i<5;i++)response=await route.POST(request(input));
  assert.equal(response.status,429);
 });
 await test('project scripts, type gate and Vercel integration refer to V986',()=>{
  const pkg=JSON.parse(read('package.json'));
  assert(Number(pkg.sonicRoadmapRelease.slice(1))>=986);
  assert(pkg.scripts.prebuild.includes('npm run test:v986 && npm run test:v986:types &&'));
  assert(pkg.scripts['test:v986']);assert(pkg.scripts['test:v986:types']);
  assert(read('scripts/vercel-production-build.cjs').includes('V986 AI Atmosphere Designer'));
  const cfg=JSON.parse(read('tests/tsconfig.v986-core.json'));
  assert(cfg.files.includes('../lib/aiAtmosphereDesignerV986.ts'));
  assert(read('.github/workflows/v832-continuous-validation.yml').includes('V986 AI Atmosphere Designer'));
 });
 console.log('V986 PASS: '+checks+' regression groups');
})().catch(e=>{console.error(e);process.exitCode=1});

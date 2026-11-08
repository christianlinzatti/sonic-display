'use strict';
/** V1106: pure contract and source safety tests; no API keys or network required. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1106-ai-remix-'));
let groups=0;
function check(label,fn){fn();groups++;console.log('PASS V1106 '+label);}
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}
 catch{const local=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);compiler=local;}
 if(!compiler)throw Error('TypeScript compiler required to verify V1106');
 const compile=spawnSync(process.execPath,[compiler,'--target','ES2022','--module','CommonJS',
  '--moduleResolution','node','--skipLibCheck','--strict','--outDir',temp,
  path.join(root,'lib/arena360AiShowRemixV1106.ts')],{encoding:'utf8',timeout:30000,windowsHide:true});
 assert.equal(compile.status,0,compile.stderr||compile.stdout);
 const {localAiShowRemixV1106,normalizeAiShowRemixV1106,normalizeRemixRequestV1106,applyAiShowRemixV1106}=require(path.join(temp,'arena360AiShowRemixV1106.js'));
 const {generateArenaShowPlanV1040,editArenaShowSegmentV1040,normalizeArenaShowPlanV1040,
  sampleArenaShowPlanV1040}=require(path.join(temp,'arena360ShowDesignerV1040.js'));
 check('four genre-specific offline plans',()=>{
  const names=new Set();for(const genre of ['rap','hard','rock','pop']){
   const plan=localAiShowRemixV1106('Beeindruckendes Finale',genre,70);
   assert.equal(plan.acts.length,7);assert.deepEqual(plan.acts.map(x=>x.scene),['intro','verse','build','hook','interlude','verse','finale']);
   assert(plan.acts.every(x=>x.intensity<=70));assert(normalizeAiShowRemixV1106(plan));names.add(plan.title);
  }
  assert.equal(names.size,4);
 });
 check('intensity safety, quiet and hard genres',()=>{
  for(const cap of [30,40,60,70,85])for(const prompt of ['ruhig und sanft','spektakulär, episch','intensiv, dramatisch']){
   const proposal=localAiShowRemixV1106(prompt,'hard',cap);
   assert(proposal.acts.every(x=>x.intensity<=cap));
   for(let i=1;i<proposal.acts.length;i++)assert(Math.abs(proposal.acts[i].intensity-proposal.acts[i-1].intensity)<=45);
  }
 });
 check('strict malformed AI responses rejected',()=>{
  const base=localAiShowRemixV1106('Epic','hard',70);
  const unsafe=[
   {...base,acts:base.acts.slice(1)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,scene:'drop'}:a)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,camera:'govee-send'}:a)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,intensity:101}:a)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,intensity:NaN}:a)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,note:''}:a)},
   {...base,acts:base.acts.map((a,i)=>i===0?{...a,intensity:0}:i===1?{...a,intensity:85}:a)},
  ];
  for(const value of unsafe)assert.equal(normalizeAiShowRemixV1106(value),null);
  assert.equal(normalizeAiShowRemixV1106({}),null);
 });
 check('untrusted request input and limits',()=>{
  assert.deepEqual(normalizeRemixRequestV1106({prompt:'Cinematic Concert',genre:'rap',intensityCap:65}),
   {prompt:'Cinematic Concert',genre:'rap',intensityCap:65});
  for(const bad of [
   {prompt:'a',genre:'rap',intensityCap:65},
   {prompt:'abcde',genre:'concert',intensityCap:65},
   {prompt:'abcde',genre:'hard',intensityCap:200},
   {prompt:'abcde',genre:'hard',intensityCap:65.5},
   {prompt:'X'.repeat(401),genre:'rock',intensityCap:65},
  ])assert.equal(normalizeRemixRequestV1106(bad),null);
 });
 check('existing V1040 timeline and user-authored timing survive remix',()=>{
  let base=generateArenaShowPlanV1040({prompt:'hardstyle',durationMs:247500,title:'Meine Live-Show'});
  base={...base,segments:base.segments.map((s,i)=>i===0?{...s,end:.10}:i===1?{...s,start:.10}:s)};
  assert(normalizeArenaShowPlanV1040(base));
  const proposal=localAiShowRemixV1106('epischer 360 grad bühnenumbau','hard',75);
  const next=applyAiShowRemixV1106(base,proposal,65);
  assert(next);assert.equal(next.title,base.title);assert.equal(next.durationMs,247500);
  assert.deepEqual(next.segments.map(s=>[s.id,s.scene,s.start,s.end]),base.segments.map(s=>[s.id,s.scene,s.start,s.end]));
  assert(next.segments.every(s=>s.intensity<=65));
  assert.notDeepEqual(next.segments.map(s=>s.camera),base.segments.map(s=>s.camera));
  assert.equal(applyAiShowRemixV1106(null,proposal,65),null);
  assert.equal(applyAiShowRemixV1106(base,proposal,120),null);
 });
 check('playback respects paused and reduced motion safety gates',()=>{
  const base=generateArenaShowPlanV1040({genre:'hard',durationMs:200000});
  const plan=applyAiShowRemixV1106(base,localAiShowRemixV1106('intro und finale','hard',75),75);
  assert.equal(sampleArenaShowPlanV1040(plan,{enabled:true,playing:false,reducedMotion:false,progressMs:60000,durationMs:200000}).active,false);
  assert.equal(sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:true,progressMs:60000,durationMs:200000}).active,false);
  assert.equal(sampleArenaShowPlanV1040(plan,{enabled:false,playing:true,reducedMotion:false,progressMs:60000,durationMs:200000}).active,false);
  assert.equal(sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,progressMs:60000,durationMs:200000}).active,true);
 });
 check('real UI and server integration, opt-in, undo, abort and no Govee commands',()=>{
  const panel=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const designer=fs.readFileSync(path.join(root,'components/visualizer/ArenaShowDesignerPanelV1040.tsx'),'utf8');
  const route=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  assert(designer.includes('<AiShowRemixPanelV1106 plan={plan}'));
  for(const x of ['Offline-Remix ausprobieren','Mit OpenAI kreativ gestalten','rückgängig machen',
   'applyAiShowRemixV1106','AbortController','aria-live','updatePreferences({arenaShowPlanV1040:result})'])
   assert(panel.includes(x),x);
  for(const x of ['store:false','normalizeAiShowRemixV1106','normalizeRemixRequestV1106',
   'getValidSession','OPENAI_API_KEY','Cache-Control','AbortSignal.timeout','session.session.accessToken'])
   assert(route.includes(x),x);
  assert(!route.includes('api/govee/'));assert(!route.includes('api/spotify/play'));
 });
 console.log(`PASS V1106 AI Creative Producer: ${groups} test groups; templates, consent, security, timing, motion and undo`);
}finally{fs.rmSync(temp,{recursive:true,force:true});}

#!/usr/bin/env node
'use strict';
/** No network / credentials required; compile the real production modules. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1107-'));
const check=(name,fn)=>{fn();console.log('PASS V1107 '+name)};
try {
 const tsc=process.platform==='win32'?'tsc.cmd':'tsc';
 const result=spawnSync(tsc,['-p',path.join(root,'tests/tsconfig.v1107-core.json'),
   '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',temp],{cwd:root,encoding:'utf8',timeout:30000,windowsHide:true});
 assert.equal(result.status,0,result.error?.message||result.stdout+'\n'+result.stderr);
 const {normalizeCreativeBriefV1107,curateCreativeRemixV1107,auditCreativeRemixV1107}=require(path.join(temp,'lib/aiCreativeProducerV1107.js'));
 const {localAiShowRemixV1106,normalizeAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(temp,'lib/arena360AiShowRemixV1106.js'));
 const {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040}=require(path.join(temp,'lib/arena360ShowDesignerV1040.js'));
 const def={style:'cinematic',contrast:50,surprise:35,mood:'none'};
 check('reject malformed and hostile director controls',()=>{
  for(const bad of [null,{},[],{...def,contrast:81},{...def,contrast:-1},{...def,surprise:71},{...def,style:'laser-device'},
   {...def,mood:'govee-send'},{...def,surprise:NaN},{...def,contrast:10.5}])assert.equal(normalizeCreativeBriefV1107(bad),null);
  assert.deepEqual(normalizeCreativeBriefV1107(def),def);
 });
 check('four stage direction styles change legitimate plan fields',()=>{
  const raw=localAiShowRemixV1106('Dramatisches Konzert','hard',80);
  const output=[];
  for(const style of ['cinematic','festival','intimate','surprise']){
   const p=curateCreativeRemixV1107(raw,{...def,style,surprise:65},70);
   assert(p);assert.equal(p.acts.length,7);assert(p.acts.every(x=>x.intensity<=70));
   assert(normalizeAiShowRemixV1106(p));
   assert(auditCreativeRemixV1107(p).safeTransitions);
   output.push(JSON.stringify(p.acts.map(a=>[a.deck,a.floating,a.camera,a.intensity])));
  }
  assert.equal(new Set(output).size,4);
 });
 check('every allowed cap, genre, mood and contrast remains safe',()=>{
  for(const cap of [30,35,55,70,85])for(const genre of ['hard','rap','rock','pop'])for(const mood of ['none','calm','atmospheric','focused','euphoric','intense']){
   const raw=localAiShowRemixV1106('Spannungsbogen fürs ganze Lied',genre,cap);
   const p=curateCreativeRemixV1107(raw,{style:'festival',contrast:80,surprise:70,mood},cap);
   assert(p,`${cap} ${genre} ${mood}`);
   assert(p.acts.every(a=>a.intensity<=cap));
   assert(p.acts.every((a,i)=>i===0||Math.abs(a.intensity-p.acts[i-1].intensity)<=45));
   assert(p.acts[0].intensity<=Math.floor(cap*.60));
   assert(p.acts[4].intensity<=Math.floor(cap*.60));
  }
 });
 check('audits report real diversity and quiet scenes, not imaginary quality scores',()=>{
  const p=curateCreativeRemixV1107(localAiShowRemixV1106('Choreografie mit Kontrast','rap',75),def,75);
  const a=auditCreativeRemixV1107(p);
  assert(a&&a.uniqueCameras>=2&&a.uniqueStages>=2&&a.quietMoments===2);
  assert(a.maximumIntensity<=75&&a.contrastRange>0);
  assert.equal(auditCreativeRemixV1107({}),null);
 });
 check('original timeline, timing, safety gates and stored manual scenes survive',()=>{
  const raw=localAiShowRemixV1106('Nur virtueller Auftritt','hard',75);
  const p=curateCreativeRemixV1107(raw,def,65);
  const base=generateArenaShowPlanV1040({title:'Eigener Konzertmix',durationMs:213456,genre:'hard'});
  const applied=applyAiShowRemixV1106(base,p,65);
  assert(applied&&normalizeArenaShowPlanV1040(applied));
  assert.deepEqual(applied.segments.map(s=>[s.start,s.end,s.scene,s.id]),base.segments.map(s=>[s.start,s.end,s.scene,s.id]));
  assert.equal(applied.durationMs,base.durationMs);
  assert.equal(applied.title,base.title);
  assert.equal(curateCreativeRemixV1107({},def,65),null);
  assert.equal(curateCreativeRemixV1107(raw,def,900),null);
 });
 check('new API/UI integration remains opt-in, fail-closed and device-isolated',()=>{
  const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const needle of ['normalizeCreativeBriefV1107','curateCreativeRemixV1107','store:false','getValidSession','AbortSignal.timeout'])
   assert(api.includes(needle),'Missing API guard '+needle);
  for(const needle of ['V1107 · KI Creative Producer 2.0','V1107 Regie-Qualitätsvorschau','Regiestil',
   'Kontraste zwischen Ruhe und Höhepunkten','Kreative Überraschungen','creativeBrief()',
   'Offline-Remix ausprobieren','Letzten Remix rückgängig machen','Diese sieben Szenen in meinen Showplan übernehmen'])
   assert(ui.includes(needle),'Missing real UI '+needle);
  assert(!api.includes('api/govee/')&&!api.includes('api/spotify/play'));
  assert(!ui.includes('NEXT_PUBLIC_OPENAI_API_KEY'));
  const browser=fs.readFileSync(path.join(root,'tests/e2e/ai-creative-producer-v1107.spec.cjs'),'utf8');
  assert(browser.includes('v1107-festival-creative-preview-screenshot'));
  assert(browser.includes('v1108-opt-in-microphone-off-screenshot'));
  assert(fs.readFileSync(path.join(root,'scripts/v1104-playwright-visual-report.cjs'),'utf8').includes('/screenshot|avatar|reference-glb|^v1104-/'));
 });
 console.log('PASS V1107 AI Creative Producer 2.0 · six real integration and safety groups');
} finally {fs.rmSync(temp,{recursive:true,force:true})}

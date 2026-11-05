#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(p){const transpiled=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(transpiled.diagnostics?.length??0,0);const module={exports:{}};
 vm.runInNewContext(transpiled.outputText,{module,exports:module.exports,require(){throw Error('Unexpected runtime dependency');}},
  {filename:p,timeout:10000});return module.exports;}
const v=load('lib/concertNarrativeV962.ts'), settings=load('lib/ultimateConcertRoadmapV958.ts');
const makeScene=(phase='verse',patch={})=>({id:'t|1|'+phase,phase,verified:true,genre:'deutschrap',
 camera:'wide',formation:'solo',wall:'pulse',palette:['#123456','#789abc'],effects:['lasers','bass-impact','beams'],
 intensity:.9,transition:1,spotlight:.5,lightGain:1,finale:false,timelineOverride:false,reason:'verified',...patch});
const opts={enabled:true,playing:true,elapsedMs:5000,sectionDurationMs:10000};
const plan=(phase='verse',options=opts,prev=null,scenePatch={})=>v.planConcertNarrativeV962(makeScene(phase,scenePatch),prev,options);
let checks=0;
function check(name,cb){cb();checks++;console.log('PASS V962 '+name);}
check('backward compatible V958 schema and storage key',()=>{
 assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
 assert.equal(settings.DEFAULT_CONCERT_V958.narrativeV962,false);
 assert.equal(settings.normalizeConcertRoadmapV958(null).narrativeV962,false);
 assert.equal(settings.normalizeConcertRoadmapV958({narrativeV962:'true'}).narrativeV962,false);
 assert.equal(settings.normalizeConcertRoadmapV958({narrativeV962:true}).narrativeV962,true);
 assert.equal(settings.normalizeConcertRoadmapV958({enabled:true,lightGovernorV961:true,transitionsV960:true}).narrativeV962,false);
});
check('opt out is identity-preserving',()=>{
 const input=makeScene();const x=v.planConcertNarrativeV962(input,null,{...opts,enabled:false});
 assert.equal(x.scene,input);assert.equal(x.factor,1);assert.equal(x.active,false);
});
check('paused player never shapes a cue',()=>assert.equal(plan('hook',{...opts,playing:false}).active,false));
check('unverified phases are never shaped',()=>assert.equal(plan('drop',opts,null,{verified:false}).active,false));
check('manual V948 timeline cue is authoritative',()=>assert.equal(plan('drop',opts,null,{timelineOverride:true}).active,false));
check('V912 saved show is untouched',()=>assert.equal(plan('drop',{...opts,savedShowActive:true}).active,false));
check('authored V354 scene is untouched',()=>assert.equal(plan('hook',{...opts,authoredStageActive:true}).active,false));
check('recovering fixture uses V934 fallback unchanged',()=>assert.equal(plan('hook',{...opts,recovering:true}).active,false));
check('invalid section timing fails closed',()=>{
 for(const duration of [0,-4,NaN,Infinity])assert.equal(plan('verse',{...opts,sectionDurationMs:duration}).active,false);
 for(const elapsed of [-2,NaN,Infinity])assert.equal(plan('verse',{...opts,elapsedMs:elapsed}).active,false);
});
check('Rap verses are more prominent than generic verse',()=>{
 const rap=v.concertNarrativeFactorV962('verse','Deutschrap',.5);
 const other=v.concertNarrativeFactorV962('verse','pop',.5);
 assert.ok(rap>other&&rap<1);
});
check('Hardtekk build rises, never gets brighter than the planned cue',()=>{
 const values=Array.from({length:101},(_,i)=>v.concertNarrativeFactorV962('build','hardtekk',i/100));
 for(let i=1;i<values.length;i++)assert.ok(values[i]>=values[i-1]&&values[i]<=1);
 assert.equal(values.at(-1),1);
});
check('Break is dimmer than verse, hook and drop',()=>{
 const f=x=>v.concertNarrativeFactorV962(x,'deutschrock',.7);
 assert.ok(f('break')<f('verse')&&f('break')<f('hook')&&f('break')<f('drop'));
});
check('outro gradually calms down',()=>{
 const start=v.concertNarrativeFactorV962('outro','deutschrock',0);
 const end=v.concertNarrativeFactorV962('outro','deutschrock',1);
 assert.ok(end<start&&end>0);
});
check('isolated drop preserves its existing maximum',()=>assert.equal(plan('drop').factor,1));
check('a confirmed prior phase blends smoothly',()=>{
 const before=makeScene('break');const start=plan('drop',{...opts,elapsedMs:0},before);
 const mid=plan('drop',{...opts,elapsedMs:425},before);
 const end=plan('drop',{...opts,elapsedMs:850},before);
 assert.equal(start.factor,v.concertNarrativeFactorV962('break','deutschrap',1));
 assert.ok(start.factor<mid.factor&&mid.factor<end.factor);assert.equal(end.factor,1);
});
check('unverified prior cue cannot invent a crossfade',()=>{
 const previous=makeScene('break',{verified:false});assert.equal(plan('drop',{...opts,elapsedMs:0},previous).factor,1);
});
check('prior manual timeline cue cannot influence the automatic fade',()=>{
 assert.equal(plan('drop',{...opts,elapsedMs:0},makeScene('break',{timelineOverride:true})).factor,1);
});
check('returned scene does not mutate source or previous scene',()=>{
 const from=makeScene('break'),to=makeScene('hook'),effectCount=to.effects.length;
 const result=v.planConcertNarrativeV962(to,from,opts);
 assert.notEqual(result.scene,to);assert.equal(to.intensity,.9);assert.equal(to.effects.length,effectCount);
 assert.equal(from.intensity,.9);
});
check('calm phase removes heavy virtual FX without adding new ones',()=>{
 const result=plan('break',{...opts,elapsedMs:10000});assert.equal(result.active,true);
 assert.ok(!result.scene.effects.includes('lasers'));
 assert.ok(!result.scene.effects.includes('bass-impact'));
 assert.ok(result.scene.effects.includes('beams'));
});
check('reduced motion allows only tame existing effects',()=>{
 const result=plan('hook',{...opts,reducedMotion:true});
 assert.deepEqual(Array.from(result.scene.effects),['beams']);
});
check('Govee light dimming never increases brightness or modifies RGB',()=>{
 const look={brightness:90,color:{r:55,g:99,b:198}};
 const result=plan('break',{...opts,elapsedMs:10000});
 const actual=v.dimConcertNarrativeLookV962(look,result);
 assert.ok(actual.brightness<look.brightness);assert.equal(actual.color,look.color);
 assert.equal(look.brightness,90);
});
check('inactive governor returns original proposed look',()=>{
 const look={brightness:22,color:{r:23,g:44,b:99}};
 assert.equal(v.dimConcertNarrativeLookV962(look,plan('hook',{...opts,enabled:false})),look);
});
check('already maximum brightness return original object on drop',()=>{
 const look={brightness:67,color:{r:0,g:1,b:2}};
 assert.equal(v.dimConcertNarrativeLookV962(look,plan('drop')),look);
});
check('invalid look is identity-preserving (legacy sender owns validation)',()=>{
 const look={brightness:NaN,color:{r:0,g:1,b:2}};
 assert.equal(v.dimConcertNarrativeLookV962(look,plan('verse')),look);
});
check('Govee request count unchanged, V961 remains final sender governor',()=>{
 const source=read('components/GoveeMusicSyncV909.tsx');
 assert.match(source,/const narrativeV962=continuousSceneV960\?planConcertNarrativeV962\(/);
 assert.match(source,/const narrativeLookV962=narrativeV962\?dimConcertNarrativeLookV962\(mixed,narrativeV962\):mixed/);
 assert.ok(source.indexOf('dimConcertNarrativeLookV962(mixed,narrativeV962)')<source.indexOf('governConcertLookV961(previous,voiceLookV970'));
 assert.match(source,/if\(!changedGoveeLookV911\(previous,finalLook\)\)continue/);
 assert.match(source,/value:finalLook/);assert.match(source,/sent\.set\(ip,finalLook\)/);
});
check('V962 is opt in and user-editable without renaming storage',()=>{
 const view=read('components/ConcertRoadmapStudioV958.tsx');
 assert.match(view,/checked=\{settings\.narrativeV962\}/);
 assert.match(view,/save\(\{narrativeV962:e\.target\.checked\}\)/);
 assert.match(view,/V912-Lichtshows/);
});
check('no additional network timers global storage or renderer operations',()=>{
 const code=read('lib/concertNarrativeV962.ts');
 assert.doesNotMatch(code,/fetch\(|setInterval\(|setTimeout\(|window\.|document\.|localStorage|goveeBridgeRequest|new WebSocket\(|requestAnimationFrame\(/);
});
check('core build gate explicitly runs V962 type and source regressions',()=>{
 const gate=read('scripts/v931-production-gate.cjs');
 assert.match(gate,/V962 narrative light curve/);
 assert.match(gate,/V962 core TypeScript/);
 assert.match(gate,/V961 core TypeScript/);
 assert.match(gate,/Full TypeScript/);
 assert.match(gate,/Next\.js production build/);
});
check('6000 cases are finite, stable and never exceed existing caps',()=>{
 const kinds=['verse','hook','build','drop','break','outro'];
 for(let i=0;i<6000;i++){
  const phase=kinds[i%kinds.length],elapsed=i%20000,duration=20000;
  const ctx={...opts,elapsedMs:elapsed,sectionDurationMs:duration};
  const input=makeScene(phase,{genre:i%4?'deutschrap':'hardtekk',intensity:(i%101)/100});
  const result=v.planConcertNarrativeV962(input,null,ctx);
  const repeated=v.planConcertNarrativeV962(input,null,ctx);
  assert.equal(result.factor,repeated.factor);
  assert.ok(Number.isFinite(result.factor)&&result.factor>=0&&result.factor<=1);
  assert.ok(result.scene.intensity<=input.intensity);
  const brightness=i%101;
  const look=v.dimConcertNarrativeLookV962({brightness,color:{r:i%256,g:0,b:1}},result);
  assert.ok(look.brightness>=0&&look.brightness<=brightness);
 }
});
console.log('V962 PASS '+checks+' groups + 6000 deterministic song/light cases');

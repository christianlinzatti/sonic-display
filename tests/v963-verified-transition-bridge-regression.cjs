#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(result.diagnostics?.length??0,0);const module={exports:{}};
 vm.runInNewContext(result.outputText,{module,exports:module.exports,require(){throw Error('unexpected runtime dependency');}},
  {filename:file,timeout:10000});return module.exports;}
const bridge=load('lib/concertBridgeV963.ts'),settings=load('lib/ultimateConcertRoadmapV958.ts');
const scene=(phase='verse',overrides={})=>({id:'track1|0|'+phase,phase,verified:true,genre:'deutschrap',
 camera:'wide',formation:'solo',wall:'pulse',palette:['#111111','#222222'],effects:['beams'],
 intensity:.7,transition:1,spotlight:.5,lightGain:1,finale:false,reason:'verified',timelineOverride:false,...overrides});
const section=(label,startMs,durationMs,confidence=.92)=>({label,startMs,durationMs,confidence});
const analysis=(sections=[section('verse',0,10000),section('hook',10000,15000)],overrides={})=>({
 schema:'sonic-track-analysis-v318',trackId:'track1',durationMs:60000,source:'test',tempo:120,
 timeSignature:4,beats:[],bars:[],importedAt:0,sections,...overrides});
const policy={enabled:true,playing:true};
const plan=(s=scene(),a=analysis(),time=9500,opts=policy,idx=0,track='track1')=>
 bridge.planVerifiedConcertBridgeV963(s,a,track,idx,time,opts);
let checks=0;
function check(label,fn){fn();checks++;console.log('PASS V963 '+label);}
check('V958 storage identity preserved and new flag defaults disabled',()=>{
 assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
 assert.equal(settings.DEFAULT_CONCERT_V958.bridgeV963,false);
 assert.equal(settings.normalizeConcertRoadmapV958({bridgeV963:false}).bridgeV963,false);
 assert.equal(settings.normalizeConcertRoadmapV958({bridgeV963:true}).bridgeV963,true);
 assert.equal(settings.normalizeConcertRoadmapV958({bridgeV963:'true'}).bridgeV963,false);
});
check('enabled false returns an inactive no-op',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,enabled:false}).factor,1));
check('opted-out plan never activates',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,enabled:false}).active,false));
check('paused player never plans a hardware transition',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,playing:false}).active,false));
check('saved V912 show always has precedence',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,savedShowActive:true}).active,false));
check('authored V354 stage always has precedence',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,authoredStageActive:true}).active,false));
check('device recovery leaves original cue untouched',()=>assert.equal(plan(scene(),analysis(),9500,{...policy,recovering:true}).active,false));
check('V948 manual timeline cue blocks bridge',()=>assert.equal(plan(scene('verse',{timelineOverride:true})).active,false));
check('scene not verified -> no hardware phase',()=>assert.equal(plan(scene('verse',{verified:false})).active,false));
check('missing analysis fails closed',()=>assert.equal(plan(scene(),null).active,false));
check('missing scene fails closed',()=>assert.equal(plan(null).active,false));
check('track mismatch fails closed',()=>assert.equal(plan(scene(),analysis(),9500,policy,0,'other').active,false));
check('analysis track mismatch fails closed',()=>assert.equal(plan(scene(),analysis(undefined,{trackId:'else'})).active,false));
check('invalid timeline section index fails closed',()=>{
 for(const i of [-1,2,1,NaN,0.1,Infinity])assert.equal(plan(scene(),analysis(),9500,policy,i).active,false);
});
check('missing or nonfinite song progress fails closed',()=>{
 for(const ms of [-1,NaN,Infinity,-Infinity,10000,20000])assert.equal(plan(scene(),analysis(),ms).active,false);
});
check('unconfirmed current label fails closed',()=>assert.equal(plan(scene('drop')).active,false));
check('missing next label never creates a phase',()=>assert.equal(plan(scene(),analysis([section('verse',0,10000),section(undefined,10000,15000)])).active,false));
check('low-confidence current and next sections fail closed',()=>{
 assert.equal(plan(scene(),analysis([section('verse',0,10000,.49),section('hook',10000,15000)])).active,false);
 assert.equal(plan(scene(),analysis([section('verse',0,10000),section('hook',10000,15000,.64)])).active,false);
});
check('any unverified future section is rejected, not guessed',()=>{
 for(const label of ['verse','break','build','outro',null])
  assert.equal(plan(scene(),analysis([section('verse',0,10000),section(label,10000,15000)])).active,false);
});
check('same-phase continuation cannot invent a hook',()=>assert.equal(plan(scene('hook'),analysis([section('hook',0,10000),section('hook',10000,10000)])).active,false));
check('noncontiguous sections cannot drive anticipation',()=>{
 assert.equal(plan(scene(),analysis([section('verse',0,10000),section('drop',12000,12000)])).active,false);
 assert.equal(plan(scene(),analysis([section('verse',0,10000),section('drop',8500,14000)])).active,false);
});
check('invalid or out-of-song timings fail closed',()=>{
 assert.equal(plan(scene(),analysis([section('verse',0,10000),section('drop',10000,99999)])).active,false);
 assert.equal(plan(scene(),analysis([section('verse',0,NaN),section('drop',10000,9000)])).active,false);
 assert.equal(plan(scene(),analysis(undefined,{durationMs:0})).active,false);
});
check('outside preparation window does not change the lamp',()=>assert.equal(plan(scene(),analysis(),1000).active,false));
check('verified hook activates shortly before boundary',()=>{
 const x=plan();assert.equal(x.active,true);assert.equal(x.nextPhase,'hook');assert.equal(x.remainingMs,500);
});
check('verified drop activates shortly before boundary',()=>{
 const x=plan(scene(),analysis([section('verse',0,10000),section('drop',10000,16000)]));
 assert.equal(x.active,true);assert.equal(x.nextPhase,'drop');assert.equal(x.windowMs,1800);
});
check('no effect at beginning of preparation window',()=>{
 const x=plan(scene(),analysis(),8600);assert.equal(x.active,true);assert.equal(x.factor,1);
});
check('nearer confirmed hook never increases brightness',()=>{
 const values=Array.from({length:50},(_,i)=>plan(scene(),analysis(),8600+i*28).factor);
 for(let i=1;i<values.length;i++)assert.ok(values[i]<=values[i-1]&&values[i]>0&&values[i]<=1);
});
check('nearer confirmed drop never increases brightness',()=>{
 const data=analysis([section('verse',0,10000),section('drop',10000,16000)]);
 const values=Array.from({length:90},(_,i)=>plan(scene(),data,8200+i*20).factor);
 for(let i=1;i<values.length;i++)assert.ok(values[i]<=values[i-1]&&values[i]>0&&values[i]<=1);
});
check('genre intelligence respects hardtekk drops',()=>{
 const a=analysis([section('verse',0,10000),section('drop',10000,20000)]);
 assert.ok(plan(scene('verse',{genre:'hardtekk'}),a,9999).factor<plan(scene('verse',{genre:'deutschrap'}),a,9999).factor);
});
check('reduced motion lowers modulation amplitude',()=>{
 const a=plan(scene(),analysis(),9999),b=plan(scene(),analysis(),9999,{...policy,reducedMotion:true});
 assert.ok(b.factor>a.factor&&b.factor<=1);
});
check('break and outro remain untouched without known next hook/drop',()=>{
 const a=analysis([section('break',0,10000),section('outro',10000,10000)]);
 assert.equal(plan(scene('break'),a).active,false);
});
check('inactive dimmer preserves exact source object',()=>{
 const look={brightness:55,color:{r:1,g:2,b:3}};
 assert.equal(bridge.dimConcertBridgeLookV963(look,plan(scene(),analysis(),1000)),look);
});
check('active dimmer never increases brightness or changes RGB',()=>{
 const look={brightness:89,color:{r:80,g:100,b:30}};
 const result=bridge.dimConcertBridgeLookV963(look,plan(scene(),analysis(),9999));
 assert.ok(result.brightness<=look.brightness&&result.brightness>=0);
 assert.equal(result.color,look.color);assert.equal(look.brightness,89);
});
check('invalid legacy sender look remains untouched',()=>{
 for(const brightness of [NaN,-1,101,Infinity]){
  const look={brightness,color:{r:2,g:4,b:6}};
  assert.equal(bridge.dimConcertBridgeLookV963(look,plan()),look);
 }
});
check('mismatched or invalid plan cannot alter hardware look',()=>{
 const look={brightness:80,color:{r:2,g:4,b:6}};
 for(const factor of [NaN,-.1,1.01,Infinity])assert.equal(
  bridge.dimConcertBridgeLookV963(look,{...plan(),factor}),look);
});
check('0% brightness stays 0% and no power-on command',()=>{
 const look={brightness:0,color:{r:2,g:4,b:6}};
 assert.equal(bridge.dimConcertBridgeLookV963(look,plan()).brightness,0);
});
check('100% brightness cap never exceeded',()=>{
 const look={brightness:100,color:{r:2,g:4,b:6}};
 assert.ok(bridge.dimConcertBridgeLookV963(look,plan()).brightness<=100);
});
check('Govee integration retains exactly one existing request per changed lamp',()=>{
 const s=read('components/GoveeMusicSyncV909.tsx');
 assert.match(s,/const bridgeV963=planVerifiedConcertBridgeV963\(/);
 assert.match(s,/dimConcertBridgeLookV963\(narrativeLookV962,bridgeV963\)/);
 assert.ok(s.indexOf('dimConcertBridgeLookV963(narrativeLookV962,bridgeV963)')<s.indexOf('const finalLook=governConcertLookV961(previous,voiceLookV970'));
 assert.match(s,/if\(!changedGoveeLookV911\(previous,finalLook\)\)continue/);
 assert.match(s,/value:finalLook/);
 assert.equal((s.match(/await goveeBridgeRequestV909\(config,'\/command','POST',\{ip,action:'look',value:finalLook\}\)/g)||[]).length,1);
});
check('new feature is opt in, UI controlled and storage key unchanged',()=>{
 const ui=read('components/ConcertRoadmapStudioV958.tsx');
 assert.match(ui,/checked=\{settings\.bridgeV963\}/);
 assert.match(ui,/save\(\{bridgeV963:e\.target\.checked\}\)/);
 assert.match(ui,/V963: Spannungsaufbau/);
 assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
});
check('pure engine performs no extra timers, network, rendering or storage',()=>{
 const s=read('lib/concertBridgeV963.ts');
 for(const token of ['fetch(','setTimeout(','setInterval(','localStorage','sessionStorage','requestAnimationFrame(',
  'window.','document.','goveeBridgeRequest','new WebSocket(','useFrame('])assert.ok(!s.includes(token),token);
});
check('V963 joins actual full production gate and preserves V962,V961 checks',()=>{
 const s=read('scripts/v931-production-gate.cjs');
 for(const text of ['V963 verified bridge regression','V963 core TypeScript','V962 narrative light curve','V962 core TypeScript',
  'Full TypeScript','Next.js production build'])assert.ok(s.includes(text),text);
});
check('7500 representative song states remain bounded and deterministic',()=>{
 const genres=['hardtekk','deutschrap','deutschrock','hardstyle','other'];
 for(let i=0;i<7500;i++){
  const label=i%2?'hook':'drop',data=analysis([section('verse',0,20000),section(label,20000,12000)]);
  const current=scene('verse',{genre:genres[i%genres.length]});
  const ms=18000+(i%2000);
  const one=plan(current,data,ms),two=plan(current,data,ms);
  assert.equal(one.factor,two.factor);
  assert.ok(one.factor>0&&one.factor<=1&&Number.isFinite(one.factor));
  const brightness=i%101,look={brightness,color:{r:i%256,g:44,b:122}};
  const actual=bridge.dimConcertBridgeLookV963(look,one);
  assert.ok(actual.brightness>=0&&actual.brightness<=brightness);
 }
});
console.log('V963 PASS '+checks+' groups + 7500 deterministic sections/light states');

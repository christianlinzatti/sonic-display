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
 vm.runInNewContext(result.outputText,{module,exports:module.exports,require(){throw Error('unexpected runtime import');}},
  {filename:file,timeout:10000});return module.exports;}
const recovery=load('lib/concertPeakRecoveryV964.ts'),settings=load('lib/ultimateConcertRoadmapV958.ts');
const section=(label,startMs,durationMs,confidence=.92)=>({label,startMs,durationMs,confidence});
const analysis=(sections=[section('drop',0,10000),section('break',10000,14000)],extra={})=>({
 schema:'sonic-track-analysis-v318',trackId:'track1',durationMs:60000,source:'test',tempo:120,
 timeSignature:4,beats:[],bars:[],importedAt:0,sections,...extra});
const scene=(phase='break',extra={})=>({id:'track1|1|'+phase,phase,verified:true,genre:'hardtekk',
 camera:'wide',formation:'solo',wall:'pulse',palette:['#111111','#222222'],effects:['beams'],
 intensity:.7,transition:1,spotlight:.5,lightGain:1,finale:false,reason:'verified',timelineOverride:false,...extra});
const options={enabled:true,playing:true};
const plan=(s=scene(),a=analysis(),time=10000,opts=options,idx=1,id='track1')=>
 recovery.planConcertPeakRecoveryV964(s,a,id,idx,time,opts);
const look={brightness:85,color:{r:123,g:45,b:67}};
let checks=0;function check(label,fn){try{fn();checks++;console.log('PASS V964 '+label);}catch(e){e.message='V964 '+label+': '+e.message;throw e;}}
check('v958 storage key and schema unchanged',()=>{assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');assert.equal(settings.DEFAULT_CONCERT_V958.schema,'ultimate-concert-v958');});
check('V964 opt-in defaults false',()=>assert.equal(settings.DEFAULT_CONCERT_V958.peakRecoveryV964,false));
check('only explicit boolean true enables flag',()=>{for(const value of [true,false,'true',1,null,{},[]])assert.equal(settings.normalizeConcertRoadmapV958({peakRecoveryV964:value}).peakRecoveryV964,value===true);});
check('disabled is exact no-op',()=>assert.equal(plan(scene(),analysis(),10000,{...options,enabled:false}).active,false));
check('paused is inactive',()=>assert.equal(plan(scene(),analysis(),10000,{...options,playing:false}).active,false));
check('saved V912 show has authority',()=>assert.equal(plan(scene(),analysis(),10000,{...options,savedShowActive:true}).active,false));
check('authored V354 stage has authority',()=>assert.equal(plan(scene(),analysis(),10000,{...options,authoredStageActive:true}).active,false));
check('V934 recovery is protected',()=>assert.equal(plan(scene(),analysis(),10000,{...options,recovering:true}).active,false));
check('V948 manual timeline cue is protected',()=>assert.equal(plan(scene('break',{timelineOverride:true})).active,false));
check('scene must be verified',()=>assert.equal(plan(scene('break',{verified:false})).active,false));
check('scene missing fails closed',()=>assert.equal(plan(null).active,false));
check('analysis missing fails closed',()=>assert.equal(plan(scene(),null).active,false));
check('wrong track fails closed',()=>{assert.equal(plan(scene(),analysis(),10000,options,1,'other').active,false);assert.equal(plan(scene(),analysis(undefined,{trackId:'other'})).active,false);});
check('invalid section index rejected',()=>{for(const i of [-1,0,2,NaN,Infinity,1.4])assert.equal(plan(scene(),analysis(),10000,options,i).active,false);});
check('invalid timestamp rejected',()=>{for(const n of [NaN,Infinity,-Infinity,-1,9999,24000,64000])assert.equal(plan(scene(),analysis(),n).active,false);});
check('low-confidence prior peak rejected',()=>assert.equal(plan(scene(),analysis([section('drop',0,10000,.69),section('break',10000,14000)])).active,false));
check('low-confidence current section rejected',()=>assert.equal(plan(scene(),analysis([section('drop',0,10000),section('break',10000,14000,.64)])).active,false));
check('same track but wrong scene phase rejected',()=>assert.equal(plan(scene('hook')).active,false));
check('only a verified preceding hook or drop can recover',()=>{for(const label of ['verse','break','build','outro',null])assert.equal(plan(scene(),analysis([section(label,0,10000),section('break',10000,14000)])).active,false);});
check('only recovery in break, verse, outro',()=>{for(const label of ['drop','hook','build',null])assert.equal(plan(scene(label),analysis([section('drop',0,10000),section(label,10000,14000)])).active,false);});
check('gap or overlap blocks recovery',()=>{for(const start of [9000,10900])assert.equal(plan(scene(),analysis([section('drop',0,10000),section('break',start,13000)]),start).active,false);});
check('500 ms proximity accepted',()=>assert.equal(plan(scene(),analysis([section('drop',0,10000),section('break',10500,13000)]),10500).active,true));
check('invalid analysis duration blocked',()=>assert.equal(plan(scene(),analysis(undefined,{durationMs:0})).active,false));
check('missing section duration blocked',()=>assert.equal(plan(scene(),analysis([section('drop',0,0),section('break',10000,14000)])).active,false));
check('out-of-track section blocked',()=>assert.equal(plan(scene(),analysis([section('drop',0,10000),section('break',10000,60000)])).active,false));
check('immediately after drop yields a gentle dimmer',()=>{const x=plan();assert.equal(x.active,true);assert.equal(x.previousPeak,'drop');assert.equal(x.windowMs,2500);assert.ok(x.factor>=.82&&x.factor<1);});
check('return to full light without discontinuities',()=>{let prev=0;for(let time=10000;time<12500;time+=5){const x=plan(scene(),analysis(),time);assert(x.active);assert(x.factor>=prev);assert(x.factor<=1);prev=x.factor;}assert.equal(plan(scene(),analysis(),12500).active,false);});
check('hook recovery is shorter and gentler',()=>{const a=plan(),b=plan(scene(),analysis([section('hook',0,10000),section('break',10000,14000)]));assert(b.active);assert.equal(b.windowMs,1800);assert(b.factor>a.factor);});
check('genre adjusts depth: hardtekk has more contrast than Deutschrap',()=>{const a=plan(),b=plan(scene('break',{genre:'deutschrap'}));assert(a.factor<b.factor);});
check('reduced motion reduces contrast',()=>{const a=plan(),b=plan(scene(),analysis(),10000,{...options,reducedMotion:true});assert(b.factor>a.factor);});
check('exact end of window is unchanged',()=>assert.equal(plan(scene(),analysis(),12500).factor,1));
check('idle plan preserves reference identity',()=>{const x=plan(scene(),analysis(),10000,{...options,enabled:false});assert.strictEqual(recovery.dimConcertPeakRecoveryLookV964(look,x),look);});
check('active plan never brightens and never mutates source',()=>{const before=JSON.stringify(look);const result=recovery.dimConcertPeakRecoveryLookV964(look,plan());assert(result.brightness<look.brightness);assert.strictEqual(result.color,look.color);assert.equal(JSON.stringify(look),before);});
check('0 brightness remains off',()=>assert.equal(recovery.dimConcertPeakRecoveryLookV964({...look,brightness:0},plan()).brightness,0));
check('bad previous look is ignored, never repaired here',()=>{for(const n of [NaN,Infinity,-1,101]){const x={...look,brightness:n};assert.strictEqual(recovery.dimConcertPeakRecoveryLookV964(x,plan()),x);}});
check('invalid or forged planner factor rejected',()=>{for(const n of [-1,NaN,Infinity,1.01])assert.strictEqual(recovery.dimConcertPeakRecoveryLookV964(look,{...plan(),factor:n}),look);});
check('no extra LAN ticker or side effects in pure module',()=>{const s=read('lib/concertPeakRecoveryV964.ts');for(const disallowed of ['fetch(','setInterval(','setTimeout(','Date.now(','localStorage','WebGLRenderer','goveeBridgeRequestV909('])assert(!s.includes(disallowed),disallowed);});
check('only one Govee LAN sender, V964 placed before V961 governor',()=>{const s=read('components/GoveeMusicSyncV909.tsx');assert.equal((s.match(/await goveeBridgeRequestV909\(config,'\/command','POST'/g)||[]).length,1);assert(s.indexOf('dimConcertBridgeLookV963(bridgeLook')<0);assert(s.indexOf('dimConcertPeakRecoveryLookV964(bridgeLookV963,peakRecoveryV964)')<s.indexOf('const finalLook=governConcertLookV961'));});
check('settings UI opt-in still separate and original controls present',()=>{const s=read('components/ConcertRoadmapStudioV958.tsx');for(const value of ['settings.peakRecoveryV964','peakRecoveryV964:e.target.checked','settings.bridgeV963','settings.narrativeV962','settings.lightGovernorV961'])assert(s.includes(value),value);});
check('build gate and Vercel source include V964',()=>{const p=JSON.parse(read('package.json'));const v=read('scripts/vercel-production-build.cjs');const g=read('scripts/v931-production-gate.cjs');assert.equal(p.sonicRoadmapRelease,'v964');assert(v.includes('tests/v964-peak-recovery-regression.cjs'));assert(g.includes('tests/v964-peak-recovery-regression.cjs'));assert(g.includes('tests/tsconfig.v964-core.json'));});
for(let i=0;i<5000;i++){
 const genre=['deutschrap','hardtekk','hardstyle','deutschrock','other'][i%5];
 const phase=['break','verse','outro'][i%3];
 const prior=['drop','hook'][i%2];
 const start=10000,elapsed=(i*31)%2500;
 const p=plan(scene(phase,{genre}),analysis([section(prior,0,start),section(phase,start,15000)]),start+elapsed);
 assert(p.factor>0&&p.factor<=1&&Number.isFinite(p.factor));
 const x=recovery.dimConcertPeakRecoveryLookV964(look,p);
 assert(x.brightness>=0&&x.brightness<=look.brightness&&x.color.r===look.color.r);
}
console.log(`V964 PASS ${checks} groups + 5000 deterministic post-peak states`);

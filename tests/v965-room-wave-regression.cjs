#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){
 const c=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(c.diagnostics?.length??0,0,'TS syntax diagnostics: '+file);
 const module={exports:{}};
 vm.runInNewContext(c.outputText,{module,exports:module.exports,require(){throw Error('Unexpected runtime dependency');}},
  {filename:file,timeout:12000});return module.exports;
}
const wave=load('lib/concertRoomWaveV965.ts'),settings=load('lib/ultimateConcertRoadmapV958.ts');
const section=(label='hook',startMs=10000,durationMs=12000,confidence=.94)=>({label,startMs,durationMs,confidence});
const analysis=(items=[section()],extra={})=>({trackId:'TRACK-965',durationMs:48000,
 sections:items,schema:'sonic-track-analysis-v318',beats:[],bars:[],tempo:140,importedAt:0,...extra});
const scene=(phase='hook',extra={})=>({id:'TRACK-965|0|hook',phase,verified:true,genre:'hardtekk',
 camera:'wide',formation:'sync',wall:'pulse',palette:['#111111','#222222'],effects:['beams'],
 intensity:.7,transition:1,spotlight:.5,lightGain:1,finale:false,reason:'verified',timelineOverride:false,...extra});
const opts={enabled:true,playing:true};
const plan=(s=scene(),a=analysis(),ms=12500,options=opts,i=0,id='TRACK-965')=>
 wave.planConcertRoomWaveV965(s,a,id,i,ms,options);
const look=()=>({brightness:85,color:{r:131,g:45,b:109}});
let count=0;const test=(name,fn)=>{try{fn();count++;console.log('PASS V965 '+name)}catch(e){e.message='V965 '+name+': '+e.message;throw e}};
test('settings key and schema preserved',()=>assert.equal(settings.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958'));
test('new wave defaults off',()=>assert.equal(settings.DEFAULT_CONCERT_V958.roomWaveV965,false));
test('only boolean true enables it',()=>{for(const value of [true,false,1,0,'true',null,{},[]])
 assert.equal(settings.normalizeConcertRoadmapV958({roomWaveV965:value}).roomWaveV965,value===true)});
test('preexisting V964 and V963 settings remain',()=>{const s=settings.normalizeConcertRoadmapV958({peakRecoveryV964:true,bridgeV963:true});assert(s.peakRecoveryV964&&s.bridgeV963)});
test('opt-out is inactive',()=>assert.equal(plan(scene(),analysis(),12500,{...opts,enabled:false}).active,false));
test('paused player is inactive',()=>assert.equal(plan(scene(),analysis(),12500,{...opts,playing:false}).active,false));
test('saved show has priority',()=>assert.equal(plan(scene(),analysis(),12500,{...opts,savedShowActive:true}).active,false));
test('authored stage has priority',()=>assert.equal(plan(scene(),analysis(),12500,{...opts,authoredStageActive:true}).active,false));
test('manual timeline override has priority',()=>assert.equal(plan(scene('hook',{timelineOverride:true})).active,false));
test('unverified scene is inactive',()=>assert.equal(plan(scene('hook',{verified:false})).active,false));
test('missing scene fails closed',()=>assert.equal(plan(null).active,false));
test('missing analysis fails closed',()=>assert.equal(plan(scene(),null).active,false));
test('track mismatch rejected',()=>{assert.equal(plan(scene(),analysis(),12500,opts,0,'OTHER').active,false);assert.equal(plan(scene(),analysis(undefined,{trackId:'OTHER'})).active,false)});
test('bad section indices rejected',()=>{for(const i of [-1,1,999,NaN,Infinity,.5])assert.equal(plan(scene(),analysis(),12500,opts,i).active,false)});
test('bad progress rejected',()=>{for(const ms of [NaN,Infinity,-Infinity,-1,9999,22000,99999])assert.equal(plan(scene(),analysis(),ms).active,false)});
test('low confidence fails closed',()=>assert.equal(plan(scene(),analysis([section('hook',10000,12000,.749)])).active,false));
test('confidence exactly 0.75 passes',()=>assert.equal(plan(scene(),analysis([section('hook',10000,12000,.75)])).active,true));
test('only hook or drop',()=>{for(const phase of ['verse','break','build','outro',null])assert.equal(plan(scene(phase),analysis([section(phase)])).active,false)});
test('scene and analysis phase match',()=>assert.equal(plan(scene('drop')).active,false));
test('drop becomes active when verified',()=>{const p=plan(scene('drop'),analysis([section('drop')]));assert(p.active);assert.equal(p.phase,'drop')});
test('invalid analysis duration rejected',()=>assert.equal(plan(scene(),analysis(undefined,{durationMs:0})).active,false));
test('out-of-duration section rejected',()=>assert.equal(plan(scene(),analysis([section('hook',40000,20000)]),42000).active,false));
test('too-short section rejected',()=>assert.equal(plan(scene(),analysis([section('hook',10000,1199)]),10400).active,false));
test('missing/invalid duration rejected',()=>{for(const n of [NaN,Infinity,-100])assert.equal(plan(scene(),analysis([section('hook',10000,n)]),10400).active,false)});
test('hardtekk wave is slower than flashes',()=>assert(plan().periodMs>=2500));
test('genre-specific timing',()=>{const a=plan();const b=plan(scene('hook',{genre:'deutschrap'}));assert(b.periodMs>a.periodMs);assert(b.depth<a.depth)});
test('reduced motion reduces modulation depth',()=>assert(plan(scene(),analysis(),12500,{...opts,reducedMotion:true}).depth<plan().depth));
test('zero brightness stays zero',()=>assert.equal(wave.dimConcertRoomWaveLookV965({...look(),brightness:0},plan(),0,4).brightness,0));
test('one lamp has no room effect',()=>{const x=look();assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,plan(),0,1),x)});
test('out of range lamp indices are ignored',()=>{const x=look();for(const i of [-1,4,NaN,Infinity,1.5])assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,plan(),i,4),x)});
test('too many lamps are ignored',()=>{const x=look();assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,plan(),0,33),x)});
test('missing/malformed brightness ignored',()=>{for(const v of [NaN,-1,101,Infinity]){const x={...look(),brightness:v};assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,plan(),0,4),x)}});
test('inactive plan preserves object identity',()=>{const x=look();assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,plan(scene(),analysis(),12500,{...opts,enabled:false}),0,4),x)});
test('phase and lamp stagger produce distinct levels',()=>{const p=plan();const brightness=[0,1,2,3].map(i=>wave.dimConcertRoomWaveLookV965(look(),p,i,4).brightness);assert(new Set(brightness).size>1)});
test('no color mutation',()=>{const x=look(),before=JSON.stringify(x);const out=wave.dimConcertRoomWaveLookV965(x,plan(),1,4);assert.strictEqual(out.color,x.color);assert.equal(JSON.stringify(x),before)});
test('never brighten a planned look',()=>{for(let i=0;i<4;i++)assert(wave.dimConcertRoomWaveLookV965(look(),plan(),i,4).brightness<=85)});
test('start and end fade are smooth',()=>{const a=wave.dimConcertRoomWaveLookV965(look(),plan(scene(),analysis(),10000),0,4);const b=wave.dimConcertRoomWaveLookV965(look(),plan(scene(),analysis(),21999),0,4);assert.equal(a.brightness,85);assert.equal(b.brightness,85)});
test('fake depth or period is ignored',()=>{const p=plan();for(const depth of [NaN,-1,.9]){const x=look();assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,{...p,depth},0,4),x)}for(const periodMs of [NaN,5,Infinity]){const x=look();assert.strictEqual(wave.dimConcertRoomWaveLookV965(x,{...p,periodMs},0,4),x)}});
test('pure module has no timers or hardware/network commands',()=>{const src=read('lib/concertRoomWaveV965.ts');for(const disallowed of ['setInterval(','setTimeout(','fetch(','Date.now(','localStorage','requestAnimationFrame(','goveeBridgeRequestV909('])assert(!src.includes(disallowed))});
test('only original bounded sender and V961 still final',()=>{const src=read('components/GoveeMusicSyncV909.tsx');assert.equal((src.match(/await goveeBridgeRequestV909\(config,'\/command','POST'/g)||[]).length,1);assert(src.indexOf('dimConcertRoomWaveLookV965(')<src.indexOf('const finalLook=governConcertLookV961'));assert(src.includes('config.selectedIps.indexOf(sourceIp)'))});
test('UI has explicit opt-in and keeps V964',()=>{const src=read('components/ConcertRoadmapStudioV958.tsx');for(const v of ['settings.roomWaveV965','roomWaveV965:e.target.checked','settings.peakRecoveryV964'])assert(src.includes(v))});
test('release gate and Vercel run actual V965 code',()=>{const p=JSON.parse(read('package.json'));assert.equal(p.sonicRoadmapRelease,'v965');assert(read('scripts/v931-production-gate.cjs').includes('tests/v965-room-wave-regression.cjs'));assert(read('scripts/vercel-production-build.cjs').includes('tests/v965-room-wave-regression.cjs'));assert(p.scripts['test:v965:types'].includes('tsconfig.v965-core.json'))});
for(let i=0;i<6000;i++){
 const genre=['hardtekk','hardstyle','deutschrap','deutschrock','other'][i%5];
 const phase=['hook','drop'][i%2];const n=2+i%12,idx=i%n;
 const p=plan(scene(phase,{genre}),analysis([section(phase,10000,12000)]),10000+(i*71)%12000,
  {...opts,reducedMotion:i%7===0});
 assert(p.active);const base=look(),out=wave.dimConcertRoomWaveLookV965(base,p,idx,n);
 assert(Number.isFinite(out.brightness)&&out.brightness>=0&&out.brightness<=base.brightness);
 assert.equal(out.color.r,base.color.r);
}
console.log('V965 PASS '+count+' test groups + 6000 deterministic room/light states');

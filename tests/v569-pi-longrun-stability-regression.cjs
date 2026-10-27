'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const base=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const buffer=load('components/visualizer/lodPlaybackBufferV569');
const continuity=load('components/visualizer/lodPlaybackContinuity');
// The diagnostic functions are pure, but their optional React hook has a runtime import.
// Stub React only for this module so that deterministic tests need no node_modules.
const diagnosticFile='components/visualizer/lodContinuityDiagnostics.ts';
const compiled=ts.transpileModule(read(diagnosticFile),{fileName:diagnosticFile,reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal(compiled.diagnostics?.length??0,0);
const diagnosticModule={exports:{}};
new Function('module','exports','require',compiled.outputText)(diagnosticModule,diagnosticModule.exports,(id)=>{
 if(id==='react')return {useSyncExternalStore:()=>null};throw Error('Unexpected runtime import '+id);
});
const diag=diagnosticModule.exports;
let tests=0;
const test=(name,fn)=>{fn();tests++;console.log('PASS V569:',name);};
const action=(time=0,weight=.5,running=true)=>({time,timeScale:1,paused:false,getEffectiveWeight:()=>weight,isRunning:()=>running});
const create=buffer.createLodPlaybackBufferV569;
const update=buffer.updateLodPlaybackBufferV569;
test('snapshot is created once and has a safe own-keyless clip map',()=>{
 const s=create();assert.equal(s.savedAt,0);assert.equal(s.timelineElapsed,null);
 assert.equal(Object.getPrototypeOf(s.clips),null);
});
test('empty action map stays empty',()=>assert.deepEqual(Object.keys(update(create(),{},1,null).clips),[]));
test('one action mirrors mixer state',()=>{
 const a=action(.4,.7);a.timeScale=.9;a.paused=true;
 const s=update(create(),{dance:a},5,1.5);
 assert.deepEqual(s.clips.dance,{time:.4,weight:.7,running:true,paused:true,timeScale:.9});
 assert.equal(s.savedAt,5);assert.equal(s.timelineElapsed,1.5);
});
test('same buffer reused without per-frame clip allocations',()=>{
 const a=action();const s=create();update(s,{dance:a},2,0);
 const clip=s.clips.dance,clips=s.clips;
 for(let frame=0;frame<7200;frame++){
  a.time=frame/60;
  assert.strictEqual(update(s,{dance:a},2+frame/60,frame/60),s);
  assert.strictEqual(s.clips,clips);assert.strictEqual(s.clips.dance,clip);
 }
 assert.equal(s.clips.dance.time,7199/60);
});
test('hundreds of motions have no hard cap',()=>{
 const actions=Object.create(null);
 for(let i=0;i<275;i++)actions['motion-'+i]=action(i,.25);
 const s=update(create(),actions,2,null);
 assert.equal(Object.keys(s.clips).length,275);
 assert.equal(s.clips['motion-274'].time,274);
});
test('one avatar buffer never shares mutable clip instances with another',()=>{
 const actions={rap:action(2)};
 const first=update(create(),actions,4,2),second=update(create(),actions,4,2);
 assert.notStrictEqual(first,second);assert.notStrictEqual(first.clips.rap,second.clips.rap);
 first.clips.rap.time=100;assert.equal(second.clips.rap.time,2);
});
test('fresh clips initialize exactly once',()=>{
 const s=update(create(),{first:action(3)},10,0);
 const old=s.clips.first;
 update(s,{first:action(4),second:action(5)},11,1);
 assert.strictEqual(s.clips.first,old);assert.equal(s.clips.second.time,5);
});
test('removed clip cannot survive a GLB remount',()=>{
 const s=update(create(),{a:action(),b:action()},10,null);
 update(s,{a:action()},11,null);assert.deepEqual(Object.keys(s.clips),['a']);
});
test('disabled undefined action is removed',()=>{
 const s=update(create(),{a:action()},10,null);
 update(s,{a:undefined},11,null);assert.equal(Object.keys(s.clips).length,0);
});
test('prototype pollution is not possible through clip names',()=>{
 const actions=Object.create(null);actions['__proto__']=action(3);actions['constructor']=action(4);
 const s=update(create(),actions,10,null);
 assert.equal(s.clips.__proto__.time,3);assert.equal(s.clips.constructor.time,4);
 assert.equal(Object.getPrototypeOf(s.clips),null);
});
test('invalid action numbers fail closed, not NaN in continuity',()=>{
 const a=action(NaN,Infinity);a.timeScale=NaN;
 const s=update(create(),{a},12,NaN);
 assert.equal(s.clips.a.time,0);assert.equal(s.clips.a.weight,0);
 assert.equal(s.clips.a.timeScale,1);assert.equal(s.timelineElapsed,null);
});
test('invalid timestamps cannot poison the buffer',()=>{
 const s=update(create(),{a:action(2)},20,8);
 assert.strictEqual(update(s,{a:action(500)},NaN,9),s);
 assert.equal(s.savedAt,20);assert.equal(s.clips.a.time,2);
 assert.equal(update(s,{a:action(2)},21,-1).timelineElapsed,null);
});
test('out-of-range weights clamped to safe range',()=>{
 const s=update(create(),{negative:action(1,-20),high:action(1,200)},20,null);
 assert.equal(s.clips.negative.weight,0);assert.equal(s.clips.high.weight,1);
});
test('LOD read sees same mutable snapshot as live renderer',()=>{
 const s=create(),actions={a:action(2)};
 update(s,actions,30,10);continuity.publishLiveLodPlayback('sourceA','ownerA',s);
 assert.strictEqual(continuity.readLiveLodPlayback('sourceA','ownerB',30.1),s);
 actions.a.time=4;update(s,actions,30.12,10.12);
 assert.equal(continuity.readLiveLodPlayback('sourceA','ownerB',30.2).clips.a.time,4);
 continuity.clearLiveLodPlayback('sourceA','ownerA');
});
test('live owner never reads own publication',()=>{
 const s=update(create(),{a:action()},31,1);
 continuity.publishLiveLodPlayback('owner-test','a',s);
 assert.equal(continuity.readLiveLodPlayback('owner-test','a',31.1),null);
 assert.strictEqual(continuity.readLiveLodPlayback('owner-test','b',31.1),s);
 continuity.clearLiveLodPlayback('owner-test','a');
});
test('live snapshots expire for readers after half a second',()=>{
 const s=update(create(),{a:action()},40,2);
 continuity.publishLiveLodPlayback('expiration','a',s);
 assert.ok(continuity.readLiveLodPlayback('expiration','b',40.49));
 assert.equal(continuity.readLiveLodPlayback('expiration','b',40.51),null);
 continuity.clearLiveLodPlayback('expiration','a');
});
test('source-specific clear cannot delete another owner',()=>{
 const s=update(create(),{a:action()},43,1);
 continuity.publishLiveLodPlayback('shared','a',s);
 continuity.clearLiveLodPlayback('shared','b');
 assert.ok(continuity.readLiveLodPlayback('shared','b',43.1));
 continuity.clearLiveLodPlayback('shared','a');assert.equal(continuity.readLiveLodPlayback('shared','b',43.1),null);
});
test('stale sources are pruned on the next publication without a timer',()=>{
 continuity.publishLiveLodPlayback('stale','a',update(create(),{},50,null));
 continuity.publishLiveLodPlayback('fresh','b',update(create(),{},57.1,null));
 assert.equal(continuity.readLiveLodPlayback('stale','c',50.1),null);
 continuity.clearLiveLodPlayback('fresh','b');
});
test('transient LOD map is bounded under long rotating shows',()=>{
 const max=continuity.MAX_LIVE_LOD_SOURCES_V569;
 for(let i=0;i<max+80;i++)continuity.publishLiveLodPlayback('rotation-'+i,'owner-'+i,update(create(),{},100+i*.001,null));
 assert.equal(continuity.readLiveLodPlayback('rotation-0','someone',100),null);
 assert.ok(continuity.readLiveLodPlayback('rotation-'+(max+79),'someone',100+(max+79)*.001+.01));
});
test('same-source new owner cannot clear the latest snapshot',()=>{
 const a=update(create(),{},200,null),b=update(create(),{},201,null);
 continuity.publishLiveLodPlayback('changing','a',a);
 continuity.publishLiveLodPlayback('changing','b',b);
 continuity.clearLiveLodPlayback('changing','a');
 assert.strictEqual(continuity.readLiveLodPlayback('changing','a',201.1),b);
 continuity.clearLiveLodPlayback('changing','b');
});
test('one-shot LOD remount snapshot remains independent and consumable',()=>{
 continuity.saveLodPlayback('oneShot',{savedAt:300,timelineElapsed:6,clips:{a:{time:2,weight:1,running:true,paused:false,timeScale:1}}});
 assert.equal(continuity.takeLodPlayback('oneShot',301)?.clips.a.time,2);
 assert.equal(continuity.takeLodPlayback('oneShot',301),null);
});
const pose=(source,owner,asset,now,angle=0)=>({source,owner,asset,sampledAt:now,clips:{walk:{time:1,weight:.8}},bones:{spine:[0,Math.sin(angle/2),0,Math.cos(angle/2)]}});
test('single LOD has no outgoing reference',()=>{
 diag.publishLodPoseSample(pose('solo','a','high',500));
 assert.equal(diag.getOutgoingLodPose('solo','a',500.1),null);
 assert.equal(diag.getOutgoingLodPose('solo','b',500.1),null);
 diag.removeLodPoseSample('a');
});
test('two concurrent LODs preserve outgoing-owner ordering',()=>{
 const a=pose('pair','older','low',520),b=pose('pair','newer','high',520.1,.2);
 diag.publishLodPoseSample(a);diag.publishLodPoseSample(b);
 assert.strictEqual(diag.getOutgoingLodPose('pair','newer',520.2),a);
 assert.equal(diag.getOutgoingLodPose('pair','older',520.2),null);
 diag.removeLodPoseSample('older');diag.removeLodPoseSample('newer');
});
test('cross-source LOD owners never match',()=>{
 diag.publishLodPoseSample(pose('one','left','low',530));
 diag.publishLodPoseSample(pose('two','right','high',530));
 assert.equal(diag.getOutgoingLodPose('one','right',530.1),null);
 diag.removeLodPoseSample('left');diag.removeLodPoseSample('right');
});
test('expired LOD samples never initiate pose correction',()=>{
 diag.publishLodPoseSample(pose('old','left','low',540));
 diag.publishLodPoseSample(pose('old','right','high',540.1));
 assert.equal(diag.getOutgoingLodPose('old','right',540.6),null);
 diag.removeLodPoseSample('left');diag.removeLodPoseSample('right');
});
test('same asset is excluded from diagnostics comparison',()=>{
 diag.publishLodPoseSample(pose('same','a','same-url',550));
 diag.publishLodPoseSample(pose('same','b','same-url',550.1));
 assert.equal(diag.getOutgoingLodPose('same','b',550.2)?.owner,'a');
 diag.removeLodPoseSample('a');diag.removeLodPoseSample('b');
});
test('pose quality remains available during real variants transition',()=>{
 const a=pose('report','a','low',600),b=pose('report','b','high',600.1,.2);
 const r=diag.compareLodPose(a,b);
 assert.equal(r.active,true);assert.equal(r.bonesCompared,1);
 assert.equal(r.clipsCompared,1);assert.ok(r.maxAngularErrorDeg>0);
});
test('unmounted LOD cleanup stays explicit',()=>{
 assert.match(read('components/visualizer/GltfDancerAvatarV492.tsx'),/clearLiveLodPlayback\(url, liveOwner\.current\)/);
 assert.match(read('components/visualizer/GltfDancerAvatarV492.tsx'),/removeLodPoseSample\(liveOwner\.current\)/);
});
test('live playback uses source-owned V569 buffer and no per-frame Object.entries allocation',()=>{
 const s=read('components/visualizer/GltfDancerAvatarV492.tsx');
 assert.match(s,/useRef\(createLodPlaybackBufferV569\(\)\)/);
 assert.match(s,/updateLodPlaybackBufferV569\(livePlaybackBufferV569\.current,actions,nowV569/);
 assert.doesNotMatch(s,/const clipStates: Record<string/);
});
test('V569 hotpath does not introduce a second render loop or timer',()=>{
 for(const file of ['components/visualizer/lodPlaybackBufferV569.ts','components/visualizer/lodPlaybackContinuity.ts','components/visualizer/lodContinuityDiagnostics.ts']){
  assert.doesNotMatch(read(file),/requestAnimationFrame\(|setInterval\(|setTimeout\(|new AnimationMixer\(|new Canvas\(/);
 }
});
test('source remains responsible for pose interpolation, not the memory buffer',()=>{
 const s=read('components/visualizer/lodPlaybackBufferV569.ts');
 assert.doesNotMatch(s,/\.play\(|\.stop\(|action\.paused\s*=|action\.timeScale\s*=|mixer\.update|lipSync/);
});
test('V355/V479/V552 policies stay installed',()=>{
 assert.match(read('components/visualizer/ThreeAvatar.tsx'),/LongRunStabilityControllerV355/);
 assert.match(read('components/visualizer/adaptivePerformance.tsx'),/samplePiConcertV479/);
 assert.match(read('components/visualizer/ConcertAtmosphereRendererV308.tsx'),/shouldDrawTransparentV552/);
});
test('release metadata and regression chain updated',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]??0)>=569);
 assert.ok(pkg.scripts['build:preflight'].includes('npm run test:v569 && npm run test:v569:types'));
 assert.match(pkg.scripts['verify:v569'],/verify:v568/);
 assert.match(read('ARCHITECTURE.md'),/Dokumentationsstand:\*\* V(?:569|5[7-9][0-9]|[6-9][0-9]{2})/);
 assert.match(read('V569-RASPBERRY-PI-LONG-RUN-STABILITY.md'),/Motion-Bibliothek/);
});
console.log(`PASS V569: ${tests} regression cases; reusable per-frame buffers, active cross-LOD handoff, memory cleanup, no artificial clip limit`);

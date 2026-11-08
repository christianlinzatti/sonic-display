#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040:generate,normalizeArenaShowPlanV1040:normalize,
 sampleArenaShowPlanV1040:sample,editArenaShowSegmentV1040:edit}=load('lib/arena360ShowDesignerV1040');
const {retimeConcertBoundaryV1094:retime,resetConcertBoundariesV1094:reset,
 timelineBoundaryRangeV1094:range,previewConcertTimelineV1094:preview,MIN_SCENE_FRACTION_V1094:minimum}=load('lib/arena360ConcertTimelineStudioV1094');
const plan=generate({prompt:'Großer Festival Abend',title:'Timeline Studio 3',genre:'Hardtekk',durationMs:210000});
assert.equal(minimum,.025);
assert.equal(normalize(plan)?.segments.length,7);
assert.equal(range(plan,0),null);assert.equal(range(plan,7),null);
assert.equal(range(plan,1.2),null);assert.equal(range(null,1),null);
assert.equal(retime(plan,0,1000),null);assert.equal(retime(plan,7,1000),null);
for(const at of [NaN,Infinity,-Infinity])assert.equal(retime(plan,1,at),null);
assert.equal(preview(null,2000),null);assert.equal(preview(plan,-1),null);
assert.equal(preview(plan,NaN),null);assert.equal(preview(plan,Infinity),null);
let changed=retime(plan,3,Math.round(plan.durationMs*.39));
assert(changed,'retime should produce a valid plan');
assert.equal(changed.segments[2].end,changed.segments[3].start);
assert(Math.abs(changed.segments[2].end-.39)<.00001);
assert.equal(changed.segments[0].start,0);
assert.equal(changed.segments.at(-1).end,1);
assert.notDeepEqual(changed,plan);
assert.equal(plan.segments[2].end,.43,'immutable edit');
assert.deepEqual(normalize(JSON.parse(JSON.stringify(changed))),changed,'persisted JSON roundtrip');
assert.equal(preview(changed,84000)?.scene,'hook','edited boundary reaches actual V1040 sampler');
assert.equal(preview(plan,84000)?.scene,'build','old show plan remains unchanged');
assert.equal(sample(changed,{enabled:true,playing:true,reducedMotion:false,progressMs:84000,durationMs:210000}).scene,'hook','live stage uses retimed boundary');
const styled=edit(changed,'act-3',{lasers:'tunnel',deck:'spiral',camera:'orbit',dance:'group',intensity:35});
const restored=reset(styled);
assert(restored);assert.deepEqual(restored.segments.map(s=>[s.start,s.end]),plan.segments.map(s=>[s.start,s.end]));
assert.equal(restored.segments[2].lasers,'tunnel');assert.equal(restored.segments[2].intensity,35);
assert.equal(restored.segments[2].camera,'orbit');assert.equal(restored.title,plan.title);
assert.equal(reset(null),null);
assert.deepEqual(reset(plan),plan);
for(const boundary of [1,2,3,4,5,6]){
 const limits=range(plan,boundary);assert(limits);
 assert(limits.minMs<limits.currentMs&&limits.currentMs<limits.maxMs);
 for(const invalid of [-1e10,1e10]){
  const next=retime(plan,boundary,invalid);assert(next);
  assert(normalize(next),'min/max clamp yields a strictly valid full timeline');
 }
}
function checkTimeline(p){
 assert.equal(p.segments[0].start,0);assert.equal(p.segments.at(-1).end,1);
 let cursor=0;
 for(let i=0;i<7;i++){
  const s=p.segments[i];assert(Number.isFinite(s.start)&&Number.isFinite(s.end));
  assert.equal(s.start,cursor);assert(s.end-s.start>=.02-1e-8);
  cursor=s.end;
 }
}
let current=plan;
// 140k adjacent boundary edits, song variations and virtual playhead samples.
for(let i=0;i<140000;i++){
 const index=1+i%6;
 const limits=range(current,index);assert(limits);
 const at=i%67===0?1e9:i%53===0?-1e9:limits.minMs+((i*749)%Math.max(1,limits.maxMs-limits.minMs+1));
 const next=retime(current,index,at);
 assert(next);
 checkTimeline(next);
 assert(normalize(next));
 const cue=preview(next,(i*1513)%next.durationMs);
 assert(cue?.active);assert(Number.isFinite(cue.intensity));assert(cue.intensity>=0&&cue.intensity<=100);
 assert(cue.segmentIndex>=0&&cue.segmentIndex<7);
 current=next;
 if(i%10000===9999)current=reset(current);
}
// Corrupted data must fail closed, rather than permitting gaps, overlaps or bad durations.
for(const input of [
 {...plan,segments:plan.segments.map((s,i)=>i===2?{...s,start:.1}:s)},
 {...plan,segments:plan.segments.map((s,i)=>i===2?{...s,end:s.start}:s)},
 {...plan,segments:plan.segments.map((s,i)=>i===2?{...s,end:Infinity}:s)},
 {...plan,segments:plan.segments.map((s,i)=>i===2?{...s,start:NaN}:s)},
 {...plan,segments:plan.segments.map((s,i)=>i===6?{...s,end:.99}:s)},
 {...plan,segments:plan.segments.map((s,i)=>i===2?{...s,end:s.start+.005}:s)}
 ])assert.equal(normalize(input),null);
const lib=read('lib/arena360ConcertTimelineStudioV1094.ts');
for(const forbidden of ['Date.now(', 'Math.random(', 'fetch(', 'setInterval(', 'setTimeout(', 'localStorage.', 'navigator.', 'requestAnimationFrame(', 'window.'])
 assert(!lib.includes(forbidden),'no new network, timer or hardware: '+forbidden);
const panel=read('components/visualizer/ConcertTimelineStudioV1094.tsx');
for(const fragment of ['timelineBoundaryRangeV1094(', 'retimeConcertBoundaryV1094(', 'previewConcertTimelineV1094(',
 'resetConcertBoundariesV1094(', 'updatePreferences({arenaShowPlanV1040:updated})',
 'updatePreferences({arenaShowPlanV1040:reset})','step={250}', 'type="number"', 'role="group"'])
 assert(panel.includes(fragment),'timeline editor missing '+fragment);
const designer=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(designer.includes('<ConcertTimelineStudioV1094/>'));
assert(designer.includes('arenaShowDesignerEnabledV1040:e.target.checked'));
assert(read('components/visualizer/stages/Arena360StageV1031.tsx').includes('sampleArenaShowPlanV1040('),
 'live stage should sample persisted V1040 plan unchanged');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1094);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.includes('npm run test:v1094 && npm run test:v1094:types &&'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1094-concert-timeline-studio-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1094(root)'));
console.log('PASS V1094: editable live show-plan boundaries, 140000 bounded scenes, preview, persistence, reset, CI and manual authority');

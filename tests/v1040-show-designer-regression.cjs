#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {
 generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,editArenaShowSegmentV1040,
 sampleArenaShowPlanV1040
}=load('lib/arena360ShowDesignerV1040');
const hard=generateArenaShowPlanV1040({prompt:'Eine dramatische Hardtekk-Show mit aggressiven Drops und großem Finale',genre:'Hardtekk',durationMs:240000});
assert.equal(hard.version,1040);assert.equal(hard.genre,'hard');assert.equal(hard.segments.length,7);
assert.equal(hard.segments[0].start,0);assert.equal(hard.segments.at(-1).end,1);
for(let i=0;i<7;i++){
 const s=hard.segments[i];
 assert.equal(s.id,`act-${i+1}`);assert(s.start>=0&&s.start<s.end&&s.end<=1);
 assert(s.intensity>=0&&s.intensity<=92);
 if(i)assert.equal(hard.segments[i-1].end,s.start,'nonoverlapping full-song timeline');
}
assert(hard.segments.at(-1).intensity>=hard.segments[0].intensity);
const rap=generateArenaShowPlanV1040({prompt:'Düsterer Deutschrap, eher ruhig und minimal',genre:'Deutschrap'});
const pop=generateArenaShowPlanV1040({prompt:'Sanfte Pop Ballade',genre:'Pop'});
assert.equal(rap.genre,'rap');assert.equal(pop.genre,'pop');
assert(rap.segments[3].intensity<hard.segments[3].intensity);
assert.equal(generateArenaShowPlanV1040({genre:'NDH / Industrial Metal'}).genre,'rock');
assert.equal(generateArenaShowPlanV1040({durationMs:-1}).durationMs,30000);
assert.equal(generateArenaShowPlanV1040({durationMs:Infinity}).durationMs,30000);
assert.equal(generateArenaShowPlanV1040({durationMs:1e12}).durationMs,900000);
assert.equal(generateArenaShowPlanV1040({prompt:'a'.repeat(1000)}).prompt.length,400);
assert.equal(generateArenaShowPlanV1040({title:'x'.repeat(1000)}).title.length,75);
const edited=editArenaShowSegmentV1040(hard,'act-4',{intensity:105,deck:'spiral',lasers:'spiral',floating:'rise',camera:'orbit',dance:'peak'});
assert.equal(edited.segments[3].intensity,100);assert.equal(edited.segments[3].deck,'spiral');
assert.equal(edited.segments[3].camera,'orbit');assert.equal(edited.segments[3].dance,'peak');
assert.equal(hard.segments[3].camera,'group','immutable update');
assert.deepEqual(editArenaShowSegmentV1040(hard,'unknown',{intensity:0}),hard);
assert.equal(editArenaShowSegmentV1040(hard,'act-1',{intensity:NaN}).segments[0].intensity,0);
assert.equal(editArenaShowSegmentV1040(hard,'act-2',{deck:'INVALID',lasers:'INVALID'}).segments[1].deck,hard.segments[1].deck);
assert.deepEqual(normalizeArenaShowPlanV1040(JSON.parse(JSON.stringify(edited))),edited);
for(const invalid of [null,{},[],{...hard,version:1041},{...hard,durationMs:0},
 {...hard,segments:hard.segments.slice(0,6)},
 {...hard,segments:hard.segments.map((s,i)=>i? s:{...s,start:.1})},
 {...hard,segments:hard.segments.map((s,i)=>i? s:{...s,intensity:Infinity})},
 {...hard,segments:hard.segments.map((s,i)=>i? s:{...s,camera:'execute'})}]){
 assert.equal(normalizeArenaShowPlanV1040(invalid),null,'invalid persisted data rejected');
}
const base={enabled:true,playing:true,reducedMotion:false,progressMs:0,durationMs:240000,observedSection:'verse'};
for(const denied of [{enabled:false},{playing:false},{reducedMotion:true},{progressMs:-1},{progressMs:NaN},{durationMs:0},{durationMs:Infinity}]){
 assert.equal(sampleArenaShowPlanV1040(hard,{...base,...denied}).active,false,JSON.stringify(denied));
}
assert.equal(sampleArenaShowPlanV1040(null,base).active,false);
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:0}).intensity,0);
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:240000*.20}).scene,'verse');
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:240000*.33}).scene,'build');
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:240000*.50}).scene,'hook');
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:240000}).scene,'finale');
assert.equal(sampleArenaShowPlanV1040(hard,{...base,progressMs:1e10}).scene,'finale');
for(const t of [0,3000,12000,55000,100000,200000,240000]){
 const c=sampleArenaShowPlanV1040(hard,{...base,progressMs:t});
 assert(c.active);assert(c.intensity>=0&&c.intensity<=80,'unverified finale safely capped');
 assert(c.fade>=0&&c.fade<=1);
}
const finale=sampleArenaShowPlanV1040(hard,{...base,progressMs:235000,observedSection:'drop'});
assert(finale.intensity>=sampleArenaShowPlanV1040(hard,{...base,progressMs:235000,observedSection:'verse'}).intensity);
// No new promises of real audio analysis, external AI, hardware lasers or camera ownership.
const planner=read('lib/arena360ShowDesignerV1040.ts');
for(const forbidden of ['fetch(','setInterval(','setTimeout(','localStorage','WebSocket','new AudioContext','dispatchEvent','eval('])
 assert(!planner.includes(forbidden),`planner contains ${forbidden}`);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
for(const fragment of ['sampleArenaShowPlanV1040','showDesignerEnabled','plannedIntensity','plannedDeck',
 'plannedFloat','plannedLasers','plannedHoloStrength','Math.min(showIntensity','===\'auto\'','observedSection:section'])
 assert(stage.includes(fragment),`stage missing ${fragment}`);
assert(stage.indexOf('{children}',stage.indexOf('ref={turntable}'))>0,'avatar parenting untouched');
for(const file of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/stages/index.tsx','components/visualizer/stages/Arena360StageV1031.tsx']){
 for(const key of ['arenaShowDesignerEnabledV1040','arenaShowPlanV1040'].filter(x=>!file.endsWith('stages/index.tsx')&&!file.endsWith('Arena360StageV1031.tsx')))
  assert(read(file).includes(key),`${file} missing ${key}`);
}
const ui=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
for(const text of ['generateArenaShowPlanV1040','editArenaShowSegmentV1040','arenaShowDesignerEnabledV1040','arenaShowPlanV1040','textarea','<ol','disabled={!plan}','onClick'])
 assert(ui.includes(text),`editor missing ${text}`);
assert(read('components/SettingsPanel.tsx').includes('<ArenaShowDesignerPanelV1040/>'),'settings renders designer');
assert(read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'),'keep V1038 TypeScript palette fix');
assert(!read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'),'no duplicate automatic build');
assert(read('scripts/vercel-ignore-upload.cjs').includes('ZIP_ONLY'),'keep long-name Vercel skip support');
console.log('V1040 AI Show Designer PASS: seven phases, genre prompts, editable cues, disabled by default, song duration, authority, safety and integration');

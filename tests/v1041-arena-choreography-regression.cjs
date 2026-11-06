#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040,editArenaShowSegmentV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaChoreographyV1041,OFF_ARENA_CHOREO_V1041}=load('lib/arena360ChoreographyV1041');
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:240000,prompt:'Hardstyle mit vielen Szenen'});
const at=(fraction,obs='verse')=>sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
 progressMs:fraction*240000,durationMs:240000,observedSection:obs});
const base={enabled:true,show:at(.5),playing:true,reducedMotion:false,manualPriority:false,stageIsArena:true,
 trackId:'spotify:track:123',progressMs:120000,genre:'Hardstyle',strength:80,formation:'auto',performanceTier:'high'};
const hook=planArenaChoreographyV1041(base);
assert(hook.active);assert.equal(hook.reason,'planned');
assert.equal(hook.formation,'wide');assert(['sync','mirror'].includes(hook.scene));
assert.equal(hook.dropAccent,false,'a timeline hook does not fabricate a verified audio drop');
assert.equal(hook.role,'together','V1041 never fabricates vocal identity');
assert(hook.strength>0&&hook.strength<=.8);
assert(hook.leadGain>=1&&hook.leadGain<=1.18);
assert(hook.partnerGain>=1&&hook.partnerGain<=1.18);
const intro=planArenaChoreographyV1041({...base,show:at(.03),progressMs:7200});
assert.equal(intro.scene,'solo');assert.equal(intro.formation,'line');
const verse=planArenaChoreographyV1041({...base,show:at(.2),progressMs:48000});
assert.equal(verse.scene,'duet');
const build=planArenaChoreographyV1041({...base,show:at(.36),progressMs:86400});
assert.equal(build.scene,'duet');
const breakCue=planArenaChoreographyV1041({...base,show:at(.69),progressMs:165600});
assert.equal(breakCue.scene,'solo');
const finale=planArenaChoreographyV1041({...base,show:at(.95,'drop'),progressMs:228000});
assert.equal(finale.formation,'wide');
assert.equal(finale.dropAccent,false);
for(const formation of ['line','diagonal','wide']){
 assert.equal(planArenaChoreographyV1041({...base,formation}).formation,formation,'user layout priority');
}
assert.equal(planArenaChoreographyV1041({...base,strength:0}).active,false);
assert.equal(planArenaChoreographyV1041({...base,strength:500}).strength<=1,true);
assert.equal(planArenaChoreographyV1041({...base,strength:NaN}).active,true,'invalid level falls back safely');
for(const denied of [
 {enabled:false},{show:null},{show:{...base.show,active:false}},
 {playing:false},{reducedMotion:true},{manualPriority:true},{stageIsArena:false},
 {trackId:''},{progressMs:-1},{progressMs:NaN},{performanceTier:'low'}
]){
 const cue=planArenaChoreographyV1041({...base,...denied});
 assert.equal(cue.active,false,'guard: '+JSON.stringify(denied));
 assert.equal(cue.scene,'solo');assert.equal(cue.formation,'line');
}
for(let i=0;i<7;i++){
 const segment=plan.segments[i],fraction=(segment.start+segment.end)/2;
 const cue=planArenaChoreographyV1041({...base,show:at(fraction),progressMs:fraction*240000});
 assert(cue.active);assert.equal(cue.dropAccent,false);
 assert(['solo','duet','sync','mirror'].includes(cue.scene));
 assert(['line','diagonal','wide'].includes(cue.formation));
}
const alternate=editArenaShowSegmentV1040(plan,'act-4',{dance:'calm'});
const custom=sampleArenaShowPlanV1040(alternate,{enabled:true,playing:true,reducedMotion:false,progressMs:120000,durationMs:240000});
assert.equal(planArenaChoreographyV1041({...base,show:custom}).scene,'solo', 'user-authored scene dance wins');
assert.equal(OFF_ARENA_CHOREO_V1041.active,false);
const lib=read('lib/arena360ChoreographyV1041.ts');
for(const unsafe of ['fetch(','setInterval(','setTimeout(','localStorage','WebSocket','dispatchEvent','eval('])
 assert(!lib.includes(unsafe),'no network or second clock in show choreography: '+unsafe);
const avatar=read('components/visualizer/ThreeAvatar.tsx');
for(const token of ['sampleArenaShowPlanV1040','planArenaChoreographyV1041','arenaChoreoV1041.active ?',
 'arenaChoreographyEnabledV1041','manualPriority:authoredEnabled','getActivePerformanceTier()',
 'arenaChoreoV1041.active ? arenaChoreoV1041 : null'])assert(avatar.includes(token),'Missing live connection '+token);
const formationRenderer=read('components/visualizer/DanceFormationActorsV492.tsx');
assert(formationRenderer.includes('arenaWeightV1041'));
assert(formationRenderer.includes('separatePartners(leadTarget, partnerTarget, 1.35)'),
 'reuse existing minimum separation before setting stage group positions');
assert(formationRenderer.includes('readFootLockV322().enabled'), 'preserve foot-lock ownership');
assert(formationRenderer.includes('shouldRunScheduledTask'), 'retain the current formation scheduler');
const ui=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
for(const x of ['arenaChoreographyEnabledV1041','arenaChoreographyStrengthV1041','arenaChoreographyFormationV1041',
 'Geplante Tanzformationen live anwenden','<fieldset','nicht überschrieben'])assert(ui.includes(x),x);
assert(read('context/UiPreferencesContext.tsx').includes('arenaChoreographyEnabledV1041:false'));
for(const file of ['types/music.ts','components/visualizer/registry.tsx','components/visualizer/VisualizerStage.tsx'])
 for(const k of ['arenaChoreographyEnabledV1041','arenaChoreographyStrengthV1041','arenaChoreographyFormationV1041'])
  assert(read(file).includes(k),`${file}: ${k}`);
assert(read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'),'carry deployment fix');
assert(!read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'),'no duplicate automatic build');
assert(!read('.github/workflows/v1041-intelligent-avatar-choreography-validation.yml').includes('  push:'));
console.log('V1041 Intelligent Avatar Choreography PASS: seven song scenes, real duo formations, genre gain, manual/editor priorities, renderer caps and regression safety');

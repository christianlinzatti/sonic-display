'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planIntelligentLaserV1057:plan}=load('lib/arena360IntelligentLaserV1057');
const durationMs=210000,trackId='spotify:laser-regression';
const showPlan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
const input=(at=103000,p=showPlan)=>({enabled:true,stageIsArena:true,fanEnabled:true,
 architectureEnabled:true,playing:true,reducedMotion:false,reactive:true,
 trackId,progressMs:at,durationMs,performanceTier:'high',strength:70,plan:p,
 show:sampleArenaShowPlanV1040(p,{enabled:true,playing:true,reducedMotion:false,
  progressMs:at,durationMs})});
const first=plan(input());
assert(first.active&&first.reason==='planned');
assert.deepEqual(first,plan(input()),'laser show is deterministic for the same song/playhead');
const times=[8000,28000,82000,108000,145000,174000,202000];
const cues=times.map(t=>plan(input(t)));
assert(cues.every(c=>c.active),'all seven planned chapters have cues');
assert.deepEqual(cues.map(c=>c.pattern),['halo','halo','spiral','tunnel','halo','halo','tunnel']);
assert.equal(new Set(cues.map(c=>c.colorA)).size,2,'multi-chapter palette changes');
assert(cues[2].sweep>cues[1].sweep,'spiral has a wider sweep than verse');
assert(cues[3].fanSpread>cues[0].fanSpread,'tunnel has a wider fan');
assert(cues[6].beamGain<=1,'finale cannot amplify existing laser brightness');
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const p=generateArenaShowPlanV1040({genre,durationMs});
 const cue=plan(input(103000,p));
 assert(cue.active&&/^#[0-9a-f]{6}$/i.test(cue.colorA)&&/^#[0-9a-f]{6}$/i.test(cue.colorB));
}
const patches=[{enabled:false},{stageIsArena:false},{fanEnabled:false,architectureEnabled:false},
 {playing:false},{reducedMotion:true},{reactive:false},{performanceTier:'low'},
 {trackId:''},{progressMs:NaN},{progressMs:-1},{progressMs:durationMs+1},
 {durationMs:Infinity},{durationMs:1200},{show:null},{plan:null},
 {show:{...first,active:false}},{show:{...input().show,segmentIndex:999}},
 {show:{...input().show,fade:0}},{show:{...input().show,scene:'finale'}},
 {show:{...input().show,lasers:'spiral'}},{strength:0}];
for(const patch of patches){
 const cue=plan({...input(),...patch});
 assert.equal(cue.active,false,JSON.stringify(patch));
 assert.equal(cue.sweep,0);assert.equal(cue.fanGain,1);assert.equal(cue.beamGain,1);
}
assert.equal(plan({...input(),playing:false}).reason,'paused');
assert.equal(plan({...input(),reducedMotion:true}).reason,'motion');
assert.equal(plan({...input(),performanceTier:'low'}).reason,'quality');
assert.equal(plan({...input(),progressMs:Infinity}).reason,'clock');
const balanced=plan({...input(),performanceTier:'balanced'});
assert(balanced.active&&balanced.sweep<first.sweep);
for(let i=0;i<6500;i++){
 const at=3000+i*31.5,cue=plan(input(at));
 if(!cue.active)continue;
 for(const key of ['fanSpread','fanLift','sweep','fanGain','beamGain'])assert(Number.isFinite(cue[key]),key);
 assert(cue.fanSpread>=.88&&cue.fanSpread<=1.17);
 assert(cue.fanLift>=-.1&&cue.fanLift<=.22);
 assert(cue.sweep>=0&&cue.sweep<=.26);
 assert(cue.fanGain>=.65&&cue.fanGain<=1);
 assert(cue.beamGain>=.62&&cue.beamGain<=1);
}
const pure=read('lib/arena360IntelligentLaserV1057.ts');
for(const unsafe of ['fetch(','setInterval(','setTimeout(','Math.random(','Date.now(',
 'localStorage','WebSocket(','new SpotLight','new Camera','navigator.'])
 assert(!pure.includes(unsafe),'pure cue director must avoid '+unsafe);
const fans=read('components/visualizer/stages/ArenaLaserFansV1036.tsx');
const tunnels=read('components/visualizer/stages/ArenaLaserTunnelsV1039.tsx');
const arena=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(fans.includes('laserCueV1057?.active')&&tunnels.includes('laserCueV1057?.active'));
assert(fans.includes('laserCueV1057.fanGain')&&tunnels.includes('authored?.beamGain'));
assert(tunnels.includes("pattern==='auto'&&authored?authored.pattern:pattern"),'manual pattern wins');
assert(fans.includes('tier===\'low\'')&&tunnels.includes('createLaserArchitectureV1039(tier)'),'GPU budget retained');
assert.equal((fans.match(/<instancedMesh\b/g)||[]).length,1);
assert.equal((tunnels.match(/<instancedMesh\b/g)||[]).length,1);
assert(arena.includes('planIntelligentLaserV1057(')&&
 (arena.match(/laserCueV1057={(?:intelligentLaserV1057|coordinatedLasersV1060)}/g)||[]).length===2);
assert(!arena.includes('coordinatedLasersV1060')||arena.includes('intelligentLaserV1057.active'),'coordination must require active original laser cue');
assert(arena.includes('hologramPattern===\'auto\''),'manual laser selection still wins');
for(const file of ['types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('IntelligentLaserEnabledV1057')||read(file).includes('intelligentLaserEnabledV1057'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaIntelligentLaserEnabledV1057:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1057 · Intelligent Laser Director'));
assert(/arenaIntelligentLaserEnabledV1057:false(?:,|})/.test(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx')));
console.log('PASS V1057 · 7 authored laser looks, manual precedence, 6500 bounded samples, reduced-motion/quality gates, no extra lights/commands/draw calls, full UI wiring');

#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {resolveHologramGenreV1039,planArenaHolographyV1039,createHologramFixturesV1039,
 createLaserArchitectureV1039,hologramFixtureCountV1039,laserArchitectureCountV1039,
 sampleHologramPortalV1039,sampleLaserArchitectureV1039}=load('lib/arena360HolographyV1039');
const tiers=['low','balanced','high'];
assert.deepEqual(tiers.map(hologramFixtureCountV1039),[3,6,9]);
assert.deepEqual(tiers.map(laserArchitectureCountV1039),[4,8,12]);
for(const tier of tiers){
 const holograms=createHologramFixturesV1039(tier),lasers=createLaserArchitectureV1039(tier);
 assert.equal(holograms.length,hologramFixtureCountV1039(tier));
 assert.equal(lasers.length,laserArchitectureCountV1039(tier));
 assert(holograms.every(p=>p.radius>=3.57&&p.radius<=3.72),'scenic portal outside cast floor');
}
assert.equal(resolveHologramGenreV1039('Deutschrap'),'rap');
assert.equal(resolveHologramGenreV1039('Hardtekk'),'hard');
assert.equal(resolveHologramGenreV1039('Hardstyle'),'hard');
assert.equal(resolveHologramGenreV1039('NDH / Industrial Metal'),'rock');
assert.equal(resolveHologramGenreV1039('Deutschrock'),'rock');
assert.equal(resolveHologramGenreV1039('Pop'),'pop');
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,
 genre:'Hardtekk',section:'drop',energy:.87,strength:70,pattern:'auto'};
const active=planArenaHolographyV1039(base);
assert.equal(active.genre,'hard');assert.equal(active.pattern,'tunnel');
assert(active.portal>.0&&active.portal<=.65);assert(active.beam>.0&&active.beam<=.44);
assert.equal(planArenaHolographyV1039({...base,section:'build'}).pattern,'spiral');
assert.equal(planArenaHolographyV1039({...base,section:'hook'}).pattern,'halo');
for(const mode of ['tunnel','spiral','halo'])assert.equal(planArenaHolographyV1039({...base,pattern:mode}).pattern,mode);
assert.equal(planArenaHolographyV1039({...base,pattern:'INVALID'}).pattern,'tunnel');
assert.deepEqual(['rap','hard','rock','pop'].map(genre=>planArenaHolographyV1039({...base,genre}).primary).length,4);
for(const blocked of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},{strength:0}]){
 const cue=planArenaHolographyV1039({...base,...blocked});
 assert.equal(cue.portal,0);assert.equal(cue.beam,0);assert.equal(cue.speed,0);
}
for(const value of [NaN,Infinity,-1,150,undefined]){
 const cue=planArenaHolographyV1039({...base,energy:value,strength:value});
 for(const key of ['portal','beam','speed','radius','phase'])assert(Number.isFinite(cue[key]));
 assert(cue.beam>=0&&cue.beam<=.44);assert(cue.portal>=0&&cue.portal<=.65);
}
for(const tier of tiers){
 const holo=createHologramFixturesV1039(tier),laser=createLaserArchitectureV1039(tier);
 for(const f of holo)for(const t of [0,5,300,NaN,Infinity]){
  const p=sampleHologramPortalV1039(f,t,active);
  assert(Object.values(p).every(Number.isFinite));
  assert(Math.hypot(p.x,p.z)>=3.56&&Math.hypot(p.x,p.z)<3.75);
  assert(p.y>=1.1&&p.y<=1.4&&p.light>=.04&&p.light<=.49);
 }
 for(const f of laser)for(const t of [0,5,300,NaN,Infinity]){
  const p=sampleLaserArchitectureV1039(f,t,active);
  assert(Object.values(p.origin).concat(Object.values(p.end),p.light).every(Number.isFinite));
  assert(p.origin.y>=2.5);assert(p.end.y>0.6&&p.end.y<=2.05);
  assert(Math.hypot(p.end.x,p.end.z)<=1.51);
  assert(p.light>=0&&p.light<=.44);
 }
}
for(const f of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx',
 'components/SettingsPanel.tsx','components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx']){
 const s=read(f);
 for(const key of ['arenaHologramsEnabledV1039','arenaLaserArchitectureEnabledV1039',
  'arenaHologramPatternV1039','arenaHologramStrengthV1039'])assert(s.includes(key),`${f}: ${key}`);
}
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
for(const name of ['ArenaHologramPortalsV1039','ArenaLaserTunnelsV1039','ArenaFloatingPlatformsV1038'])assert(stage.includes(`<${name}`));
for(const name of ['ArenaHologramPortalsV1039','ArenaLaserTunnelsV1039'])
 assert(stage.indexOf(`<${name}`)<stage.indexOf('ref={turntable}'),'world-fixed effects cannot rotate cast');
assert(stage.indexOf('{children}',stage.indexOf('ref={turntable}'))>0);
for(const file of ['components/visualizer/stages/ArenaHologramPortalsV1039.tsx',
 'components/visualizer/stages/ArenaLaserTunnelsV1039.tsx']){
 const s=read(file);
 for(const required of ['useAdaptivePerformance','useFrame','instancedMesh','instanceColor','depthWrite={false}','enabled'])
  assert(s.includes(required),`${file} missing ${required}`);
 for(const forbidden of ['setInterval(','setTimeout(','spotLight','pointLight','fetch(','new WebSocket','AudioContext','navigator.'])
  assert(!s.includes(forbidden),`${file} forbidden ${forbidden}`);
}
const index=read('components/visualizer/stages/index.tsx');
for(const prop of ['hologramsEnabled={hologramsEnabled}','laserArchitectureEnabled={laserArchitectureEnabled}',
 'hologramPattern={hologramPattern}','hologramStrength={hologramStrength}','genre={genre}'])assert(index.includes(prop));
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1039-preview-portal'));
assert(read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'),'keep proven V1038 TypeScript palette fix');
assert(!read('.github/workflows/v1032-live-arena-validation.yml').includes('  push:'),'avoid duplicate automatic CI');
console.log('V1039 Holographic Laser Architecture PASS: tier-caps, genre presets, real section cues, bounds, pause, safety, settings and integration');

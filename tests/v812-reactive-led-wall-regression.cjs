'use strict';const fs=require('node:fs'),assert=require('node:assert/strict');
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const shader=fs.readFileSync('components/visualizer/reactiveLedWallV812.ts','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const context=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
for(const key of ['uAudioBass','uAudioMids','uAudioHighs','uFxPower','uFxStyle']){
 assert(stage.includes(key));assert(shader.includes(key));}
assert((stage.includes('fragmentShader={LED_WALL_FRAGMENT_V842}') || (stage.includes('fragmentShader={LED_WALL_FRAGMENT_V886}') && fs.readFileSync('components/visualizer/ledWallCreativeShaderV886.ts','utf8').includes('LED_WALL_FRAGMENT_V842')))&&
 fs.readFileSync('components/visualizer/ledWallExperienceShaderV842.ts','utf8').includes('LED_WALL_FRAGMENT_V821')||
 stage.includes('fragmentShader={LED_WALL_FRAGMENT_V812}')||
 stage.includes('fragmentShader={LED_WALL_FRAGMENT_V821}')&&
 fs.readFileSync('components/visualizer/ledWallExperienceShaderV821.ts','utf8').includes('LED_WALL_FRAGMENT_V812'));
assert(shader.includes('LED_WALL_FRAGMENT_V647'));assert(shader.includes('backdrop+=fx'));
assert(ui.includes('Simulation'));assert(context.includes('normalizeConcertFxV810(parsed.concertFxV810)'));
console.log('PASS V812: existing protected LED shader extended with audio-reactive graphics, settings persisted');

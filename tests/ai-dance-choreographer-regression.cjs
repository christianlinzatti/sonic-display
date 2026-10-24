require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require("node:fs"),assert=require("node:assert/strict");
const path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../components/visualizer/aiDanceChoreographer.ts"),"utf8");
const ui=fs.readFileSync(path.join(__dirname,"../components/visualizer/SmartChoreographyEvolutionPanel.tsx"),"utf8");
const runtime=fs.readFileSync(path.join(__dirname,"../components/visualizer/ThreeAvatar.tsx"),"utf8");
const checks=[[/export function composeDanceSequence/,src],[/scoreDanceMotion/,src],[/avatarId!==input.avatarId/,src],[/bpm<m.bpmMin/,src],[/m.section===input.phase/,src],[/m.genre/,src],[/maxSteps/,src],[/previous/,src],[/Math\.min\(6,pool.length\)/,src],[/motionId:selected.m.id/,src],[/totalBars/,src],[/reason:/,src],[/V200 Vorschau generieren/,ui],[/Alle Phasen vorschlagen/,ui],[/Vorschlag übernehmen/,ui],[/setSteps\(phase,previews/,ui],[/value=\{energy\}/,ui],[/value=\{seed\}/,ui],[/selectEvolutionByBeat/,runtime]];
for(const [re,text] of checks)assert.match(text,re);console.log(`V200: ${checks.length} static integration checks passed`);

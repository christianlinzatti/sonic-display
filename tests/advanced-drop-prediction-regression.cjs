require('./helpers/threeAvatarSourcesV492.cjs').install();
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../components/visualizer/advancedDropPredictor.ts'),'utf8');
const stage=fs.readFileSync(path.join(__dirname,'../components/visualizer/ThreeAvatar.tsx'),'utf8');
let n=0;function check(value,msg){assert.ok(value,msg);n++}
for(const symbol of ['createDropPredictionState','advanceDropPrediction','risingSamples','cooldownUntil','dropOnset','phaseSince','playing','buildScore','confidence'])check(source.includes(symbol),symbol);
for(const symbol of ['advanceDropPrediction(prior','setPredictedPhase','predictedPhase, undefined','audio.kickAnticipation','audio.energyEnvelope','audio.bass','audio.attack'])check(stage.includes(symbol),symbol);
check(!stage.includes('audio.kickAccentIntensity && audio.kickAccentIntensity > 0.6 ? "drop" : "verse"'),'old one-frame selection removed');
console.log(`${n} V194 drop-prediction checks passed`);

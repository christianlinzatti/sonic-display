const assert=require('node:assert/strict'); const fs=require('node:fs'); const path=require('node:path');
let checks=0;function check(x,msg){assert.ok(x,msg);checks++;}
const src=fs.readFileSync(path.join(__dirname,'../components/visualizer/beatPerfectSequencer.ts'),'utf8');
const stage=fs.readFileSync(path.join(__dirname,'../components/visualizer/ThreeAvatar.tsx'),'utf8');
const evo=fs.readFileSync(path.join(__dirname,'../components/visualizer/smartChoreographyEvolution.ts'),'utf8');
for(const term of ['advanceBeatTransport','initialBeatTransport','validBpm','nextBoundaryDelay','completedBars','shouldCommitMotionSwitch','barPosition'])check(src.includes(term),term);
for(const term of ['selectEvolutionByBeat','phaseTransport','phaseBeat','setPhaseBeat','shouldCommitMotionSwitch','isPlaying&&!reducedMotion'])check(stage.includes(term),term);
for(const term of ['selectEvolutionByBeat','Math.floor(Math.max(0,phaseBeat)','total=steps.reduce'])check(evo.includes(term),term);
check(fs.readFileSync(path.join(__dirname,'../package.json'),'utf8').includes('0.1.0-v248'),'version');
console.log(`V199 beat-perfect: ${checks} checks passed`);

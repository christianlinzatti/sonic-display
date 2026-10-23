const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');let n=0;
function check(name,cond){assert.ok(cond,name);n++;console.log('PASS',name)}
const dir=path.join(__dirname,'../components/visualizer');
const engine=fs.readFileSync(path.join(dir,'predictiveDanceTransitions.ts'),'utf8');const stage=fs.readFileSync(path.join(dir,'ThreeAvatar.tsx'),'utf8');const panel=fs.readFileSync(path.join(dir,'SmartChoreographyEvolutionPanel.tsx'),'utf8');const ui=fs.readFileSync(path.join(dir,'PredictiveDanceTransitionsPanel.tsx'),'utf8');
for(const x of ['predictDanceCue','mayCommitPredictedCue','sanitizePredictiveDance','readPredictiveDance','writePredictiveDance','minimumDwellBars','leadBeats','boundaryBeat'])check('engine '+x,engine.includes(x));
for(const x of ['predictDanceCue(','mayCommitPredictedCue(','queuedPredictiveCue','libraryClips.some','setStableLibraryClip(clip.name)','PREDICTIVE_DANCE_EVENT','if(!isPlaying||reducedMotion)return'])check('runtime '+x,stage.includes(x));
for(const x of ['PredictiveDanceTransitionsPanel','input type="checkbox"','input type="range"','writePredictiveDance'])check('panel '+x,ui.includes(x));
check('visible settings',panel.includes('<PredictiveDanceTransitionsPanel/>'));check('opt-in off',engine.includes('enabled:false'));check('phase reset',stage.includes('queuedPredictiveCue.current=undefined;lastPredictiveSwitchBeat.current=-Infinity;'));
console.log(n+' V211 regression checks passed');

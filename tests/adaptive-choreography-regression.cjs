const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const learning=read('components/visualizer/adaptiveChoreographyLearning.ts');
const ui=read('components/visualizer/AdaptiveChoreographyTimeline.tsx');
const avatar=read('components/visualizer/ThreeAvatar.tsx');
const panel=read('components/CharacterMotionLibraryPanel.tsx');let n=0;
function check(s,v){assert.ok(v,s);n++}
for(const phrase of ['sanitizeAdaptiveState','loadAdaptiveState','saveAdaptiveState','learnFromObservation','resolveAdaptiveMotion','PHASES','counts.slice(-500)','best.count/total>=0.6','total<3','!state.enabled','confidence<0.55'])check(phrase,learning.includes(phrase));
for(const phrase of ['MUSIC_STRUCTURE_TIMELINE_EVENT','lastPhase=obs.phase','loadAdaptiveState()','saveAdaptiveState(updated)','Motion für ${phase}','settings.assignments[avatarId]','settings.learn','settings.enabled','counts.filter(c=>c.avatarId!==avatarId)'])check(phrase,ui.includes(phrase));
check('panel integrated',panel.includes('<AdaptiveChoreographyTimeline avatarId={avatar} motions={motions}/>'));
check('stage responds to updates',avatar.includes('ADAPTIVE_CHOREOGRAPHY_EVENT'));
check('stage applies learned rule',avatar.includes('adaptiveMotion?.url ?? chooseCharacterMotion'));
check('manual enabled without existing automatic',avatar.includes('!library.automatic && !adaptiveMotion'));
console.log(`${n} V196 adaptive choreography checks passed`);

require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newPresetDirectorStateV493,stepMotionPresetDirectorV493}=load('components/visualizer/intelligentMotionPresetDirectorV493');
const candidates=[
 {actionName:'GlbPresetV492:rapA',presetId:'rapA',baseName:'Crouch',region:'upper',genre:'rap',weight:.24},
 {actionName:'GlbPresetV492:rapB',presetId:'rapB',baseName:'Crouch',region:'arms',genre:'rap',weight:.34},
 {actionName:'GlbPresetV492:rapC',presetId:'rapC',baseName:'Crouch',region:'upper',genre:'rap',weight:.45},
 {actionName:'GlbPresetV492:other',presetId:'other',baseName:'Dance',region:'upper',genre:'rap',weight:.30},
];
const valid={candidates,selectedBase:'Crouch',trackId:'track-123',positionMs:1000,section:'verse',energy:.40,bpm:96,slot:0,
 playing:true,reducedMotion:false,manualPriority:false,quality:'medium'};
const start=newPresetDirectorStateV493();
const first=stepMotionPresetDirectorV493(start,valid);
assert(first.selectedId?.startsWith('GlbPresetV492:rap'));
assert.deepEqual(stepMotionPresetDirectorV493(start,valid),first,'must be deterministic');
assert.equal(stepMotionPresetDirectorV493(first,{...valid,positionMs:3000}).selectedId,first.selectedId);
for(const disable of ['playing','reducedMotion','manualPriority','quality','selectedBase','trackId']){
 const value={...valid,positionMs:2000,[disable]:{playing:false,reducedMotion:true,manualPriority:true,quality:'low',selectedBase:'Missing',trackId:''}[disable]};
 assert.equal(stepMotionPresetDirectorV493(first,value).selectedId,null,`${disable} must block automatic presets`);
}
assert.equal(stepMotionPresetDirectorV493(first,{...valid,candidates:[],positionMs:2000}).selectedId,null);
assert.equal(stepMotionPresetDirectorV493(first,{...valid,candidates:[candidates[3]],positionMs:2000}).selectedId,null);
assert.equal(stepMotionPresetDirectorV493(first,{...valid,candidates:[{...candidates[0],weight:NaN}],positionMs:2000}).selectedId,null);
const songSwitch=stepMotionPresetDirectorV493(first,{...valid,trackId:'another-song',positionMs:0});
assert.equal(songSwitch.trackId,'another-song');assert.equal(songSwitch.lastSwitchMs,0);
const seek=stepMotionPresetDirectorV493({...first,lastPositionMs:120000},valid);
assert.equal(seek.lastSwitchMs,1000,'seek backwards resets cooldown');
let state=newPresetDirectorStateV493(),switches=0,previous=null;
for(let t=0;t<=900000;t+=1000){
 const input={...valid,positionMs:t,section:t%64000<32000?'verse':'drop',energy:t%64000<32000?.3:.95,bpm:164};
 const next=stepMotionPresetDirectorV493(state,input);
 if(previous&&next.selectedId!==previous){switches++;assert(t-state.lastSwitchMs>=10000,'never switch too quickly');}
 previous=next.selectedId;state=next;
}
assert(switches>0,'musical structure should vary eligible presets');
assert(switches<60,'anti-flapping limits transitions over fifteen minutes');
const read=(p)=>fs.readFileSync(p,'utf8');
const source=read('components/visualizer/ThreeAvatar.tsx')+read('components/visualizer/useGltfMotionPresetDirectorV493.ts')+read('components/visualizer/intelligentMotionPresetDirectorV493.ts');
for(const token of ['useGltfMotionPresetDirectorV493','intelligentMotionPresetDirectorV493','presetId:preset.id','region:preset.region',
 'manualPriority:!liveBlendAllowedV492','const activeLiveBlendV492=liveBlendAllowedV492?directorBlendV493:null',
 'const presetWeightsV493=useRef<Map<string,number>>(new Map())','weights.delete(name)','action.stop()',
 'action.setEffectiveWeight(weight)',
 '!name.startsWith(\'GlbPresetV492:\')','useAnimations(playbackClips, root)'])assert(source.includes(token),`missing V493 wiring: ${token}`);
const stage=read('components/visualizer/VisualizerStage.tsx');
assert.match(stage,/detectedSection:rapMotionHookV437\?"hook":directedSection/);
assert.match(read('tests/v273-dance-intelligence-regression.cjs'),/rapMotionHookV437/);
assert(Number(require('../package.json').version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=493);
console.log('V493 Intelligent Motion Preset Director PASS: phase, energy, cooldown, dancer variation, seek, priority and mixer');

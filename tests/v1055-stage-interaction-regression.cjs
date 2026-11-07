'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planStageInteractionV1055:plan,applyStageInteractionV1055:move}=load('lib/arena360StageInteractionV1055');
const durationMs=210000,trackId='spotify:v1055-test-song';
const planData=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
function input(at=93000){return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 trackId,progressMs:at,durationMs,plan:planData,
 show:sampleArenaShowPlanV1040(planData,{enabled:true,playing:true,reducedMotion:false,progressMs:at,durationMs}),
 manualPriority:false,performanceTier:'high',strength:75};}
const cue=plan(input());assert.equal(cue.active,true);assert.equal(cue.reason,'planned');
assert.deepEqual(plan(input()),cue,'reproducible across callers');
assert.deepEqual(plan({...input(),trackId}),cue,'same song same cue');
assert(cue.cameraGain>0&&cue.cameraGain<=1);
assert(cue.crowdGain>0&&cue.crowdGain<=1);
assert(cue.platformGain>0&&cue.platformGain<=1);
assert(Math.hypot(cue.offsetX,cue.offsetZ)<=.31,'never exceed central deck lane');
assert(Math.abs(cue.audienceYaw)<=.11);
const chapterSamples=[8000,30000,82000,107000,140000,170000,201000].map(ms=>plan(input(ms)));
assert(chapterSamples.every(c=>c.active),'all seven chapter cues active');
assert.equal(new Set(chapterSamples.map(c=>c.focus)).size,4,'four alternating production focuses');
assert(new Set(chapterSamples.map(c=>c.zone)).size>=5,'different 360 stage positions');
assert(chapterSamples[4].offsetX===0&&chapterSamples[4].offsetZ===0,'calm interlude recenters');
const another=plan({...input(93000),trackId:'spotify:different-song'});
assert(another.active,'new track allowed');
assert(Math.hypot(another.offsetX-cue.offsetX,another.offsetZ-cue.offsetZ)>1e-4,'song-specific orientation');
const before=plan(input(Math.round(.43*durationMs)-2));
const justAfter=plan(input(Math.round(.43*durationMs)+4));
assert(!justAfter.active||Math.hypot(justAfter.offsetX-before.offsetX,justAfter.offsetZ-before.offsetZ)<.05,
 'chapter transition avoids sudden root snaps');
const lead=[-.92,0,0],partner=[.92,0,0];
const guards={manual:false,footLocked:false,importedAnimation:false,ensembleOwns:false,collisionRisk:false,
 isPlaying:true,reducedMotion:false,performanceTier:'high'};
const moved=move(lead,partner,cue,guards);
assert(moved.active,'procedural duo can use the rotating center deck');
assert.equal(moved.lead[1],lead[1]);assert.equal(moved.partner[1],partner[1],'no floating or foot-height change');
assert(Math.abs(Math.hypot(moved.partner[0]-moved.lead[0],moved.partner[2]-moved.lead[2])-1.84)<1e-7,
 'same translation does not reduce dancer separation');
assert.deepEqual(lead,[-.92,0,0]);assert.deepEqual(partner,[.92,0,0],'no input mutation');
for(const patch of [{manual:true},{footLocked:true},{importedAnimation:true},{ensembleOwns:true},{collisionRisk:true},
 {isPlaying:false},{reducedMotion:true},{performanceTier:'low'}]){
 const result=move(lead,partner,cue,{...guards,...patch});
 assert.equal(result.active,false,JSON.stringify(patch));
 assert.strictEqual(result.lead,lead,'exact legacy reference on guard');
 assert.strictEqual(result.partner,partner);
}
for(const patch of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},{reactive:false},
 {manualPriority:true},{performanceTier:'low'},{trackId:''},{trackId:null},{progressMs:NaN},
 {durationMs:NaN},{durationMs:1000},{progressMs:-5},{progressMs:durationMs+5},
 {strength:0},{show:{...input().show,active:false}},{show:{...input().show,fade:0}},
 {plan:null},{show:{...input().show,segmentIndex:999}}]){
 const out=plan({...input(),...patch});assert.equal(out.active,false,JSON.stringify(patch));
 assert.equal(out.offsetX,0);assert.equal(out.offsetZ,0);assert.equal(out.cameraGain,1);
 assert.equal(out.crowdGain,1);assert.equal(out.platformGain,1);
}
assert.equal(plan({...input(),playing:false}).reason,'paused');
assert.equal(plan({...input(),manualPriority:true}).reason,'manual');
assert.equal(plan({...input(),reducedMotion:true}).reason,'motion');
assert.equal(plan({...input(),performanceTier:'low'}).reason,'performance');
assert.equal(plan({...input(),progressMs:Infinity}).reason,'clock');
const balanced=plan({...input(),performanceTier:'balanced'});
assert(balanced.active&&Math.hypot(balanced.offsetX,balanced.offsetZ)<Math.hypot(cue.offsetX,cue.offsetZ));
assert(!plan({...input(),strength:-10}).active);
assert(Math.hypot(...((x)=>[x.offsetX,x.offsetZ])(plan({...input(),strength:200})))<=.35);
const outside=move([1.94,0,0],[2.05,0,0],cue,guards);
assert(!outside.active,'central-deck radial safety, even with invalid duo spacing');
assert(!move([NaN,0,0],partner,cue,guards).active);
const source=read('lib/arena360StageInteractionV1055.ts');
for(const forbidden of ['fetch(', 'setTimeout(', 'setInterval(', 'Math.random(', 'localStorage', 'document.',
 'navigator.', 'Date.now(', 'WebSocket(', 'new AnimationMixer', 'new Camera'])
 assert(!source.includes(forbidden),'pure, safe director '+forbidden);
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
 'types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaStageInteractionEnabledV1055'),file+' has opt-in');
assert(read('context/UiPreferencesContext.tsx').includes('arenaStageInteractionEnabledV1055:false'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('stageInteractionV1055={arenaChoreoV1041.active?stageInteractionV1055:null}'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('*stageInteractionV1055.cameraGain'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('*stageInteractionV1055.crowdGain'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('*stageInteractionV1055.platformGain'));
const actors=read('components/visualizer/DanceFormationActorsV492.tsx');
assert(actors.includes('applyStageInteractionV1055(leadTarget,partnerTarget,stageInteractionV1055'));
assert(actors.includes('importedAnimation:Boolean(props.avatarModelUrl||props.secondaryAvatarModelUrl'));
assert(actors.includes('footLocked:readFootLockV322().enabled'));
assert(actors.includes('const safe = separatePartners(leadTarget, partnerTarget, 1.35)'));
assert(actors.indexOf('const placementV1055')<actors.indexOf('const safe = separatePartners(leadTarget'));
assert(actors.includes('placementV1055.active ? stageInteractionV1055?.audienceYaw??0 : 0'));
const packageJson=JSON.parse(read('package.json'));
assert(packageJson.scripts.prebuild.includes('npm run test:v1055 && npm run test:v1055:types && npm run test:v1054'));
console.log('PASS V1055 · seven show chapters, shared chapter scores, small safe duo translation, stage/scene/camera/crowd coordination, manual/GLB/footlock/quality guards, no new actors or network');

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(file,requireFn=require){const code=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};new Function('module','exports','require',code)(mod,mod.exports,requireFn);return mod.exports;}
const previous=load('components/visualizer/cinematicDuetCameraV377.ts');
const director=load('components/visualizer/visualPerformanceDirectorV397.ts',id=>id==='./cinematicDuetCameraV377'?previous:require(id));
const {initialVisualDirectorV397:init,advanceVisualDirectorV397:advance,timedLineV397:line,composeVisualPerformanceV397:compose}=director;
const lyrics={synced:true,lines:[{startMs:1000,endMs:2100,text:'Rap, wir sind da'},{startMs:2100,endMs:3800,text:'Nächster Part'},{startMs:4100,endMs:5600,text:'Hook!'}]};
const base={trackId:'t1',progressMs:1200,playing:true,reducedMotion:false,mode:'cinematic',strength:90,count:2,section:'verse',lyrics,lyricsEnabled:true,performanceTier:'high'};
const step=(s,p={})=>advance(s,{...base,...p});
assert.equal(line(lyrics,1100),0);assert.equal(line(lyrics,2900),1);assert.equal(line(lyrics,3801),-1);assert.equal(line(lyrics,4100),2);
assert.equal(line({...lyrics,synced:false},1300),-1);assert.equal(line(null,1400),-1);assert.equal(line(lyrics,-1),-1);
const st=init();let shot=step(st);assert.equal(shot.shot,'lead');assert.equal(shot.leadSlot,0);assert.equal(shot.source,'timed-lyrics');
assert.equal(step(st,{progressMs:2500,section:'hook'}).shot,'lead','unconfirmed hook cannot cut');
assert.equal(step(st,{progressMs:2900,section:'hook'}).shot,'group');
assert.equal(step(st,{progressMs:3100,section:'verse'}).shot,'group','brief section classifier bounce ignored');
assert.equal(step(st,{progressMs:3300,section:'verse'}).shot,'group','group hold lasts at least 550 ms');
let after=step(st,{progressMs:3900,section:'verse'});assert.equal(after.active,false,'stale lyric line must not drive lead shot');
const manual={active:true,count:2,lineIndex:0,leadSlot:1,handoffFrom:0};
shot=step(init(),{manual});assert.equal(shot.shot,'two-shot');assert.equal(shot.leadSlot,1);assert.equal(shot.partnerSlot,0);assert.equal(shot.source,'manual-stage-cast');
const duet={enabled:true,count:2,lineIndex:0,leadSlot:1,fromSlot:0};shot=step(init(),{duet});assert.equal(shot.shot,'two-shot');assert.equal(shot.source,'timed-lyrics');
shot=step(init(),{manual:{...manual,lineIndex:1}});assert.equal(shot.leadSlot,0,'out of range manual cast ignored');
let neutral=step(init(),{count:1,section:'drop',lyricsEnabled:false});assert.equal(neutral.active,false,'no group for solo');
shot=step(init(),{count:4,section:'drop',lyricsEnabled:false});assert.equal(shot.shot,'group');assert.equal(shot.source,'section');
for(const p of [{playing:false},{reducedMotion:true},{mode:'off'},{strength:0},{strength:NaN},{trackId:''},
 {progressMs:-1},{progressMs:NaN},{manualCamera:true},{authoredStage:true},{existingCamera:true}]){
 const x=step(init(),p);assert.equal(x.active,false,JSON.stringify(p));assert.equal(x.shot,'none');
}
const sync=init();step(sync,{progressMs:1600,manual});step(sync,{progressMs:2400,manual:{...manual,handoffFrom:null}});
assert.equal(step(sync,{trackId:'new',progressMs:1200}).leadSlot,0,'track reset');
assert.equal(step(sync,{trackId:'new',progressMs:1000,lyricsEnabled:false}).active,false,'seek must reset');
for(const perf of ['low','balanced','high']){
 const x=step(init(),{performanceTier:perf});assert.ok(x.strength>0&&x.strength<=.9);
}
// Regression: camera studio hold duration must accept exactly 3 clamp arguments,
// clamp valid inputs, and use 1150ms for non-finite values.
for(const [holdMs,expected] of [[900,900],[1,450],[9999,2400],[NaN,1150],[Infinity,1150]]){
 const fresh=init();const result=step(fresh,{studioV398:{enabled:true,holdMs}});
 assert.equal(result.shot,'lead');
 assert.equal(fresh.heldUntilMs,1200+expected,`holdMs=${holdMs}`);
}
const pose={x:0,y:.1,z:6,targetX:0,targetY:0,targetZ:0,fov:38};
const anchored=[{slot:0,x:-.5,y:0,z:0,visible:true},{slot:1,x:.5,y:0,z:0,visible:true}];
const group=step(init(),{count:2,section:'hook',progressMs:1200,lyricsEnabled:false});
assert.notDeepEqual(compose(pose,group,anchored,false,null),pose);
assert.deepEqual(compose(pose,group,anchored.slice(0,1),false,null),pose,'missing group anchor refuses phantom group shot');
const lead=step(init());assert.notDeepEqual(compose(pose,lead,anchored,false,1.4),pose);
assert.deepEqual(compose(pose,lead,anchored.slice(1),false,1.4),pose,'missing singer anchor refuses phantom solo');
const protectedPose=compose(pose,lead,anchored,true,1.4);assert.ok(Math.abs(protectedPose.fov-pose.fov)<Math.abs(compose(pose,lead,anchored,false,1.4).fov-pose.fov));
for(const [file,needles] of Object.entries({
 'types/music.ts':['avatarVisualDirectorModeV397','avatarVisualDirectorStrengthV397'],
 'context/UiPreferencesContext.tsx':['avatarVisualDirectorModeV397:"off"'],
 'components/visualizer/registry.tsx':['visualDirectorModeV397'],
 'components/visualizer/VisualizerStage.tsx':['visualDirectorModeV397:preferences.avatarVisualDirectorModeV397','visualDirectorTierV397:getActivePerformanceTier()'],
 'components/visualizer/ThreeAvatar.tsx':['props.lipSync?.visualDirectorModeV397'],
 'components/visualizer/StageCameraDirectorV289.tsx':['advanceVisualDirectorV397','composeVisualPerformanceV397','existingCamera:shotV377.active'],
 'components/SettingsPanel.tsx':['v397-visual-performance-director-settings','avatarVisualDirectorStrengthV397'],
 'V397-VISUAL-PERFORMANCE-DIRECTOR.md':['V397']
 }))for(const part of needles)assert.ok(read(file).includes(part),file+': '+part);
const pkg=JSON.parse(read('package.json'));assert.ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=398);assert.ok(pkg.scripts['verify:offline'].includes('test:v397'));
console.log('PASS V397 – timed lyric close-ups, duet handoffs, chorus group, visible anchors, protected manual framing, seeks, budgets');

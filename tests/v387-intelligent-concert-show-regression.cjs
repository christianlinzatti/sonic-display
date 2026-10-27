require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve('.');
function load(name){const p=path.resolve(root,name);const source=fs.readFileSync(p,'utf8');
 const t=ts.transpileModule(source,{fileName:p,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(t.diagnostics?.filter(x=>x.category===ts.DiagnosticCategory.Error).length??0,0);
 const m=new Module(p);m.filename=p;m.paths=Module._nodeModulePaths(path.dirname(p));m._compile(t.outputText,p);return m.exports;
}
const {advanceConcertShowV387,initialConcertShowV387,composeConcertShowCameraV387}=load('components/visualizer/concertShowDirectorV387.ts');
const base={trackId:'demo',progressMs:1000,playing:true,reducedMotion:false,mode:'festival',strength:90,section:'verse',energy:.9,beat:.7,genre:'hardtekk'};
const first=advanceConcertShowV387(initialConcertShowV387(),base);
assert.equal(first.cue.active,true);assert.equal(first.cue.intensity,0,'smooth entry, no instantaneous flash');
const verse=advanceConcertShowV387(first,{...base,progressMs:2300});
assert.equal(verse.cue.moment,'verse');assert.ok(verse.cue.intensity>.1);
const buildState=advanceConcertShowV387(verse,{...base,section:'build',progressMs:3000});
assert.equal(buildState.moment,'build');
const build=advanceConcertShowV387(buildState,{...base,section:'build',progressMs:3900});
assert.ok(build.cue.beamGain>1&&build.cue.hazeGain>1&&build.cue.sweepGain>1);
const dropStart=advanceConcertShowV387(build,{...base,section:'drop',progressMs:4700});
const drop=advanceConcertShowV387(dropStart,{...base,section:'drop',progressMs:5400});
assert.equal(drop.cue.moment,'drop');assert.ok(drop.cue.intensity>verse.cue.intensity);
assert.ok(drop.cue.dropPulse>0,'actual beat accent during a documented drop');
const fakeDrop=advanceConcertShowV387(verse,{...base,section:'verse',progressMs:2600,beat:1});
assert.equal(fakeDrop.cue.moment,'verse','kick alone must not claim a drop');
for(const strength of [0,25,65,100,500]){
 const st=advanceConcertShowV387(initialConcertShowV387(),{...base,strength,progressMs:900});
 const v=advanceConcertShowV387(st,{...base,strength,progressMs:2200}).cue;
 for(const k of ['intensity','lightGain','beamGain','hazeGain','sweepGain','danceGain','cameraPull','dropPulse'])assert.ok(Number.isFinite(v[k]),k);
 assert.ok(v.lightGain>=.88&&v.lightGain<=1.25);assert.ok(v.beamGain<=1.35);assert.ok(v.hazeGain<=1.28);
 assert.ok(v.danceGain>=.9&&v.danceGain<=1.13);assert.ok(v.cameraPull>=-.04&&v.cameraPull<=.16);
}
for(const overrides of [{mode:'off'},{playing:false},{reducedMotion:true},{strength:0},{manualPriority:true},{trackId:''}]){
 const cue=advanceConcertShowV387(verse,{...base,progressMs:2900,...overrides}).cue;
 assert.equal(cue.active,false,JSON.stringify(overrides));assert.equal(cue.lightGain,1);
}
const paused=advanceConcertShowV387(drop,{...base,playing:false,progressMs:5400});assert.equal(paused.cue.active,false);
const seek=advanceConcertShowV387(drop,{...base,progressMs:700,section:'break'});
assert.equal(seek.moment,'break');assert.equal(seek.cue.intensity,0);
const nextTrack=advanceConcertShowV387(drop,{...base,trackId:'different',progressMs:5700,section:'verse'});
assert.equal(nextTrack.cue.intensity,0);
const pose={x:0,y:1,z:5,fov:39,targetY:1};
assert.deepEqual(composeConcertShowCameraV387(pose,drop.cue,{automatic:false}),pose);
assert.deepEqual(composeConcertShowCameraV387(pose,drop.cue,{automatic:true,authored:true}),pose);
assert.deepEqual(composeConcertShowCameraV387(pose,drop.cue,{automatic:true,lyricsProtected:true}),pose);
const camera=composeConcertShowCameraV387(pose,drop.cue,{automatic:true});assert.ok(camera.z>pose.z);assert.ok(camera.fov>pose.fov);
assert.deepEqual(pose,{x:0,y:1,z:5,fov:39,targetY:1},'do not mutate camera preset');
const checks={
 'types/music.ts':['avatarShowModeV387','avatarShowLightingV387'],
 'context/UiPreferencesContext.tsx':['avatarShowModeV387:"off"'],
 'components/visualizer/VisualizerStage.tsx':['advanceConcertShowV387','concertShowCueV387={concertShowCueV387}'],
 'components/visualizer/ThreeAvatar.tsx':['concertGainV387','concertShowCueV387={props.concertShowCueV387}'],
 'components/visualizer/DynamicStage.tsx':['festivalLightV387','authoredLightsV386','concertShowAtmosphereV387'],
 'components/visualizer/ConcertAtmosphereRendererV308.tsx':['beamGainV387','hazeGainV387','authoredLightingV387'],
 'components/visualizer/StageCameraDirectorV289.tsx':['composeConcertShowCameraV387','lyricsProtected:'],
 'components/SettingsPanel.tsx':['v387-concert-show-settings','Festiva' ],
 'components/visualizer/registry.tsx':['concertShowCueV387'],
 'package.json':['test:v387'],
};
for(const [p,tokens] of Object.entries(checks))for(const token of tokens)assert.ok(fs.readFileSync(p,'utf8').includes(token),`${p}: ${token}`);
assert(Number(require('../package.json').version.match(/-v(\d+)$/)?.[1]||0)>=387);
console.log('PASS V387 sections, envelopes, real beat, safety limits, manual priorities, wiring');

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('components/visualizer/festivalShowDirectorV394.ts');
const code=ts.transpileModule(src,{fileName:'festivalShowDirectorV394.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};new Function('module','exports','require',code)(mod,mod.exports,require);
const {initialFestivalShowV394:init,advanceFestivalShowV394:advance,composeFestivalCameraV394:camera,combineFestivalGainsV394:mix}=mod.exports;
const base={trackId:'one',progressMs:0,playing:true,reducedMotion:false,mode:'festival',strength:95,section:'verse',genre:'hardtekk',energy:.9,beat:.9,performanceTier:'high'};
const step=(state,patch)=>advance(state,{...base,...patch});
let a=step(init(),{});assert.equal(a.cue.active,true);assert.equal(a.cue.gain,0);
a=step(a,{progressMs:900});assert.ok(a.cue.gain>0);assert.equal(a.cue.section,'verse');
let rapid=step(a,{progressMs:1050,section:'drop'});assert.equal(rapid.section,'verse','brief wrong section must not switch');
rapid=step(rapid,{progressMs:1180,section:'verse'});assert.equal(rapid.section,'verse');
let building=step(a,{progressMs:1400,section:'build'});assert.equal(building.section,'verse');
building=step(building,{progressMs:1710,section:'build'});assert.equal(building.section,'build');
const build=step(building,{progressMs:2700,section:'build'});
assert.ok(build.cue.hazeGain>1&&build.cue.sweepGain>1);assert.ok(build.cue.laserGain>0);
let drop=step(build,{progressMs:3000,section:'drop'});drop=step(drop,{progressMs:3300,section:'drop'});
assert.equal(drop.section,'drop');let full=step(drop,{progressMs:3760,section:'drop'});
assert.ok(full.cue.gain>build.cue.gain);assert.ok(full.cue.cameraZoom>0);assert.ok(full.cue.beamGain>build.cue.beamGain);
assert.ok(drop.cue.dropAccent>0,'only verified drop produces temporary accent');
const falseKick=step(a,{progressMs:1200,section:'verse',beat:1});assert.equal(falseKick.cue.dropAccent,0);
for(const patch of [{mode:'off'},{playing:false},{reducedMotion:true},{strength:0},{trackId:''}]){
 const result=step(a,{progressMs:1300,...patch});assert.equal(result.cue.active,false,JSON.stringify(patch));
 assert.equal(result.cue.beamGain,1);assert.equal(result.cue.laserGain,0);
}
const low=step(step(init(),{performanceTier:'low'}),{performanceTier:'low',progressMs:1300});
assert.equal(low.cue.laserGain,0,'never laser on low tier');assert.ok(low.cue.gain<a.cue.gain+0.4);
const balanced=step(step(init(),{performanceTier:'balanced',section:'drop'}),{performanceTier:'balanced',section:'drop',progressMs:1300});
assert.equal(balanced.cue.laserGain,0);
const singer=step(step(init(),{genre:'Deutschrap',section:'verse'}),{genre:'Deutschrap',section:'verse',progressMs:1300});
assert.ok(singer.cue.cameraZoom<0,'verse frames singer');assert.equal(singer.cue.laserGain,0);
const seek=step(full,{progressMs:300,section:'break'});assert.equal(seek.section,'break');assert.equal(seek.cue.gain,0);
const switched=step(full,{trackId:'other',progressMs:4000,section:'hook'});assert.equal(switched.section,'hook');assert.equal(switched.cue.gain,0);
for(const strength of [1,50,100,1000,Infinity,NaN]){
 const v=step(step(init(),{strength,section:'drop'}),{strength,section:'drop',progressMs:1400}).cue;
 for(const key of ['gain','lightGain','beamGain','hazeGain','sweepGain','laserGain','cameraZoom','cameraOrbit','dropAccent'])assert.ok(Number.isFinite(v[key]),key);
 assert.ok(v.lightGain<=1.30&&v.beamGain<=1.42&&v.hazeGain<=1.35&&v.sweepGain<=1.40&&v.laserGain<=.65);
}
const pose={x:0,z:5,fov:40,custom:'unchanged'};
assert.deepEqual(camera(pose,full.cue,{automatic:false}),pose);
assert.deepEqual(camera(pose,full.cue,{automatic:true,authored:true}),pose);
assert.deepEqual(camera(pose,full.cue,{automatic:true,lyricsProtected:true}),pose);
assert.deepEqual(camera(pose,full.cue,{automatic:true,enabled:false}),pose);
const framed=camera(pose,full.cue,{automatic:true});assert.ok(framed.z>pose.z);assert.ok(framed.fov>pose.fov);assert.equal(pose.z,5);
const baseGain={lightGain:1.23,beamGain:1.3,hazeGain:1.23,sweepGain:1.3};
for(const options of [{enabled:false},{authored:true},{blackout:true}])assert.deepEqual(mix(baseGain,full.cue,options),baseGain);
const combined=mix(baseGain,full.cue);assert.ok(combined.beamGain>=baseGain.beamGain);assert.ok(combined.beamGain<=1.48);
for(const [p,words] of Object.entries({
 'types/music.ts':['avatarFestivalModeV394'],
 'context/UiPreferencesContext.tsx':['avatarFestivalModeV394:"off"','avatarFestivalLasersV394:false'],
 'components/visualizer/VisualizerStage.tsx':['advanceFestivalShowV394','festivalShowCueV394={festivalShowCueV394}'],
 'components/visualizer/registry.tsx':['festivalShowCueV394'],
 'components/visualizer/ThreeAvatar.tsx':['festivalShowCueV394={props.festivalShowCueV394}','festivalShowLasersV394={props.festivalShowLasersV394}'],
 'components/visualizer/StageCameraDirectorV289.tsx':['composeFestivalCameraV394','lyricsProtected:!!composition?.protectLyrics'],
 'components/visualizer/DynamicStage.tsx':['combineFestivalGainsV394','festivalShowLightingV394','authoredLightsV386'],
 'components/visualizer/ConcertAtmosphereRendererV308.tsx':['laserVisible','tier==="high"','timelineGainRef.current>.001','!authoredLightingV387'],
 'components/SettingsPanel.tsx':['v394-festival-show-settings','Festival-Regie']
}))for(const word of words)assert.ok(read(p).includes(word),p+':'+word);
const pkg=JSON.parse(read('package.json'));assert.ok(Number(pkg.version.match(/v(\d+)$/)?.[1])>=394);assert.ok(pkg.scripts['verify:offline'].includes('test:v394'));
console.log('PASS V394 – timed festival sections, drop safety, device budget, authored priority, camera/atmosphere integration');

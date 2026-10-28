require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const cache=new Map();
function load(file){
 const full=path.resolve(root,file);
 if(cache.has(full))return cache.get(full).exports;
 const source=fs.readFileSync(full,'utf8');
 const js=ts.transpileModule(source,{fileName:full,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m=new Module(full,module);m.filename=full;m.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,m);
 const original=m.require.bind(m);
 m.require=(name)=>name.startsWith('./')?load(path.join(path.relative(root,path.dirname(full)),`${name}.ts`)):original(name);
 m._compile(js,full);return m.exports;
}
const {resolveCoordinatedVocalV372:direct}=load('components/visualizer/vocalPerformanceDirectorV372.ts');
const {resolveVocalPerformanceV368:legacy}=load('components/visualizer/vocalPerformanceV368.ts');
const {resolveFacialPoseV369:legacyFace}=load('components/visualizer/facialPerformanceV369.ts');
const {resolveVocalStageCueV371:legacyBody,NEUTRAL_VOCAL_STAGE_V371}=load('components/visualizer/vocalStageExpressionV371.ts');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:3600,text:'Bam superklasse Wahnsinn!',words:[
  {text:'Bam',startMs:1000,endMs:1400},
  {text:'superklasse',startMs:1470,endMs:2090},
  {text:'Wahnsinn!',startMs:2160,endMs:3510}]},
 {startMs:3850,endMs:4600,text:'♪'},
 {startMs:4700,endMs:5500,text:'Lange Zeile ohne Wortmarken'},
 {startMs:6000,endMs:7000,text:'[instrumental]'},
]};
const opts={genre:'Deutschrap',style:'auto',expression:.7,lipStrength:90,bodyStrength:65,avatarSlot:0};
const sample=(ms,extra={},playing=true)=>direct(lyrics,ms,playing,{...opts,...extra});
const on=sample(1600);
assert.equal(on.confidence,'word');assert.equal(on.vocal.style,'rap');
assert.equal(on.vocal.activeWord,'superklasse');assert.equal(on.body.mode,'rap');
assert.equal(on.songTimeMs,1600);assert.equal(on.effectiveTimeMs,1600);
assert.ok(on.face.jaw>0 && Math.abs(on.body.headPitch)>0 && on.focus>0);
assert.deepEqual(sample(1600),on,'frame-independent, deterministic same player clock');
assert.equal(sample(1600,{avatarSlot:1}).face.jaw,on.face.jaw,'same vocal art for all avatars');
assert.notEqual(sample(1600,{avatarSlot:1}).body.headYaw,on.body.headYaw,'alternate stage directions by slot');
const legacyCue=legacy(lyrics,1600,true,{...opts});
assert.equal(sample(1600,{enabled:false}).face.jaw,legacyFace(legacyCue,{strength:90,jawFollow:65}).jaw,'disabled V372 maintains original facial output');
const baselineBody=legacyBody(lyrics,1600,true,{genre:'Deutschrap',strength:65});
assert.deepEqual(sample(1600,{enabled:false}).body,baselineBody,'legacy gesture path is preserved');
assert.ok(Math.abs(on.body.headPitch)>Math.abs(sample(1600,{alignment:0}).body.headPitch)*.9);
const shifted=sample(1560,{timingOffsetMs:40});
const unshifted=sample(1600);
assert.equal(shifted.effectiveTimeMs,1600);
assert.deepEqual(shifted.vocal,unshifted.vocal,'time offset shifts lips');
assert.deepEqual(shifted.body,unshifted.body,'time offset shifts gestures together');
assert.equal(sample(1560,{enabled:false,timingOffsetMs:40}).effectiveTimeMs,1560,'legacy mode ignores time offset');
assert.equal(sample(1500,{timingOffsetMs:Infinity}).effectiveTimeMs,1500,'invalid numeric values do not shift the clock');
assert.equal(sample(1500,{timingOffsetMs:-500}).effectiveTimeMs,1300,'explicit offset clamped');
assert.equal(sample(1500,{timingOffsetMs:500}).effectiveTimeMs,1700);
for(const t of [250,1440,3900,6300,7400]){
 const c=sample(t);
 assert.equal(c.face.jaw,0,`silence at ${t}`);
 assert.deepEqual(c.body,NEUTRAL_VOCAL_STAGE_V371,`no invented gestures at ${t}`);
 assert.equal(c.focus,0);
}
for (const c of [sample(1670,{},false),sample(1670,{reducedMotion:true}),sample(1670,{lipStrength:0})]){
 assert.equal(c.face.jaw,0);assert.equal(c.body.emphasis,0);
}
const line=sample(4990);
assert.equal(line.confidence,'line');assert.equal(line.focus,0);
assert.equal(line.body.leftArm,0);assert.equal(line.body.rightArm,0);
const singing=sample(1600,{style:'singing'});
assert.equal(singing.vocal.style,'singing');assert.equal(singing.body.mode,'singing');
assert.ok(Math.abs(singing.body.leftArm)<Math.abs(on.body.leftArm));
const partner=sample(1600,{partnerAttention:1,authoredPriority:true});
assert.ok(Math.abs(partner.body.headPitch)<Math.abs(on.body.headPitch));
const noGesture=sample(1600,{gestures:false,eyeContact:false});
assert.equal(noGesture.body.leftArm,0);assert.equal(noGesture.body.eyeYaw,0);
for(const f of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx'])
 assert.match(fs.readFileSync(path.join(root,f),'utf8'),/resolveVocalPerformanceQualityV374/,'coordinator wired: '+f);
const stage=fs.readFileSync(path.join(root,'components/visualizer/VisualizerStage.tsx'),'utf8');
assert.match(stage,/coordinationOffsetMsV372:preferences\.avatarVocalCoordinationOffsetMsV372/);
const settings=fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
assert.match(settings,/V372 · Unified Vocal Performance Director/);
assert.match(fs.readFileSync(path.join(root,'context/UiPreferencesContext.tsx'),'utf8'),/avatarVocalCoordinationEnabledV372:true/);
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(372);
console.log('PASS V372: shared vocal clock, focus, rap/singing, shift, multi-avatar, legacy, reduced motion, pause, lyric gaps, IK/partner priority, settings and stage');

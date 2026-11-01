'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{
 fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},
}).outputText,f);
const root=path.resolve(__dirname,'..');
const {sampleSmartCameraChoreographyV792:sample,composeSmartCameraChoreographyV792:compose}=
 require('../components/visualizer/smartCameraChoreographyV792.ts');
const intents=['portrait','dialogue','ensemble','wide','rise','pulse','breath'];
const scenes=intents.map((intent,i)=>({index:i,actIndex:i,startMs:i*12000,
 endMs:(i+1)*12000,intent,section:i===0?'verse':'hook',moment:i===5?'payoff':i===6?'breath':'focus',
 role:'foundation',emphasis:0,variation:i%2===0?1:.82}));
const plan={source:'verified-storyboard',trackId:'camera-verified',durationMs:84000,scenes,peakAct:5};
function input(i,positionMs=i*12000+6000,extra={}){
 return {trackId:plan.trackId,durationMs:plan.durationMs,positionMs,
 playing:true,enabled:true,reducedMotion:false,tier:'high',lyricsProtected:false,manualCamera:false,
 show:{active:true,reason:'verified-show',sceneIndex:i,actIndex:scenes[i].actIndex,
 intent:scenes[i].intent,moment:scenes[i].moment,blend:1,emphasis:0,dynamics:{}},...extra};
}
const shotMoves=['dolly-in','arc-right','crane','dolly-out','crane','arc-left','dolly-out'];
for(let i=0;i<scenes.length;i++){
 const middle=sample(plan,input(i));
 assert(middle.active,`camera movement ${i} active`);
 assert.equal(middle.move,shotMoves[i]);
 assert.equal(middle.reason,'verified-scene');
 assert.equal(middle.sceneIndex,i);
 assert.deepEqual(sample(plan,input(i)),middle,'deterministic');
 assert.equal(sample(plan,input(i,i*12000)).weight,0,'exact zero on scene entrance');
 assert(!sample(plan,input(i,i*12000)).active);
 assert(sample(plan,input(i,(i+1)*12000-1)).weight<.001,'fade out on scene exit');
}
const peak=sample(plan,input(5));
const breath=sample(plan,input(6));
assert(peak.weight>breath.weight,'payoff visibly stronger than a break');
assert(sample(plan,input(0,6000,{tier:'balanced'})).weight<sample(plan,input(0)).weight);
assert(sample(plan,input(0,6000,{lyricsProtected:true})).weight<sample(plan,input(0)).weight);
for(const changes of [
 {trackId:'different'},{durationMs:83999},{playing:false},{enabled:false},
 {reducedMotion:true},{tier:'low'},{manualCamera:true},{positionMs:NaN},
 {positionMs:-1},{positionMs:Infinity},{positionMs:84000},
 {show:{...input(1).show,active:false}},
 {show:{...input(1).show,sceneIndex:0}},
 {show:{...input(1).show,actIndex:5}},
 {show:{...input(1).show,moment:'breath'}},
 {show:{...input(1).show,intent:'wide'}},
 {show:{...input(1).show,blend:NaN}},
 ])assert(!sample(plan,input(1,18000,changes)).active,'must fail closed: '+Object.keys(changes)[0]);
assert(!sample({...plan,source:'unavailable'},input(1)).active);
assert(!sample({...plan,scenes:scenes.map((s,i)=>i===1?{...s,endMs:s.startMs+2000}:s)},input(1)).active);
const pose={x:0,y:1.4,z:7.6,targetX:0,targetY:1.1,targetZ:0,fov:46};
const anchors=[{slot:0,x:0,y:0,z:0,visible:true}];
const options={aspect:1.7,lyricsProtected:false,lyricsSide:null,leadSlot:0};
const {measureConcertFrameV550:measure}=require('../components/visualizer/cinematicConcertCameraV550.ts');
const {measureScreenFrameV540:screen}=require('../components/visualizer/cinematicCameraCompositionV540.ts');
let changed=0;
for(let i=0;i<scenes.length;i++){
 const cue=sample(plan,input(i));
 const next=compose(pose,cue,anchors,options);
 assert(next.fov>=28&&next.fov<=76);
 const before=measure(pose,anchors,options.aspect,null,false),after=measure(next,anchors,options.aspect,null,false);
 assert(before&&after);
 assert(after.overflow<=before.overflow+1e-6);
 assert(after.headOverflow<=before.headOverflow+1e-6);
 assert(after.fullBodyOverflow<=before.fullBodyOverflow+1e-6);
 assert(screen(next,anchors,options.aspect).overflow<=screen(pose,anchors,options.aspect).overflow+1e-6);
 if(JSON.stringify(next)!==JSON.stringify(pose))changed++;
}
assert(changed>0,'V792 composes actual camera movement instead of just metadata');
for(const bad of [[],[{...anchors[0],visible:false}],[anchors[0],anchors[0]],
 [{...anchors[0],x:Infinity}],Array.from({length:5},(_,slot)=>({...anchors[0],slot}))]){
 assert.equal(compose(pose,sample(plan,input(0)),bad,options),pose,'invalid anchors unchanged');
}
assert.equal(compose(pose,{...peak,weight:Infinity},anchors,options),pose);
assert.equal(compose(pose,{...peak,phase:NaN},anchors,options),pose);
assert.equal(compose({...pose,x:NaN},peak,anchors,options).x!==pose.x,true,'invalid pose unchanged');
assert.equal(compose(pose,peak,anchors,{...options,aspect:0}),pose);
// A fake side-lyric constraint is never allowed to introduce clipping.
const lyricCue=sample(plan,input(1,18000,{lyricsProtected:true}));
const lyricPose=compose(pose,lyricCue,anchors,{...options,lyricsProtected:true,lyricsSide:'left'});
const originalLyric=measure(pose,anchors,1.7,'left',true),finalLyric=measure(lyricPose,anchors,1.7,'left',true);
assert(finalLyric.overflow<=originalLyric.overflow+1e-6);
const requires={
 'components/visualizer/VisualizerStage.tsx':['sampleSmartCameraChoreographyV792','smartCameraChoreographyV792={smartCameraV792}','data-v792-move'],
 'components/visualizer/registry.tsx':['smartCameraChoreographyV792?:'],
 'components/visualizer/ThreeAvatar.tsx':['choreographyV792={props.smartCameraChoreographyV792}'],
 'components/visualizer/StageCameraDirectorV289.tsx':['composeSmartCameraChoreographyV792','const framedV792=','guardAutomaticCameraV351(framedV809','!studioProfileV398.enabled','!lipSync?.rapCameraOverridesV430?.length'],
};
for(const [file,words] of Object.entries(requires)){
 const content=fs.readFileSync(path.join(root,file),'utf8');
 for(const word of words)assert(content.includes(word),`${file} missing ${word}`);
}
const pkg=require('../package.json');assert(['0.1.0-v792','0.1.0-v793','0.1.0-v794','0.1.0-v795','0.1.0-v796','0.1.0-v797','0.1.0-v798','0.1.0-v799','0.1.0-v800','0.1.0-v801','0.1.0-v802','0.1.0-v803','0.1.0-v804','0.1.0-v805','0.1.0-v806','0.1.0-v808','0.1.0-v809','0.1.0-v807'].includes(pkg.version));
for(const k of ['build:preflight','check:fast','check:release'])
 assert(pkg.scripts[k].includes('npm run test:v792 && npm run test:v792:types && npm run test:v791'),k);
console.log('PASS V792: deterministic verified shots, motion curves and fades, manual/lyrics/tier safeguards, real measured frame protection and wiring');

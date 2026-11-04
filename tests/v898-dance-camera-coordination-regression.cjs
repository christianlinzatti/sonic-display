'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/danceCameraCoordinationV898');
const dir=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let checks=0;
function check(label,fn){try{fn();checks++}catch(e){e.message=`V898 ${label}: ${e.message}`;throw e;}}
const source={trackId:'dance-stage-test',durationMs:180000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:20000,section:'intro',intent:'opening'},
 {index:1,startMs:20000,endMs:52000,section:'verse',intent:'performer'},
 {index:2,startMs:52000,endMs:65000,section:'build',intent:'rise'},
 {index:3,startMs:65000,endMs:87000,section:'drop',intent:'impact'},
 {index:4,startMs:87000,endMs:119000,section:'hook',intent:'group'},
 {index:5,startMs:119000,endMs:151000,section:'verse',intent:'performer'},
 {index:6,startMs:151000,endMs:171000,section:'finale',intent:'ending'},
 {index:7,startMs:171000,endMs:180000,section:'outro',intent:'end'},
]};
const plan=dir.buildDirectorPlanV895(source);
const pose={x:.1,y:1.45,z:7.8,targetX:0,targetY:1.1,targetZ:0,fov:52};
const anchors=[{slot:0,x:-.65,y:0,z:0,visible:true},{slot:1,x:0,y:0,z:0,visible:true},{slot:2,x:.65,y:0,z:0,visible:true}];
const settings={...v.DEFAULT_DANCE_CAMERA_V898};
const input=(patch={})=>({pose,plan,settings,trackId:plan.trackId,durationMs:plan.durationMs,
 positionMs:101000,playing:true,autoEnabled:true,directorEnabled:true,cameraEnabled:true,danceEnabled:true,
 reducedMotion:false,tier:'high',aspect:16/9,anchors,anchorAgeMs:20,motion:.22,...patch});
const sample=(p={})=>v.sampleDanceCameraV898(input(p));
check('valid verified full-song plan',()=>{assert.equal(plan.scenes.length,8);assert.equal(plan.source,'verified-v604');});
check('default normalized stable',()=>assert.deepEqual(v.normalizeDanceCameraV898(null),settings));
for(const x of [null,undefined,[],false,0,-1,{},'',NaN,Infinity,new Date()])
 check('bad settings '+String(x),()=>assert.deepEqual(v.normalizeDanceCameraV898(x),settings));
for(const style of ['subtle','cinematic','dynamic'])
 check('allowed style '+style,()=>assert.equal(v.normalizeDanceCameraV898({style}).style,style));
for(const style of [null,'','glitch',5,{},false])
 check('bad style '+String(style),()=>assert.equal(v.normalizeDanceCameraV898({style}).style,'cinematic'));
for(const mode of ['auto','solo','duet','ensemble'])
 check('allowed mode '+mode,()=>assert.equal(v.normalizeDanceCameraV898({mode}).mode,mode));
for(const mode of [null,'','group','vocal',5,{},false])
 check('bad mode '+String(mode),()=>assert.equal(v.normalizeDanceCameraV898({mode}).mode,'auto'));
for(const val of [-500,-1,0,1.7,15.9,60.3,99.9,100,500])
 check('clamped intensity '+val,()=>assert.equal(v.normalizeDanceCameraV898({intensity:val}).intensity,Math.round(Math.max(0,Math.min(100,val)))));
for(const val of [NaN,Infinity,-Infinity,null,'77'])
 check('invalid intensity '+String(val),()=>assert.equal(v.normalizeDanceCameraV898({intensity:val}).intensity,50));
for(const k of ['enabled','solo','duet','ensemble','motionFollow','protectLyrics','protectDuets'])
 check('independent flag '+k,()=>{assert.equal(v.normalizeDanceCameraV898({[k]:false})[k],false);assert.equal(v.normalizeDanceCameraV898({[k]:'false'})[k],true);});
check('3 verified visible performers choose ensemble in hook',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors,settings,null,null),'ensemble'));
check('1 visible performer allows solo',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[1],[anchors[0]],settings,null,null),'solo'));
check('2 visible performers allow two-shot',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors.slice(0,2),settings,null,null),'duet'));
check('solo with 3 requires explicit V528 singing-slot evidence',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[1],anchors,settings,null,null),'ensemble'));
check('verified lead in 3 allows solo verse',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[1],anchors,settings,0,[0]),'solo'));
check('unknown lead never enough',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[1],anchors,settings,2,[0]),'ensemble'));
check('forced mode cannot fabricate solo',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors,{...settings,mode:'solo'},null,null),null));
check('forced mode cannot fabricate 3-person group',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors.slice(0,2),{...settings,mode:'ensemble'},null,null),null));
check('disabled group returns null',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors,{...settings,ensemble:false},null,null),null));
check('disabled duo returns null',()=>assert.equal(v.selectDanceCameraModeV898(plan.scenes[4],anchors.slice(0,2),{...settings,duet:false},null,null),null));
check('default can alter safe shot',()=>{const r=sample();assert.equal(r.mode,'ensemble');assert.equal(r.active,true);assert.notEqual(r.pose,pose);});
check('output deterministic',()=>assert.deepEqual(sample(),sample()));
check('original pose immutable',()=>{sample();assert.deepEqual(pose,{x:.1,y:1.45,z:7.8,targetX:0,targetY:1.1,targetZ:0,fov:52});});
for(const [reason,patch] of [
 ['disabled',{settings:{...settings,enabled:false}}],['zero intensity',{settings:{...settings,intensity:0}}],
 ['paused',{playing:false}],['not automatic',{autoEnabled:false}],['director disabled',{directorEnabled:false}],
 ['camera disabled',{cameraEnabled:false}],['dance disabled',{danceEnabled:false}],['manual camera',{manualCamera:true}],
 ['manual dance',{manualDance:true}],['manual FX',{manualFx:true}],['authored preset',{authored:true}],
 ['seek guard',{seekBlocked:true}],['blackout',{blackout:true}],['reduced motion',{reducedMotion:true}],
 ['low tier',{tier:'low'}],['no plan',{plan:null}],['unverified plan',{plan:{...plan,source:'unavailable'}}],
 ['wrong plan track',{plan:{...plan,trackId:'another'}}],['wrong duration',{durationMs:200000}],
 ['wrong track',{trackId:'unrelated'}],['zero duration',{durationMs:0}],['NaN duration',{durationMs:NaN}],
 ['negative position',{positionMs:-1}],['after end',{positionMs:180000}],['NaN position',{positionMs:NaN}],
 ['bad aspect',{aspect:.3}],['too wide aspect',{aspect:4}],['bad sample age',{anchorAgeMs:700}],
 ['negative sample age',{anchorAgeMs:-4}],['bad motion',{motion:NaN}],['out of bound motion',{motion:1.5}],
 ['missing anchors',{anchors:[]}],['invisible roots',{anchors:anchors.map(x=>({...x,visible:false}))}],
 ['lyrics',{lyricsProtected:true}],['lyrics visible',{lyricsVisible:true}],
 ['bad x',{pose:{...pose,x:NaN}}],['bad fov',{pose:{...pose,fov:100}}],
 ['camera too close',{pose:{...pose,z:.4}}],
 ])check('hard guard '+reason,()=>{const i=input(patch),o=v.sampleDanceCameraV898(i);assert.equal(o.active,false);assert.equal(o.pose,i.pose);assert.equal(o.cameraRate,1);});
check('lyrics protection can be disabled explicitly',()=>assert(sample({settings:{...settings,protectLyrics:false},lyricsProtected:true}).active));
check('single root gives solo',()=>assert.equal(sample({anchors:[anchors[0]],positionMs:34000}).mode,'solo'));
check('2 roots give duo',()=>assert.equal(sample({anchors:anchors.slice(0,2)}).mode,'duet'));
check('3 roots give ensemble',()=>assert.equal(sample({anchors}).mode,'ensemble'));
check('forced solo with real lead and group',()=>assert.equal(sample({positionMs:34000,verifiedLeadSlot:0,verifiedSingingSlots:[0],settings:{...settings,mode:'solo'}}).mode,'solo'));
check('false singer slots fail closed',()=>assert.equal(sample({verifiedSingingSlots:[3]}).active,false));
check('duplicate stage slot fails',()=>assert.equal(sample({anchors:[anchors[0],anchors[0]]}).active,false));
check('non-finite stage root fails',()=>assert.equal(sample({anchors:[{...anchors[0],x:NaN}]}).active,false));
check('offstage performer root fails',()=>assert.equal(sample({anchors:[{...anchors[0],z:99}]}).active,false));
check('invalid tight screen framing cannot become unsafe',()=>{
 const s=sample({aspect:.65,anchors:[{slot:0,x:-2.1,y:0,z:0,visible:true},{slot:1,x:2.1,y:0,z:0,visible:true}]});
 assert(s.active===false||Math.abs(s.pose.fov-pose.fov)<1);
});
for(const style of ['subtle','cinematic','dynamic'])check('style remains bounded '+style,()=>{
 const s=sample({settings:{...settings,style,intensity:100}});assert(Number.isFinite(s.pose.fov));assert(s.cameraRate>=.94&&s.cameraRate<=1.04);
});
check('tier balanced reduces strength',()=>assert(sample({tier:'balanced'}).gain<sample({tier:'high'}).gain));
check('intensity reduces strength',()=>assert(sample({settings:{...settings,intensity:10}}).gain<sample().gain));
check('scene entry and exit are neutral',()=>{
 for(const s of plan.scenes){assert.equal(sample({positionMs:s.startMs}).active,false);const x=sample({positionMs:s.endMs-.001});assert(!x.active||x.gain<.00001);}
});
check('no fabricated scene for gaps',()=>assert.equal(sample({plan:{...plan,scenes:[]}}).active,false));
check('too short verified scene refused',()=>assert.equal(sample({plan:{...plan,scenes:[{...plan.scenes[4],startMs:100900,endMs:101900}]}}).active,false));
check('time reversing resets motion',()=>assert.equal(v.measureAnchorMotionV898(anchors,anchors,200,false),0));
check('no previous roots yields zero motion',()=>assert.equal(v.measureAnchorMotionV898([],anchors,200,true),0));
check('no movement is zero',()=>assert.equal(v.measureAnchorMotionV898(anchors,anchors,200,true),0));
check('root translated gives finite signal',()=>assert(v.measureAnchorMotionV898(anchors,anchors.map(x=>({...x,x:x.x+.05})),180,true)>0));
check('teleport resets motion',()=>assert.equal(v.measureAnchorMotionV898(anchors,anchors.map(x=>({...x,x:x.x+2})),180,true),0));
for(const ms of [-1,0,10,1100,Infinity,NaN])check('motion delta reject '+String(ms),()=>assert.equal(v.measureAnchorMotionV898(anchors,anchors,ms,true),0));
check('invisible current root cannot contribute',()=>assert.equal(v.measureAnchorMotionV898(anchors,anchors.map(x=>({...x,visible:false})),200,true),0));
check('motion follower not inventing motion',()=>assert.equal(sample({motion:0}).motion,0));
check('motion follow optional',()=>assert.equal(sample({motion:1,settings:{...settings,motionFollow:false}}).motion,0));
check('real motion can change camera easing',()=>assert(sample({motion:.85}).cameraRate>=sample({motion:0}).cameraRate));
check('30k frames do not violate bounded offsets or camera rates',()=>{
 for(let j=0;j<30000;j++){
  const sc=plan.scenes[j%8];const len=sc.endMs-sc.startMs;
  const ms=sc.startMs+200+((j*89)%(len-400));
  const r=sample({positionMs:ms,settings:{...settings,intensity:j%101},motion:(j%100)/100});
  assert(r.cameraRate>=.94&&r.cameraRate<=1.04);assert(Number.isFinite(r.pose.x)&&Number.isFinite(r.pose.fov));
  assert(Math.abs(r.pose.x-pose.x)<=.12&&Math.abs(r.pose.fov-pose.fov)<=.5);
 }
});
check('invalid export rejected',()=>assert.equal(v.exportDanceCameraV898({...plan,source:'unavailable'},settings),null));
check('empty export rejected',()=>assert.equal(v.exportDanceCameraV898({...plan,scenes:[]},settings),null));
check('verified export encodes source but no fabricated dancer IDs',()=>{
 const j=JSON.parse(v.exportDanceCameraV898(plan,settings));assert.equal(j.schema,'sonic-dance-camera-v898');
 assert.equal(j.scenes.length,8);assert.deepEqual(j.scenes.map(x=>x.startMs),source.scenes.map(x=>x.startMs));
 assert(!JSON.stringify(j).includes('vocalIdentity'));
});
check('settings bridged through normalized versioned stage signal',()=>{
 bridge.publishConcertStageSyncV882({trackId:plan.trackId,durationMs:plan.durationMs,playing:true,enabled:true,
  reducedMotion:false,intensity:.5,sceneSource:'verified',section:'hook',sceneStartMs:87000,
  look:'none',manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},
  danceCameraSettingsV898:{...settings,style:'dynamic'},directorPlanV895:plan});
 assert.equal(bridge.readConcertStageSyncV882().danceCameraSettingsV898.style,'dynamic');
 bridge.publishConcertStageSyncV882(null);
});
const camera=read('components/visualizer/StageCameraDirectorV289.tsx');
const deck=read('components/visualizer/LiveFxDeckV881.tsx');
const signal=read('components/visualizer/concertStageSyncV882.ts');
check('R3F camera uses V898 after V897 before V351',()=>{
 assert(camera.indexOf('sampleDanceCameraV898({')>camera.indexOf('sampleCinematicCameraV897({'));
 assert(camera.indexOf('guardAutomaticCameraV351(danceCameraV898.pose')>camera.indexOf('sampleDanceCameraV898({'));
});
check('one existing R3F camera, not second or new render loop',()=>{assert(!read('components/visualizer/danceCameraCoordinationV898.ts').includes('useFrame('));assert(camera.includes('danceCameraV898.cameraRate'));});
check('camera reads real V377 anchors from existing stage',()=>assert(camera.includes('duetAnchorSampleV377.current.anchors,\n      anchorAgeMs')));
check('motion sample compares real cached slot roots',()=>assert(camera.includes('measureAnchorMotionV898(')));
check('publishes V898 only when V898 UI hydrated',()=>assert(deck.includes('!danceCameraReadyV898)return;')));
check('user can disable each camera composition independently',()=>assert(deck.includes("['solo','duet','ensemble','motionFollow','protectLyrics','protectDuets']")));
check('one locally persisted settings key',()=>assert(deck.includes('DANCE_CAMERA_KEY_V898')));
check('shows verified-scene UI disclaimer',()=>assert(deck.includes('Keine neue Sänger-, Beat- oder Tanzschritt-Erkennung')));
check('bridge compares each changed setting',()=>assert(signal.includes('snapshot.danceCameraSettingsV898?.motionFollow===next.danceCameraSettingsV898?.motionFollow')));
console.log('V898 PASS '+checks+' regression checks');

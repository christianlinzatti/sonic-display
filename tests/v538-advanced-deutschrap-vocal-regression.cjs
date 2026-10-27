'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineDeutschrapFaceV538:face,refineDeutschrapGestureV538:gesture}=load('components/visualizer/deutschrapVocalPerformanceV538');
const words=[
 {text:'Ich',startMs:1000,endMs:1210},
 {text:'bin',startMs:1240,endMs:1480},
 {text:'Bam!',startMs:1500,endMs:1730},
 {text:'dabei',startMs:1760,endMs:2070},
 {text:'Pause',startMs:2700,endMs:3050},
 {text:'Boom',startMs:3100,endMs:3450},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {text:words.slice(0,4).map(w=>w.text).join(' '),startMs:900,endMs:2200,words:words.slice(0,4)},
 {text:words.slice(4).map(w=>w.text).join(' '),startMs:2670,endMs:3500,words:words.slice(4)}
]};
const neutral={jaw:.28,wide:.17,round:.11,lipsClosed:.02,smile:.1,brow:.12,blink:.03,cheek:.08,squint:.04};
const frame={face:neutral,sentinel:{keep:true}};
const defaults={lyrics,effectiveTimeMs:1880,activeWord:'dabei',playing:true,enabled:true,reducedMotion:false,
 rap:true,verifiedWord:true,roleAllowed:true,manualSilent:false,manualPriority:false,
 preserveAudioMouth:false,intensity:85,section:'verse',energy:.7};
const success=face(frame,defaults);
assert(success.active&&success.source==='timed-word');
assert(success.frame.face.jaw>neutral.jaw&&success.frame.face.cheek>neutral.cheek);
assert.deepEqual(success.frame.sentinel,frame.sentinel);
assert.equal(success.frame.face.lipsClosed,neutral.lipsClosed);
assert.equal(success.frame.face.blink,neutral.blink);
assert.equal(success.frame.face.smile,neutral.smile);
assert.equal(face(frame,defaults).frame.face.jaw,success.frame.face.jaw,'seek-safe deterministic');
assert(face(frame,{...defaults,section:'hook'}).frame.face.cheek>success.frame.face.cheek,'hooks raise expression subtly');
const shield=[{playing:false},{enabled:false},{rap:false},{verifiedWord:false},{roleAllowed:false},
 {manualPriority:true},{manualSilent:true},{preserveAudioMouth:true},{reducedMotion:true},
 {intensity:0},{effectiveTimeMs:2350},{effectiveTimeMs:3100},{activeWord:'other'},
 {lyrics:{...lyrics,synced:false}},{editedWords:[{startMs:1760,text:'dabei'}]}];
for(const opts of shield){const r=face(frame,{...defaults,...opts});assert.equal(r.active,false,JSON.stringify(opts));assert.strictEqual(r.frame,frame);}
const close=face({face:{...neutral,lipsClosed:.93}},defaults);
assert(close.active&&close.frame.face.jaw===neutral.jaw);
assert.equal(close.frame.face.lipsClosed,.93);
const bareFace=face(frame,{...defaults,intensity:NaN});assert.strictEqual(bareFace.frame,frame);
const live={active:true,source:'word',confidence:'lyrics-word',lineIndex:0,wordIndex:3,
 role:'lead',head:.02,chest:.03,arms:.045,side:1};
const cast={active:true,lineIndex:0,singingSlots:[0],handoffFrom:null,phase:0};
const options={lyrics,effectiveTimeMs:1880,playing:true,rap:true,reducedMotion:false,
 authored:false,bodyEnabled:true,gesturesEnabled:true,trackId:'rap-track',slot:0,count:1,section:'verse'};
const moved=gesture(live,options);
assert(moved.active&&moved.arms>live.arms&&moved.head>live.head);
assert.equal(moved.side,live.side);
assert.deepEqual(gesture(live,options),moved,'gesture stateless');
for(const o of [{playing:false},{rap:false},{authored:true},{reducedMotion:true},{bodyEnabled:false},
 {gesturesEnabled:false},{trackId:null},{effectiveTimeMs:2350},{count:2},{slot:2},{section:'break'}]) {
 assert.deepEqual(gesture(live,{...options,...o}),live,JSON.stringify(o));
}
assert(gesture(live,{...options,count:2,casting:cast}).arms>live.arms,'authored singer plays');
assert.deepEqual(gesture(live,{...options,count:2,slot:1,casting:cast}),live,'non-singer cannot get vocal gestures');
assert.deepEqual(gesture({...live,role:'background'},options),{...live,role:'background'});
// No source-less or line-only cues may be enhanced.
assert.deepEqual(gesture({...live,source:'line'},options),{...live,source:'line'});
assert.deepEqual(gesture({...live,wordIndex:999},options),{...live,wordIndex:999});
let frames=0;
for(let i=0;i<20000;i++){
 const t=900+(i*37)%2900;
 const token=words.find(w=>t>=w.startMs&&t<w.endMs)?.text||'';
 const f=face(frame,{...defaults,effectiveTimeMs:t,activeWord:token});
 for(const c of Object.values(f.frame.face))assert(Number.isFinite(c)&&c>=0&&c<=1,'finite rig channels');
 assert.equal(f.frame.face.lipsClosed,neutral.lipsClosed);
 frames++;
}
for(const name of ['sonic-performer-v3','sonic-pulsebot-v1','sonic-nova-v1','sonic-rae-v1','sonic-jax-v1']){
 const filename=path.join('/mnt/data',name+'.glb');
 if(!fs.existsSync(filename))continue;
 const b=fs.readFileSync(filename);assert.equal(b.toString('ascii',0,4),'glTF');
 const length=b.readUInt32LE(12),gltf=JSON.parse(b.toString('utf8',20,20+length).trim());
 const morphs=(gltf.meshes||[]).flatMap(m=>(m.extras?.targetNames)||[]);
 assert(morphs.includes('jawOpen'),`${name} jawOpen morph required`);
 assert(morphs.includes('mouthSmile'),`${name} mouthSmile morph required`);
 assert(gltf.animations.length===20,`${name} original animation library unchanged`);
}
const glb=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
const body=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
assert(glb.includes('const lipV538=refineDeutschrapFaceV538')&&glb.includes('const finalTargetV538='),'GLB rig uses the result');
assert(procedural.includes('const lipV538=refineDeutschrapFaceV538')&&procedural.includes('const mouthFaceV538=lipV538.active?'),'procedural mouth uses result');
assert(body.includes('const refinedRapV538=refineDeutschrapGestureV538')&&(body.includes('correctAutomaticAccentV515(refinedRapV538')||(body.includes('const naturalBodyV564=refineNaturalDeutschrapBodyV564')&&body.includes('correctAutomaticAccentV515(wordDanceV567'))),'gesture limiter retained through V564');
assert(!fs.readFileSync('components/visualizer/deutschrapVocalPerformanceV538.ts','utf8').includes('requestAnimationFrame('));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=538);
assert(pkg.scripts['build:preflight'].includes('npm run test:v538 && npm run test:v538:types && npm run test:v537')); 
console.log(`PASS V538: ${frames} seeks/frames, vocal ownership, audio/manual priority, GLB/procedural rendering, gesture limiter`);

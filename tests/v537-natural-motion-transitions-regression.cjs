'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalMotionTransitionV537}=load('components/visualizer/naturalMotionTransitionsV537');
const project=path.resolve(__dirname,'..');
const nodeNames=['Hips','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftFoot','RightFoot'];
const q=(r)=>[0,Math.sin(r/2),0,Math.cos(r/2)];
function moving(name,offset=0){const values=[...q(offset),...q(offset+.8)];return {name:`${name}.quaternion`,times:[0,1],values,getValueSize:()=>4};}
const synthetic=(offset=0)=>({duration:1,tracks:nodeNames.map(n=>moving(n,offset))});
const opts={outgoing:synthetic(0),incoming:synthetic(0),outgoingSeconds:.76,
 baselineSeconds:.34,plantedLeft:true,plantedRight:false,automatic:true};
let r=planNaturalMotionTransitionV537(opts);
assert.equal(r.mode,'matched');
assert(r.entrySeconds>.55 && r.entrySeconds<.95,`expected matched midclip, got ${r.entrySeconds}`);
assert(r.comparedJoints>=7&&r.contactAware);
assert(r.fadeSeconds>=.34);
assert.deepEqual(r,planNaturalMotionTransitionV537(opts),'planner should be deterministic');
// A planted left foot should alter the preferred entry when its pose contradicts the rest.
const divergent=synthetic(0);
const left=divergent.tracks.find(t=>t.name==='LeftFoot.quaternion');
left.values=[...q(.4),...q(1.2)];
const airborne=planNaturalMotionTransitionV537({...opts,outgoingSeconds:.5,incoming:divergent,plantedLeft:false});
const planted=planNaturalMotionTransitionV537({...opts,outgoingSeconds:.5,incoming:divergent,plantedLeft:true});
assert.equal(airborne.mode,'matched');assert.equal(planted.mode,'matched');
assert(planted.entrySeconds<airborne.entrySeconds,`contact weighting should bias left-foot entry: ${planted.entrySeconds} vs ${airborne.entrySeconds}`);
// Quaternion q/-q are the SAME rotation, not a 360-degree pose jump.
const flipped=synthetic(0);for(const t of flipped.tracks)t.values=t.values.map(v=>-v);
r=planNaturalMotionTransitionV537({...opts,incoming:flipped});
assert.equal(r.mode,'matched');assert(r.score<.1,'sign-flipped quaternions must match');
const manual=planNaturalMotionTransitionV537({...opts,automatic:false,fallbackSeconds:.21});
assert.equal(manual.mode,'fallback');assert.equal(manual.entrySeconds,.21);
assert.equal(planNaturalMotionTransitionV537({...opts,outgoing:null}).mode,'fallback');
assert.equal(planNaturalMotionTransitionV537({...opts, reducedMotion:true}).mode,'fallback');
assert.equal(planNaturalMotionTransitionV537({...opts,incoming:{duration:1,tracks:[moving('LeftFoot')]}}).mode,'fallback');
assert.equal(planNaturalMotionTransitionV537({...opts,incoming:{duration:NaN,tracks:[]}}).mode,'fallback');
assert.equal(planNaturalMotionTransitionV537({...opts,outgoingSeconds:NaN}).mode,'fallback');
const damaged=synthetic(0);damaged.tracks[2].values[0]=NaN;
assert(['matched','fallback'].includes(planNaturalMotionTransitionV537({...opts,incoming:damaged}).mode),'corrupt curves should not crash');
// Genuine GLB 2.0 accessors: read original Float32 animation curves without Three or WebGL.
function parseGlb(file){
 const bytes=fs.readFileSync(file);assert.equal(bytes.toString('ascii',0,4),'glTF');
 const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.toString('utf8',20,20+jsonLength).trim());
 const binStart=20+jsonLength+8;
 const sizeOf={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
 function accessor(id){
  const a=json.accessors[id],v=json.bufferViews[a.bufferView],n=sizeOf[a.type];
  assert.equal(a.componentType,5126,'expected Float32 animation sample');
  const stride=v.byteStride??n*4,offset=binStart+(v.byteOffset||0)+(a.byteOffset||0);
  const values=[];for(let i=0;i<a.count;i++)for(let j=0;j<n;j++)values.push(bytes.readFloatLE(offset+i*stride+j*4));
  return values;
 }
 const tracksOf=animation=>{
  const tracks=[];
  animation.channels.forEach(ch=>{
   if(!['rotation','translation'].includes(ch.target.path))return;
   const name=json.nodes[ch.target.node]?.name||'';
   if(!nodeNames.includes(name))return;
   const sampler=animation.samplers[ch.sampler];
   const times=accessor(sampler.input),values=accessor(sampler.output);
   tracks.push({name:name+'.'+(ch.target.path==='rotation'?'quaternion':'position'),times,values,getValueSize:()=>values.length/times.length});
  });
  return tracks;
 };
 return json.animations.map(a=>{
  const tracks=tracksOf(a),duration=Math.max(0,...tracks.flatMap(x=>[x.times[x.times.length-1]??0]));
  return {name:a.name,duration,tracks};
 });
}
let fixtures=0,checks=0,matches=0;
for(const name of ['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb']){
 const file=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',name);
 if(!fs.existsSync(file))continue;
 const clips=parseGlb(file);fixtures++;
 assert.equal(clips.length,20,`${name} must retain 20 original animations`);
 for(const [from,to] of [['Idle_Groove','Dance_RapTwoStep'],['Dance_RapTwoStep','Dance_ClubGroove'],['Dance_ClubGroove','Idle_Groove'],['Rap_Gesture','Hip_Bounce'],['Dance_HeelTap','Dance_Groove'],['Dance_SideStep','Dance_DiscoPoint']]){
  const a=clips.find(c=>c.name===from),b=clips.find(c=>c.name===to);assert(a&&b);
  const x=planNaturalMotionTransitionV537({...opts,outgoing:a,incoming:b,outgoingSeconds:.53,baselineSeconds:.44,plantedRight:true});
  assert(x.fadeSeconds>=.08&&x.fadeSeconds<=1.5);
  assert(x.entrySeconds>=0&&x.entrySeconds<b.duration);
  if(x.mode==='matched'){matches++;assert(x.comparedJoints>=4&&x.candidates>=4&&Number.isFinite(x.score));}
  const y=planNaturalMotionTransitionV537({...opts,outgoing:a,incoming:b,outgoingSeconds:.53,baselineSeconds:.44,automatic:false,fallbackSeconds:0});
  assert.equal(y.mode,'fallback',`${name} must preserve manual control`);
  checks++;
 }
 console.log(`V537 ${name}: ${clips.length} original clips, 6 bounded transition pairs`);
}
const hook=fs.readFileSync(path.join(project,'components/visualizer/useGltfClipTransitionsV492.ts'),'utf8');
for(const keyword of ['planNaturalMotionTransitionV537','automaticV537','naturalV537.mode === \'matched\'','naturalV537.fadeSeconds','footIK.current.left?.contact.phase','footIK.current.right?.contact.phase','lowMotionV489.active']){
 assert(hook.includes(keyword),`V537 stage integration missing: ${keyword}`);
}
assert(!hook.includes('resetFootIK')&&!hook.includes('new AnimationMixer('),'no IK reset or second animation mixer');
const pkg=JSON.parse(fs.readFileSync(path.join(project,'package.json'),'utf8'));
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=537);
assert(pkg.scripts['build:preflight'].includes('npm run test:v537 && npm run test:v537:types &&')); 
console.log(`V537 PASS: synthetic quaternion/sign/IK/manual/fallback cases, ${fixtures} real GLBs, ${checks} transition pairs (${matches} matched), V492 integration`);

require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('components/visualizer/naturalDanceIntelligenceV391.ts');
const code=ts.transpileModule(source,{fileName:'naturalDanceIntelligenceV391.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('module','exports','require',code)(mod,mod.exports,require);
const v=mod.exports;
const base=Object.freeze({headNod:.1,headTurn:0,spineSway:.08,hipSway:.05,shoulderRoll:.12,
  followThrough:.08,headLag:0,chestPulse:.04,armSwing:.45,legGroove:.42,footStep:.36,
  weightShift:.08,beatImpulse:0,expressionJaw:.1,expressionBrow:0,expressionEyeNarrow:0,expressionHeadTilt:0});
const input=(time,more={})=>({time,delta:1/60,trackId:'song-A',playing:true,reducedMotion:false,
  settings:{enabled:true,strength:75},genre:'Deutschrap',section:'verse',slot:0,
  bpm:93,energy:.9,beat:.7,snare:1,kick:0,...more});
const sample=(more={},frames=180)=>{const state=v.createDanceFlowStateV391();let final=base,max=0,acc=0;
  for(let i=0;i<=frames;i++){final=v.refineDanceFlowV391(state,base,input(i/60,more));
    const diff=Math.abs(final.weightShift-base.weightShift);max=Math.max(max,diff);acc+=diff;}
  return {final,max,acc,state};};
assert.deepEqual(v.normalizeDanceFlowV391(null),v.DEFAULT_DANCE_FLOW_V391);
assert.deepEqual(v.normalizeDanceFlowV391({enabled:true,strength:Infinity}),{enabled:true,strength:55});
assert.deepEqual(v.normalizeDanceFlowV391({enabled:true,strength:999}),{enabled:true,strength:100});
assert.deepEqual(v.normalizeDanceFlowV391({enabled:true,strength:-12}),{enabled:true,strength:0});
const state=v.createDanceFlowStateV391();
assert.equal(v.refineDanceFlowV391(state,base,input(0)),base,'new track must be inert on first frame');
const normal=v.refineDanceFlowV391(state,base,input(1/60));
assert.notEqual(normal,base,'active layer produces a new motion');
assert.equal(base.counterArm,undefined,'source motion is never mutated');
assert.equal(normal.footStep,base.footStep,'missing contact information must never move feet');
assert.equal(normal.legGroove,base.legGroove,'missing contact information must never move legs');
const bothAir=v.createDanceFlowStateV391();v.refineDanceFlowV391(bothAir,base,input(0,{plantedLeft:false,plantedRight:false,genre:'Hardtekk',kick:1}));
const air=v.refineDanceFlowV391(bothAir,base,input(1/60,{plantedLeft:false,plantedRight:false,genre:'Hardtekk',kick:1}));
assert.ok(Math.abs(air.footStep-base.footStep)<.019,'airborne-only footwork is tightly bounded');
const landed=v.refineDanceFlowV391(bothAir,base,input(2/60,{plantedLeft:true,plantedRight:false,genre:'Hardtekk',kick:1}));
assert.equal(landed.footStep,base.footStep,'any planted foot disables V391 foot rotations');
assert.equal(landed.legGroove,base.legGroove,'any planted foot disables V391 leg rotations');
const authored=v.refineDanceFlowV391(bothAir,base,input(3/60,{plantedLeft:false,plantedRight:false,authoredClipPriority:true}));
assert.equal(authored.footStep,base.footStep,'authored clips keep all original foot curves');
assert.equal(normal.expressionJaw,base.expressionJaw,'facial/lip-sync channels remain untouched');
for(const k of ['weightShift','spineSway','hipSway','shoulderRoll','followThrough','headLag','counterArm','torsoTwist'])
  assert.ok(Number.isFinite(normal[k]),`${k} must be finite`);
assert.ok(Math.abs(normal.weightShift-base.weightShift)<.07,'subtle weight transfer');
assert.ok(sample().acc > .05,'groove must vary across time');
assert.ok(sample({plantedLeft:true,plantedRight:true}).acc < sample().acc*.4,'two planted feet suppress extra weight transfer');
assert.ok(sample({plantedLeft:true}).acc < sample().acc*.8,'single planted foot reduces extra groove');
assert.ok(sample({authoredClipPriority:true}).acc < sample().acc*.3,'authored clips take priority');
assert.notEqual(sample({slot:0}).final.weightShift,sample({slot:2}).final.weightShift,'performers vary subtly per slot');
const rap=sample({genre:'Deutschrap',snare:1,kick:0}).final;
const rave=sample({genre:'Hardtekk',snare:1,kick:0}).final;
assert.ok(rap.shoulderRoll>rave.shoulderRoll,'rap follows snares, rave follows kicks');
const mute=v.createDanceFlowStateV391();v.refineDanceFlowV391(mute,base,input(0));v.refineDanceFlowV391(mute,base,input(1/60));
for(const patch of [{playing:false},{reducedMotion:true},{settings:{enabled:false,strength:100}}]){
  assert.equal(v.refineDanceFlowV391(mute,base,input(2/60,patch)),base,'pause/reduced/disabled must return original');
  assert.equal(mute.weight,0,'inactive state must reset');
}
assert.equal(v.refineDanceFlowV391(mute,base,input(100)),base,'seek clears state');
assert.equal(v.refineDanceFlowV391(mute,base,input(1/60,{trackId:'song-B'})),base,'track change clears state');
assert.equal(v.refineDanceFlowV391(mute,base,input(2/60,{settings:{enabled:true,strength:0},trackId:'song-B'})),base,'zero strength inert');
const avatar=read('components/visualizer/ThreeAvatar.tsx');
assert.equal((avatar.match(/refineDanceFlowV391\(danceFlowV391.current/g)||[]).length,2,'gltf and procedural integration');
assert.match(avatar,/balanceStateV323.current,performanceV391/);
assert.match(avatar,/refineDanceFlowV391\(danceFlowV391.current,performanceV320,\{settings:readDanceFlowV391\(\),playing:isPlaying,reducedMotion,delta,time:updateDanceSongClock\(/,'seek-aware song clock should drive glb groove');
assert.match(avatar,/snare:audio.snare,kick:audio.kickAccentIntensity/);
const controls=read('components/visualizer/NaturalDanceControlsV320.tsx');
assert.match(controls,/V391 Flow-Variation aktivieren/);
assert.match(controls,/readDanceFlowV391|refreshDanceFlowV391/);
const pkg=JSON.parse(read('package.json'));
assert.ok(['0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));
assert.ok(pkg.scripts['verify:offline'].includes('test:v391'));
console.log('PASS V391 natural dance – behavioral, rig-safety, UI, version, integration');

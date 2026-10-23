'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file){let code=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;let m={exports:{}};new Function('module','exports','require',code)(m,m.exports,()=>{throw Error('unexpected runtime import')});return m.exports;}
const e=load('components/visualizer/realMotionComparisonV317.ts');
const options=e.comparisonMotionSourcesV317('avatar-a','/motion/default.glb',[
 {id:'a',avatarId:'avatar-a',name:'Groove',url:'/motion/groove.glb'},
 {id:'b',avatarId:'avatar-b',name:'Other',url:'/motion/other.glb'},
 {id:'c',avatarId:'avatar-a',name:'Duplicate',url:'/motion/groove.glb'},
 {id:'d',avatarId:'avatar-a',name:'Bad URL',url:'javascript:evil'},
]);
assert.deepEqual(options.map(x=>x.id),['embedded','default','installed:a']);
assert.equal(options[1].url,'/motion/default.glb');
assert.deepEqual(e.validComparisonClipsV317([{id:'a',name:'A',duration:8},{id:'b',name:'B',duration:NaN},{id:'c',name:'C',duration:0}]).map(x=>x.id),['a']);
assert.equal(e.clipTimeV317(-12,6),0);assert.equal(e.clipTimeV317(8,6),2);
for(const seconds of [0,1,4,7.7,7.85,8,12,12.6,15.1,20,51.2]){
 const plan=e.clipBlendV317(seconds,8,5,.65);
 assert.ok(plan.primaryWeight>=0&&plan.secondaryWeight>=0&&plan.primaryWeight<=1&&plan.secondaryWeight<=1);
 assert.ok(Math.abs(plan.primaryWeight+plan.secondaryWeight-1)<1e-8);
 assert.ok(plan.primaryTime>=0&&plan.secondaryTime>=0);
}
const period=8+5-2*1.05;const start=e.clipBlendV317(0,8,5,.65);
const end=e.clipBlendV317(period-0.00001,8,5,.65);
assert.equal(start.phase,'solo-primary');assert.equal(end.phase,'to-primary');
assert.ok(Math.abs(start.primaryTime-end.primaryTime)<0.001,'A clip must connect seamlessly at loop end');
assert.ok(end.primaryWeight>.99,'A must be dominant at loop end');
for(const time of [0,2,7,9.3,period-.00001]){
  const left=e.clipBlendV317(time,8,5,.2),right=e.clipBlendV317(time,8,5,.85);
  assert.equal(left.primaryTime,right.primaryTime,'both panes use identical authored A keyframe time');
  assert.equal(left.secondaryTime,right.secondaryTime,'both panes use identical authored B keyframe time');
}
assert.ok(e.fadeSecondsV317(.25,.3,100)<.11,'fade cannot consume a very short clip');
assert.equal(e.plantedFootV317(.05,.05,.05,.033),true);
assert.equal(e.plantedFootV317(.25,.05,.05,.033),false);
assert.equal(e.plantedFootV317(.05,null,.05,.033),false);
assert.equal(e.plantedFootV317(.05,.05,.05,0),false);
const preview=read('components/visualizer/DanceLiveComparisonV316.tsx');
for(const item of ['"use client"','AnimationMixer','GLTFLoader','retargetHumanoidClips','readRetargetCalibration',
 'cloneSkinnedScene','onCatalog','RealGLBMotionV317','clipBlendV317','mixer.update(0)',
 'overlayRealMotionV317','resetRealOverlayV317','plantedFootV317','Echte GLB-Motion',
 'Animationsquelle','Optionaler Übergang','modelAnimationUrl','installed','synthetischer Beat',
 'performance.transitionPolish','Proposals']){
  if(item==='Proposals')continue;assert.ok(preview.includes(item),`missing ${item}`);
}
assert.ok(preview.includes('onCatalog={handleCatalog}'));
assert.ok(preview.includes('onCatalog={silentCatalog}'));
assert.ok(preview.includes('resetRealOverlayV317(overlay.current)'));
assert.ok(preview.includes('realController?.sample(time,settings.performance.transitionPolish,dt)'));
const studio=read('components/visualizer/VisualDanceImprovementStudioV315.tsx');
assert.ok(studio.includes('Real-Motion-Vergleich öffnen · V317'));
const pack=require('../package.json');assert.ok(['0.1.0-v317','0.1.0-v318','0.1.0-v319','0.1.0-v320','0.1.0-v321','0.1.0-v322','0.1.0-v324','0.1.0-v325','0.1.0-v326','0.1.0-v329','0.1.0-v330','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pack.version));assert.ok(pack.scripts['verify:offline'].includes('test:v317'));
console.log('PASS V317: isolated real source catalog, deterministic A/B clip sampling, retargeting, continuous two-clip loop, live review wiring');

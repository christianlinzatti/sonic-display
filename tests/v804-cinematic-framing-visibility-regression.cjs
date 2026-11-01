'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(804);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectProjectedFramingV804:inspect}=load('components/visualizer/cinematicFramingInspectorV804');
let count=0,probes=0;
const test=(name,fn)=>{try{fn();count++;}catch(error){error.message=`V804 ${name}: ${error.message}`;throw error;}};
const corners=(l=.32,t=.14,r=.66,b=.70)=>{
 const points=[];for(const x of [l,r])for(const y of [t,b])for(const z of [0,.2])points.push({x,y,z});return points;
};
const base={source:'glb',bounds:corners(),head:{x:.49,y:.21,z:.1},feet:[{x:.43,y:.68,z:.1},{x:.55,y:.68,z:.1}],headBone:true,footBones:true,performerCount:1};
const status=(x,id)=>x.checks.find(c=>c.id===id)?.status;
const output=inspect(base);
test('GLB scene produces geometric evidence',()=>assert.equal(output.source,'geometry-review'));
test('one result per requested check',()=>assert.deepEqual(output.checks.map(x=>x.id),['body','face','feet','ensemble','lyrics']));
test('normal full-body bounds inside the camera',()=>assert.equal(status(output,'body'),'clear'));
test('tracked head with margin accepted',()=>assert.equal(status(output,'face'),'clear'));
test('two tracked feet accepted',()=>assert.equal(status(output,'feet'),'clear'));
test('one GLB cannot establish group visibility',()=>assert.equal(status(output,'ensemble'),'unverified'));
test('lyrics not rendered so no false full clearance',()=>assert.equal(status(output,'lyrics'),'unverified'));
test('tracks geometry source types',()=>assert.deepEqual(output.checks.map(c=>c.source),['geometry','bone','bone','unavailable','proxy']));
test('normal bounds finite',()=>assert.deepEqual(output.bounds,{left:.32,top:.14,right:.66,bottom:.70}));
test('no mutation of evidence',()=>{const before=JSON.stringify(base);inspect(base);assert.equal(JSON.stringify(base),before);});
test('missing GLB yields no green checks',()=>{const res=inspect(null);assert.equal(res.verified,0);assert.equal(res.source,'unavailable');});
test('demo performer not mistaken for actual GLB',()=>{const res=inspect({...base,source:'demo'});assert.equal(res.source,'demo-only');assert(res.checks.every(c=>c.status==='unverified'));});
test('missing projected corners closes check',()=>{const res=inspect({...base,bounds:[]});assert.equal(res.source,'unavailable');});
test('too few corners closes check',()=>{const res=inspect({...base,bounds:corners().slice(0,7)});assert.equal(res.source,'unavailable');});
test('NaN projection does not pass',()=>{const res=inspect({...base,bounds:[...corners().slice(0,7),{x:NaN,y:0,z:0}]});assert.equal(res.source,'unavailable');});
test('infinite projection does not pass',()=>{const res=inspect({...base,bounds:[...corners().slice(0,7),{x:Infinity,y:0,z:0}]});assert.equal(res.source,'unavailable');});
test('degenerate model does not pass',()=>assert.equal(inspect({...base,bounds:corners(.4,.4,.4,.4)}).source,'unavailable'));
test('body cropped on left flagged',()=>assert.equal(status(inspect({...base,bounds:corners(-.02,.14,.65,.70)}),'body'),'risk'));
test('body cropped on top flagged',()=>assert.equal(status(inspect({...base,bounds:corners(.32,-.01,.66,.7)}),'body'),'risk'));
test('body cropped on right flagged',()=>assert.equal(status(inspect({...base,bounds:corners(.32,.14,1.06,.7)}),'body'),'risk'));
test('body cropped on bottom flagged',()=>assert.equal(status(inspect({...base,bounds:corners(.32,.14,.66,1.05)}),'body'),'risk'));
test('behind near clipping plane flagged',()=>{const b=corners();b[0].z=-3;assert.equal(status(inspect({...base,bounds:b}),'body'),'risk');});
test('behind far clipping plane flagged',()=>{const b=corners();b[0].z=3;assert.equal(status(inspect({...base,bounds:b}),'body'),'risk');});
test('head border proximity flagged',()=>assert.equal(status(inspect({...base,head:{x:.02,y:.4,z:0}}),'face'),'risk'));
test('head outside depth flagged',()=>assert.equal(status(inspect({...base,head:{x:.5,y:.4,z:4}}),'face'),'risk'));
test('missing head bone is unknown despite proxy',()=>assert.equal(status(inspect({...base,headBone:false}),'face'),'unverified'));
test('no head coordinates is unknown',()=>assert.equal(status(inspect({...base,head:null}),'face'),'unverified'));
test('missing one foot is unknown',()=>assert.equal(status(inspect({...base,feet:base.feet.slice(0,1)}),'feet'),'unverified'));
test('missing foot bones unknown',()=>assert.equal(status(inspect({...base,footBones:false}),'feet'),'unverified'));
test('foot at lower frame boundary flagged',()=>{assert.equal(status(inspect({...base,feet:[base.feet[0],{x:.55,y:.995,z:0}]}),'feet'),'risk');});
test('invalid foot position is unknown',()=>{assert.equal(status(inspect({...base,feet:[base.feet[0],{x:NaN,y:.68,z:0}]}),'feet'),'unverified');});
test('potential lyrics band collision is only a risk flag',()=>{const res=inspect({...base,bounds:corners(.31,.2,.64,.91)});assert.equal(status(res,'lyrics'),'risk');assert.match(res.checks[4].detail,/kein tatsächliches Lyrics-Overlay/);});
test('lyrics band outside horizontal center not falsely flagged',()=>{const res=inspect({...base,bounds:corners(.02,.1,.17,.95)});assert.equal(status(res,'lyrics'),'unverified');});
test('lyrics band above cutoff is unverified not green',()=>assert.equal(status(inspect({...base,bounds:corners(.3,.2,.7,.75)}),'lyrics'),'unverified'));
test('ensemble never falsely green if more are claimed',()=>assert.equal(status(inspect({...base,performerCount:4}),'ensemble'),'unverified'));
test('no score fabricates visual pixel certainty',()=>assert(!('visualQualityScore' in output)&&!('pixelOverlap' in output)));
test('invalid extreme projection cannot overflow panel',()=>assert.equal(inspect({...base,bounds:corners(-1e8,.2,.7,.7)}).source,'unavailable'));
test('limits and deterministic checks across 2200 cases',()=>{for(let i=0;i<2200;i++){
 const t=i/2199,l=.15+.23*t,r=.72+.2*t;
 const e={...base,bounds:corners(l,.08,r,.65+.34*t),head:{x:.5,y:.2,z:0}};
 const a=inspect(e),b=inspect(e);assert.deepEqual(a,b);
 assert(a.risks>=0&&a.risks<=5&&a.verified>=0&&a.verified<=3);probes++;
 }});
const read=p=>fs.readFileSync(p,'utf8');
test('uses real GLB world bounds in existing 3D review renderer',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const x of ['work.box.setFromObject(performer)','getObjectByName(\'v804-glb-performer\')','getWorldPosition(work.point)','project(cam)','inspectProjectedFramingV804','onInspection','v804-view-overlay'])assert(s.includes(x),x);
});
test('reuses one WebGL canvas two cameras and frozen pose',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 assert.equal((s.match(/<Canvas\s/g)||[]).length,1);
 for(const x of ['setScissorTest(true)','gl.render(scene,cam)','mixer.setTime','<FrozenGlb','<ReviewCameras'])assert(s.includes(x),x);
});
test('read-only review without save or extra loops',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx')+read('components/visualizer/cinematicFramingInspectorV804.ts');
 assert(!/localStorage|saveTimelineV354|requestAnimationFrame|fetch\s*\(|captureStream|setInterval/.test(s));
});
test('explicit differences between model, demo, unknown',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 assert(s.includes('geometry-review')&&s.includes('demo-only')&&s.includes('Keine GLB-Messung')===false);
});
test('UI warns of real limitations',()=>{
 const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const x of ['keine Mehrpersonen-Garantie','keine echte Live-Kamera','Keine Pixel-Okklusionsmessung','Keine Bewertung','Lyrics'])assert(s.includes(x),x);
});
test('V803 comparison still accessible via the V802 proposal panel',()=>{
 assert(read('components/visualizer/ConcertImprovementAssistantPanelV802.tsx').includes('<VisualConcertComparisonPanelV803'));
 assert(read('components/visualizer/VisualConcertComparisonPanelV803.tsx').includes('open&&<CameraComparisonCanvasV803'));
});
test('CSS overlay is noninteractive',()=>assert(read('app/globals.css').includes('.v804-overlays{position:absolute;inset:0;')&&read('app/globals.css').includes('pointer-events:none')));
test('version and required release gates',()=>{
 const pkg=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version));
 for(const gate of ['build:preflight','check:fast','check:release'])
  assert(pkg.scripts[gate].includes('npm run test:v804 && npm run test:v804:types && npm run test:v803'),gate);
});
console.log(`PASS V804: ${count} test groups, ${probes} deterministic geometry probes`);

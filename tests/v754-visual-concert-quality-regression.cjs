'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const d=load('components/visualizer/visualQualityInspectorV754');
let checks=0;
const ok=(x,m)=>{assert.ok(x,m);checks++;};
const eq=(x,y,m)=>{assert.deepEqual(x,y,m);checks++;};
const at=1793370000000;
const c={x:100,y:200,width:1000,height:700};
const avatar=(slot=0,x=500,y=400,other={})=>({slot,x,y,inFront:true,anchor:'head-bone',loaded:true,...other});
const body=(slot=0,other={})=>({slot,headSource:'head-bone',hips:{x:500,y:620,inFront:true},leftFoot:{x:460,y:830,inFront:true},rightFoot:{x:540,y:830,inFront:true},...other});
const snap=(overrides={})=>({at,canvas:c,lyrics:null,avatars:[avatar()],bodyV754:[body()],assessment:null,
 fps:55,frameMs:17,p95FrameMs:24,drawCalls:123,triangles:250000,qualityTier:'balanced',samples:64,...overrides});
const check=(p,expected)=>{const r=d.assessVisualQualityV754(p,at);eq(r.status,expected);return r;};
// V754 anatomical bone classifier must preserve FBX namespaced Head bone support
// and reject head ends/toes and unrelated mesh names.
for(const [name,expected] of [
 ['Head','head'],['Root:Head','head'],['mixamorig:Head','head'],['mixamorigHead','head'],
 ['HeadTop_End',null],['HeadEnd',null],['head_end',null],
 ['Hips','hips'],['Armature:Hips','hips'],['mixamorigHips','hips'],
 ['LeftFoot','leftFoot'],['mixamorig:LeftFoot','leftFoot'],['J_Bip_L_Foot','leftFoot'],
 ['RightFoot','rightFoot'],['mixamorigRightFoot','rightFoot'],['J_Bip_R_Foot','rightFoot'],
 ['LeftToeBase',null],['RightFootEnd',null],['Foot',null]
])eq(d.classifyAnatomicalBoneV754(name),expected);
let r=check(snap(),'ok');eq(r.examined,1);eq(r.verifiedBodies,1);eq(r.missingBodyEvidence,0);
eq(r.lighting,'not-measured');eq(r.findings,[]);eq(r.method,'projected-bones-and-dom-rectangles');
r=check(snap({avatars:[avatar(0,90,400)]}),'critical');ok(r.findings.some(f=>f.code==='head-outside-0'));
r=check(snap({avatars:[avatar(0,105,400)]}),'attention');ok(r.findings.some(f=>f.code==='head-edge-0'));
r=check(snap({avatars:[avatar(0,800,400,{inFront:false})]}),'critical');ok(r.findings[0].message.includes('hinter der Kamera'));
r=check(snap({avatars:[avatar(0,90,400,{anchor:'estimated'})]}),'attention');
r=check(snap({bodyV754:[body(0,{leftFoot:{x:1,y:700,inFront:true}})]}),'critical');ok(r.findings.some(f=>f.code==='feet-outside-0'));
r=check(snap({bodyV754:[body(0,{leftFoot:{x:460,y:899,inFront:true}})]}),'attention');ok(r.findings.some(f=>f.code==='feet-edge-0'));
r=check(snap({bodyV754:[body(0,{leftFoot:{x:450,y:700,inFront:false}})]}),'critical');
r=check(snap({bodyV754:[body(0,{leftFoot:null})]}),'ok');eq(r.verifiedBodies,0);eq(r.missingBodyEvidence,1);
r=check(snap({bodyV754:[body(0,{headSource:'estimated'})]}),'ok');eq(r.missingBodyEvidence,1);
r=check(snap({avatars:[avatar(0,500,400,{anchor:'estimated'})]}),'ok');eq(r.verifiedBodies,0);
r=check(snap({bodyV754:[]}), 'ok');eq(r.missingBodyEvidence,1);
r=check(snap({lyrics:{x:300,y:250,width:350,height:200}}),'attention');ok(r.findings.some(f=>f.code==='lyrics-head-0'));
r=check(snap({lyrics:{x:300,y:580,width:350,height:130}}),'attention');ok(r.findings.some(f=>f.code==='lyrics-hips-0'));
r=check(snap({lyrics:{x:50,y:300,width:400,height:100}}),'attention');ok(r.findings.some(f=>f.code==='lyrics-clipped'));
r=check(snap({lyrics:{x:1200,y:200,width:100,height:60}}),'ok');eq(r.lyricsApplicable,false);
r=check(snap({lyrics:{x:0,y:0,width:0,height:0}}),'ok');eq(r.lyricsApplicable,false);
r=check(snap({avatars:[avatar(0,500,400,{loaded:false})]}),'unavailable');
r=check(snap({avatars:[avatar(0),avatar(1,550,450,{loaded:false})]}),'attention');
ok(r.findings.some(f=>f.code==='avatar-unloaded-1'));eq(r.examined,1);
r=check(snap({avatars:[]}), 'unavailable');
r=check(snap({avatars:[avatar(0),avatar(0)]}), 'unavailable');
r=check(snap({avatars:[avatar(4)]}),'unavailable');
r=check(snap({canvas:{...c,width:0}}),'unavailable');
r=check(snap({at:at-6000}),'unavailable');
r=check(snap({at:at+1000}),'unavailable');
r=check(snap({at:NaN}),'unavailable');
r=check(snap(), 'ok');
const multi=snap({avatars:[avatar(0,350,360),avatar(1,800,400)],bodyV754:[body(),body(1,{leftFoot:null})]});
r=check(multi,'ok');eq(r.examined,2);eq(r.verifiedBodies,1);eq(r.missingBodyEvidence,1);
let history=[];history=d.appendVisualQualityV754(history,r);eq(history.length,1);
eq(d.appendVisualQualityV754(history,r),history);
eq(d.appendVisualQualityV754(history,d.assessVisualQualityV754(snap({at:at-6000}),at)),history);
for(let i=1;i<50;i++){
 const report=d.assessVisualQualityV754(snap({at:at+i*1000}),at+i*1000);
 history=d.appendVisualQualityV754(history,report);
 ok(history.length<=d.VISUAL_QUALITY_HISTORY_LIMIT_V754);
}
eq(history.length,30);
let summary=d.summarizeVisualQualityV754(history);eq(summary.samples,30);eq(summary.counts.critical,0);eq(summary.kinds.overlap,0);
eq(d.appendVisualQualityV754(history,{...r,at:at+150000}).length,1);
// Safety under varied camera positions and text rectangles; deterministic results and bounded evidence.
for(let i=0;i<20000;i++){
 const n=1+i%4,xx=100+(i*73)%1001,yy=200+(i*41)%701;
 const avatars=Array.from({length:n},(_,j)=>avatar(j,xx+j*36,yy-j*12));
 const bodies=Array.from({length:n},(_,j)=>body(j,{hips:{x:xx+j*20,y:yy+100,inFront:true},
   leftFoot:{x:xx+j*20-9,y:yy+260,inFront:true},rightFoot:{x:xx+j*20+9,y:yy+260,inFront:true}}));
 const lyrics=i%3===0?{x:380,y:680,width:390,height:90}:null;
 const probe=snap({avatars,bodyV754:bodies,lyrics,at:at+i*1000});
 const result=d.assessVisualQualityV754(probe,at+i*1000);
 ok(result.status!=='unavailable');
 eq(result.examined,n);
 eq(result.verifiedBodies,n);
 ok(result.findings.length<=n*5+1);
 ok(result.findings.every(f=>!f.message.includes('sichtbar garantiert')&&f.code.length<60));
 ok(result.lighting==='not-measured');
 const count=d.summarizeVisualQualityV754([result]);eq(count.samples,1);
}
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const s of ['bodyV754:bodyAnchors.current','head.leftFoot','head.rightFoot','head.hips','projectBone','if(!enabled'])
 ok(read('components/visualizer/ConcertQualityProbeV466.tsx').includes(s),s);
for(const s of ['<VisualConcertInspectorPanelV754/>','<RealConcertBenchmarkPanelV753/>'])
 ok(read('components/visualizer/ConcertQualityDashboardV751.tsx').includes(s),s);
for(const s of ['assessVisualQualityV754','appendVisualQualityV754','setHistory([])','Nicht gemessen','V751_OPEN_RENDER_QA_EVENT'])
 ok(read('components/visualizer/VisualConcertInspectorPanelV754.tsx').includes(s),s);
ok(!read('components/visualizer/visualQualityInspectorV754.ts').includes('localStorage'));
ok(!read('components/visualizer/VisualConcertInspectorPanelV754.tsx').includes('setPerformanceMode'));
ok(!read('components/visualizer/VisualConcertInspectorPanelV754.tsx').includes('canvas.getContext'));
console.log(`PASS V754 Visual Concert Quality Inspector: ${checks.toLocaleString('en-US')} assertions`);

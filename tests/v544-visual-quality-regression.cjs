'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {captureLiveConcertV544:capture,analyzeCaptureV544:analyze,compareConcertCapturesV544:compare,
 createComparisonReportV544:report}=load('services/show/liveConcertComparisonV544');
const base=1730000100000;
const canvas={x:20,y:40,width:1000,height:600};
const make=(n=2,override={})=>({at:base,canvas,lyrics:{x:420,y:480,width:300,height:120},
 avatars:Array.from({length:n},(_,i)=>({slot:i,x:250+i*400,y:230,inFront:true,anchor:'head-bone',loaded:true})),
 fps:60,p95FrameMs:18,samples:90,qualityTier:'balanced',...override});
assert.equal(capture(make(),base+4000),null,'stale sample must not be captured');
assert.equal(capture(make(),base-1),null,'time travel must not be captured');
assert.equal(capture(make(0),base+500),null,'empty avatars should not become a real show');
assert.equal(capture(make(5),base+500),null,'unsupported actor counts cannot be captured');
assert.equal(capture(make(2,{canvas:{...canvas,width:0}}),base+500),null);
const a=capture(make(),base+250);
assert(a && a.source==='live-webgl-head-projection');
assert.equal(a.heads[0].x,.23);assert.equal(a.heads[0].y,190/600);
assert.equal(a.lyrics.x,.4);assert.equal(a.lyrics.width,.3);
assert.equal(analyze(a).grade,'watch','manual review is intentionally required');
assert.equal(analyze(a).nearEdge,0);
assert.equal(analyze(a).nearLyrics,0);
const yes={footwork:'good',faces:'good',lyrics:'good'};
const checked={...a,review:yes};
assert.equal(analyze(checked).grade,'good');
const headOccluded=capture(make(2,{avatars:[{slot:0,x:450,y:530,inFront:true,anchor:'head-bone',loaded:true},{slot:1,x:650,y:230,inFront:true,anchor:'head-bone',loaded:true}]}),base+250);
assert.equal(analyze(headOccluded).nearLyrics,1);
assert.equal(analyze({...headOccluded,review:yes}).grade,'watch');
const nearEdge=capture(make(2,{avatars:[{slot:0,x:40,y:51,inFront:true,anchor:'head-bone',loaded:true},{slot:1,x:650,y:230,inFront:true,anchor:'head-bone',loaded:true}]}),base+250);
assert.equal(analyze(nearEdge).nearEdge,1);
const behind=capture(make(2,{avatars:[{slot:0,x:250,y:230,inFront:false,anchor:'head-bone',loaded:true},{slot:1,x:650,y:230,inFront:true,anchor:'estimated',loaded:true}]}),base+250);
assert.equal(analyze(behind).grade,'watch');assert.equal(analyze(behind).estimated,1);
const missingFps=capture(make(2,{fps:null}),base+250);
assert.equal(analyze({...missingFps,review:yes}).grade,'watch');
const badFps=capture(make(2,{fps:18}),base+250);
assert.equal(analyze({...badFps,review:yes}).grade,'issue');
assert.equal(analyze({...checked,review:{...yes,faces:'issue'}}).grade,'issue');
const b=capture(make(2,{at:base+1200,fps:64,avatars:[{slot:0,x:240,y:230,inFront:true,anchor:'head-bone',loaded:true},{slot:1,x:670,y:230,inFront:true,anchor:'head-bone',loaded:true}]}),base+1300);
assert.equal(compare(a,b).status,'comparable');
assert.equal(compare(a,b).fpsDifference,4);
assert.equal(compare(a,null).status,'waiting');
assert.equal(compare(a,capture(make(3),base+200)).status,'not-comparable');
assert.equal(compare(a,capture(make(2,{canvas:{...canvas,height:280}}),base+200)).status,'not-comparable');
const partiallyOutside=capture(make(2,{lyrics:{x:-20,y:490,width:200,height:150}}),base+250);
assert.equal(partiallyOutside.lyrics.x,0);
assert.equal(partiallyOutside.lyrics.width,.16,'clipped rect width should match viewport');
const doc=report(checked,b);
assert.equal(doc.captureA.review.footwork,'good');assert.equal(doc.comparison.status,'comparable');
assert(doc.limitations.some(x=>/no screenshot/i.test(x)));
for(const file of ['components/visualizer/ConcertQualityInspectorV466.tsx','components/visualizer/ConcertVisualCompareV544.tsx']){
 const content=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 assert.match(content,/ConcertVisualCompareV544|captureLiveConcertV544/);
}
let checks=0;
for(const n of [1,2,3,4])for(const fps of [null,16,27,40,48,60])
 for(const edge of [0,1,2,3])for(const lyrics of [null,{x:25,y:55,width:400,height:180}]){
  const items=Array.from({length:n},(_,i)=>({slot:i,x:edge?22+i*30:120+i*190,y:200,inFront:true,anchor:'head-bone',loaded:true}));
  const c=capture(make(n,{fps,lyrics,avatars:items}),base+500);
  assert(c);
  const evalResult=analyze({...c,review:yes});
  assert(['good','watch','issue'].includes(evalResult.grade));
  assert(evalResult.visible<=n&&evalResult.nearEdge<=n&&evalResult.nearLyrics<=n);
  checks++;
 }
console.log(`PASS V544 real-projection A/B capture and safeguards: ${checks} deterministic fixtures + edge cases (not FPS/video measurements)`);

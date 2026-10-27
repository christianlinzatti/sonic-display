require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {assessConcertQualityV466:assess}=load('services/show/concertQualityInspectorV466');
const viewport={x:10,y:20,width:1000,height:600};
const rect={x:720,y:140,width:250,height:290};
const make=(patch={})=>assess({canvas:viewport,lyrics:rect,
 avatars:[{slot:0,x:380,y:210,inFront:true,anchor:'head-bone'},
          {slot:1,x:580,y:230,inFront:true,anchor:'estimated'}],fps:59,fpsFresh:true,...patch});
const clean=make();
assert.deepEqual(clean.warnings,[]);assert.equal(clean.fps,'ok');assert.equal(clean.headVisibility,'ok');assert.equal(clean.lyrics,'ok');
assert.equal(clean.headsInFrame,2);assert.equal(clean.headsNearLyrics,0);
assert.equal(clean.method,'head-projection-and-dom-rectangles');
assert.equal(make({fps:42}).fps,'watch');assert.equal(make({fps:22}).fps,'issue');
assert.equal(make({fps:NaN}).fps,'unavailable');assert.equal(make({fps:59,fpsFresh:false}).fps,'unavailable');
assert.equal(make({fps:0}).fps,'unavailable');
const overlapping=make({avatars:[{slot:0,x:790,y:200,inFront:true,anchor:'head-bone'}]});
assert.equal(overlapping.lyrics,'watch');assert.equal(overlapping.headsNearLyrics,1);
assert(overlapping.warnings.some(w=>w.includes('Lyrics-Bereich')));
const back=make({avatars:[{slot:0,x:400,y:200,inFront:false,anchor:'head-bone'}]});
assert.equal(back.headsInFrame,0);assert.equal(back.headVisibility,'issue');
assert.equal(make({avatars:[{slot:0,x:-20,y:200,inFront:true,anchor:'head-bone'}]}).headVisibility,'issue');
assert.equal(make({avatars:[]}).headVisibility,'unavailable');
const missing=make({avatars:[{slot:0,x:0,y:0,inFront:false,anchor:'estimated',loaded:false}]});
assert.equal(missing.headVisibility,'issue');
assert(missing.warnings.some(w=>w.includes('noch nicht als Mesh geladen')));
assert.equal(make({lyrics:null}).lyrics,'unavailable');
assert.equal(make({lyrics:{x:1000,y:1000,width:100,height:100}}).lyrics,'unavailable');
assert.equal(make({lyrics:{x:700,y:140,width:400,height:300}}).lyrics,'watch');
assert.equal(make({canvas:{...viewport,width:0}}).headVisibility,'issue');
const many=Array.from({length:10},(_,slot)=>({slot,x:250,y:220,inFront:true,anchor:'estimated'}));
assert.equal(make({avatars:many}).activeAvatarCount,4,'inspector max 4 performers');
assert.deepEqual(make(),make(),'deterministic assessment');

// Repeated ~30-minute input does not accumulate state or leak warnings.
for(let second=0;second<1800;second++) {
 const avatars=Array.from({length:1+second%4},(_,slot)=>({slot,x:150+slot*165,y:180,inFront:second%90!==0,anchor:slot%2?'estimated':'head-bone'}));
 const a=make({avatars,fps:second%45===0?19:58});
 assert(a.warnings.length<=4,'bounded warnings');
 assert(a.activeAvatarCount<=4);
 assert.deepEqual(a,make({avatars,fps:second%45===0?19:58}));
}
const read=f=>fs.readFileSync(f,'utf8');
const stage=read('components/visualizer/ThreeAvatar.tsx');
const probe=read('components/visualizer/ConcertQualityProbeV466.tsx');
const hud=read('components/visualizer/ConcertQualityInspectorV466.tsx');
const store=read('components/visualizer/concertQualityStoreV466.ts');
const css=read('app/globals.css');
assert(stage.includes('{qualityInspectorEnabledV466&&<ConcertQualityProbeV466 enabled />}'),'probe opt-in only');
assert(stage.includes('<ConcertQualityInspectorV466 enabled={qualityInspectorEnabledV466}'),'live HUD mounted in stage');
assert(probe.includes('scene.getObjectByName(TRACKING_ROOT_NAME)'),'real runtime scene used');
assert(probe.includes('getWorldPosition(point.current)'),'3D head position from actual live object');
assert(probe.includes('point.current.project(camera)'),'actual camera projection used');
assert(probe.includes('getBoundingClientRect()'),'DOM geometry rather than hardcoded lyric box');
assert(probe.includes('getRenderMetricsSnapshot()'),'reuse existing FPS stats');
assert(probe.includes("head-bone")===false || probe.includes('headAnchor'),'mark estimates');
assert(hud.includes('Kopfprojektion ≠ sichtbares Gesicht'),'truthful limitation label');
assert(hud.includes('aria-pressed={enabled}'),'accessible toggle');
assert(store.includes('useSyncExternalStore')&&store.includes('resetConcertQualityV466'));
assert(css.includes('.v466-quality-toggle'));
assert(!/setInterval|setTimeout|localStorage|fetch\(|requestAnimationFrame|Math\.random/.test(probe+store),'no new timers, storage or transport');
const p=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(p.version) && Number(p.version.match(/v(\d+)$/)?.[1])>=466,'V466 quality regression kept in later releases');
console.log('PASS V466: real renderer wiring, opt-in projection, head-bone/estimated distinction, true DOM lyrics geometry, FPS/stale thresholds, no fabricated visibility or GPU data, 30-minute deterministic logic');

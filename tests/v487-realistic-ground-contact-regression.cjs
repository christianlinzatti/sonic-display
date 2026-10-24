require('./helpers/threeAvatarSourcesV492.cjs').install();
"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {assessGroundContactV487:assess,buildGroundContactReportV487:build,emptyGroundObservationV487:empty}=load('components/visualizer/groundContactStudioV487');
const footwork={offsetX:.04,offsetZ:-.06,liftLeft:0,liftRight:0,rootSpeed:.12,weightShift:0};
const fixed={...empty(),tracked:true,leftPlanted:true,rightPlanted:true,leftConfidence:.94,rightConfidence:.8};
assert.equal(assess(empty(),footwork).status,'unavailable');
assert.equal(assess(fixed,footwork).status,'stable');
assert.equal(assess(fixed,footwork).travelMultiplier,1,'no additional slowdown when stable');
assert.equal(assess({...fixed,leftDriftCm:2},footwork).status,'watch');
assert.equal(assess({...fixed,leftDriftCm:2},footwork).travelMultiplier,.65);
assert.equal(assess({...fixed,rightDriftCm:7},footwork).status,'drifting');
assert.equal(assess({...fixed,rightDriftCm:7},footwork).travelMultiplier,.32);
assert.equal(assess({...fixed,rightDriftCm:7},{...footwork,offsetX:0,offsetZ:0}).travelMultiplier,1,'source formation never slowed');
assert.equal(assess({...fixed,rightDriftCm:7},footwork,false).status,'unavailable','paused or reduced motion disables observation');
assert.equal(assess({...fixed,leftConfidence:.2,rightConfidence:.1,leftDriftCm:30},footwork).status,'airborne','low-confidence anchors do not count');
const airborne={...fixed,leftPlanted:false,rightPlanted:false,leftDriftCm:99};
assert.equal(assess(airborne,footwork).status,'airborne');
assert.equal(assess({...fixed,rightPlanted:false,leftDriftCm:3,rightDriftCm:99},footwork).driftCm,3,'unplanted foot cannot claim drift');
assert.equal(assess({...fixed,leftDriftCm:NaN,rightDriftCm:Infinity},footwork).driftCm,0,'nonfinite observations are bounded');
const reports=[empty(),fixed,{...fixed,rightDriftCm:5},airborne];
const report=build(reports,Array.from({length:4},()=>footwork),4);
assert.equal(report.slots.length,4);
assert.equal(report.count,4);
assert.equal(report.slots[0].status,'unavailable');
assert.equal(report.slots[2].status,'drifting');
assert.equal(build(reports,[footwork],25).slots.length,4);
assert.equal(build(reports,[footwork],-1).slots.length,0);
assert.equal(build(reports,[footwork],4,false).active,false);
const src=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/GroundContactPanelV487.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/StageDirectorControlsV287.tsx','utf8');
for(const marker of ['GroupGroundObservationContextV487.Provider','groundV487.current.map',
 'leg.contact.plantedX','leg.contact.plantedZ','leg.ankle.getWorldPosition(groundProbeV487.current)',
 'groundTravelV487[i]??1','GROUND_CONTACT_REPORT_EVENT_V487','buildGroundContactReportV487(']){
 assert(src.includes(marker),`missing live IK observation: ${marker}`);
}
assert.equal((src.match(/useFrame\(/g)||[]).length,(fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8').match(/useFrame\(/g)||[]).length);
assert(studio.includes('<GroundContactStudioV487 />'),'UI integrated into stage director');
assert(ui.includes('report.slots.map')&&ui.includes('Anzeige zurücksetzen'));
assert(ui.includes('kein')||ui.includes('Keine')||ui.includes('keine'));
const pure=fs.readFileSync('components/visualizer/groundContactStudioV487.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Date\.now|Math\.random|localStorage)\b/.test(pure+ui));
// Bounded long-running deterministic mixed-contact simulation + no contact fabrication.
for(let t=0;t<120000;t++){
 const drift=t%290<130?(t%11)/10:(t%19)/2;
 const active=t%251!==0;
 const sample={...fixed,tracked:active,leftDriftCm:drift,rightDriftCm:drift/2};
 const result=assess(sample,footwork);
 assert(result.travelMultiplier>=.32&&result.travelMultiplier<=1);
 if(!active)assert.equal(result.status,'unavailable');
 if(t%3300===0)assert.deepEqual(assess(sample,footwork),result);
}
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=487);
assert(pkg.scripts['build:preflight'].includes('npm run test:v487 && npm run test:v487:types'));
console.log('PASS V487: real IK anchor drift estimates, contact confidence, slot diagnosis, only optional travel damping, 33-minute guard test and UI wiring');

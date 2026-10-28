"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {auditFullConcertV641:audit}=require('./helpers/ts-loader-v404.cjs').load('components/visualizer/fullConcertQualityAuditV641');
const {readProfile,compareProfiles}=require('../scripts/v641-full-concert-compare.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'v641-compare-'));
let tests=0;const test=(name,fn)=>{try{fn();tests++;}catch(e){e.message=`V641 compare ${name}: ${e.message}`;throw e;}};
const observation=(i,count,trackId='song-a')=>({trackId,durationMs:120000,progressMs:i*1000,observedAt:1_790_000_000_000+i*1000,
 avatarCount:count,headsInFrame:count,verifiedGlbActors:count,fps:60-count*2,p95FrameMs:17+count,drawCalls:100+count*30,triangles:200000+count*100000,
 lyrics:'ok',headVisibility:'ok',chapter:'verse',shot:i<30?'wide':'lead',motif:'ambient',focus:'0'});
function profile(count,changes={}){const observations=Array.from({length:120},(_,i)=>observation(i,count,changes.trackId));
 const report={...audit(observations),observations,recordingMode:'manually-started-browser-qa',...changes};
 const location=path.join(dir,`profile-${count}-${fs.readdirSync(dir).length}.json`);fs.writeFileSync(location,JSON.stringify(report));return location;
}
try{
 const a=profile(1),b=profile(2),c=profile(4),all={avatar1:a,avatar2:b,avatar4:c};
 test('one profile measured and two missing',()=>{const r=compareProfiles({avatar1:a});assert.equal(r.status,'incomplete-evidence');assert.equal(r.profiles[1].status,'missing');});
 test('all broad measurements still require human review',()=>{const r=compareProfiles(all);assert.equal(r.status,'broad-measurement-coverage-needs-human-review');assert.equal(r.visualQualityApproved,false);assert.equal(r.hardwareSuitabilityCertified,false);});
 test('three different avatar counts compared',()=>assert.deepEqual(compareProfiles(all).profiles.map(x=>x.avatarCount),[1,2,4]));
 test('median FPS is actual profile measurement',()=>assert.deepEqual(compareProfiles(all).profiles.map(x=>x.metrics.medianFps),[58,56,52]));
 test('draw calls are measured',()=>assert.deepEqual(compareProfiles(all).profiles.map(x=>x.metrics.medianDrawCalls),[130,160,220]));
 test('p95 results measured',()=>assert.deepEqual(compareProfiles(all).profiles.map(x=>x.metrics.medianP95Ms),[18,19,21]));
 test('triangles measured',()=>assert.deepEqual(compareProfiles(all).profiles.map(x=>x.metrics.medianTriangles),[300000,400000,600000]));
 test('different songs cannot be compared',()=>assert.throws(()=>compareProfiles({...all,avatar4:profile(4,{trackId:'other-song'})}),/same song/));
 test('forged approval blocked',()=>assert.throws(()=>readProfile(profile(2,{automaticallyApproved:true}),2),/invalid/));
 test('wrong count blocked',()=>assert.throws(()=>readProfile(a,4),/slot count/));
 test('unverified GLB measurements blocked',()=>{const file=profile(2);const data=JSON.parse(fs.readFileSync(file));data.observations.forEach(x=>x.verifiedGlbActors=null);fs.writeFileSync(file,JSON.stringify({...data,...audit(data.observations)}));assert.throws(()=>readProfile(file,2),/GLB meshes/);});
 test('replaced timestamp blocked',()=>{const file=profile(2),data=JSON.parse(fs.readFileSync(file));data.observations[10].observedAt=-1;fs.writeFileSync(file,JSON.stringify(data));assert.throws(()=>readProfile(file,2),/invalid/);});
 test('bogus coverage rejected',()=>assert.throws(()=>readProfile(profile(2,{coveragePercent:100}),2),/inconsistent/));
 test('bogus report format rejected',()=>assert.throws(()=>readProfile(profile(2,{format:'synthetic'}),2),/invalid/));
 test('no video or automatic visual pass in comparator source',()=>{const s=fs.readFileSync('scripts/v641-full-concert-compare.cjs','utf8');assert(!s.includes('new WebGLRenderer('));assert(s.includes('visualQualityApproved:false'));});
 test('report never contains Spotify lyrics',()=>assert(!JSON.stringify(compareProfiles(all)).includes('lyricsText')));
 test('local CLI does not use network',()=>{const s=fs.readFileSync('scripts/v641-full-concert-compare.cjs','utf8');assert(!s.includes('fetch('));assert(!s.includes('https.request('));});
}finally{fs.rmSync(dir,{recursive:true,force:true});}
console.log(`PASS V641 compare: ${tests} regression groups`);

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {GATES,localUrl,assessV695,parseV695Options,inspectAssetEvidence,inspectLiveV695,runV695}=require('../scripts/v695-release-quality-gate.cjs');
const root=path.resolve(__dirname,'..');let count=0,combos=0;
function test(label,fn){try{fn();count++;}catch(e){e.message=`V695 ${label}: ${e.message}`;throw e;}}
const evidence=(status='passed')=>Object.fromEntries(GATES.map(id=>[id,{status:id==='visual-review'?'manual-required':status,detail:'Gültige Prüfnotiz',source:'test'}]));
const dummy=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v695-qa-'));
try{
 test('8 required gates stable',()=>assert.deepEqual(GATES,['lockfile','dependencies','typescript','next-build','qa-browser','webgl','glb-live','visual-review']));
 test('all seven automatic gates only require human review',()=>{const r=assessV695(evidence());assert.equal(r.status,'needs-human-review');assert.equal(r.approved,false);assert.equal(r.passCount,7);});
 test('visual approval never automatic',()=>assert.equal(assessV695(evidence()).humanReviewRequired,true));
 test('all failed result blocked',()=>{const r=assessV695(evidence('failed'));assert.equal(r.status,'blocked');assert.equal(r.passCount,0);});
 for(const id of GATES.slice(0,7))test(`absent ${id} blocks`,()=>{const e=evidence();delete e[id];const r=assessV695(e);assert.equal(r.status,'blocked');assert.equal(r.gates.find(x=>x.id===id).status,'not-run');});
 for(const state of ['blocked','not-run','failed'])test(`${state} never grants release`,()=>{const v=evidence();v.webgl.status=state;assert.equal(assessV695(v).status,'blocked');});
 test('invented magic success status rejected',()=>{const v=evidence();v.webgl.status='approved';assert.throws(()=>assessV695(v));});
 test('cannot silently omit manual review',()=>{const e=evidence();delete e['visual-review'];assert.equal(assessV695(e).humanReviewRequired,true);});
 test('localhost http accepted',()=>assert(localUrl('http://localhost:3000')));
 test('127.0.0.1 accepted',()=>assert(localUrl('http://127.0.0.1:3000/')));
 test('IPv6 loopback accepted',()=>assert(localUrl('http://[::1]:3000')));
 for(const bad of ['https://evil.example','http://127.0.0.2:3000','http://example.org@localhost:3000/','file:///tmp/foo','javascript:alert(1)','http://localhost:3000/#x','https://localhost@evil.test','not-a-url'])test(`unsafe URL rejected ${bad}`,()=>assert(!localUrl(bad)));
 test('bad CLI argument rejected',()=>assert.throws(()=>parseV695Options(['--bogus'])));
 test('unsafe CLI destination rejected',()=>assert.throws(()=>parseV695Options(['--out='])));
 test('unsafe CLI URL rejected',()=>assert.throws(()=>parseV695Options(['--url=http://evil.example'])));
 test('normal CLI parsed',()=>{const opts=parseV695Options(['--url=http://127.0.0.1:3000','--live-report=artifacts/a.json']);assert.equal(opts.liveReport,'artifacts/a.json');});
 test('model inventory is not live proof',()=>{const a=inspectAssetEvidence(root);assert(Array.isArray(a.files));assert(!a.detail.includes('Live-GLB nachgewiesen'));});
 test('no V592 report blocks',()=>assert.equal(inspectLiveV695(dummy,null).status,'blocked'));
 test('external proof file refused',()=>assert.equal(inspectLiveV695(dummy,'../outside.json').status,'failed'));
 test('missing proof file refused',()=>assert.equal(inspectLiveV695(dummy,'report.json').status,'failed'));
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(160)]);
 fs.writeFileSync(path.join(dummy,'live-00.png'),png);fs.writeFileSync(path.join(dummy,'live-01.png'),png);
 const report={format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',source:'actual-spotify-visualizer-stage',
  mode:'existing-local-chromium',modelCount:2,sourceTrack:'track-from-real-spotify',frameTiming:{status:'measured'},progressMs:16000,
  capturedAt:'2026-10-29T08:00:00Z',screenshots:[{file:'live-00.png',actors:2},{file:'live-01.png',actors:2}]};
 const now=Date.parse('2026-10-29T09:00:00Z');const put=r=>fs.writeFileSync(path.join(dummy,'report.json'),JSON.stringify(r));
 put(report);
 test('V592 measured bundle can be recognized as submitted evidence only',()=>{const r=inspectLiveV695(dummy,'report.json',now);assert.equal(r.status,'passed');assert(!/approved|freigegeben/i.test(r.detail));});
 test('fixture report never substitutes app',()=>{put({...report,source:'test-fixture'});assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');put(report);});
 test('reported blocked status refused',()=>{put({...report,status:'blocked'});assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');put(report);});
 test('without screenshots refused',()=>{put({...report,screenshots:[]});assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');put(report);});
 test('fake model count refused',()=>{put({...report,modelCount:0});assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');put(report);});
 test('stale evidence rejected',()=>assert.equal(inspectLiveV695(dummy,'report.json',now+172800000).status,'failed'));
 test('future evidence rejected',()=>assert.equal(inspectLiveV695(dummy,'report.json',now-7200000).status,'failed'));
 test('traversal screenshots rejected',()=>{put({...report,screenshots:[{file:'../../else.png',actors:2},report.screenshots[1]]});assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');put(report);});
 test('broken PNG signature refused',()=>{fs.writeFileSync(path.join(dummy,'live-00.png'),Buffer.alloc(256));assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');fs.writeFileSync(path.join(dummy,'live-00.png'),png);});
 test('missing screenshot refused',()=>{fs.renameSync(path.join(dummy,'live-00.png'),path.join(dummy,'temp.png'));assert.equal(inspectLiveV695(dummy,'report.json',now).status,'failed');fs.renameSync(path.join(dummy,'temp.png'),path.join(dummy,'live-00.png'));});
 test('fixture environment no lock or packages blocks true build',()=>{fs.writeFileSync(path.join(dummy,'package.json'),JSON.stringify({name:'sonic-test',version:'0.1.0-v695',dependencies:{missing:'^1.0.0'},scripts:{}}));
  const result=runV695(dummy,{url:null,liveReport:null});assert.equal(result.status,'blocked');assert.equal(result.gates.find(x=>x.id==='typescript').status,'blocked');
  assert.equal(result.gates.find(x=>x.id==='next-build').status,'blocked');});
 test('browser script does not use user profile or Spotify cookies',()=>{const s=fs.readFileSync(path.join(root,'scripts/v695-browser-qa-smoke.cjs'),'utf8');assert(s.includes('mkdtempSync'));assert(s.includes('--user-data-dir=')&&!s.includes('userDataDir:process.env'));});
 test('fixture browser evidence never promoted',()=>{const s=fs.readFileSync(path.join(root,'scripts/v695-release-quality-gate.cjs'),'utf8');assert(s.includes("report.kind==='application'"));});
 test('browser checks actual QA, storage, WebGL',()=>{const s=fs.readFileSync(path.join(root,'scripts/v695-browser-qa-smoke.cjs'),'utf8');
  for(const v of ['.v466-quality-toggle','[data-v641-recorder]','.v694-quality-history','.v694-saved-tasks','getContext(\'webgl2\')','Page.captureScreenshot','Page.navigate'])assert(s.includes(v),v);});
 test('no invented lyrics and no synthetic GLB in browser',()=>{const s=fs.readFileSync(path.join(root,'scripts/v695-browser-qa-smoke.cjs'),'utf8');assert(!s.includes('spotify_access_token'));assert(!s.includes('fabricated-mesh'));});
 test('legacy V592 real GLB runner included',()=>assert(fs.existsSync(path.join(root,'scripts/v592-live-stage-benchmark.cjs'))));
 test('manual QA still distinct from measured geometry',()=>{const s=fs.readFileSync(path.join(root,'scripts/v695-release-quality-gate.cjs'),'utf8');assert(s.includes('humanReviewRequired:true'));assert(s.includes('moving light beams'));});
 test('blocked external URL rejects without browser or network',()=>{const r=spawnSync(process.execPath,['scripts/v695-browser-qa-smoke.cjs','--url=https://example.org',`--out=${path.join(dummy,'rejected')}`],{cwd:root,encoding:'utf8',timeout:5000});
  assert.notEqual(r.status,0);const j=JSON.parse(fs.readFileSync(path.join(dummy,'rejected.json')));assert.equal(j.kind,'application');assert.equal(j.status,'blocked');});
 test('release CLI with fake project never gives success',()=>{const r=spawnSync(process.execPath,[path.join(root,'scripts/v695-release-quality-gate.cjs'),`--out=${path.join(root,'artifacts/v695/test-cli-report.json')}`],{cwd:root,encoding:'utf8',timeout:10000});assert.notEqual(r.status,0);
  const j=JSON.parse(fs.readFileSync(path.join(root,'artifacts/v695/test-cli-report.json')));assert.equal(j.status,'blocked');assert.equal(j.approved,false);});
 for(let i=0;i<10000;i++){const row=evidence();row[GATES[i%7]].status=['blocked','failed','not-run'][i%3];const r=assessV695(row);assert.equal(r.status,'blocked');assert(!r.approved);combos++;}
 test('10,000 deterministic negative release scenarios',()=>assert.equal(combos,10000));
 test('package release scripts linked',()=>{const p=require('../package.json');assert(/^0\.1\.0-v(?:69[5-9]|[7-9]\d\d)$/.test(p.version));assert(p.scripts['test:quick'].includes('npm run test:v695 &&'));assert(p.scripts['check:release'].includes('npm run test:v695 &&'));});
 console.log(`PASS V695: ${count} tests, ${combos} negative release scenarios`);
}finally{fs.rmSync(dummy,{recursive:true,force:true});}

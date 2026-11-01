'use strict';
// Only synthetic tests; V697 browser dashboard is not a V592 live GLB measurement.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');const ts=require('./typescript-loader.cjs');
const file=path.join(root,'components/visualizer/concertAcceptanceDashboardV697.ts');
const transformed=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
const mod={exports:{}};vm.runInNewContext(transformed.outputText,{exports:mod.exports,module:mod,require,JSON,Date,Set,Number,String,Object,Array,Math}, {filename:'concertAcceptanceDashboardV697.js'});
const c=mod.exports;const cli=require('../scripts/v696-production-concert-acceptance.cjs');
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}};
let groups=0,negative=0;
const copy=x=>JSON.parse(JSON.stringify(x));
const makeCapture=(s,i=0)=>({format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',source:'actual-spotify-visualizer-stage',
 capturedAt:'2026-10-29T10:00:00.000Z',mode:'existing-local-chromium',modelCount:s.actors,minGlb:s.actors,sourceTrack:'song-'+(s.genre==='Deutschrap'?'rap':'tekk'),
 frameTiming:{status:'measured',averageFps:60-s.actors*4,p95FrameMs:18+s.actors,contextLosses:0},screen:{width:1280,height:720},
 screenshots:[0,1,2].map((_,n)=>({file:`live-0${n}.png`,actors:s.actors,progressMs:10000+n*7000,actorBounds:Array.from({length:s.actors},()=>({meshes:2,bounds:{minX:-1,maxX:1,minY:-1,maxY:1}})),sceneEvidence:{act:'verse',shot:'wide'}}))});
test('six canonical profiles',()=>assert.equal(c.V697_SCENARIOS.length,6));
test('profile ids match original V696 CLI',()=>assert.deepEqual(Array.from(c.V697_SCENARIOS.map(s=>s.id)),cli.SCENARIOS.map(s=>s.id)));
test('labels exist for all review checks',()=>{for(const s of c.V697_SCENARIOS)for(const id of c.criteriaV697(s))assert(c.V697_CHECK_LABELS[id],id);});
test('V696 blank review roundtrip',()=>{const initial=cli.blankReview(),normalized=c.decodeReviewV697(initial);assert(normalized);assert.deepEqual(copy(normalized),initial);assert.doesNotThrow(()=>cli.validateReview(normalized));});
test('V697 generated review validates in V696',()=>assert.doesNotThrow(()=>cli.validateReview(c.emptyReviewV697())));
test('new default is not completed',()=>{const p=c.reviewProgressV697(c.emptyReviewV697());assert(!p.complete);assert(p.pending>0);assert(p.readyToExport);});
test('immutable check edit',()=>{const before=c.emptyReviewV697();const after=c.updateCheckV697(before,'rap-solo','glb-and-rig',{status:'pass',note:'Natürliche Bewegung vorhanden',songTimeSec:25});assert.equal(before.scenarios[0].checks[0].status,'pending');assert.equal(after.scenarios[0].checks[0].status,'pass');assert.doesNotThrow(()=>cli.validateReview(after));});
test('incomplete pass disallows export',()=>{const v=c.updateCheckV697(c.emptyReviewV697(),'rap-solo','glb-and-rig',{status:'pass'});assert.equal(c.reviewProgressV697(v).readyToExport,false);assert.throws(()=>cli.validateReview(v));});
test('failed check is still valid review',()=>{const v=c.updateCheckV697(c.emptyReviewV697(),'rap-solo','glb-and-rig',{status:'fail',note:'Starkes Fußrutschen im Bild',songTimeSec:40});assert.equal(c.reviewProgressV697(v).failed,1);assert.doesNotThrow(()=>cli.validateReview(v));});
test('no auto approval fields',()=>{const r=c.emptyReviewV697();assert.equal(r.approved,undefined);assert.equal(r.status,undefined);});
test('malicious extra fields stripped',()=>{const bad={...c.emptyReviewV697(),approved:true,privateToken:'secret'};bad.scenarios[0].checks[0].credential='secret';const r=c.decodeReviewV697(bad);assert(r);assert.equal(JSON.stringify(r).includes('secret'),false);});
test('invalid pending timestamp rejected',()=>{const r=c.emptyReviewV697();r.scenarios[0].checks[0].songTimeSec=-1;assert.equal(c.decodeReviewV697(r),null);});
test('no duplicate scene accepted',()=>{const r=c.emptyReviewV697();r.scenarios[1].id=r.scenarios[0].id;assert.equal(c.decodeReviewV697(r),null);});
test('no extra check accepted',()=>{const r=c.emptyReviewV697();r.scenarios[0].checks[0].id='invented';assert.equal(c.decodeReviewV697(r),null);});
test('import rejects unsupported format',()=>{const r=c.emptyReviewV697();r.schema=99;assert.equal(c.decodeReviewV697(r),null);});
test('extra unknown scene rejected',()=>{const r=c.emptyReviewV697();r.scenarios.push(copy(r.scenarios[0]));assert.equal(c.decodeReviewV697(r),null);});
test('no unbounded notes',()=>{const r=c.emptyReviewV697();r.scenarios[0].checks[0].note='X'.repeat(801);assert.equal(c.decodeReviewV697(r),null);});
test('every scene accepts a syntactically matching preview',()=>{for(const s of c.V697_SCENARIOS){const p=c.previewCaptureV697(makeCapture(s),s.id);assert(p);assert.equal(p.actors,s.actors);assert.equal(p.verified,false);assert.equal(p.moments.length,3);}});
test('mismatch scene report blocked',()=>assert.equal(c.previewCaptureV697(makeCapture(c.V697_SCENARIOS[1]),'rap-solo'),null));
test('untrusted source blocked',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.source='synthetic';assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('missing GLB count blocked',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.minGlb=0;assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('preview refuses fake screenshot paths',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.screenshots[0].file='../x.png';assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('preview refuses duplicate shot',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.screenshots[1].file=r.screenshots[0].file;assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('preview refuses nonascending song progress',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.screenshots[2].progressMs=4000;assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('preview refuses missing FPS',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);delete r.frameTiming.averageFps;assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('preview refuses WebGL context loss',()=>{const r=makeCapture(c.V697_SCENARIOS[0]);r.frameTiming.contextLosses=1;assert.equal(c.previewCaptureV697(r,'rap-solo'),null);});
test('no cross track FPS comparison',()=>{const profiles=c.V697_SCENARIOS.map(s=>c.previewCaptureV697(makeCapture(s),s.id));assert.equal(c.comparablePreviewsV697(profiles,'Deutschrap'),true);profiles[1].trackId='different';assert.equal(c.comparablePreviewsV697(profiles,'Deutschrap'),false);});
test('no cross browser FPS comparison',()=>{const profiles=c.V697_SCENARIOS.map(s=>c.previewCaptureV697(makeCapture(s),s.id));profiles[4].mode='headless-local-chromium';assert.equal(c.comparablePreviewsV697(profiles,'Hardstyle/Hardtekk'),false);});
test('no cross resolution FPS comparison',()=>{const profiles=c.V697_SCENARIOS.map(s=>c.previewCaptureV697(makeCapture(s),s.id));profiles[5].width=1920;assert.equal(c.comparablePreviewsV697(profiles,'Hardstyle/Hardtekk'),false);});
test('missing scenarios cannot be compared',()=>assert.equal(c.comparablePreviewsV697([],'Deutschrap'),false));
test('actual Next route present',()=>{const route=fs.readFileSync(path.join(root,'app/acceptance/page.tsx'),'utf8');assert(route.includes('ConcertAcceptanceDashboardV697'));});
test('accessible from existing QA',()=>{const ui=fs.readFileSync(path.join(root,'components/visualizer/FullConcertQualityAuditPanelV641.tsx'),'utf8');assert(ui.includes('href="/acceptance"'));});
test('client UI does not post private reports',()=>{const ui=fs.readFileSync(path.join(root,'components/visualizer/ConcertAcceptanceDashboardPanelV697.tsx'),'utf8');assert(!/\bfetch\s*\(/.test(ui));assert(!/\bXMLHttpRequest\b/.test(ui));assert(ui.includes('localStorage.setItem'));assert(ui.includes('URL.createObjectURL'));});
test('review is not an automatic production approval',()=>{const ui=fs.readFileSync(path.join(root,'components/visualizer/ConcertAcceptanceDashboardPanelV697.tsx'),'utf8');assert(ui.includes('Produktionsfreigabe weiterhin gesperrt'));assert(ui.includes('audit:v696:collect'));});
test('status is human-only',()=>{const r=c.emptyReviewV697();r.reviewer='Tester';r.device='Windows PC';r.browser='Chrome 155';for(const s of r.scenarios){s.genreConfirmed=true;for(const check of s.checks){check.status='pass';check.note='Echte, direkt geprüfte Szene';check.songTimeSec=34;}}const p=c.reviewProgressV697(r);assert(p.complete);assert(!p.status.includes('freigegeben'));assert(!('approved' in p));});
// 12k randomized invalid or incompatible inputs, distinct from any real capture.
let seed=998244353;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
for(let i=0;i<12000;i++){
 const r=c.emptyReviewV697(),choice=random()%9,idx=random()%6;
 if(choice===0)r.scenarios[idx].id='__proto__';
 else if(choice===1)r.scenarios[idx].checks[0].status='automatically-approved';
 else if(choice===2)r.scenarios[idx].checks.pop();
 else if(choice===3)r.scenarios[idx].checks[0].songTimeSec=Number.POSITIVE_INFINITY;
 else if(choice===4)r.scenarios[idx].checks[0].note='X'.repeat(801);
 else if(choice===5)r.scenarios[idx].genreConfirmed='yes';
 else if(choice===6)r.scenarios[idx].checks[0].id='../../secret';
 else if(choice===7)r.scenarios[idx].checks[1].id=r.scenarios[idx].checks[0].id;
 else r.scenarios.splice(idx,1);
 assert.equal(c.decodeReviewV697(r),null,`failed closed at ${i}`);negative++;
}
test('12,000 malformed review inputs rejected',()=>assert.equal(negative,12000));
console.log(`PASS V697: ${groups} test groups; ${negative} malformed reports rejected; V696 contract checked`);

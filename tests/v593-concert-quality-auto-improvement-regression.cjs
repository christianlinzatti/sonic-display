'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {adviceForLiveReport,overlapInfo,formationOverlapInfo}=require('../scripts/v593-concert-quality-advisor.cjs');
const {renderV593Report}=require('../scripts/v593-concert-quality-report.cjs');
const {generate}=require('../scripts/v593-concert-quality-cli.cjs');
let count=0;
function test(label,fn){try{fn();count++;}catch(e){e.message=`V593 ${label}: ${e.message}`;throw e;}}
const bounds=(minX=-.3,maxX=.3,minY=-.5,maxY=.5)=>({minX,maxX,minY,maxY});
function shot(i,changes={}){return {file:`live-${String(i).padStart(2,'0')}.png`,progressMs:1000+i*3300,actors:2,drawCalls:170,triangles:110000,
 lyricsMode:'dom-overlay',activeIndex:i,coverage:{nonBackgroundFraction:.22},stageRect:{x:0,y:0,width:1280,height:800},
 lyricRect:{x:180,y:580,width:620,height:120},actorBounds:[{meshes:1,bounds:bounds()},{meshes:1,bounds:bounds(.4,.75,-.4,.65)}],warnings:[],...changes};}
function live(changes={}){return {format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',source:'actual-spotify-visualizer-stage',
 sourceTrack:'test-track-placeholder',modelCount:2,progressMs:13200,mode:'existing-local-chromium',minGlb:1,
 frameTiming:{status:'measured',frames:500,averageFps:30,p95FrameMs:31,p99FrameMs:41,contextLosses:0},
 screenshots:[shot(0),shot(1),shot(2),shot(3)],transitions:[],warnings:[],...changes};}
function ids(a){return a.recommendations.map(x=>x.id);}
test('reject missing report, synthetic benchmark family, blocked or insufficient evidence',()=>{
 for(const value of [null,{},live({status:'blocked'}),live({format:'sonic-v591-report'}),live({source:'v591-concert-scene'}),
  live({screenshots:[shot(0)]}),live({sourceTrack:''}),live({modelCount:0}),live({progressMs:0}),live({frameTiming:{status:'insufficient-data'}}),
  live({screenshots:[shot(0),shot(1,{actors:0})]})]){
  const result=adviceForLiveReport(value);assert.equal(result.status,'blocked');assert.deepEqual(result.recommendations,[]);
 }
});
test('no warning never means visual approval',()=>{
 const a=adviceForLiveReport(live());assert.equal(a.status,'advice-needs-human-review');assert.deepEqual(a.recommendations,[]);
 assert.equal(a.humanReviewRequired,true);assert.equal(a.autoApplied,false);
 assert(a.limitations.some(x=>x.includes('artistic quality')));
});
test('repeated camera clipping recommends manually safer framing, not actual camera change',()=>{
 const shots=[shot(0,{actorBounds:[{meshes:1,bounds:bounds(-1.15,.6)}],warnings:['Avatar 1: Avatar möglicherweise angeschnitten']}),
  shot(1,{actorBounds:[{meshes:1,bounds:bounds(-1.12,.45)}]}),shot(2),shot(3)];
 const a=adviceForLiveReport(live({screenshots:shots}));assert(ids(a).includes('camera-clipping'));
 const rec=a.recommendations.find(r=>r.id==='camera-clipping');assert.equal(rec.priority,'high');assert.equal(rec.preview.factor,1.08);
 assert.deepEqual(rec.evidence.screenshotIndices,[1,2]);assert.equal(rec.status,'suggested-not-applied');
});
test('repeated undersized performer separated from clipping and contradictory zoom hints',()=>{
 const b=bounds(-.02,.02,-.08,.08),s=[shot(0,{actorBounds:[{meshes:1,bounds:b}]}),shot(1,{actorBounds:[{meshes:1,bounds:b}]}),shot(2),shot(3)];
 const a=adviceForLiveReport(live({screenshots:s}));assert(ids(a).includes('camera-small-avatar'));assert(!ids(a).includes('camera-clipping'));
 assert(a.recommendations[0].safeguards.includes('camera-clipping'));
});
test('one-off warnings do not trigger spurious camera/lyrics recommendations',()=>{
 const shots=[shot(0,{warnings:['Avatar 1: Avatar möglicherweise angeschnitten','Lyrics nicht als synchronisiert bestätigt']}),shot(1),shot(2),shot(3)];
 assert.deepEqual(ids(adviceForLiveReport(live({screenshots:shots}))),[]);
});
test('true small DOM lyrics rectangle can overlap actual measured actor projection',()=>{
 const s=shot(0,{lyricRect:{x:450,y:310,width:200,height:95}});
 assert.equal(overlapInfo(s).state,'measured');assert(overlapInfo(s).fraction>.08);
 const a=adviceForLiveReport(live({screenshots:[s,shot(1,{lyricRect:s.lyricRect}),shot(2),shot(3)]}));
 assert(ids(a).includes('lyrics-overlap'));
});
test('full-screen transparent DOM overlay must NOT be called text collision',()=>{
 const giant={x:0,y:0,width:1280,height:800};
 const shots=[0,1,2,3].map(i=>shot(i,{lyricRect:giant}));
 const a=adviceForLiveReport(live({screenshots:shots}));assert(!ids(a).includes('lyrics-overlap'));
 assert.equal(a.unmeasurableLyricFrames,4);assert.equal(overlapInfo(shots[0]).state,'inconclusive-overlay');
});
test('missing lyrics geometry never causes false overlap',()=>{
 const a=adviceForLiveReport(live({screenshots:[0,1,2,3].map(i=>shot(i,{lyricRect:null,stageRect:null}))}));
 assert(!ids(a).includes('lyrics-overlap'));assert.equal(a.unmeasurableLyricFrames,4);
});
test('repeated projected overlap across two GLB actors flags possible formation collision',()=>{
 const close=[{meshes:1,bounds:bounds(-.4,.4,-.6,.6)},{meshes:1,bounds:bounds(-.3,.5,-.5,.7)}];
 const s=[shot(0,{actorBounds:close}),shot(1,{actorBounds:close}),shot(2),shot(3)];
 const a=adviceForLiveReport(live({screenshots:s}));
 assert(formationOverlapInfo(s[0]).fraction>.45);
 assert(ids(a).includes('avatar-formation-overlap'));
 assert(a.recommendations.find(r=>r.id==='avatar-formation-overlap').safeguards.includes('Keine automatische Avatar-Verschiebung'));
 assert(!ids(adviceForLiveReport(live({screenshots:[shot(0,{actorBounds:close}),shot(1),shot(2),shot(3)]}))).includes('avatar-formation-overlap'));
});
test('unsynchronized lyrics are source warning, never invented timestamps',()=>{
 const shots=[shot(0,{warnings:['Lyrics nicht als synchronisiert bestätigt']}),shot(1,{warnings:['Lyrics nicht als synchronisiert bestätigt']}),shot(2),shot(3)];
 const a=adviceForLiveReport(live({screenshots:shots}));assert(ids(a).includes('lyrics-sync-evidence'));
 assert(a.recommendations.find(r=>r.id==='lyrics-sync-evidence').safeguards.includes('Quellenbeleg'));
});
test('measured frame pacing uses safe threshold and no guessed Pi performance gain',()=>{
 const a=adviceForLiveReport(live({frameTiming:{status:'measured',frames:300,averageFps:23.3,p95FrameMs:49,p99FrameMs:72}}));
 assert(ids(a).includes('performance-frame-pacing'));
 const recommendation=a.recommendations.find(r=>r.id==='performance-frame-pacing');
 assert.equal(recommendation.confidence,'measured-browser-raf-only');assert.equal(recommendation.preview.suggestedStepPercent,15);
 assert(recommendation.safeguards.includes('keine GPU-/Pi-Messung'));assert.equal(a.autoApplied,false);
 for(const fps of [27,30,45]){
  const good=adviceForLiveReport(live({frameTiming:{status:'measured',frames:450,averageFps:fps,p95FrameMs:40,p99FrameMs:44}}));
  assert(!ids(good).includes('performance-frame-pacing'));
 }
});
test('high draw-call and triangle heuristics require repeated evidence',()=>{
 const heavy=(i)=>shot(i,{drawCalls:500,triangles:780000});
 assert(ids(adviceForLiveReport(live({screenshots:[heavy(0),heavy(1),shot(2),shot(3)]}))).includes('scene-render-budget'));
 assert(!ids(adviceForLiveReport(live({screenshots:[heavy(0),shot(1),shot(2),shot(3)]}))).includes('scene-render-budget'));
});
test('low screen coverage is flagged cautiously and not classified visually failed',()=>{
 const shots=[shot(0,{coverage:{nonBackgroundFraction:.002}}),shot(1,{coverage:{nonBackgroundFraction:.005}}),shot(2),shot(3)];
 const a=adviceForLiveReport(live({screenshots:shots}));assert(ids(a).includes('scene-low-coverage'));
 assert.equal(a.humanReviewRequired,true);
});
test('recommendations preserve exact source indices and ordered priorities',()=>{
 const s=[0,1,2,3].map(i=>shot(i,{warnings:['Avatar möglicherweise angeschnitten'],drawCalls:500,triangles:800000}));
 const a=adviceForLiveReport(live({screenshots:s,frameTiming:{status:'measured',frames:250,averageFps:20,p95FrameMs:50,p99FrameMs:80}}));
 assert(a.recommendations.length>=2);assert.equal(a.recommendations[0].priority,'high');
 for(const rec of a.recommendations)assert(rec.evidence.screenshotIndices.every(i=>i>=1&&i<=4));
});
test('XSS escape all user-controlled warning text and HTML fields',()=>{
 const s=shot(0,{warnings:['<svg onload=alert(1)>']});
 const report=live({screenshots:[s,{...s,file:'live-01.png',progressMs:4000}]});
 const a=adviceForLiveReport(report);const html=renderV593Report(report,a);
 assert(html.includes('&lt;svg'));assert(!html.includes('<svg onload='));
 assert(html.includes('V593'));assert(html.includes('report-v593'));
});
test('HTML cannot be produced from blocked or fake report',()=>{
 const report=live(),a=adviceForLiveReport(report);
 assert.throws(()=>renderV593Report({...report,status:'blocked'},a));
 assert.throws(()=>renderV593Report(report,{...a,autoApplied:true}));
});
test('offline generator writes no files on blocked reports and only the expected two reports on measured',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v593-test-'));
 try{
  assert.equal(generate({status:'blocked'},out).status,'blocked');assert.deepEqual(fs.readdirSync(out),[]);
  const report=live();const a=generate(report,out);assert.equal(a.status,'advice-needs-human-review');
  assert.deepEqual(fs.readdirSync(out).sort(),['advice-v593.json','report-v593.html']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(out,'advice-v593.json'),'utf8')).autoApplied,false);
 }finally{fs.rmSync(out,{force:true,recursive:true});}
});
test('CLI refuses blocked or non-local JSON and exits nonzero without HTML',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v593-test-'));
 try{const reportFile=path.join(out,'report.json');fs.writeFileSync(reportFile,JSON.stringify({status:'blocked'}));
  const result=spawnSync(process.execPath,['scripts/v593-concert-quality-cli.cjs',`--report=${reportFile}`,`--out=${out}`],{cwd:process.cwd(),encoding:'utf8',timeout:5000});
  assert.notEqual(result.status,0);assert(!fs.existsSync(path.join(out,'report-v593.html')));
 }finally{fs.rmSync(out,{force:true,recursive:true});}
});
test('CLI can re-process existing REAL-report-shaped fixture without browser or credentials',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v593-test-'));
 try{const reportFile=path.join(out,'report.json');fs.writeFileSync(reportFile,JSON.stringify(live()));
  const result=spawnSync(process.execPath,['scripts/v593-concert-quality-cli.cjs',`--report=${reportFile}`,`--out=${out}`],{cwd:process.cwd(),encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stderr);assert(fs.existsSync(path.join(out,'report-v593.html')));
 }finally{fs.rmSync(out,{force:true,recursive:true});}
});
test('separate output folder keeps relative links to original local screenshots',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v593-path-test-'));
 try{
  const source=path.join(root,'captures'),dest=path.join(root,'review');fs.mkdirSync(source);
  const reportFile=path.join(source,'report.json');fs.writeFileSync(reportFile,JSON.stringify(live()));
  const result=spawnSync(process.execPath,['scripts/v593-concert-quality-cli.cjs',`--report=${reportFile}`,`--out=${dest}`],{cwd:process.cwd(),encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stderr);
  const html=fs.readFileSync(path.join(dest,'report-v593.html'),'utf8');
  assert(html.includes('../captures/live-00.png'));assert(!html.includes('undefined'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('V592 browser captures real actor, DOM lyrics geometry and only then generates V593 report',()=>{
 const src=fs.readFileSync('scripts/v592-live-stage-benchmark.cjs','utf8');
 for(const marker of ['actorBounds:s.canvas.actors.map','stageRect:s.stageRect','lyricRect:s.lyricRect','generateV593Advice(report,out)'])assert(src.includes(marker),marker);
 assert(src.indexOf("report.status='measured-needs-human-review'")<src.indexOf('generateV593Advice(report,out)'));
});
test('V593 release scripts do not mutate camera, Spotify, manual choreography, or library state',()=>{
 const files=['scripts/v593-concert-quality-advisor.cjs','scripts/v593-concert-quality-report.cjs','scripts/v593-concert-quality-cli.cjs'];
 for(const file of files){const src=fs.readFileSync(file,'utf8');for(const marker of ['localStorage.setItem','fetch(','camera.position.set(','spotifyApi','glbMixer.update(','deleteUserSetting'])assert(!src.includes(marker),`${file}: ${marker}`);}
});
test('package keeps previous benchmark commands and current V593 release',()=>{
 const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=593);
 for(const key of ['benchmark:v590:visual','benchmark:v591:concert','benchmark:v592:live','benchmark:v593:advise','test:v593','test:smoke:v593','verify:v593'])assert(pkg.scripts[key],key);
 assert(/npm run test:smoke:v(?:59[3-9]|[6-9]\d\d)/.test(pkg.scripts.prebuild));
});
console.log(`V593 PASS: ${count} regression groups (offline fixtures only; no actual browser visual sign-off)`);

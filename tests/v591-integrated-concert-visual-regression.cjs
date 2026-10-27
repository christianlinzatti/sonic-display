'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs'),os=require('node:os'),path=require('node:path');const {spawnSync}=require('node:child_process');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {V591_DEMO_CUES,validV591Cues,safeV591AssetPath,parseV591Actors,compositionV591,V591_REVIEW_LIMIT}=load('components/visualizer/concertQualityProtocolV591');
const {validPath,compositionActorBounds}=require('../scripts/v591-integrated-concert-visual-benchmark.cjs');
const {renderV591Report}=require('../scripts/v591-concert-visual-report.cjs');
let groups=0;const check=(label,fn)=>{try{fn();groups++;}catch(e){e.message=`V591 ${label}: ${e.message}`;throw e;}};
check('demo has five reproducible review cues, clearly labelled and distinct',()=>{
 assert(validV591Cues(V591_DEMO_CUES,2));assert.equal(V591_DEMO_CUES.length,5);
 assert(new Set(V591_DEMO_CUES.map(c=>c.camera)).size>=3);
 assert(new Set(V591_DEMO_CUES.map(c=>c.fx)).size===4);
 assert(V591_DEMO_CUES.every(x=>x.line.startsWith('DEMO')));
});
check('supports two to four genuine local GLB sources with a clip per dancer',()=>{
 for(let n=2;n<=4;n++){
  const models=Array(n).fill('/benchmark/a.glb').join(','),clips=Array(n).fill('0').join(',');
  assert.equal(parseV591Actors(models,clips).length,n);
 }
 for(const v of ['', '/a.glb', Array(5).fill('/a.glb').join(','),'/a.glb,http://evil.example/a.glb','/a.glb,/../bad.glb'])
  assert.equal(parseV591Actors(v,'0,1'),null);
 assert.deepEqual(parseV591Actors('/a.glb,/b.glb','0,10'),[{model:'/a.glb',clip:0},{model:'/b.glb',clip:10}]);
 assert.equal(parseV591Actors('/a.glb,/b.glb','0,-1'),null);
});
check('local path hardening both browser and CDP CLI',()=>{
 for(const p of ['https://evil.com/a.json','//evil/a.json','/a/../secret.json','/a/%2e%2e/b.json','/a%5cfoo.json','/x.json?token=y','/x.txt']){
  assert(!validPath(p),p);assert(!safeV591AssetPath(p,'.json'),p);
 }
 for(const p of ['/benchmark/concert.json','/benchmark/show.CUES.json']){
  assert(validPath(p),p);assert(safeV591AssetPath(p,'.json'),p);
 }
 assert(safeV591AssetPath('/benchmark/real.glb','.glb'));
 assert(!safeV591AssetPath('/benchmark/fixture.svg','.glb'));
});
check('storyboard metadata validation rejects duplicate ids, stale times, fake cast and unsafe text',()=>{
 const original=V591_DEMO_CUES.map(c=>({...c}));
 for(const [field,value] of [['id',''],['at',-1],['at',Infinity],['line',''],['focus',3],['camera','zoom'],['fx','laser']]){
  const arr=original.map(x=>({...x}));arr[1][field]=value;
  assert(!validV591Cues(arr,2),`${field}=${value}`);
 }
 const repeated=original.map(x=>({...x}));repeated[1].id=repeated[0].id;assert(!validV591Cues(repeated,2));
 const backwards=original.map(x=>({...x}));backwards[2].at=backwards[1].at;assert(!validV591Cues(backwards,2));
 assert(!validV591Cues(original.slice(0,1),2));assert(!validV591Cues(original,5));
 assert(!validV591Cues([...original, ...original,...original,...original],2));
});
check('composition flags clipping and probable lyrics occlusion without claiming quality',()=>{
 const safe={minX:-.2,maxX:.2,minY:-.3,maxY:.8};
 const low={minX:-.2,maxX:.2,minY:-.78,maxY:.2};
 const clipped={minX:-1.1,maxX:.1,minY:-.3,maxY:.8};
 assert.equal(compositionV591([safe,safe],true).status,'no-obvious-warning');
 assert.equal(compositionV591([safe,low],true).lyricIntersections,1);
 assert.equal(compositionV591([clipped,low],true).clipped,1);
 assert.equal(compositionV591([clipped,low],false).lyricIntersections,0);
 assert.equal(compositionV591([null,null],true).status,'unmeasured');
 assert.match(V591_REVIEW_LIMIT,/Sichtabnahme/);
});
check('JS CLI and browser TS composition logic remain identical across 15000 deterministic scenes',()=>{
 for(let j=0;j<15000;j++){
  const mk=i=>({minX:-.92+(j%29)/150-i*.1,maxX:.23+(j%17)/100+i*.08,
    minY:-.91+(j%43)/80,maxY:.3+(j%37)/90});
  const bounds=[mk(0),mk(1),j%71===0?null:mk(2)];const lyrics=j%4!==0;
  assert.deepEqual(compositionV591(bounds,lyrics),compositionActorBounds(bounds,lyrics));
 }
});
check('camera and scene are real GLB WebGL, not procedural dummy; full DOM lyrics included in screenshot',()=>{
 const stage=fs.readFileSync('components/visualizer/V591ConcertBrowserStage.tsx','utf8');
 for(const s of ['useGLTF(','cloneSkinnedScene(','AnimationMixer(','setTime(','data-v591-stage="full-concert"','data-v591-lyrics="true"','<StageSet','CameraCue','__sonicV591'])
  assert(stage.includes(s),s);
 assert(!stage.includes('DummyV513')&&!stage.includes('ProceduralDancerAvatar'));
 assert.match(fs.readFileSync('app/benchmark/v591/page.tsx','utf8'),/V591ConcertBrowserStage/);
});
check('CDP captures whole stage and measures real frames; blocked on absent GLB and never declares passed',()=>{
 const s=fs.readFileSync('scripts/v591-integrated-concert-visual-benchmark.cjs','utf8');
 for(const t of ['Page.captureScreenshot','data-v591-stage','data-v591-lyrics','__sonicV591.seekCue','appliedGeneration','summarizeFrames','analyzePngs','contextLosses','cueChanges','measured-needs-human-review'])assert(s.includes(t),t);
 assert(!s.includes("status='passed'")&&!s.includes('syntheticFps'));
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'v591-blocked-test-'));
 try{
  const proc=spawnSync(process.execPath,['scripts/v591-integrated-concert-visual-benchmark.cjs',`--out=${out}`],{cwd:process.cwd(),encoding:'utf8',timeout:4000});
  assert.notEqual(proc.status,0);
  const data=JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8'));
  assert.equal(data.status,'blocked');assert.equal(data.screenshots.length,0);assert.equal(data.transitions.length,0);
  assert(!fs.existsSync(path.join(out,'report.html')));
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
check('HTML review refuses blocked data, escapes all text and shows actual screenshot captures',()=>{
 assert.throws(()=>renderV591Report({status:'blocked',screenshots:[]}));
 const cue={id:'<b>fake</b>',camera:'wide',fx:'hook',line:'<script>no</script>',at:1,focus:1};
 const shot={file:'a.png',cue,composition:{status:'review',actorsMeasured:2,clipped:1,lyricIntersections:1},drawCalls:10,triangles:111};
 const report={status:'measured-needs-human-review',screenshots:[shot,{...shot,file:'b.png'}],
  source:{models:['/a.glb','/b.glb'],script:null},mode:'headless-diagnostic',
  frameTiming:{averageFps:42,p95FrameMs:26,p99FrameMs:41,contextLosses:0},
  transitions:[{from:'x',to:'y',changedPixelFraction:.12}],warnings:['<img src=x>']};
 const html=renderV591Report(report);
 for(const text of ['12.00%','a.png','b.png','Manuelle Freigabe','DEMO','<script>']){
  if(text==='<script>')assert(!html.includes(text));
  else if(text==='DEMO')continue;
  else assert(html.includes(text),text);
 }
 assert(html.includes('&lt;script&gt;')&&html.includes('&lt;img src=x&gt;'));
});
check('scripts integrate release and prior V590 remains intact',()=>{
 const pkg=require('../package.json');
 assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=591);
 for(const key of ['test:v591','test:v591:types','test:smoke:v591','verify:v591','benchmark:v591:concert'])assert(pkg.scripts[key]);
 assert(pkg.scripts['test:smoke:v591'].includes('test:v590'));
 assert(pkg.scripts['benchmark:v590:visual'].includes('v590-real-concert'));
 assert(/test:smoke:v(?:59[1-9]|[6-9]\d\d)/.test(pkg.scripts.prebuild));
});
console.log(`PASS V591: ${groups} test groups, 15,000 concert composition cases, honest missing-GLB blockade`);

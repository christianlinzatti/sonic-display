'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');const {load}=require('./helpers/ts-loader-v404.cjs');
const {v592LoopbackAllowed,v592Status,v592BoundsWarning,v592AdvanceIsReal}=load('components/visualizer/liveStageQualityV592');
const {renderV592Report}=require('../scripts/v592-live-stage-report.cjs');
let count=0;function test(label,fn){try{fn();count++;}catch(e){e.message=`V592 ${label}: ${e.message}`;throw e;}}
test('only explicit local opt-in activates runtime probe',()=>{
 for(const host of ['127.0.0.1','localhost','::1'])assert(v592LoopbackAllowed({hostname:host,search:'?benchmarkV592=1',protocol:'http:'}));
 for(const host of ['evil.example','192.168.1.33','0.0.0.0'])assert(!v592LoopbackAllowed({hostname:host,search:'?benchmarkV592=1',protocol:'http:'}));
 for(const query of ['','?benchmarkV592=true','?benchmarkV592=0'])assert(!v592LoopbackAllowed({hostname:'localhost',search:query,protocol:'http:'}));
 assert(!v592LoopbackAllowed({hostname:'localhost',search:'?benchmarkV592=1',protocol:'file:'}));
});
test('strict playback and real GLB evidence gate',()=>{
 const base={trackId:'spotify-song',playing:true,canvas:true,lyrics:true,glbActors:1,contextLost:false};
 assert.equal(v592Status(base),'ready');
 for(const [key,value,result] of [['trackId','','no-track'],['playing',false,'paused'],['canvas',false,'no-canvas'],['contextLost',true,'context-lost'],['glbActors',0,'no-glb'],['lyrics',false,'no-lyrics']])
  assert.equal(v592Status({...base,[key]:value}),result,key);
});
test('invalid skeleton projections cannot be called good',()=>{
 for(const b of [null,{minX:NaN,maxX:1,minY:-1,maxY:1},{minX:0,maxX:0,minY:0,maxY:1}])assert(v592BoundsWarning(b).length>0);
 assert(v592BoundsWarning({minX:-1.1,maxX:.3,minY:-.5,maxY:.5}).join().includes('angeschnitten'));
 assert(v592BoundsWarning({minX:-.01,maxX:.01,minY:-.03,maxY:.03}).join().includes('klein'));
 assert.equal(v592BoundsWarning({minX:-.4,maxX:.4,minY:-.6,maxY:.6}).length,0);
});
test('live playback progress must move in same track',()=>{
 assert(v592AdvanceIsReal([{trackId:'a',progressMs:123,timestamp:1},{trackId:'a',progressMs:2590,timestamp:2501}]));
 assert(!v592AdvanceIsReal([{trackId:'a',progressMs:123,timestamp:1},{trackId:'b',progressMs:2590,timestamp:2501}]));
 assert(!v592AdvanceIsReal([{trackId:'a',progressMs:123,timestamp:1},{trackId:'a',progressMs:1300,timestamp:2501}]));
});
test('live stage DOM probe registers only at loopback and does not override show',()=>{
 const src=fs.readFileSync('components/visualizer/LiveStageDomProbeV592.tsx','utf8');
 for(const marker of ['window.__sonicV592=api','v592LoopbackAllowed(window.location)','[data-v592-live-stage]','progressMs','lyricsSynced','glbActors','return null'])assert(src.includes(marker),marker);
 assert(!src.includes('localStorage.setItem(')&&!src.includes('SpotifyLogin('));
});
test('Canvas probe operates in real live R3F tree and only reads geometry',()=>{
 const src=fs.readFileSync('components/visualizer/LiveStageCanvasProbeV592.tsx','utf8');
 for(const marker of ['useThree','useFrame','scene.traverse','userData?.sonicV592GlbActor','Box3','gl.info.render.calls','gl.info.render.triangles','window.__sonicV592Canvas'])assert(src.includes(marker),marker);
 const tree=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
 assert(tree.includes('<LiveStageCanvasBridgeV301 />\n      <LiveStageCanvasProbeV592 />'));
 const glb=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(glb.includes('userData={{sonicV592GlbActor:true}}'));
});
test('actual Spotify VisualizerStage mounts probe without substitute fixture',()=>{
 const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 for(const marker of ['<LiveStageDomProbeV592','data-v592-live-stage="true"','data-v568-mode=','const Mode = definition.Component','useVisualizer()'])assert(s.includes(marker),marker);
 const runner=fs.readFileSync('scripts/v592-live-stage-benchmark.cjs','utf8');
 for(const marker of ['/?benchmarkV592=1','window.__sonicV592?.state?.()','Page.captureScreenshot','actual-spotify-visualizer-stage','v592-live-stage-report','measured-needs-human-review','debug-port','analyzePngs','summarizeFrames'])assert(runner.includes(marker),marker);
 assert(!runner.includes('/benchmark/v591?')&&!runner.includes('V591ConcertBrowserStage'));
 assert(!runner.includes('const fakeTrack')&&!runner.includes('syntheticFps'));
});
test('HTML review only for genuine measurements, XSS escaped',()=>{
 assert.throws(()=>renderV592Report({status:'blocked',screenshots:[]}));
 const s={file:'a.png',progressMs:1400,actors:2,drawCalls:20,triangles:200,activeIndex:0,lyricsMode:'dom-overlay',warnings:['<script>']};
 const report={status:'measured-needs-human-review',screenshots:[s,{...s,file:'b.png'}],transitions:[{from:'a.png',to:'b.png',changedPixelFraction:.25}],warnings:['<img src=x>'],frameTiming:{averageFps:40,p95FrameMs:25,p99FrameMs:35,contextLosses:0},mode:'headless',progressMs:3000,minGlb:1};
 const html=renderV592Report(report);assert(html.includes('a.png')&&html.includes('b.png')&&html.includes('25.00'));
 assert(!html.includes('<script>')&&!html.includes('<img src=x>')&&html.includes('&lt;script&gt;'));
});
test('CLI refuses missing Spotify/GLB and writes blocked report without screenshots',()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v592-test-'));
 try{const run=spawnSync(process.execPath,['scripts/v592-live-stage-benchmark.cjs',`--out=${out}`,'--url=https://bad.example'],{cwd:process.cwd(),timeout:5000,encoding:'utf8'});
  assert.notEqual(run.status,0);const report=JSON.parse(fs.readFileSync(path.join(out,'report.json'),'utf8'));
  assert.equal(report.status,'blocked');assert.deepEqual(report.screenshots,[]);assert(!fs.existsSync(path.join(out,'report.html')));
 }finally{fs.rmSync(out,{recursive:true,force:true});}
});
test('release config keeps earlier benchmarks intact',()=>{
 const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=592);
 for(const name of ['test:v592','test:v592:types','test:smoke:v592','verify:v592','benchmark:v592:live'])assert(pkg.scripts[name]);
 assert(pkg.scripts['benchmark:v590:visual']&&pkg.scripts['benchmark:v591:concert']);
});
console.log(`V592 PASS: ${count} regression groups`);

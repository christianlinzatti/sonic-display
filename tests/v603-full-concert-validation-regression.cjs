'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const {spawnSync}=require('node:child_process');
const {fullConcertReview:analyze,mergeIntervals,section}=require('../scripts/v603-full-concert-review.cjs');
const {renderV603Report}=require('../scripts/v603-full-concert-report.cjs');
const {generate,validPng}=require('../scripts/v603-full-concert-cli.cjs');
let passed=0;function test(name,fn){try{fn();passed++}catch(e){e.message=`V603 ${name}: ${e.message}`;throw e;}}
const shot=(ms,index=0,more={})=>({file:`live-${String(index).padStart(2,'0')}.png`,progressMs:ms,actors:2,activeIndex:index,
 warnings:[],drawCalls:180,triangles:200000,lyricsMode:'dom-overlay',coverage:{nonBackgroundFraction:.4},
 stageRect:{x:0,y:0,width:640,height:480},lyricRect:{x:100,y:400,width:200,height:50},
 actorBounds:[{meshes:2,bounds:{minX:-.3,maxX:-.1,minY:-.8,maxY:.6}},{meshes:2,bounds:{minX:.2,maxX:.45,minY:-.8,maxY:.6}}],
 sceneEvidence:{moment:'verse',shot:'medium',mode:'',focus:'lead',genre:'deutschrap'},...more});
const live=(start=0,opts={})=>({format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',
 source:'actual-spotify-visualizer-stage',sourceTrack:'my-private-local-track',trackDurationMs:60000,
 modelCount:2,mode:'existing-local-chromium',screen:{width:640,height:480},
 browser:{userAgent:'Chromium v1',webglVersion:'WebGL2'},progressMs:19000,
 frameTiming:{status:'measured',frames:900,averageFps:31,p95FrameMs:31,p99FrameMs:42,elapsedMs:19000},
 screenshots:[0,1,2,3,4,5,6,7].map((i)=>shot(start+1000+i*2700,i)),...opts});
const review=(...args)=>analyze(args.length?args:[live()]);
const temporary=fn=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v603-'));try{return fn(dir);}finally{fs.rmSync(dir,{recursive:true,force:true});}};
const png=(w=2,h=2)=>{
 const chunk=(type,body)=>{const l=Buffer.alloc(4);l.writeUInt32BE(body.length);const payload=Buffer.concat([Buffer.from(type),body]);let c=~0;
  for(const b of payload){c^=b;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}const crc=Buffer.alloc(4);crc.writeUInt32BE((c^~0)>>>0);
  return Buffer.concat([l,payload,crc]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(w,0);header.writeUInt32BE(h,4);header[8]=8;header[9]=2;
 const raw=Buffer.alloc((w*3+1)*h);
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
};
test('refuses empty and excessive run arrays',()=>{assert.equal(analyze([]).status,'blocked');assert.equal(analyze(Array(17).fill(live())).status,'blocked')});
test('broad real-shaped playback evidence still requires manual artistic approval',()=>{
 const moments=['intro','verse','hook','outro'];
 const runs=[0,15000,30000,40000].map((start,i)=>live(start,{screenshots:live(start).screenshots.map(s=>({...s,sceneEvidence:{moment:moments[i],shot:'sweep'+i}}))}));
 const r=review(...runs);assert.equal(r.status,'broad-coverage-needs-human-review');assert.equal(r.approved,false);
 assert(r.coverage.ratio>.92);assert.equal(r.coverage.gaps.length,2);
});
test('staged metadata outside string track identifiers is refused',()=>{
 assert.equal(review(live(0,{sourceTrack:{id:'not-a-track'}})).status,'blocked');
});
test('real original V592 source is mandatory',()=>{for(const r of [null,{},live(0,{status:'blocked'}),live(0,{source:'synthetic'})])assert.equal(review(r).status,'blocked')});
test('track mismatch rejected',()=>assert.equal(review(live(),live(20000,{sourceTrack:'different'})).status,'blocked'));
test('screen mismatch rejected',()=>assert.equal(review(live(),live(20000,{screen:{width:800,height:600}})).status,'blocked'));
test('browser mismatch rejected',()=>assert.equal(review(live(),live(20000,{browser:{userAgent:'other',webglVersion:'WebGL2'}})).status,'blocked'));
test('WebGL mismatch rejected',()=>assert.equal(review(live(),live(20000,{browser:{userAgent:'Chromium v1',webglVersion:'WebGL1'}})).status,'blocked'));
test('model count mismatch rejected',()=>assert.equal(review(live(),live(20000,{modelCount:3})).status,'blocked'));
test('mode mismatch rejected',()=>assert.equal(review(live(),live(20000,{mode:'headless-local-chromium'})).status,'blocked'));
test('conflicting track duration rejected',()=>assert.equal(review(live(),live(20000,{trackDurationMs:65000})).status,'blocked'));
test('future song position beyond duration rejected',()=>assert.equal(review(live(60000)).status,'blocked'));
test('no duration results in incomplete evidence',()=>{const r=review(live(0,{trackDurationMs:null}));assert.equal(r.coverage.ratio,null);assert.equal(r.status,'partial-evidence-needs-human-review')});
test('older report compatible, but flags missing Spotify duration',()=>{const r=review(live(),live(20000,{trackDurationMs:null}));assert.equal(r.legacyDurationMissing,true)});
test('one short live capture cannot certify whole concert',()=>{const r=review();assert.equal(r.approved,false);assert.equal(r.status,'partial-evidence-needs-human-review');assert(r.coverage.gaps.length>0)});
test('song timeline is sorted across multiple out-of-order runs',()=>{const r=review(live(20000),live(0));assert.equal(r.captures[0].progressMs,1000);assert.equal(r.captures.at(-1).progressMs,39900)});
test('overlapping windows merge without double counting',()=>{const r=review(live(0),live(10000));assert.equal(r.coverage.continuousWindows,1);assert(r.coverage.ratio<.5)});
test('disjoint windows generate visible song gaps',()=>{const r=review(live(0),live(30000));assert.equal(r.coverage.continuousWindows,2);assert(r.coverage.gaps.some(g=>g.durationMs>0))});
test('no elapsed evidence cannot prove continuous capture',()=>{const r=review(live(0,{frameTiming:{...live().frameTiming,elapsedMs:undefined}}));assert.equal(r.coverage.measuredWindowMs,0)});
test('playback jumps cannot silently count full interval',()=>{const r=review(live(0,{frameTiming:{...live().frameTiming,elapsedMs:5000}}));assert.equal(r.coverage.measuredWindowMs,0)});
test('duration is never guessed from last screenshot',()=>{const r=review(live(0,{trackDurationMs:null}));assert.equal(r.trackDurationMs,null)});
test('manual approval never synthesized, regardless of coverage',()=>{
 const r=review(live(0),live(17000),live(34000));assert.equal(r.approved,false);assert.equal(r.humanReviewRequired,true);
});
test('valid intro/verse/pre-hook/hook/drop/bridge/outro cues map precisely',()=>{
 for(const v of ['intro','verse','pre-hook','hook','drop','bridge','outro'])assert.equal(section({moment:v}),v);
});
test('unfamiliar genres and generic mode do not invent song sections',()=>{
 for(const cue of [null,{}, {genre:'hardtekk'}, {shot:'closeup',mode:'cinematic'}, {moment:'some-random-value'}])assert.equal(section(cue),null);
});
test('uncertain cues counted unclassified',()=>{const r=review(live(0,{screenshots:live().screenshots.map(s=>({...s,sceneEvidence:{genre:'deutschrap'}}))}));assert.equal(r.counts.unclassified,8)});
test('repeated camera cues only raise human-editorial notice',()=>{const r=review();assert(r.cameraRepeats.some(x=>x.count>=3));assert.equal(r.approved,false)});
test('camera cues without evidence do not trigger false repetition',()=>{const r=review(live(0,{screenshots:live().screenshots.map(s=>({...s,sceneEvidence:{moment:'verse'}}))}));assert.equal(r.cameraRepeats.length,0)});
test('repeated clipping warnings are tied to source photos',()=>{const r=review(live(0,{screenshots:live().screenshots.map((s,i)=>i<3?{...s,warnings:['Avatar angeschnitten']}:s)}));assert(r.repeatedWarnings.some(x=>x.name==='clipped'&&x.observedFrames===3))});
test('single warning does not become recurring defect',()=>{const r=review(live(0,{screenshots:live().screenshots.map((s,i)=>i===0?{...s,warnings:['Avatar angeschnitten']}:s)}));assert(!r.repeatedWarnings.some(x=>x.name==='clipped'))});
test('slow rAF run is reported without Pi FPS assumption',()=>{const r=review(live(0,{frameTiming:{...live().frameTiming,averageFps:19,p95FrameMs:62,p99FrameMs:80}}));assert.deepEqual(r.slowRuns,[1]);assert(r.limitations.some(x=>x.includes('GPU')))});
test('lighting FX cannot be magically certified from screenshots',()=>{const r=review();assert.equal(r.evidenceMatrix.find(x=>x.area==='Licht und Stage FX').observed,false)});
test('lip sync is strictly manual, not faked as validated',()=>assert(review().manualReview.some(x=>x.includes('Lip-Sync'))));
test('track identifier is not leaked in output',()=>{const r=review();assert(!JSON.stringify(r).includes('my-private-local-track'));assert.equal(r.trackHash.length,16)});
test('merged interval function handles nesting and disjoint windows',()=>assert.deepEqual(mergeIntervals([[2,10],[1,3],[12,14],[4,6]]),[[1,10],[12,14]]));
test('HTML output escapes source-injected stage cues and strings',()=>{
 const s=live().screenshots.map((x,i)=>i===0?{...x,sceneEvidence:{moment:'verse',shot:'<img src=x onerror=alert(1)>'},warnings:['<script>']}:x);
 const html=renderV603Report(review(live(0,{screenshots:s})));assert(!html.includes('<script>'));assert(!html.includes('shot: <img'));
 assert(html.includes('&lt;img'));
});
test('HTML only includes authorized copied screenshot names',()=>{
 const html=renderV603Report(review(),[{run:1,index:1,name:'javascript:alert(1)'}]);assert(!html.includes('src="javascript:'));assert(html.includes('Original-PNG fehlt'));
});
test('HTML never says complete acceptance',()=>{const html=renderV603Report(review());assert(html.includes('Manuelle Abnahme'));assert(!html.includes('automatisch freigegeben'))});
test('HTML rejects blocked or automatically approved result',()=>{
 assert.throws(()=>renderV603Report({format:'sonic-v603-full-concert-review',status:'blocked',approved:false,humanReviewRequired:true}));
 assert.throws(()=>renderV603Report({...review(),approved:true}));
});
test('CLI missing run produces nonzero exit without creating output',()=>{
 const out=temporary(d=>{const r=spawnSync(process.execPath,['scripts/v603-full-concert-cli.cjs',`--out=${d}/x`],{encoding:'utf8',cwd:process.cwd()});assert.notEqual(r.status,0);assert(!fs.existsSync(path.join(d,'x')))});
});
test('CLI fake data refuses output',()=>temporary(dir=>{
 const src=path.join(dir,'source');fs.mkdirSync(src);const file=path.join(src,'report.json');fs.writeFileSync(file,JSON.stringify(live(0,{status:'blocked'})));
 assert.throws(()=>generate({runs:[file],out:path.join(dir,'report')}));assert(!fs.existsSync(path.join(dir,'report')));
}));
test('identical content from distinct JSON files cannot amplify warning frequency',()=>temporary(dir=>{
 const f1=path.join(dir,'a.json'),f2=path.join(dir,'b.json');fs.writeFileSync(f1,JSON.stringify(live()));fs.writeFileSync(f2,JSON.stringify(live()));
 assert.throws(()=>generate({runs:[f1,f2],out:path.join(dir,'out')}));
}));
test('CLI duplicate source rejected',()=>temporary(dir=>{
 const file=path.join(dir,'source.json');fs.writeFileSync(file,JSON.stringify(live()));assert.throws(()=>generate({runs:[file,file],out:path.join(dir,'out')}));
}));
test('CLI cannot overwrite original recording folder',()=>temporary(dir=>{
 const folder=path.join(dir,'run');fs.mkdirSync(folder);const file=path.join(folder,'report.json');fs.writeFileSync(file,JSON.stringify(live()));assert.throws(()=>generate({runs:[file],out:folder}));
}));
test('valid actual-shaped JSON creates report and flags missing PNG',()=>temporary(dir=>{
 const folder=path.join(dir,'source'),out=path.join(dir,'result');fs.mkdirSync(folder);
 const file=path.join(folder,'report.json');fs.writeFileSync(file,JSON.stringify(live()));const r=generate({runs:[file],out});
 assert.equal(r.imageEvidence.availableOriginalPngs,0);assert(fs.existsSync(path.join(out,'review-v603.json')));assert(fs.existsSync(path.join(out,'review-v603.html')));
}));
test('broad time windows with missing images never receive broad visual evidence label',()=>temporary(dir=>{
 const runs=[0,15000,30000,40000].map((offset,i)=>{
  const r=live(offset,{screenshots:live(offset).screenshots.map(s=>({...s,sceneEvidence:{moment:['intro','verse','hook','outro'][i]}}))});
  const folder=path.join(dir,`capture${i}`);fs.mkdirSync(folder);
  const name=path.join(folder,'report.json');fs.writeFileSync(name,JSON.stringify(r));return name;
 });
 const r=generate({runs,out:path.join(dir,'out')});assert.equal(r.coverage.status,'visual-images-incomplete');
 assert.equal(r.status,'partial-evidence-needs-human-review');assert.equal(r.approved,false);
}));
test('genuine local PNG is preserved for visual review',()=>temporary(dir=>{
 const folder=path.join(dir,'source'),out=path.join(dir,'result');fs.mkdirSync(folder);
 const file=path.join(folder,'report.json');fs.writeFileSync(file,JSON.stringify(live()));fs.writeFileSync(path.join(folder,'live-00.png'),png());
 const r=generate({runs:[file],out});assert.equal(r.imageEvidence.availableOriginalPngs,1);assert(fs.existsSync(path.join(out,'images','run-1-live-00.png')));
 assert(fs.readFileSync(path.join(out,'review-v603.html'),'utf8').includes('images/run-1-live-00.png'));
}));
test('invalid screenshot is never copied or shown',()=>temporary(dir=>{
 const folder=path.join(dir,'source'),out=path.join(dir,'result');fs.mkdirSync(folder);
 const file=path.join(folder,'report.json');fs.writeFileSync(file,JSON.stringify(live()));fs.writeFileSync(path.join(folder,'live-00.png'),'not PNG'.repeat(30));
 const r=generate({runs:[file],out});assert.equal(r.imageEvidence.availableOriginalPngs,0);
 assert(!fs.existsSync(path.join(out,'images','run-1-live-00.png')));
}));
test('truncated screenshot with forged magic is not trusted',()=>temporary(dir=>{
 const fake=path.join(dir,'live-00.png');fs.writeFileSync(fake,Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),Buffer.alloc(100)]));assert.equal(validPng(fake),false);
}));
test('real probe carries original track duration without time fabrication',()=>{
 const probe=fs.readFileSync('components/visualizer/LiveStageDomProbeV592.tsx','utf8');
 const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 const capture=fs.readFileSync('scripts/v592-live-stage-benchmark.cjs','utf8');
 assert(probe.includes('trackId,durationMs,progressMs'));assert(stage.includes('durationMs={track?.durationMs??0}'));
 assert(capture.includes('report.trackDurationMs=Number.isInteger(stage.durationMs)'));
});
test('V603 adds no render-loop, Spotify seek or 3D animation modification',()=>{
 for(const f of ['scripts/v603-full-concert-cli.cjs','scripts/v603-full-concert-review.cjs','scripts/v603-full-concert-report.cjs']){
  const s=fs.readFileSync(f,'utf8');assert(!s.includes('requestAnimationFrame('));assert(!s.includes('Spotify.setPlayback'));
 }
});
console.log(`PASS V603: ${passed} complete-concert validation groups`);

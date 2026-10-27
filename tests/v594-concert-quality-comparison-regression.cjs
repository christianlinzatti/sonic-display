'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const {spawnSync}=require('node:child_process');
const {compareConcertReports,valid,matches,metricsOf}=require('../scripts/v594-concert-quality-comparison.cjs');
const {renderV594Comparison,renderV594History}=require('../scripts/v594-concert-quality-report.cjs');
const {compare,updateHistory}=require('../scripts/v594-concert-quality-cli.cjs');
let groups=0;function test(label,fn){try{fn();groups++;}catch(e){e.message=`V594 ${label}: ${e.message}`;throw e;}}
const bounds={minX:-.35,maxX:.35,minY:-.7,maxY:.7};
const shot=(i,overrides={})=>({file:`live-${String(i).padStart(2,'0')}.png`,progressMs:1000+i*3300,actors:2,
 drawCalls:170,triangles:120000,lyricsMode:'dom-overlay',activeIndex:i,coverage:{nonBackgroundFraction:.28},
 stageRect:{x:0,y:0,width:1280,height:800},lyricRect:{x:250,y:590,width:450,height:70},
 actorBounds:[{meshes:1,bounds},{meshes:1,bounds:{minX:.4,maxX:.8,minY:-.6,maxY:.6}}],warnings:[],...overrides});
const live=(overrides={})=>({format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',
 source:'actual-spotify-visualizer-stage',sourceTrack:'test-track-7',capturedAt:'2026-10-26T14:00:00.000Z',
 modelCount:2,progressMs:13200,mode:'existing-local-chromium',minGlb:1,
 browser:{userAgent:'Chromium-test',webglVersion:2},screen:{width:1280,height:800},
 frameTiming:{status:'measured',frames:500,averageFps:24,p95FrameMs:46,p99FrameMs:70,contextLosses:0},
 screenshots:[shot(0),shot(1),shot(2),shot(3)],transitions:[],warnings:[],...overrides});
const paired=(a={},b={})=>compareConcertReports(live(a),live({frameTiming:{status:'measured',frames:500,averageFps:33,p95FrameMs:28,p99FrameMs:42,contextLosses:0},...b}));
const metric=(r,id)=>r.metrics.find(m=>m.name===id);
const run=(args)=>spawnSync(process.execPath,['scripts/v594-concert-quality-cli.cjs',...args],{cwd:process.cwd(),encoding:'utf8',timeout:15000});
function fixture(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v594-'));try{return fn(root);}finally{fs.rmSync(root,{recursive:true,force:true});}}
const write=(root,name,r)=>{const dir=path.join(root,name);fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'report.json');fs.writeFileSync(file,JSON.stringify(r));return file;};
function png(rgb){const crc=()=>Buffer.alloc(4),chunk=(type,bytes)=>{const head=Buffer.alloc(8);head.writeUInt32BE(bytes.length,0);head.write(type,4);return Buffer.concat([head,bytes,crc()]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(4,0);ihdr.writeUInt32BE(4,4);ihdr[8]=8;ihdr[9]=2;
 const line=Buffer.from([0,...Array(4).fill(rgb).flat()]);return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.concat(Array(4).fill(line)))),chunk('IEND',Buffer.alloc(0))]);}
test('accept measured V592 screenshot provenance, reject blocked/synthetic reports',()=>{
 assert(valid(live()));
 for(const x of [null,{},live({status:'blocked'}),live({format:'sonic-v591'}),live({source:'synthetic'}),
  live({modelCount:0}),live({sourceTrack:''}),live({screenshots:[shot(0)]}),
  live({frameTiming:{status:'blocked'}})])assert.equal(compareConcertReports(live(),x).status,'blocked');
});
test('no cross-track comparisons even with numerically identical FPS',()=>{
 assert.match(compareConcertReports(live(),live({sourceTrack:'another-track'})).reason,/Different Spotify track/);
});
test('same authentic browser setup, actor count and times gives comparable status',()=>{
 const r=paired();assert.equal(r.status,'comparable-needs-human-review');assert.equal(r.prerequisites.alignedCaptureCount,4);
 assert.equal(r.humanReviewRequired,true);assert.equal(r.autoApplied,false);
});
test('measured rAF improvement remains a heuristic, not a Pi or visual claim',()=>{
 const r=paired();assert.equal(metric(r,'averageFps').assessment,'improved');
 assert.equal(metric(r,'p95FrameMs').assessment,'improved');assert.equal(metric(r,'p99FrameMs').assessment,'improved');
 assert(r.limitations.some(x=>x.includes('GPU')));
});
test('clear performance regression is identified without automatic correction',()=>{
 const r=paired({frameTiming:{status:'measured',frames:500,averageFps:40,p95FrameMs:23,p99FrameMs:31}},
  {frameTiming:{status:'measured',frames:500,averageFps:22,p95FrameMs:52,p99FrameMs:78}});
 assert.equal(metric(r,'averageFps').assessment,'regressed');assert.equal(metric(r,'p95FrameMs').assessment,'regressed');
});
test('noise smaller than 5 percent yields similar assessment',()=>{
 const r=paired({frameTiming:{status:'measured',frames:500,averageFps:30,p95FrameMs:30,p99FrameMs:40}},
  {frameTiming:{status:'measured',frames:500,averageFps:30.8,p95FrameMs:30.5,p99FrameMs:41}});
 assert.equal(metric(r,'averageFps').assessment,'similar');assert.equal(metric(r,'p95FrameMs').assessment,'similar');
});
test('screen resolution mismatch limits comparison and suppresses improvement label',()=>{
 const r=paired({screen:{width:1024,height:768}});assert.equal(r.status,'limited-needs-human-review');
 assert.equal(metric(r,'averageFps').assessment,'not-comparable');
});
test('browser/WebGL mismatch limits performance conclusion',()=>{
 for(const browser of [{userAgent:'Different',webglVersion:2},{userAgent:'Chromium-test',webglVersion:'WebGL 1'},{}]){
  const r=paired({}, {browser});assert.equal(r.status,'limited-needs-human-review');
 }
});
test('actor count change is a controlled comparison limitation',()=>{
 const r=paired({}, {modelCount:3});assert.equal(r.status,'limited-needs-human-review');
 assert.equal(r.prerequisites.sameCount,false);
});
test('capture mode change limits comparison',()=>{
 const r=paired({}, {mode:'headless-local-chromium'});assert.equal(r.status,'limited-needs-human-review');
});
test('track position mismatch does not falsely compare random hook/verse',()=>{
 const r=paired({}, {screenshots:[0,1,2,3].map(i=>shot(i,{progressMs:24000+i*3300}))});
 assert.equal(r.status,'limited-needs-human-review');assert.equal(r.alignedCaptures.length,0);
});
test('minor timing offsets still pair chronological captures',()=>{
 const r=paired({}, {screenshots:[0,1,2,3].map(i=>shot(i,{progressMs:1400+i*3300}))});
 assert.equal(r.status,'comparable-needs-human-review');assert.equal(r.alignedCaptures.length,4);
 assert.deepEqual(r.alignedCaptures.map(x=>x.progressDeltaMs),[400,400,400,400]);
});
test('alignment never reuses the same after-capture twice',()=>{
 const a=[shot(0),shot(1),shot(2)];const b=[shot(0,{progressMs:1400}),shot(1,{progressMs:7900})];
 const aligned=matches(a,b,1500);assert(new Set(aligned.map(x=>x.afterIndex)).size===aligned.length);
});
test('reversed and duplicate timestamps are not admissible as live report',()=>{
 const dup=[shot(0),shot(1,{progressMs:1000}),shot(2),shot(3)];
 assert.equal(compareConcertReports(live({screenshots:dup}),live()).status,'blocked');
});
test('duplicate and malicious PNG filenames are rejected',()=>{
 for(const shots of [[shot(0),shot(1,{file:'live-00.png'})],[shot(0,{file:'../live-00.png'}),shot(1)]]){
  assert.equal(compareConcertReports(live({screenshots:shots}),live()).status,'blocked');
 }
});
test('invalid frame timing values never become apparent gain',()=>{
 for(const frames of [{status:'measured',frames:5,averageFps:Infinity,p95FrameMs:30,p99FrameMs:40},
  {status:'measured',frames:1,averageFps:30,p95FrameMs:20,p99FrameMs:30},
  {status:'measured',frames:5,averageFps:30,p95FrameMs:80,p99FrameMs:40}]){
  assert.equal(compareConcertReports(live({frameTiming:frames}),live()).status,'blocked');
 }
});
test('frame budget median calculated only from finite on-screen evidence',()=>{
 const m=metricsOf(live({screenshots:[shot(0,{drawCalls:200}),shot(1,{drawCalls:300}),shot(2,{drawCalls:400}),shot(3,{drawCalls:500})]}));
 assert.equal(m.drawCallsMedian,350);
});
test('repeated clipped avatars decline and raw heuristic count is not claimed to be beauty',()=>{
 const s=[0,1,2,3].map(i=>shot(i,{warnings:i<3?['Avatar möglicherweise angeschnitten']:[]}));
 const r=paired({screenshots:s});const e=r.warningCounts.find(x=>x.name==='clipped');
 assert.equal(e.before,3);assert.equal(e.after,0);assert.equal(e.assessment,'fewer-heuristic-flags');
});
test('number of screenshots differs, so warnings are not rated on raw count',()=>{
 const s=[shot(0),shot(1),shot(2)];const r=paired({}, {screenshots:s});
 assert.equal(r.status,'comparable-needs-human-review');
 assert(r.warningCounts.every(x=>x.assessment==='not-comparable'));
});
test('HTML report escapes untrusted strings and is not automatic approval',()=>{
 const r=paired();r.limitations.push('<script>alert(1)</script>');
 const html=renderV594Comparison(r,[{beforeProgressMs:1100,deltaMs:400,beforeUrl:'../before/live-00.png',afterUrl:'../after/live-00.png',pixelStatus:'not-measured'}]);
 assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>alert'));
 assert(html.includes('Manuelle Sichtprüfung')||html.includes('manueller Sichtprüfung')||html.includes('manuellen Sichtprüfung'));
 assert(html.includes('Vorher')&&html.includes('Nachher'));
});
test('cannot render blocked reports or auto-applied modifications',()=>{
 assert.throws(()=>renderV594Comparison({status:'blocked',autoApplied:false},[]));
 assert.throws(()=>renderV594Comparison({...paired(),autoApplied:true},[]));
});
test('CLI prevents same-file and wrong-track reports without creating comparison',()=>fixture(root=>{
 const before=write(root,'before',live()),after=write(root,'after',live({sourceTrack:'X'})),out=path.join(root,'out');
 for(const args of [[`--before=${before}`,`--after=${before}`,`--out=${out}`],[`--before=${before}`,`--after=${after}`,`--out=${out}`]]){
  const result=run(args);assert.notEqual(result.status,0);assert(!fs.existsSync(path.join(out,'report-v594.html')));
 }
}));
test('CLI compares two fixture reports and creates HTML, JSON and history',()=>fixture(root=>{
 const before=write(root,'before',live()),after=write(root,'after',live()),out=path.join(root,'out'),history=path.join(root,'history.json');
 const result=run([`--before=${before}`,`--after=${after}`,`--out=${out}`,`--history=${history}`]);
 assert.equal(result.status,0,result.stderr);const j=JSON.parse(fs.readFileSync(path.join(out,'comparison-v594.json')));
 assert.equal(j.status,'comparable-needs-human-review');assert.equal(j.visualComparison.status,'partial-or-unavailable');
 assert(fs.readFileSync(path.join(out,'report-v594.html'),'utf8').includes('Originalbild fehlt'));
 const idx=JSON.parse(fs.readFileSync(history));assert.equal(idx.entries.length,1);assert(fs.existsSync(path.join(root,'history-v594.html')));
 assert(!JSON.stringify(idx).includes('test-track-7'));
 const listed=run(['--list',`--history=${history}`]);assert.equal(listed.status,0);assert(listed.stdout.includes('1 local comparisons'));
}));
test('history HTML has working links and escaped data',()=>{
 const data={format:'sonic-v594-comparison-history',entries:[{key:'safe',report:'comparison/report-v594.html',status:'comparable-needs-human-review',baselineFps:29,candidateFps:31,capturedAtBefore:'<img src=x>',capturedAtAfter:'2026-10-26'}]};
 const html=renderV594History(data);assert(html.includes('comparison/report-v594.html'));assert(html.includes('&lt;img src=x&gt;'));assert(!html.includes('<img src=x>'));
 const attack=renderV594History({...data,entries:[{...data.entries[0],report:'javascript:alert(1).html'}]});
 assert(!attack.includes('href="javascript:')); 
});
test('rerunning same pair updates history idempotently',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live()),history=path.join(root,'history.json');
 for(let i=0;i<2;i++)compare({before:b,after:a,out:path.join(root,'out'),history});
 assert.equal(JSON.parse(fs.readFileSync(history)).entries.length,1);
}));
test('history can be explicitly disabled',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live()),out=path.join(root,'out');
 const result=run([`--before=${b}`,`--after=${a}`,`--out=${out}`,'--no-history']);assert.equal(result.status,0);
 assert(!fs.existsSync(path.join(root,'history.json')));
}));
test('history destination cannot overwrite original V592 measurement reports',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live()),snapshot=fs.readFileSync(b,'utf8');
 assert.throws(()=>compare({before:b,after:a,out:path.join(root,'out'),history:b}),/History path/);
 assert.equal(fs.readFileSync(b,'utf8'),snapshot);
}));
test('history retention is capped at 100 entries',()=>fixture(root=>{
 const index=path.join(root,'history.json');for(let i=0;i<108;i++)updateHistory(index,{key:`entry-${i}`,status:'comparable-needs-human-review',baselineFps:28,candidateFps:30,report:'compare/report-v594.html'});
 const history=JSON.parse(fs.readFileSync(index));assert.equal(history.entries.length,100);
 assert.equal(history.entries[0].key,'entry-8');assert.equal(history.entries.at(-1).key,'entry-107');
}));
test('invalid existing history is never silently overwritten',()=>fixture(root=>{
 const idx=path.join(root,'history.json');fs.writeFileSync(idx,'{"unknown":true}');
 assert.throws(()=>updateHistory(idx,{key:'a',status:'x'}));assert.equal(fs.readFileSync(idx,'utf8'),'{"unknown":true}');
}));
test('limited comparisons remain in history visibly marked as limited',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live({screen:{width:1024,height:768}})),history=path.join(root,'history.json');
 const r=compare({before:b,after:a,out:path.join(root,'out'),history});
 assert.equal(r.status,'limited-needs-human-review');
 assert.equal(JSON.parse(fs.readFileSync(history)).entries[0].status,'limited-needs-human-review');
}));
test('actual PNG image bytes yield measured differences without visual quality claim',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live());
 for(let i=0;i<4;i++){const file=`live-${String(i).padStart(2,'0')}.png`;
  fs.writeFileSync(path.join(root,'b',file),png([30,55,90]));fs.writeFileSync(path.join(root,'a',file),png([90,80,30]));}
 const r=compare({before:b,after:a,out:path.join(root,'out'),history:null});
 assert.equal(r.visualComparison.status,'measured-differences-not-quality');
 assert(r.visualComparison.pairs.every(x=>x.changedPixelFraction>0));
 assert(fs.readFileSync(path.join(root,'out','report-v594.html'),'utf8').includes('geänderte Pixel'));
}));
test('invalid/foreign PNG does not produce a fake measured visual comparison',()=>fixture(root=>{
 const b=write(root,'b',live()),a=write(root,'a',live());
 fs.writeFileSync(path.join(root,'b','live-00.png'),'not PNG');fs.writeFileSync(path.join(root,'a','live-00.png'),'not PNG');
 const r=compare({before:b,after:a,out:path.join(root,'out'),history:null});
 assert.equal(r.visualComparison.status,'partial-or-unavailable');
 assert.equal(r.visualComparison.pairs[0].pixelStatus,'incompatible-or-invalid-PNG');
}));
test('history list can run safely when no history exists',()=>fixture(root=>{
 const r=run(['--list',`--history=${path.join(root,'missing.json')}`]);assert.equal(r.status,0);assert(r.stdout.includes('no saved'));
}));
test('no source mutation or Spotify network calls in V594 scripts',()=>{
 for(const file of ['scripts/v594-concert-quality-comparison.cjs','scripts/v594-concert-quality-report.cjs','scripts/v594-concert-quality-cli.cjs']){
  const src=fs.readFileSync(file,'utf8');for(const marker of ['fetch(','localStorage.setItem(','camera.position.set(','spotifyApi','glbMixer.update('])assert(!src.includes(marker),`${file}: ${marker}`);
 }
});
test('package includes current version and older benchmark scripts',()=>{
 const p=require('../package.json');assert(Number(p.version.match(/-v(\d+)$/)?.[1]||0)>=594,'V594 and later releases must retain all historical tests');
 for(const s of ['test:v594','test:v594:types','test:smoke:v594','verify:v594','benchmark:v594:compare','benchmark:v594:history',
  'benchmark:v590:visual','benchmark:v591:concert','benchmark:v592:live','benchmark:v593:advise'])assert(p.scripts[s],s);
});
console.log(`V594 PASS: ${groups} regression groups`);

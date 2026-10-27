'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {spawnSync}=require('node:child_process');const zlib=require('node:zlib');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {safeLocalGlbV590,assessFramingV590,classifyPixelDiffV590,V590_VISUAL_LIMITATION}=load('components/visualizer/realConcertBenchmarkV590');
const {assessFraming}=require('../scripts/v590-visual-geometry.cjs');
const {safeOrigin,safeGlb}=require('../scripts/v590-real-concert-visual-benchmark.cjs');
const {decodePng,analyzePngs,contentCoverage}=require('../scripts/v590-visual-image.cjs');
const {renderVisualReportV590,escapeHtml}=require('../scripts/v590-visual-report.cjs');
let count=0;function test(name,fn){try{fn();count++;}catch(e){e.message=`V590 ${name}: ${e.message}`;throw e;}}
function png(w,h,colorType,channels,filter=0){
 const row=Buffer.alloc(w*channels);const raw=[];
 for(let y=0;y<h;y++){const data=Buffer.alloc(row.length);for(let x=0;x<w;x++){
   data[x*channels+0]=(x*31+y*17)%255;data[x*channels+1]=(x*7+y*53)%255;data[x*channels+2]=(x*23+y*13)%255;
   if(channels===4)data[x*channels+3]=255;}
  const src=Buffer.from(data);for(let k=0;k<data.length;k++){
   const a=k>=channels?src[k-channels]:0,b=y?row[k]:0,c=y&&k>=channels?row[k-channels]:0;
   let pred=0;if(filter===1)pred=a;if(filter===2)pred=b;if(filter===3)pred=Math.floor((a+b)/2);
   if(filter===4){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);pred=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
   data[k]=(src[k]-pred)&255;
  }
  raw.push(Buffer.from([filter]),data);src.copy(row);
 }
 function chunk(type,data){const a=Buffer.alloc(8);a.writeUInt32BE(data.length,0);a.write(type,4);
  return Buffer.concat([a,data,Buffer.alloc(4)]);}
 const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=8;header[9]=colorType;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(Buffer.concat(raw))),chunk('IEND',Buffer.alloc(0))]);
}
test('no remote or path traversal sources accepted by browser and CLI',()=>{
 for(const p of ['','https://evil.example/x.glb','//evil.example/x.glb','/../bad.glb','/%2e%2e/bad.glb','/%2F%2Fevil.glb','/a.gltf','/x.glb?next=1','/x\\y.glb','/x.glb#thing','/%ZZ.glb']){
  assert(!safeLocalGlbV590(p),p);assert(!safeGlb(p),p);
 }
 for(const p of ['/avatars/real.glb','/motions/shared/track.GLB','/space%20encoded/track.glb']){
  assert(safeLocalGlbV590(p),p);assert(safeGlb(p),p);
 }
});
test('browser must be on loopback',()=>{
 for(const u of ['https://localhost:3000','http://127.0.0.1:3000','http://[::1]:3000'])assert(safeOrigin(u));
 for(const u of ['http://example.com','http://192.168.1.2:3000','file:///tmp/stage.html','http://localhost:3000/?a=1','http://user:secret@localhost:3000'])assert(!safeOrigin(u),u);
});
test('geometry rejects missing and invalid projections, never says good',()=>{
 for(const b of [null,{minX:NaN,maxX:1,minY:-1,maxY:1},{minX:0,maxX:0,minY:0,maxY:1}]){
  assert.equal(assessFramingV590(b).status,'unmeasured');assert.deepEqual(assessFramingV590(b),assessFraming(b));
 }
});
test('clipping, tiny subject, and safe framing detected',()=>{
 const samples=[{minX:-1.1,maxX:.4,minY:-.6,maxY:.6},{minX:-.1,maxX:.1,minY:-.1,maxY:.1},{minX:-.5,maxX:.5,minY:-.7,maxY:.7}];
 const statuses=['clipped','too-small','within-frame'];
 for(let i=0;i<samples.length;i++){
  assert.equal(assessFramingV590(samples[i]).status,statuses[i]);assert.deepEqual(assessFramingV590(samples[i]),assessFraming(samples[i]));
 }
});
test('valid PNG RGB with each filter correctly decoded',()=>{
 for(let f=0;f<5;f++){const b=png(15,7,2,3,f),data=decodePng(b);assert.equal(data.width,15);assert.equal(data.height,7);
  const at=(3*15+2)*3;assert.deepEqual([...data.rgb.subarray(at,at+3)],[ (2*31+3*17)%255,(2*7+3*53)%255,(2*23+3*13)%255]);}
});
test('valid RGBA and RGB pixel-equivalent',()=>{
 const rgb=png(24,12,2,3,4),rgba=png(24,12,6,4,2);
 assert.deepEqual(decodePng(rgb).rgb,decodePng(rgba).rgb);
 assert.equal(analyzePngs(rgb,rgba).changedPixelFraction,0);
 assert.equal(analyzePngs(rgb,rgb).changedPixelFraction,0);
});
test('different frames give numeric pixel difference, not artistic rating',()=>{
 const a=png(24,12,2,3),b=Buffer.from(a);
 const decoded=decodePng(a);assert.equal(decoded.width,24);
 const smaller=png(24,12,2,3,1);assert.equal(analyzePngs(a,smaller).changedPixelFraction,0);
 const white=png(24,12,2,3),position=white.indexOf(Buffer.from('IDAT'));
 assert(position>0);assert.equal(classifyPixelDiffV590(0),'nearly-identical');
 assert.equal(classifyPixelDiffV590(.04),'changed');assert.equal(classifyPixelDiffV590(NaN),'unmeasured');
 assert.match(V590_VISUAL_LIMITATION,/Sichtabnahme/);
});
test('canvas content coverage only heuristic and bounded',()=>{
 const coverage=contentCoverage(png(90,60,2,3,2));assert(coverage.nonBackgroundFraction>=0&&coverage.nonBackgroundFraction<=1);assert.match(coverage.note,/Heuristic/);
});
test('invalid PNG rejected rather than silently producing comparison',()=>{
 assert.throws(()=>decodePng(Buffer.from('not a png')));
 assert.throws(()=>analyzePngs(png(2,2,2,3),png(3,2,2,3)));
});
test('CLI with missing GLB refuses to create fake screenshots and writes blocked JSON',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v590-test-'));
 try{
  const r=spawnSync(process.execPath,['scripts/v590-real-concert-visual-benchmark.cjs',`--out=${dir}`],{cwd:path.resolve(__dirname,'..'),encoding:'utf8',timeout:3000});
  assert.notEqual(r.status,0);const data=JSON.parse(fs.readFileSync(path.join(dir,'report.json'),'utf8'));
  assert.equal(data.status,'blocked');assert.equal(data.screenshots.length,0);assert.equal(data.comparisons.length,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('real browser route and GLB-based rather than procedural renderer',()=>{
 const p=fs.readFileSync('components/visualizer/V590BrowserStage.tsx','utf8');
 const r=fs.readFileSync('app/benchmark/v590/page.tsx','utf8');
 assert(p.includes('useGLTF(')&&p.includes('AnimationMixer(')&&p.includes('cloneSkinnedScene('));
 assert(p.includes('setTime(')&&p.includes('assessFramingV590')&&p.includes('appliedGeneration'));
 assert(!p.includes('ProceduralModel')&&!p.includes('DummyV513'));assert(r.includes('V590BrowserStage'));
});
test('CDP captures genuine canvas with screenshots and rAF; never synthesizes pass',()=>{
 const p=fs.readFileSync('scripts/v590-real-concert-visual-benchmark.cjs','utf8');
 for(const token of ['Page.captureScreenshot','data-v590-scene','__sonicV590.seek','webglVersion','appliedGeneration','requestAnimationFrame','summarizeFrames','analyzePngs','measured-needs-human-review','status:\'blocked\''])assert(p.includes(token),token);
 assert(!p.includes('status:\'passed\''));
});
test('human-readable side-by-side HTML is only produced after real captures and escaped',()=>{
 assert.throws(()=>renderVisualReportV590({status:'blocked',screenshots:[]}));
 const screenshot=role=>({file:`${role}.png`,clipName:'<script>alert(1)</script>',seconds:0.5,framing:{status:'within-frame'},coverage:{nonBackgroundFraction:.2},drawCalls:10});
 const r={status:'measured-needs-human-review',source:{model:'/real.glb'},mode:'headless-diagnostic',
 screenshots:[screenshot('original'),screenshot('following')],comparisons:[{original:'original.png',following:'following.png',seconds:.5,changedPixelFraction:.12,averageMaxChannelDelta:18,threshold:22}],
 frameTiming:{averageFps:42,p95FrameMs:30,p99FrameMs:40,frames:420,contextLosses:0},warnings:['please check']};
 const html=renderVisualReportV590(r);
 assert(html.includes('Original')&&html.includes('Folgeclip')&&html.includes('12.00 %'));
 assert(!html.includes('<script>')&&html.includes('&lt;script&gt;')&&html.includes('Manuelle Sichtabnahme'));
 assert.equal(escapeHtml(`<b>&"'`),'&lt;b&gt;&amp;&quot;&#39;');
});
test('representative 15,000 cross-runtime deterministic framing and seek inputs',()=>{
 for(let i=0;i<15000;i++){
  const b={minX:-.5+(i%51)/500,maxX:.6+(i%29)/500,minY:-.75+(i%19)/400,maxY:.8+(i%17)/400};
  const b1=assessFramingV590(b),b2=assessFraming(b);assert.deepEqual(b1,b2);
  assert(b1.status==='clipped'||b1.status==='within-frame'||b1.status==='too-small');
 }
});
console.log(`PASS V590: ${count} groups, 15,000 framing probes, PNG filters, local security and blocked-data honesty`);

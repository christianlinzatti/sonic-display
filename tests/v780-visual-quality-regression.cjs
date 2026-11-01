'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),zlib=require('node:zlib'),Module=require('node:module'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),ts=require('./typescript-loader.cjs');
const file=path.join(root,'services/monitoring/visualQualityPlanV780.ts');
const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0);
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(compiled.outputText,file);
const {visualPlanV780,normalizeVisualFramesV780}=m.exports;
assert.equal(visualPlanV780().length,36);assert.deepEqual([...new Set(visualPlanV780().map(x=>x.frame))],[96,208]);
assert.deepEqual(normalizeVisualFramesV780([96,216]),[96,216]);
for(const invalid of [[],[5],[1801],[96,96],[96,96,216],[96,216,312,408],[NaN],[96.5]])assert.throws(()=>normalizeVisualFramesV780(invalid));
assert.equal(new Set(visualPlanV780().map(x=>x.filename)).size,36);
const report=require('../scripts/v780-visual-quality-report.cjs'),runner=require('../scripts/v780-visual-capture-browser.cjs');
assert.deepEqual(runner.frames('96,216'),[96,216]);
for(const url of ['https://evil.org','http://localhost.example','file:///etc/passwd','http://hacker@127.0.0.1:3000'])assert.equal(runner.localUrl(url),false);
assert(runner.localUrl('http://127.0.0.1:3000'));
for(const glb of ['//other/a.glb','/../secret.glb','/avatar.glb?x=1','/%2e%2e/a.glb','http://evil/a.glb'])assert(!runner.glbPath(glb));
assert(runner.glbPath('/benchmark/avatar.glb'));
for(const bad of ['../x.png','A.png','a.html','x.png/../x'])assert(!report.validSlug(bad));
function crc32(data){let c=0xffffffff;for(const v of data){c^=v;for(let b=0;b<8;b++)c=c&1?(c>>>1)^0xedb88320:c>>>1}return (c^0xffffffff)>>>0}
function chunk(type,payload){const name=Buffer.from(type,'ascii'),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(payload.length);crc.writeUInt32BE(crc32(Buffer.concat([name,payload])));return Buffer.concat([len,name,payload,crc])}
function pngColor(rgb){const width=960,height=540,raw=Buffer.alloc(height*(width*3+1));for(let y=0;y<height;y++){const row=y*(width*3+1);raw[row]=0;for(let x=0;x<width;x++){const pos=row+1+x*3;raw[pos]=rgb[0]+Math.floor(x*0.08);raw[pos+1]=rgb[1]+Math.floor(y*0.1);raw[pos+2]=rgb[2]}}
 const header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v780-test-'));
try{
 const original=pngColor([26,48,70]);const other=pngColor([38,63,84]);
 assert.equal(report.decodePng(original).width,960);
 assert(report.metrics(report.decodePng(original)).contrastStd>1);
 assert.equal(report.difference(report.decodePng(original),report.decodePng(original)),0);
 assert(report.difference(report.decodePng(original),report.decodePng(other))>0);
 const images=visualPlanV780([96,216]).map(s=>{const binary=s.profile==='cinematic'?original:other;fs.writeFileSync(path.join(dir,s.filename),binary);
  return {...s,file:s.filename,viewport:'960x540',renderer:'Mock WebGL GPU',assetMode:'user-glb',hashes:['a'.repeat(64)],sha256:crypto.createHash('sha256').update(binary).digest('hex')};});
 const manifest={format:'sonic-visual-quality-v780',status:'ok',frames:[96,216],images};
 const assessment=report.write(dir,manifest);assert.equal(assessment.status,'ready');assert.equal(assessment.verifiedImages,36);assert.equal(assessment.comparisons.length,24);assert.equal(assessment.imageMetrics.length,36);
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert(html.includes('cinematic')&&html.includes('economy')&&html.includes('Pixelabweichung'));
 const cli=cp.spawnSync(process.execPath,[path.join(root,'scripts/v780-visual-quality-report.cjs'),`--dir=${dir}`],{encoding:'utf8'});assert.equal(cli.status,2,'requires manifest on disk');
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest));
 const cliOk=cp.spawnSync(process.execPath,[path.join(root,'scripts/v780-visual-quality-report.cjs'),`--dir=${dir}`],{encoding:'utf8'});assert.equal(cliOk.status,0,cliOk.stderr);
 const broken=structuredClone(manifest);broken.images[0].sha256='b'.repeat(64);assert.equal(report.report(dir,broken).status,'blocked','corrupt image hash');
 broken.images[0].sha256=manifest.images[0].sha256;broken.images[1].hashes=['b'.repeat(64)];assert.equal(report.report(dir,broken).status,'blocked','mismatching GLB');
 const missing=structuredClone(manifest);missing.images.pop();assert.equal(report.report(dir,missing).status,'blocked','incomplete');
 const blocked=structuredClone(manifest);blocked.status='blocked';assert.equal(report.report(dir,blocked).status,'blocked');
 const dup=structuredClone(manifest);dup.images[1]={...dup.images[0]};assert.equal(report.report(dir,dup).status,'blocked');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const token of ['__sonicV780','visualFrameV780','mixer.setTime(aligned/60)','preserveDrawingBuffer:visualModeV780','canvas.toDataURL(\'image/png\')','normalizeVisualFramesV780','lyricsSynced.current'])assert(fixture.includes(token),token);
const browserScript=fs.readFileSync(path.join(root,'scripts/v780-visual-capture-browser.cjs'),'utf8');
for(const token of ['visualPlanV780(cfg.frames)','profileV779','visualV780','concertBenchV777','assetMode','sha256','window.__sonicV780.capture','chrome.kill'])assert(browserScript.includes(token),token);
assert(!fixture.includes('new WebGLRenderer('));
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:78\d|79\d|[89]\d\d|\d{4,})$/);
for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v780 && npm run test:v780:types &&'),k);
console.log('PASS V780: 36 real visual scenarios, fixed GLB/lyrics/cue timing, strict browser evidence, PNG decoding, hashes, contrast and comparison, HTML review, offline CLI, fail-closed guards');

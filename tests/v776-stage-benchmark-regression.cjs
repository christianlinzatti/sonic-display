'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),os=require('node:os');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const filename=path.join(root,'services/monitoring/stageBenchmarkV776.ts');const source=fs.readFileSync(filename,'utf8');
const compiled=ts.transpileModule(source,{fileName:filename,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
assert.equal(compiled.diagnostics?.length??0,0);
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));m._compile(compiled.outputText,filename);
const {summarizeSceneV776,compareStageReportsV776,BENCHMARK_STAGES_V776:stages}=m.exports;
const sample=(ms=16,calls=10)=>({ms,calls,triangles:300,geometries:15,textures:3,programs:4,contextLost:false});
const frames=Array.from({length:100},(_,i)=>sample(i<95?16:35,10));
const r=summarizeSceneV776('rock',frames);
assert.equal(r.frames,100);assert.equal(r.p95Ms,16);assert.equal(r.avgCalls,10);assert(r.fps>50&&r.fps<65);
assert.equal(summarizeSceneV776('rock',[sample(16,3),sample(16,9)]).avgCalls,6);
assert.equal(summarizeSceneV776('galaxy',[{...sample(),programs:null}]).maxPrograms,null);
for(const broken of [[],[sample(0)],[sample(-1)],[sample(16,-1)],[sample(16,0)],[{...sample(),contextLost:true}],[{...sample(),textures:-1}]])
 assert.throws(()=>summarizeSceneV776('rock',broken),/Messpunkte|Draw Calls/);
const mk=(label,change=0)=>({format:'sonic-stage-benchmark-v776',version:1,label,measuredAt:'2026-10-31',
 environment:{userAgent:'Chromium fixture',renderer:'GPU X',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false},
 config:{fixtureId:'v776-fixed-stages-two-actors-v1',stages,passes:2,warmupFrames:60,sampleFrames:240,avatarCount:2,audioMode:'none'},
 scenes:stages.map(stage=>({...r,stage,fps:r.fps+change,avgCalls:10-change,p95Ms:r.p95Ms+change,frames:478}))});
const before=mk('v767'),after=mk('v776',-1);const comp=compareStageReportsV776(before,after);
assert.equal(comp.status,'comparable');assert.equal(comp.rows.length,6);
assert.equal(comp.rows[0].callsBefore,10);assert.equal(comp.rows[0].callsAfter,11);
assert.equal(comp.rows[0].callsPct,10);
for(const [key,value] of [['renderer','different'],['viewport','1920x1080'],['userAgent','different'],['dpr',2],['softwareRenderer',true]]){
 const x=structuredClone(after);x.environment[key]=value;
 assert.equal(compareStageReportsV776(before,x).status,'incompatible',key);
}
for(const [key,value] of [['passes',3],['warmupFrames',30],['sampleFrames',90],['avatarCount',4],['audioMode','beat'],['fixtureId','invalid']]){
 const x=structuredClone(after);x.config[key]=value;assert.equal(compareStageReportsV776(before,x).status,'incompatible',key);
}
const miss=structuredClone(after);miss.scenes.pop();assert.equal(compareStageReportsV776(before,miss).status,'incompatible');
const lost=structuredClone(after);lost.scenes[0].frames--;assert.equal(compareStageReportsV776(before,lost).status,'incompatible');
const component=fs.readFileSync(path.join(root,'components/visualizer/StageBenchmarkV776.tsx'),'utf8');
const browser=fs.readFileSync(path.join(root,'scripts/v776-stage-benchmark-browser.cjs'),'utf8');
const compare=fs.readFileSync(path.join(root,'scripts/v776-compare-benchmarks.cjs'),'utf8');
const installer=fs.readFileSync(path.join(root,'scripts/v776-install-benchmark-harness.cjs'),'utf8');
assert(component.includes('StageEnvironment theme={stage}'),'real stage implementation');
assert(component.includes('dpr={1}')&&component.includes('antialias:false'));
assert(component.includes('size.width')&&component.includes('gl.getPixelRatio()'),'actual drawing resolution is measured');
assert(component.includes('await frameWait(warmupFrames)')&&component.includes('pass=-2'));
assert(component.includes('collector.current.frames.slice(1)'));
assert(component.includes('960 × 540')&&component.includes('<Actor side={-1}/><Actor side={1}/>'));
assert(!/useGLTF|fetch\(|localStorage|new WebGLRenderer|setInterval/.test(component));
assert(component.includes("get('stageBenchV776')==='1'"),'explicit localhost opt-in');
assert(browser.includes('Emulation.setDeviceMetricsOverride')&&browser.includes('Runtime.evaluate'));
assert(browser.includes('localUrl(root)')&&browser.includes('window.__sonicV776.run('));
assert(compare.includes("result.status!=='comparable'"));
assert(installer.includes('fs.existsSync(path.join(target,name))'),'no overwriting older code');
assert.match(require('../package.json').version,/^0\.1\.0-v(?:77[6-9]|7[89]\d|[89]\d\d|\d{4,})$/);
for(const name of ['check:fast','build:preflight'])assert(require('../package.json').scripts[name].includes('npm run test:v776 && npm run test:v776:types &&'));
const {install}=require('../scripts/v776-install-benchmark-harness.cjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v776-backport-test-'));
try{
 fs.writeFileSync(path.join(tmp,'package.json'),JSON.stringify({name:'sonic-display',version:'0.1.0-v767'}));
 fs.mkdirSync(path.join(tmp,'components/visualizer'),{recursive:true});
 fs.writeFileSync(path.join(tmp,'components/visualizer/original.ts'),'unchanged');
 assert.equal(install(tmp).length,3);
 assert.equal(fs.readFileSync(path.join(tmp,'components/visualizer/original.ts'),'utf8'),'unchanged');
 assert.throws(()=>install(tmp),/existiert bereits/);
}finally{fs.rmSync(tmp,{force:true,recursive:true});}
console.log('PASS V776: scene aggregation, p95, 6-stage report, strict matching, browser CDP, one Canvas, backport safety and release gates');

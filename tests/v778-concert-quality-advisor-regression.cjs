'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),Module=require('node:module'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),ts=require('./typescript-loader.cjs');
const filename=path.join(root,'services/monitoring/concertQualityAdvisorV778.ts');
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0);
const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(compiled.outputText,filename);
const {assessConcertQualityV778:advise,summarizeConcertQualityComparisonV778:comp}=mod.exports;
const scenes=([2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({
 id:`${stage}-${avatars}glb`,stage,avatarCount:avatars,frames:358,fps:avatars===2?60:45,p95Ms:avatars===2?16:24,
 avgCalls:avatars===2?88:140,avgTriangles:avatars===2?200000:360000,maxGeometries:25,maxTextures:12,maxPrograms:5
}))));
const report=(mode='user-glb')=>({status:'ok',source:'real-browser',report:{
 format:'sonic-concert-benchmark-v777',version:1,label:'local run',measuredAt:'2026-10-31T10:00:00.000Z',
 environment:{userAgent:'Chromium',renderer:'AMD Radeon',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false},
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',stages:['cyberpunk','rock','galaxy'],counts:[2,4],passes:2,warmupFrames:60,sampleFrames:180,
 audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
 assets:{urls:['/benchmark/prod.glb'],hashes:['a'.repeat(64)],bytes:[450000],animations:4,skinnedMeshes:2,mouthMorphs:2,mode},scenes:structuredClone(scenes)}});
const good=report(),a60=advise(good,60);assert.equal(a60.status,'ready');
assert.equal(a60.cases.length,6);assert.equal(a60.groups.length,2);
assert.equal(a60.recommendedAvatars,2);assert.equal(a60.recommendedQuality,'balanced');
assert.equal(a60.evidence,'fixture-only');assert.equal(a60.cases[0].frameBudgetMarginMs,.7);
assert.equal(a60.groups[0].targetReached,true);assert.equal(a60.groups[1].targetReached,false);
assert.match(a60.hardwareVerdict,/kein belastbares Raspberry-Pi/);
const a30=advise(good,30);assert.equal(a30.recommendedAvatars,4);assert.equal(a30.groups[1].targetReached,true);
const a45=advise(good,45);assert.equal(a45.recommendedAvatars,2);
const ref=advise(report('reference'));assert.equal(ref.evidence,'reference-only');assert.match(ref.hardwareVerdict,/zu klein/);
const software=report();software.report.environment.softwareRenderer=true;
assert.equal(advise(software).evidence,'software-only');
const allFast=report();for(const s of allFast.report.scenes){s.fps=61;s.p95Ms=12}
assert.equal(advise(allFast).recommendedQuality,'high');
const badFrames=report();badFrames.report.scenes[2].p95Ms=0;
assert.equal(advise(badFrames).status,'blocked');
for(const make of [
 ()=>({status:'blocked',message:'browser offline'}),
 ()=>null,()=>({hello:'world'}),
 ()=>{const x=report();x.report.scenes.pop();return x},
 ()=>{const x=report();x.report.scenes[5].id=x.report.scenes[0].id;return x},
 ()=>{const x=report();x.report.assets.hashes=['unverified'];return x},
 ()=>{const x=report();x.report.environment.renderer='';return x},
 ()=>{const x=report();x.report.config.audioMode='spotify-real';return x},
 ()=>{const x=report();x.report.scenes[1].avgCalls=0;return x},
 ()=>{const x=report();x.report.scenes[1].fps=Infinity;return x},
 ]){const result=advise(make());assert.equal(result.status,'blocked');assert.equal(result.recommendedAvatars,null);assert.equal(result.cases.length,0);assert.equal(result.recommendations.length,0)}
assert.equal(advise(good,17).status,'blocked');
const slow=report();for(const s of slow.report.scenes){s.fps=20;s.p95Ms=52}
assert.equal(advise(slow).recommendedAvatars,null);assert.equal(advise(slow).recommendedQuality,'low');
const compareRows=scenes.map(s=>({id:s.id,fpsPct:8,p95Pct:-8}));
assert.equal(comp({status:'comparable',warnings:[],rows:compareRows}).improved,6);
assert.equal(comp({status:'incompatible',warnings:['Andere GLBs'],rows:compareRows}).status,'incompatible');
assert.equal(comp({status:'comparable',warnings:[],rows:compareRows.slice(0,5)}).status,'incompatible');
const mixed=comp({status:'comparable',warnings:[],rows:[{fpsPct:8,p95Pct:-9},{fpsPct:-7,p95Pct:8},{fpsPct:1,p95Pct:1},
 ...Array.from({length:3},()=>({fpsPct:0,p95Pct:0}))]});assert.deepEqual([mixed.improved,mixed.regressed,mixed.neutral],[1,1,4]);
const ui=fs.readFileSync(path.join(root,'components/visualizer/ConcertQualityAdvisorV778.tsx'),'utf8');
assert(ui.includes("accept=\".json,application/json\"")&&ui.includes('assessConcertQualityV778(current,target)'));
assert(ui.includes('compareConcertReportsV777')&&ui.includes('file.text()')&&ui.includes('JSON.stringify(payload'));
assert(!/fetch\(|XMLHttpRequest|new WebGLRenderer|<Canvas|setInterval\(/.test(ui));
const route=fs.readFileSync(path.join(root,'app/diagnostics/concert-quality/page.tsx'),'utf8');assert(route.includes('ConcertQualityAdvisorV778'));
assert(fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8').includes('/diagnostics/concert-quality'));
const cli=require('../scripts/v778-concert-quality-advisor.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v778-cli-'));
try{
 const input=path.join(dir,'input.json'),out=path.join(dir,'advice.json');fs.writeFileSync(input,JSON.stringify(good));
 const ok=cp.spawnSync(process.execPath,[path.join(root,'scripts/v778-concert-quality-advisor.cjs'),`--input=${input}`,`--out=${out}`,'--target=60'],{encoding:'utf8'});
 assert.equal(ok.status,0,ok.stderr);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).recommendedAvatars,2);
 assert.match(fs.readFileSync(out.replace(/\.json$/,'')+'.md','utf8'),/Hardwareevidenz/);
 const blockedInput=path.join(dir,'blocked.json');fs.writeFileSync(blockedInput,JSON.stringify({status:'blocked'}));
 const blockedCli=cp.spawnSync(process.execPath,[path.join(root,'scripts/v778-concert-quality-advisor.cjs'),`--input=${blockedInput}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(blockedCli.status,2);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).status,'blocked');
 const base=path.join(dir,'base.json');fs.writeFileSync(base,JSON.stringify(good));
 const comparable=cp.spawnSync(process.execPath,[path.join(root,'scripts/v778-concert-quality-advisor.cjs'),`--input=${input}`,`--before=${base}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(comparable.status,0,comparable.stderr);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).comparison.status,'comparable');
 const different=report();different.report.assets.hashes=['b'.repeat(64)];fs.writeFileSync(base,JSON.stringify(different));
 const incompatible=cp.spawnSync(process.execPath,[path.join(root,'scripts/v778-concert-quality-advisor.cjs'),`--input=${input}`,`--before=${base}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(incompatible.status,2);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).comparison.status,'incompatible');
 fs.writeFileSync(base,JSON.stringify({status:'blocked'}));
 const invalidBase=cp.spawnSync(process.execPath,[path.join(root,'scripts/v778-concert-quality-advisor.cjs'),`--input=${input}`,`--before=${base}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(invalidBase.status,2);assert.match(JSON.parse(fs.readFileSync(out,'utf8')).comparison.summary,/ungültig/);
 assert.throws(()=>cli.loadJson(path.join(dir,'does-not-exist.json')));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:77[6-9]|7[89]\d|[89]\d\d|\d{4,})$/);
for(const name of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[name].includes('npm run test:v778 && npm run test:v778:types &&'));
console.log('PASS V778: strict V777 evidence, six scenes, 30/45/60 FPS, 2/4 GLB capacity, hardware caveats, fair comparisons, local UI/CLI/JSON/Markdown, pipeline');

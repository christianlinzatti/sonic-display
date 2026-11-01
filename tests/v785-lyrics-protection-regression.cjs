'use strict';
/** Pure geometry, fail-closed measured GLB report, offline CLI, integration and pipeline. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const ts=require('./typescript-loader.cjs'),Module=require('node:module');const root=path.resolve(__dirname,'..');
function load(file){const f=path.join(root,file),built=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}),m=new Module(f,module);
 m.filename=f;m.paths=Module._nodeModulePaths(path.dirname(f));m._compile(built.outputText,f);return m.exports;}
const {selectLyricsAnchorV785,lyricsProxyOverlapV785,summarizeLyricsSceneV785,LYRICS_ANCHORS_V785}=load('services/monitoring/lyricsProtectionV785.ts');
assert.equal(LYRICS_ANCHORS_V785.length,6);
assert.deepEqual(selectLyricsAnchorV785([],{x:.43,y:-.68}),{x:.43,y:-.68},'previous safe anchor is sticky');
assert.notDeepEqual(selectLyricsAnchorV785([[.43,-.65]],{x:.43,y:-.68}),{x:.43,y:-.68},'collision must override hysteresis');
const initial=selectLyricsAnchorV785([]);assert.deepEqual(initial,{x:0,y:-.66});
const shift=selectLyricsAnchorV785([[0,-.62]]);assert.notEqual(shift.x,0,'move away from the stage proxy');
assert(lyricsProxyOverlapV785({left:-.2,right:.2,bottom:-.7,top:-.5},[[0,-.6]]));
assert(!lyricsProxyOverlapV785({left:-.2,right:.2,bottom:-.7,top:-.5},[[.9,.6]]));
const makeSamples=(on)=>Array.from({length:240},(_,frame)=>({frame,expectedLine:Math.floor(frame/104)%4,displayedLine:Math.floor(frame/104)%4,
 rect:on?{left:-.32,right:.32,bottom:-.78,top:-.54}:{left:-1.3,right:1.3,bottom:-.8,top:-.51},proxyOverlap:!on}));
const scene=summarizeLyricsSceneV785('rock-4glb',0,4,makeSamples(true));
assert.equal(scene.clipPct,0);assert.equal(scene.proxyOverlapPct,0);assert.equal(scene.lineLagPct,0);assert.equal(scene.frames,240);
const old=summarizeLyricsSceneV785('rock-4glb',1,4,makeSamples(false));assert.equal(old.clipPct,100);assert.equal(old.proxyOverlapPct,100);
const delayed=makeSamples(true);for(let j=104;j<111;j++)delayed[j].displayedLine=0;
assert.equal(summarizeLyricsSceneV785('rock-4glb',0,4,delayed).maxConsecutiveLag,7);
for(const mutate of [a=>a.splice(0,160),a=>a[8].rect=null,a=>a[7].rect.left=NaN,a=>a[6].frame=4,
 a=>a[1].expectedLine=4,a=>a[2].rect.right=-10,a=>a[5].proxyOverlap='yes']){
 const broken=structuredClone(makeSamples(true));mutate(broken);assert.throws(()=>summarizeLyricsSceneV785('rock-4glb',0,4,broken));}
const {reviewLyricsRunsV785,LYRICS_ORDER_V785}=load('services/monitoring/lyricsReviewV785.ts');
function records(){const env={userAgent:'Chrome GPU',renderer:'Real GPU 123',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false};
 return LYRICS_ORDER_V785.map(mode=>({status:'ok',report:{format:'sonic-concert-benchmark-v777',version:1,environment:{...env},
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:'balanced',cameraV784:'on',lyricsV785:mode,passes:2,warmupFrames:60,sampleFrames:240,
  stages:['cyberpunk','rock','galaxy'],counts:[2,4],audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
 assets:{hashes:['a'.repeat(64)],bytes:[38000],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'user-glb'},
 scenes:[2,4].flatMap(avatarCount=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatarCount}glb`,stage,avatarCount,
  frames:478,fps:58,p95Ms:17.5,avgCalls:31,avgTriangles:100,maxGeometries:10,maxTextures:10,maxPrograms:1})))},
 lyricsV785:{format:'sonic-lyrics-protection-v785',version:1,mode,environment:{...env},assets:{hashes:['a'.repeat(64)],mode:'user-glb'},
  config:{passes:2,sampleFrames:240,warmupFrames:60,timeline:'scripted-shots-240f-v784',sampling:'projected-3d-glyph-bounds-v785'},
  scenes:[0,1].flatMap(pass=>[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatars}glb`,pass,avatars,
   frames:240,clipPct:mode==='on'?0:42,proxyOverlapPct:mode==='on'?0:18,lineLagPct:1,maxConsecutiveLag:1,largePositionJumps:mode==='on'?0:4,notes:[]}))))}}));}
const good=records(),review=reviewLyricsRunsV785(good);
assert.equal(review.status,'ready',review.issues.join('; '));assert.equal(review.rows.length,6);
assert(review.rows.every(r=>r.clipOn<r.clipOff&&r.proxyOverlapOn<r.proxyOverlapOff));
for(const mutate of [a=>a.pop(),a=>a[0].status='blocked',a=>a[1].report.config.lyricsV785='off',
 a=>a[1].report.config.cameraV784='off',a=>a[1].report.config.sampleFrames=180,
 a=>a[0].report.environment.softwareRenderer=true,a=>a[0].report.assets.hashes=['b'.repeat(64)],
 a=>a[3].report.environment.renderer='different GPU',a=>a[1].lyricsV785.environment.renderer='different GPU',
 a=>a[0].lyricsV785.scenes.pop(),a=>a[0].lyricsV785.scenes[1]={...a[0].lyricsV785.scenes[0]},
 a=>a[0].report.scenes.pop(),a=>a[0].report.scenes[0].fps=0,
 a=>a[1].lyricsV785.scenes[0].clipPct=NaN,a=>a[1].lyricsV785.scenes[0].proxyOverlapPct=101]){
 const bad=structuredClone(good);mutate(bad);assert.equal(reviewLyricsRunsV785(bad).status,'blocked',String(mutate));}
const cli=require('../scripts/v785-lyrics-protection.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const url of ['http://evil.test','http://127.0.0.1.evil.test','file:///etc/passwd'])assert(!cli.localUrl(url));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v785-'));
try{const input=path.join(tmp,'runs.json'),out=path.join(tmp,'result.json');fs.writeFileSync(input,JSON.stringify({runs:good}));
 let proc=cp.spawnSync(process.execPath,[path.join(root,'scripts/v785-lyrics-protection.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(proc.status,0,proc.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).rows.length,6);assert(fs.readFileSync(out.replace('.json','.md'),'utf8').includes('Zeilenverzögerung'));
 fs.writeFileSync(input,JSON.stringify({runs:good.slice(0,1)}));proc=cp.spawnSync(process.execPath,[path.join(root,'scripts/v785-lyrics-protection.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(proc.status,2,proc.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).status,'blocked');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const token of ['selectLyricsAnchorV785','Box3','area.setFromObject(group,true)','group.quaternion.copy(camera.quaternion)',
 'summarizeLyricsSceneV785','lyricsEnabledV785','lyricsSamplesV785','window.__sonicV785','lyricsModeV785'])assert(fixture.includes(token),token);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
assert(browser.includes("u.searchParams.set('lyricsV785',lyricsV785)")&&browser.includes('record.lyricsV785=lyrics'));
const pkg=require('../package.json');assert(/^0\.1\.0-v(?:785|78[6-9]|79\d|[8-9]\d\d)$/.test(pkg.version));
for(const k of ['check:fast','build:preflight','check:release'])assert(pkg.scripts[k].includes('npm run test:v785 && npm run test:v785:types &&'),k);
console.log('PASS V785: 3D glyph bounds, safe anchors, line latency, strict 6-case off/on paired GPU/GLB validation, CLI and benchmarks');

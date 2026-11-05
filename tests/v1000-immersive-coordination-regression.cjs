'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/immersiveConcertDirectorV1000');
const root=path.resolve(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {transpileModule,ScriptTarget,ModuleKind,JsxEmit,DiagnosticCategory}=require('./typescript-loader.cjs');
let count=0;function test(label,fn){fn();count++;console.log('PASS V1000 '+label);}
const base={trackId:'spotify-track',stageTrackId:'spotify-track',durationMs:185000,sceneStartMs:32000,
 section:'verse',verified:true,playing:true,autoEnabled:true,reducedMotion:false,
 manual:false,blackout:false,seekBlocked:false,lyricsProtected:false,vocalFocus:false,
 settings:{...v.DEFAULT_IMMERSIVE_V1000,enabled:true}};
const plan=o=>v.planImmersiveV1000({...base,...o});
test('off by default and neutral fallback is stable',()=>{
 assert.equal(v.DEFAULT_IMMERSIVE_V1000.enabled,false);
 assert.equal(plan({settings:v.DEFAULT_IMMERSIVE_V1000}).active,false);
 assert.deepEqual({...plan({settings:v.DEFAULT_IMMERSIVE_V1000}).gains},{led:1,bass:1,crowd:1});
});
test('strict preference normalization rejects unknown styles and nonnumeric strength',()=>{
 assert.equal(v.normalizeImmersiveV1000({enabled:'true'}).enabled,false);
 assert.equal(v.normalizeImmersiveV1000({enabled:true,style:'explosion',intensity:Infinity}).intensity,60);
 assert.equal(v.normalizeImmersiveV1000({style:'explosion'}).style,'cinematic');
 assert.equal(v.normalizeImmersiveV1000({intensity:-999}).intensity,0);
 assert.equal(v.normalizeImmersiveV1000({intensity:999}).intensity,100);
 assert.equal(v.normalizeImmersiveV1000({protectLyrics:'false'}).protectLyrics,true);
 assert.equal(v.normalizeImmersiveV1000({protectLyrics:false}).protectLyrics,false);
});
test('only real verified song-bound scene permits active coordination',()=>{
 for(const c of [{verified:false},{stageTrackId:'another'},{trackId:''},{stageTrackId:''},
 {durationMs:0},{durationMs:Infinity},{sceneStartMs:-1},{sceneStartMs:185000},{sceneStartMs:NaN}]){
  const p=plan(c);assert.equal(p.active,false,JSON.stringify(c));assert.deepEqual({...p.gains},{led:1,bass:1,crowd:1});
 }
});
test('manual, blackout, pause, seek, accessibility and disabled auto are neutral',()=>{
 for(const c of [{playing:false},{autoEnabled:false},{manual:true},{blackout:true},{seekBlocked:true},
  {reducedMotion:true},{settings:{...base.settings,intensity:0}}]){
  const p=plan(c);assert.equal(p.active,false,JSON.stringify(c));assert.equal(p.gains.bass,1);
 }
});
test('known musical sections have distinct coordinated dramaturgy',()=>{
 const verse=plan({section:'verse'}),drop=plan({section:'drop'}),intro=plan({section:'intro'});
 assert(verse.active&&drop.active&&intro.active);
 assert.equal(verse.section,'verse');assert.equal(drop.section,'drop');
 assert(verse.gains.crowd<drop.gains.crowd);
 assert(intro.gains.bass<drop.gains.bass);
});
test('unknown scene is not guessed from artist metadata or BPM',()=>{
 assert.equal(plan({section:'verse-with-drop'}).reason,'unknown-section');
 assert.equal(plan({section:'unknown',momentKind:null}).active,false);
 assert.equal(plan({section:'',momentKind:'rise'}).active,false);
 assert.equal(plan({section:'',momentKind:'drop'}).section,'drop');
 assert.equal(plan({section:'bridge'}).section,'break');
});
test('vocal and lyrics protections can only reduce permitted channels',()=>{
 const plain=plan({section:'hook',settings:{...base.settings,style:'festival'}});
 const focused=plan({section:'hook',vocalFocus:true,lyricsProtected:true});
 for(const lane of ['led','bass','crowd'])assert(focused.gains[lane]<=plain.gains[lane]);
 assert(plan({section:'hook',lyricsProtected:true,settings:{...base.settings,protectLyrics:false}}).gains.led>=focused.gains.led);
});
test('intensity zero is neutral and full power only reduces preauthorized effects',()=>{
 for(const section of ['intro','verse','hook','build','drop','break','finale','outro']){
  const p=plan({section,settings:{...base.settings,intensity:100}});
  assert(p.active);
  for(const n of Object.values(p.gains))assert(n>=0&&n<=1&&Number.isFinite(n));
 }
});
test('10,000 adversarial combinations are bounded and non-increasing',()=>{
 const sections=['intro','verse','hook','build','drop','break','finale','outro','unknown'];
 const styles=['cinematic','festival','vocal'];
 for(let i=0;i<10000;i++){
  const p=plan({section:sections[i%sections.length],lyricsProtected:i%3===0,
   settings:{enabled:true,style:styles[i%3],intensity:i%101,protectLyrics:i%2===0},
   manual:i%19===0,blackout:i%17===0,reducedMotion:i%23===0});
  for(const gain of Object.values(p.gains))assert(Number.isFinite(gain)&&gain>=0&&gain<=1);
 }
});
test('production renders use same existing stage frame and three V999-decorated lanes',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 assert(stage.includes('planImmersiveV1000({'));assert(stage.includes('stageTrackId:liveSignalV882.trackId'));
 for(const k of ['getConcertFactorsV999().led*immersiveCueV1000.gains.led',
  'getConcertFactorsV999().bass*immersiveCueV1000.gains.bass',
  'getConcertFactorsV999().crowd*immersiveCueV1000.gains.crowd'])assert(stage.includes(k),k);
 const panel=read('components/visualizer/ConcertQualityDashboardV751.tsx');
 assert(panel.includes('<ImmersiveConcertPanelV1000/>'));
});
test('controller has no audio, GPU, Alexa, Govee or extra render authority',()=>{
 const sources=['components/visualizer/immersiveConcertDirectorV1000.ts',
  'components/visualizer/immersiveConcertStoreV1000.ts',
  'components/visualizer/ImmersiveConcertPanelV1000.tsx'];
 for(const filename of sources){
  const s=read(filename);
  for(const forbidden of ['useFrame(', 'requestAnimationFrame(', 'navigator.mediaDevices',
   '/api/govee','/api/alexa', 'new Audio(', 'setInterval(','setTimeout('])assert(!s.includes(forbidden),filename+': '+forbidden);
 }
 assert(!read(sources[0]).includes('fetch('));
});
test('all modified and new TypeScript/TSX files transpile without syntax errors',()=>{
 for(const f of ['components/visualizer/immersiveConcertDirectorV1000.ts',
  'components/visualizer/immersiveConcertStoreV1000.ts',
  'components/visualizer/ImmersiveConcertPanelV1000.tsx',
  'components/visualizer/ConcertQualityDashboardV751.tsx',
  'components/visualizer/DynamicStage.tsx']){
  const r=transpileModule(read(f),{fileName:f,reportDiagnostics:true,
   compilerOptions:{target:ScriptTarget.ES2022,module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}});
  assert.equal((r.diagnostics||[]).filter(d=>d.category===DiagnosticCategory.Error).length,0,f);
 }
});
test('release metadata and CI/production gate retain backwards coverage',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.version,/^0\.1\.0-v\d+$/);
 const release=Number(pkg.version.match(/-v(\d+)$/)[1]);assert(release>=1000);
 assert.equal(pkg.sonicRoadmapRelease,`v${release}`);assert.equal(pkg.sonicFeatureRelease,`v${release}`);
 assert(pkg.scripts.prebuild.includes('npm run test:v1000 && npm run test:v1000:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v1000-immersive-coordination-regression.cjs'));
 assert(read('.github/workflows/v1000-immersive-production-validation.yml').includes('npm run build:next'));
});
console.log('PASS V1000 '+count+' groups');

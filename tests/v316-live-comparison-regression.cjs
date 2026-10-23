const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file,deps={}){
  const compiled=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};new Function('module','exports','require',compiled)(mod,mod.exports,id=>{if(id in deps)return deps[id];throw Error(`unsupported ${id}`)});return mod.exports;
}
const prev=load('components/visualizer/danceImprovementAssistantV315.ts');
const engine=load('components/visualizer/danceComparisonHelpersV316.ts',{'./danceImprovementAssistantV315':prev});
const base=()=>({quality:{enabled:true,variety:65,minHoldSeconds:14,dancerFocus:70,fxCeiling:75},
  dance:{enabled:true,style:'auto',intensity:55,expressiveArms:true,bodyGroove:true,plantedFootSafety:true},
  performance:{enabled:true,style:'auto',fluidity:62,balance:55,footProtection:85,transitionPolish:65}});
const original=base(),snapshot=JSON.stringify(original);
assert.equal(engine.prepareComparisonV316(original,[]).ok,false,'do not open no-op previews');
const items=[{id:'a',field:'dance.intensity',before:55,after:67},{id:'b',field:'quality.fxCeiling',before:75,after:65},
  {id:'c',field:'performance.fluidity',before:62,after:75}];
const result=engine.prepareComparisonV316(original,items);
assert.equal(result.ok,true);
assert.equal(result.changed,3);
assert.equal(result.before.dance.intensity,55);
assert.equal(result.after.dance.intensity,67);
assert.equal(result.after.quality.fxCeiling,65);
assert.equal(result.after.performance.fluidity,75);
assert.equal(result.after.quality.dancerFocus,70);
assert.equal(JSON.stringify(original),snapshot,'preview cannot write to actual settings');
assert.equal(engine.prepareComparisonV316(original,[items[0],items[0]]).ok,false,'reject duplicate fields');
assert.equal(engine.prepareComparisonV316(original,[{...items[0],before:56}]).ok,false,'reject stale previews');
const disabled=base();disabled.dance.enabled=false;
assert.equal(engine.prepareComparisonV316(disabled,[items[0]]).ok,false,'disabled subsystem cannot be silently enabled');
for(const genre of ['Hardtekk','Deutschrap','Cinematic']){
  const bpm=engine.previewBpmV316(genre);
  assert.ok(bpm>=80&&bpm<=180);
  const cycle=(144*60)/bpm;
  const first=engine.demoSampleV316(0,genre);
  const again=engine.demoSampleV316(cycle,genre);
  assert.equal(first.section,again.section);
  assert.ok(Math.abs(first.kick-again.kick)<.0001,'same beat at repeated section');
  for(const fraction of [.05,.25,.35,.52,.62,.80,.91]){
    const sample=engine.demoSampleV316(cycle*fraction,genre);
    assert.ok(['verse','break','build','drop','hook'].includes(sample.section));
    assert.ok(sample.energy>=0&&sample.energy<=1&&sample.kick>=0&&sample.kick<=1);
    const rig=engine.demoRigMotionV316(sample);
    for(const n of Object.values(rig))assert.ok(Number.isFinite(n),'all rig animation targets are bounded and finite');
  }
}
const side=read('components/visualizer/DanceLiveComparisonV316.tsx');
for(const name of ['"use client"','<Canvas','SceneController','DemoHumanoid','useGLTF','cloneSkinnedScene',
  'createDanceQualityState','enhanceDanceQuality','refineDancePerformanceV311','advanceShowQualityV310','applyShowQualityV310',
  'Bisher · Original','Vorschlag · Vorschau','same','clock','aria-modal','onClose',"document.hidden",'synthetischer Beat']){
  assert.ok(side.includes(name),`missing real 3D comparison element ${name}`);
}
const parent=read('components/visualizer/VisualDanceImprovementStudioV315.tsx');
assert.ok(parent.includes("dynamic(()=>import('./DanceLiveComparisonV316')"),'3D preview must load on demand');
assert.ok(parent.includes('Live-3D-Vergleich öffnen · V316')||parent.includes('Real-Motion-Vergleich öffnen · V317')); 
assert.ok(parent.includes('baseline={comparison.baseline}'));
assert.ok(parent.includes('proposals={comparison.proposals}'));
assert.ok(read('app/globals.css').includes('.dance-comparison-v316-grid'));
assert.ok(/^0\.1\.0-v(316|317|318|319|320|321|322|323|324|325|326|327|328|329|330|331|332|333|334|335|336|337|338|339|340|341|342|343|344|345|346|347|348|349|350|351|352|353|354|355|356|357|358|359|360|361|362|363|364|365|366|367|368|369|370|371|375|376|377|378|379|380|381|382|383|384|385|386|387|388|389|390|391|392|393|394|395|396|397|398|399|400|401|402|403|404|405|406|407|408|409|410|411|412|413|414|415|416|417)$/.test(require('../package.json').version));
console.log('PASS V316: pure A/B snapshot, stale guard, deterministic shared beat, actual R3F rig/show engines, lazy 3D preview');

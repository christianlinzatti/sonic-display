'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=(()=>{try{return require('typescript');}catch{return require(path.join(path.dirname(path.dirname(process.execPath)),'lib/node_modules/typescript'));}})();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const eventLog=[];const store=new Map();const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 const code=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(code.diagnostics?.length||0,0);
 const mod={exports:{}};cache.set(file,mod);
 const ctx={module:mod,exports:mod.exports,Event:class{constructor(type){this.type=type;}},
  window:{dispatchEvent:e=>eventLog.push(e.type)},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
  require(id){if(!id.startsWith('@/'))throw Error('Unexpected dependency: '+id);
   const target=id.replace(/^@\//,'')+'.ts';return load(target);}};
 vm.runInNewContext(code.outputText,ctx,{filename:file,timeout:10000});return mod.exports;
}
const g=load('lib/goveeSectionDirectorV919.ts');const json=x=>JSON.parse(JSON.stringify(x));
const opts={...json(g.DEFAULT_GOVEE_SECTION_V919),enabled:true};
const mk=(a=[{label:'verse',startMs:0,durationMs:10000,confidence:.95},
 {label:'build',startMs:10000,durationMs:10000,confidence:.95},
 {label:'drop',startMs:20000,durationMs:10000,confidence:.95},
 {label:'hook',startMs:30000,durationMs:10000,confidence:.95},
 {label:'break',startMs:40000,durationMs:10000,confidence:.95}])=>({schema:'sonic-track-analysis-v318',trackId:'track',source:'json-import',durationMs:60000,
 beats:[],bars:[],sections:a,tempo:150,timeSignature:4,importedAt:0});
const base={color:{r:55,g:75,b:116},brightness:55};
let tests=0;function test(name,fn){fn();tests++;console.log('PASS V919 '+name);}
const plan=(time,analysis=mk(),settings=opts,trackId='track')=>g.planGoveeSectionV919(analysis,trackId,time,settings);
const apply=(decision,role='rhythm',settings=opts,brightness=55,master=75)=>
 g.applyGoveeSectionV919({...base,brightness},decision,role,settings,master);

test('opt-in defaults and disabled plan preserve existing V918 behavior',()=>{
 assert.equal(g.DEFAULT_GOVEE_SECTION_V919.enabled,false);
 assert.equal(g.loadGoveeSectionV919().enabled,false);
 assert.equal(plan(12000,mk(),{...opts,enabled:false}).active,false);
 assert.equal(plan(12000,mk(),{...opts,strength:0}).active,false);
});
test('untrusted settings cannot enable feature',()=>{
 for(const x of [null,undefined,false,[],{},'true',{enabled:'true'},{enabled:1}])
  assert.equal(g.normalizeGoveeSectionV919(x).enabled,false);
});
test('settings validated, constrained and finite',()=>{
 assert.deepEqual(json(g.normalizeGoveeSectionV919({enabled:true,strength:Infinity,minConfidence:5,preDropWindowMs:100,maxExtraBrightness:200})),
  {enabled:true,strength:65,minConfidence:50,preDropWindowMs:2000,maxExtraBrightness:15});
});
test('browser persistence and update events (no secrets)',()=>{
 g.saveGoveeSectionV919({...opts,strength:87});
 assert.equal(g.loadGoveeSectionV919().strength,87);
 assert.ok(eventLog.includes(g.GOVEE_SECTION_EVENT_V919));
 assert.equal(Object.keys(JSON.parse(store.get(g.GOVEE_SECTION_KEY_V919))).length,5);
 assert.ok(!/token|endpoint|password/i.test(store.get(g.GOVEE_SECTION_KEY_V919)));
});
test('corrupted storage safe disabled fallback',()=>{
 store.set(g.GOVEE_SECTION_KEY_V919,'invalid');assert.equal(g.loadGoveeSectionV919().enabled,false);
});
test('missing analysis is unchanged',()=>{
 const d=plan(15000,null);assert.equal(d.active,false);assert.deepEqual(json(apply(d)),base);
});
test('track identity enforced',()=>assert.equal(plan(15000,mk(),opts,'another').active,false));
test('invalid playback positions rejected',()=>{
 for(const t of [-1,NaN,Infinity,60000,100000])assert.equal(plan(t).active,false);
});
test('no section data is safe ambience',()=>assert.equal(plan(20000,mk([])).active,false));
test('unlabeled marker never produces dynamics',()=>{
 const a=mk([{startMs:0,durationMs:10000,confidence:1}]);assert.equal(plan(3000,a).active,false);
});
test('low-confidence section never produces dynamics',()=>{
 const a=mk([{label:'hook',startMs:0,durationMs:10000,confidence:.51}]);assert.equal(plan(3000,a).active,false);
});
test('current confidence must meet configured threshold',()=>{
 const a=mk([{label:'hook',startMs:0,durationMs:10000,confidence:.75}]);
 assert.equal(plan(3000,a,{...opts,minConfidence:80}).active,false);
 assert.equal(plan(3000,a,{...opts,minConfidence:70}).active,true);
});
test('verse is restrained, hook is stronger, break is softer',()=>{
 const v=plan(5000),h=plan(35000),b=plan(45000);
 assert.equal(v.phase,'verse');assert.equal(h.phase,'hook');assert.equal(b.phase,'break');
 assert.ok(v.intensity<0&&h.intensity>0&&b.intensity<v.intensity);
 assert.ok(apply(v).brightness<base.brightness);
 assert.ok(apply(h).brightness>base.brightness);
 assert.ok(apply(b).brightness<base.brightness);
});
test('drop starts strong and declines gently without strobe',()=>{
 const first=plan(20000),late=plan(28000);
 assert.equal(first.phase,'drop');assert.ok(first.intensity>late.intensity&&late.intensity>0);
 assert.ok(apply(first).brightness>apply(late).brightness);
});
test('build-up rises over its verified section',()=>{
 const start=plan(10000),middle=plan(15000),end=plan(19990);
 assert.ok(start.intensity<middle.intensity&&middle.intensity<end.intensity);
 assert.equal(end.verifiedDropAhead,true);
});
test('pre-drop cue requires adjacent verified drop',()=>{
 const a=mk();assert.equal(plan(19300,a).verifiedDropAhead,true);
 const labelChanged=mk(a.sections.map((s,i)=>i===2?{...s,label:'verse'}:s));
 assert.equal(plan(19300,labelChanged).verifiedDropAhead,false);
 const lowConfidence=mk(a.sections.map((s,i)=>i===2?{...s,confidence:.2}:s));
 assert.equal(plan(19300,lowConfidence).verifiedDropAhead,false);
 const gap=mk(a.sections.map((s,i)=>i===2?{...s,startMs:20250}:s));
 assert.equal(plan(19300,gap).verifiedDropAhead,false);
});
test('unspecified future section never becomes synthetic drop',()=>{
 const a=mk([{label:'build',startMs:0,durationMs:10000,confidence:1}]);
 assert.equal(plan(9990,a).verifiedDropAhead,false);
});
test('pre-drop never inferred when markers only indicate beats',()=>{
 const a=mk([{label:'build',startMs:0,durationMs:10000,confidence:1}]);a.beats=[{startMs:10000,durationMs:200,confidence:1}];
 assert.equal(plan(9990,a).verifiedDropAhead,false);
});
test('pre-drop window custom preference changes tension onset',()=>{
 const a=plan(16500,mk(),{...opts,preDropWindowMs:2000});
 const b=plan(16500,mk(),{...opts,preDropWindowMs:8000});
 assert.ok(a.intensity<b.intensity);
});
test('same analysis is deterministic and has no side effects',()=>{
 const a=mk();const copy=json(a);
 assert.deepEqual(json(plan(17600,a)),json(plan(17600,a)));
 assert.deepEqual(json(a),copy);
});
test('disabled, unrelated ambient and zero intensity do not touch reference',()=>{
 const no=g.planGoveeSectionV919(mk(),'track',1000,{...opts,enabled:false});
 const actual=g.applyGoveeSectionV919(base,no,'rhythm',opts,65);
 assert.equal(actual,base);
});
test('RGB is preserved for all roles and sections',()=>{
 for(const t of [5000,15000,20000,35000,45000])for(const role of ['wall','rhythm','neon','ambient'])
  assert.deepEqual(json(apply(plan(t),role).color),base.color);
});
test('role strengths keep rhythm strongest and ambient least intrusive',()=>{
 const d=plan(20000);const levels=['wall','rhythm','neon','ambient'].map(role=>apply(d,role).brightness);
 assert.equal(levels[1],Math.max(...levels));assert.equal(levels[3],Math.min(...levels));
});
test('master brightness bonus never exceeds explicit cap',()=>{
 const d=plan(20000);const v=apply(d,'rhythm',{...opts,maxExtraBrightness:6},45,45);
 assert.ok(v.brightness<=51);
});
test('existing brighter show cues are never unexpectedly dimmed on hook',()=>{
 const d=plan(35000);const v=apply(d,'rhythm',{...opts,maxExtraBrightness:0},91,40);
 assert.ok(v.brightness>=91);
});
test('break never sends off or drops below guarded brightness',()=>{
 const d=plan(45000);const v=apply(d,'rhythm',opts,20,70);
 assert.ok(v.brightness>=20);assert.equal(Object.keys(v).length,2);
});
test('preview simulates without user audio, network or storage',()=>{
 for(const phase of ['verse','hook','build','drop','break']){
  const preview=g.previewGoveeSectionV919(opts,phase,'wall',55,75);
  assert.equal(preview.base,55);assert.ok(preview.result>=20&&preview.result<=85);
  if(phase==='build')assert.equal(preview.uplift,true);
 }
});
test('5000 deterministic track/phase/role states',()=>{
 let elevated=0;let quiet=0;
 const roles=['wall','rhythm','neon','ambient'];const phases=['verse','build','drop','hook','break'];
 for(let i=0;i<5000;i++){
  const phase=phases[i%5];const role=roles[i%4];
  const index=i%5;const start=index*12000;const t=start+((i*37)%10500);
  const sectors=phases.map((label,j)=>({label,startMs:j*12000,durationMs:12000,confidence:(i%11===0&&j===index)?.55:.95}));
  const a=mk(sectors);a.durationMs=80000;
  const d=plan(t,a);
  const x=apply(d,role,opts,45+(i%35),65+(i%20));
  assert.deepEqual(json(x),json(apply(d,role,opts,45+(i%35),65+(i%20))));
  assert.deepEqual(json(x.color),base.color);
  assert.ok(Number.isFinite(x.brightness)&&x.brightness>=20&&x.brightness<=100);
  if(x.brightness>45+(i%35))elevated++;
  if(x.brightness<45+(i%35))quiet++;
  if(i%11===0)assert.equal(d.active,false);
 }
 assert.ok(elevated>500&&quiet>500);
 console.log('V919 verified 5000 deterministic track/phase/role scenarios');
});
test('production sync uses verified V318 state and existing send gate',()=>{
 const source=read('components/GoveeMusicSyncV909.tsx');
 assert.match(source,/planGoveeSectionV919\(analysis\.current,state\.track\.id,progress,sectionSettings\)/);
 assert.match(source,/config\.directorEnabledV911\?planGoveeSectionV919/);
 assert.match(source,/applyGoveeSectionV919\(planned,sectionDecision/);
 assert.match(source,/applyGoveeBassLookV917\(unboosted/);
 assert.match(source,/applyGoveePredictedLookV918\(bassLook/);
 assert.match(source,/applyGoveeGroupBrightnessV915\(base/);
 assert.match(source,/if\(!state\.isPlaying\|\|!state\.track\)return/);
 assert.match(source,/document\.hidden/);
 assert.match(source,/planGoveeBeatDispatchV918/);
});
test('V919 UI integrated and cannot itself issue network commands',()=>{
 const panel=read('components/GoveeLanPanelV909.tsx');
 const ui=read('components/GoveeSectionStudioV919.tsx');
 assert.match(panel,/<GoveeSectionStudioV919 config=\{config\}\/>/);
 assert.doesNotMatch(ui,/goveeBridgeRequestV909|fetch\(|\/command|action:'power'/);
 assert.match(ui,/Pre-Drop/);assert.match(ui,/Mindestvertrauen/);
});
test('CI and npm commands include V919',()=>{
 assert.match(read('.github/workflows/v832-continuous-validation.yml'),/V919 Govee Verse Hook Drop Director/);
 const packageJson=JSON.parse(read('package.json'));
 assert.ok(packageJson.scripts['verify:v919:focused'].includes('verify:v918:focused'));
});
console.log(`PASS V919 ${tests} test groups`);

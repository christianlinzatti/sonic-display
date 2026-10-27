'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 BENCHMARK_RECIPES_V522:recipes,beginBenchmarkV522:begin,advanceBenchmarkV522:advance,
 cancelBenchmarkV522:cancel,benchmarkResultV522:result,validateBenchmarksV522:validate,
 benchmarkVisualReviewV522:visual,benchmarkRecipeV522:recipe
}=load('services/monitoring/concertBenchmarkValidationV522');
const {validStudioReadingV518:valid}=load('services/monitoring/piConcertPerformanceStudioV518');
const T=1730000000000;
const base=(at=T,overrides={})=>({at,fps:53,p95FrameMs:23,p99FrameMs:29,
 slowPercent:3,drawCalls:320,triangles:183000,avatarCount:4,tier:'balanced',dpr:1.15,
 piProfile:'off',piLevel:'disabled',features:{lyrics:true,lipSync:true,reactiveLighting:true},
 heapMb:130,geometries:24,textures:16,...overrides});
const run=(id,scene='deutschrap-feature',overrides={},offset=0)=>{
 const first=base(T+offset,overrides),current=begin(id,scene,30,first,first.at+200);
 assert(current);let state=current;
 for(let i=1;i<=recipe(scene).warmupSeconds+recipe(scene).measurementSeconds;i++){
  state=advance(state,base(first.at+i*1000,{...overrides,heapMb:130+i*.15}));
  if(state.status!=='running')break;
 }
 return state;
};
assert.deepEqual(recipes.map(r=>r.id),['deutschrap-feature','hardstyle-drop','long-concert']);
assert.equal(recipes[2].measurementSeconds,180);
assert.equal(begin('','deutschrap-feature',30,base(),T+200),null);
assert.equal(begin('ok','deutschrap-feature',30,null,T+200),null);
assert.equal(begin('ok','deutschrap-feature',30,base(),T+10000),null);
assert.equal(begin('ok','deutschrap-feature',30,base(T,{fps:NaN}),T+200),null);
assert(valid(base()));
assert(!valid(base(T,{p99FrameMs:2})));
assert(!valid(base(T,{textures:-1})));
assert(!valid(base(T,{geometries:Infinity})));
const good=run('good');assert.equal(good.status,'complete');assert.equal(good.count,30);
assert.equal(result(good).targetMet,true);assert.equal(result(good).status,'meets-target');
assert.equal(result(good).worstWindowP99Ms,29);
assert(result(good).heapDeltaMb>0);
assert.equal(advance(good,base(T+40000)),good);
const slow=run('slow','deutschrap-feature',{fps:24,p95FrameMs:42,p99FrameMs:48,slowPercent:34});
assert.equal(result(slow).status,'below-target');
assert.equal(result(run('legacy','deutschrap-feature',{p99FrameMs:undefined})).status,'limited');
const changing=begin('changed','hardstyle-drop',30,base(),T+100);
const changed=advance(changing,base(T+1000,{features:{lyrics:false,lipSync:true,reactiveLighting:true}}));
assert.equal(changed.status,'invalid');assert.match(changed.reason,/verändert/);
assert.equal(result(changed),null);
const gap=advance(changing,base(T+4000));assert.equal(gap.status,'invalid');
assert.equal(advance(changing,base(T+1000,{fps:NaN})).status,'invalid');
assert.equal(cancel(changing,T+500).status,'cancelled');assert.equal(cancel(good,T+500),good);
assert.equal(advance(changing,base(T)),changing); // duplicate
assert.equal(advance(changing,base(T-100)),changing); // rewind
assert.equal(advance(changing,base(T+500)).status,'invalid'); // atypically short interval
const same=[run('r1'),run('r2','deutschrap-feature',{},90_000),run('r3','deutschrap-feature',{},180_000)];
let validated=validate(same,'deutschrap-feature',30,good.configuration);
assert.equal(validated.repetitions,3);assert.equal(validated.status,'provisional');
assert.equal(validated.worstP99Ms,29);
assert.equal(validate(same.slice(0,2),'deutschrap-feature',30,good.configuration).status,'insufficient');
assert.equal(validate([...same,run('other','deutschrap-feature',{tier:'high'},270000)],'deutschrap-feature',30,'impossible').status,'mixed');
assert.equal(validate([good,slow,good],'deutschrap-feature',30,good.configuration).status,'needs-review');
assert.equal(validate([good],'hardstyle-drop',30,good.configuration).repetitions,0);
assert.match(visual({lyricsLegible:false,lipSyncPlausible:true,motionNatural:true,lightReadable:true}),/offen/);
assert.match(visual({lyricsLegible:true,lipSyncPlausible:true,motionNatural:true,lightReadable:true}),/bestätigt/);
for(const scene of recipes){
 const r=run('sample-'+scene.id,scene.id,{},250000);
 assert.equal(r.status,'complete',scene.id);assert(result(r).windows>=scene.measurementSeconds-2);
}
// Thousands of representative edge sequences: no synthetic readings are rendered to the user.
let tested=0;
for(let i=0;i<25000;i++){
 const scene=recipes[i%recipes.length].id,offset=i*1000000;
 const first=base(T+offset),initial=begin('sim-'+i,scene,30,first,first.at+100);
 assert(initial);
 const missing=i%11===0,breakConfig=i%13===0,breakGap=i%17===0;
 let s=initial;
 for(let j=1;j<=7;j++){
  const changes={};
  if(j===3&&breakConfig)changes.features={lyrics:true,lipSync:false,reactiveLighting:true};
  const step=j===3&&breakGap?5000:j*1000;
  s=advance(s,base(first.at+step,changes));
  if(s.status!=='running')break;
 }
 if(breakConfig||breakGap)assert.equal(s.status,'invalid');
 else assert.equal(s.status,'running');
 if(missing)assert.equal(result(s),null);
 tested++;
}
const ui=fs.readFileSync('components/visualizer/PiConcertBenchmarkStudioV522.tsx','utf8');
const parent=fs.readFileSync('components/visualizer/PiConcertPerformanceStudioV518.tsx','utf8');
const sampler=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');
assert(parent.includes('<PiConcertBenchmarkStudioV522 readings={samples} />'));
assert(ui.includes('advanceBenchmarkV522')&&ui.includes('benchmarkVisualReviewV522'));
assert(ui.includes('benchmarkResultV522')&&ui.includes('validateBenchmarksV522'));
assert(ui.includes('JSON.stringify(payload,null,2)'));
assert(!ui.includes('setPerformanceMode(')&&!ui.includes('requestAnimationFrame(')&&!ui.includes('setInterval('));
assert(sampler.includes('p99FrameMsV522')&&sampler.includes('p99FrameMs:p99FrameMsV522'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=522);
assert(pkg.scripts['build:preflight'].includes('npm run test:v522 && npm run test:v522:types && npm run test:v521'));
console.log(`PASS V522: ${tested} deterministic sessions + real window P99, warmup, 3 repeats, pause/config resets, subjective audit and wiring`);

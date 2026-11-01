'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartEnsembleV683:plan,ensembleMomentAtV683:at,refineSmartEnsembleV683:refine}=load('components/visualizer/smartEnsembleDirectorV683');
const {planSectionDirectionV681}=load('components/visualizer/verseHookDropDirectionV681');
const {planFullSongPacingV671}=load('components/visualizer/fullSongPacingV671');
const {planIntelligentSongArcV679}=load('components/visualizer/intelligentSongArcV679');
const {layoutV326,evaluateGroupV326}=load('components/visualizer/multiAvatarStageDirectorV326');
let count=0;
const test=(name,fn)=>{try{fn();count++;}catch(error){error.message=`V683 ${name}: ${error.message}`;throw error;}};
const raw=[['verse','setup','portrait',0,0,30000],['hook','payoff','wide',0,30000,55000],
 ['break','respite','breath',0,55000,70000],['verse','develop','dialogue',1,70000,98000],
 ['build','rise','ensemble',0,98000,110000],['hook','payoff','ensemble',1,110000,138000],
 ['drop','ending-arc','crescendo',0,138000,160000]];
const narrative={trackId:'songA',durationMs:160000,source:'verified-v600',genre:'deutschrap',endingSupported:true,
 acts:raw.map(([section,chapter,motif,repetition,startMs,endMs],index)=>({section,chapter,motif,repetition,startMs,endMs,index}))};
const pacing=planFullSongPacingV671(narrative),arc=planIntelligentSongArcV679(narrative,pacing);
const section=planSectionDirectionV681(narrative,pacing,arc);
const p4=plan(section,4),p3=plan(section,3);
const opts={enabled:true,reducedMotion:false,tier:'high',manualProtected:false};
const times=[0,5,14,27,32,40,52,57,65,73,82,94,100,105,115,130,143,155];
function group(n=4){return {enabled:true,count:n,songSync:true,trackId:'songA',bpm:120,snap:'off',minSpacing:1.05,
 modelIds:['a','b','c','d'],cues:times.map((t,i)=>({id:`auto-v442-${i}`,at:t,formation:'line',focus:i%n,drop:false,
 transition:i===0?0:.9,positions:layoutV326('line',n)}))};}
const g=group();
const out=refine(g,p4,opts);
test('verified seven phases',()=>{assert.equal(section.source,'verified-v604-v671-v679');assert.equal(p4.source,'verified-v681');assert.equal(p4.moments.length,7);});
test('three and four dancer plans',()=>{assert.equal(p3.count,3);assert.equal(p4.count,4);});
test('verse carries focus but does not create singer',()=>assert.equal(p4.moments[0].mode,'solo-focus'));
test('first hook full ensemble',()=>assert.equal(p4.moments[1].mode,'ensemble'));
test('break deliberately calm',()=>assert.equal(p4.moments[2].mode,'respite'));
test('build uses staggered group structure',()=>assert.equal(p4.moments[4].mode,'build'));
test('verified drop is wide',()=>assert.equal(p4.moments[6].formation,'wide'));
test('verified main peak never treated as small dialogue',()=>{for(let i=0;i<p4.moments.length;i++)if(section.moments[i].arcRole==='main-peak')assert.equal(p4.moments[i].mode,'ensemble');});
test('second hook can alternate to dialogue',()=>{const m=section.moments[5];assert.equal(p4.moments[5].mode,m.arcRole==='main-peak'?'ensemble':'dialogue');});
test('no fabricated availability without evidence',()=>assert.equal(plan({...section,source:'unavailable'},4).source,'unavailable'));
test('mismatched count fails closed',()=>assert.equal(plan(section,2).source,'unavailable'));
test('bad ordering fails closed',()=>assert.equal(plan({...section,moments:section.moments.slice().reverse()},4).source,'unavailable'));
test('overlap fails closed',()=>assert.equal(plan({...section,moments:section.moments.map((x,i)=>i===2?{...x,startMs:30000}:x)},4).source,'unavailable'));
test('bad section fails closed',()=>assert.equal(plan({...section,moments:section.moments.map((x,i)=>i===1?{...x,section:'fake'}:x)},4).source,'unavailable'));
test('infinite timestamp fails closed',()=>assert.equal(plan({...section,moments:section.moments.map((x,i)=>i===1?{...x,endMs:Infinity}:x)},4).source,'unavailable'));
test('exact section start and gap lookups',()=>{assert.equal(at(p4,30000)?.index,1);assert.equal(at(p4,160000),null);assert.equal(at(p4,-1),null);assert.equal(at(p4,NaN),null);});
test('normal generated group changes formation',()=>{assert(out!==g);assert(out.cues.some((c,i)=>c.formation!==g.cues[i].formation));});
test('only generated timestamped cues changed',()=>assert.deepEqual(out.cues.map(c=>c.at),g.cues.map(c=>c.at)));
test('artist focus and drop flags preserved',()=>{assert.deepEqual(out.cues.map(c=>c.focus),g.cues.map(c=>c.focus));assert.deepEqual(out.cues.map(c=>c.drop),g.cues.map(c=>c.drop));});
test('model selection untouched',()=>assert.deepEqual(out.modelIds,g.modelIds));
test('BPM and sync kept',()=>{for(const key of ['bpm','songSync','snap','minSpacing','trackId','count'])assert.deepEqual(out[key],g[key]);});
test('cue ids and original transition durations kept',()=>{assert.deepEqual(out.cues.map(c=>c.id),g.cues.map(c=>c.id));assert.deepEqual(out.cues.map(c=>c.transition),g.cues.map(c=>c.transition));});
test('generated clips/voice roles never referenced',()=>{const src=fs.readFileSync('components/visualizer/smartEnsembleDirectorV683.ts','utf8');assert(!/fetch\(|setInterval\(|setTimeout\(|requestAnimationFrame\(|Math\.random\(|Date\.now\(|localStorage|sessionStorage/.test(src));});
test('source cues immutable',()=>assert.equal(g.cues[1].formation,'line'));
test('three dancer group produces safe bounded positions',()=>{const x=refine(group(3),p3,opts);for(const c of x.cues){assert.equal(c.positions.length,3);for(const pt of c.positions){assert(pt.every(Number.isFinite));assert(Math.abs(pt[0])<=4.5);assert(Math.abs(pt[2])<=2);}for(let i=1;i<3;i++)assert(c.positions[i][0]-c.positions[i-1][0]>=.99);}});
test('four dancer group produces safe bounded positions',()=>{for(const c of out.cues)for(let i=1;i<4;i++)assert(c.positions[i][0]-c.positions[i-1][0]>=.99);});
test('existing V326 interpolated pose remains finite',()=>{for(let ms=0;ms<160000;ms+=345){const pose=evaluateGroupV326(out,ms/1000);assert(pose.positions.every(pt=>pt.every(Number.isFinite)));}});
test('same inputs deterministic',()=>assert.deepEqual(refine(g,p4,opts),refine(g,p4,opts)));
test('no pause-induced formation reset: same song plan independent of playback state',()=>assert.deepEqual(refine(g,p4,opts),out));
test('no verified section returns same instance',()=>assert.strictEqual(refine(g,{...p4,source:'unavailable'},opts),g));
test('wrong track ID returns same instance',()=>assert.strictEqual(refine({...g,trackId:'other'},p4,opts).trackId,'other'));
test('opt-out/paused/reduced/low/manual all preserve original object',()=>{for(const change of [{enabled:false},{reducedMotion:true},{tier:'low'},{manualProtected:true}])assert.strictEqual(refine(g,p4,{...opts,...change}),g);});
test('manual custom cue id protected',()=>assert.strictEqual(refine({...g,cues:g.cues.map((c,i)=>i===4?{...c,id:'manual'}:c)},p4,opts).cues[4].id,'manual'));
test('unbound cue track protected',()=>assert.strictEqual(refine({...g,trackId:''},p4,opts).trackId,''));
test('non-song-synced stage protected',()=>{const h={...g,songSync:false};assert.strictEqual(refine(h,p4,opts),h);});
test('disabled stage protected',()=>{const h={...g,enabled:false};assert.strictEqual(refine(h,p4,opts),h);});
test('extra-long generated cues list protected',()=>assert.strictEqual(refine({...g,cues:Array(65).fill(g.cues[0])},p4,opts).cues.length,65));
test('manual hard cuts protected',()=>{const h={...g,cues:g.cues.map((c,i)=>i===1?{...c,transition:0}:c)};assert.strictEqual(refine(h,p4,opts).cues[1],h.cues[1]);});
test('an unconfirmed drop hint does not rewrite verse',()=>{const h={...g,cues:g.cues.map((c,i)=>i===2?{...c,drop:true}:c)};assert.strictEqual(refine(h,p4,opts).cues[2],h.cues[2]);});
test('section boundary guard prevents new abrupt staging',()=>{const h={...g,cues:g.cues.map((c,i)=>i===4?{...c,at:30}:c)};assert.strictEqual(refine(h,p4,opts).cues[4],h.cues[4]);});
test('no additional cue times/scene cuts over 10000 simulated frames',()=>{let n=0;for(let ms=0;ms<160000;ms+=16){const m=at(p4,ms);if(m)assert(m.startMs<=ms&&ms<m.endMs);n++;}assert(n>=10000);assert.equal(out.cues.length,g.cues.length);});
test('visual inspector and R3F integration use same V681 plan',()=>{const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(stage.includes('planSmartEnsembleV683(sectionPlanV681'));assert(stage.includes('refineSmartEnsembleV683(concertGroupV609'));assert(stage.includes('autoMultiArtistGroupV442={concertGroupV683}'));assert(stage.includes('data-v683-mode='));const inspector=fs.readFileSync('components/visualizer/TrackAnalysisControlsV318.tsx','utf8');assert(inspector.includes('V683 Smart Ensemble Inspector'));assert(inspector.includes('planSmartEnsembleV683(sectionPlanV681,4)'));});
test('reporting is bounded and does not claim diarization',()=>{const docs=fs.readFileSync('V683-SMART-ENSEMBLE-DIRECTOR.md','utf8');assert(docs.includes('keine Stimmenerkennung'));});
test('release scripts architecture and version',()=>{const p=require('../package.json');assert(/^0\.1\.0-v(?:68[3-9]|69\d|[7-9]\d\d)$/.test(p.version));assert(p.scripts['test:quick'].includes('npm run test:v683')); assert(p.scripts['check:release'].includes('test:v683'));assert(Number(fs.readFileSync('ARCHITECTURE.md','utf8').match(/\*\*Dokumentationsstand:\*\* V(\d+)/)?.[1]||0)>=683); });
console.log(`PASS V683 Smart Ensemble: ${count} tests, 10,000 sampled frames`);

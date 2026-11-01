'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const a=load('components/visualizer/concertAcceptanceV829');
const {EMPTY_QUALITY_SNAPSHOT_V826}=load('components/visualizer/concertQualityTelemetryV826');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let groups=0;
const check=(name,fn)=>{try{fn();groups++}catch(e){e.message=`${name}: ${e.message}`;throw e}};
const snap=(o={})=>({...EMPTY_QUALITY_SNAPSHOT_V826,available:true,playing:true,verified:true,
  sampleCount:30,frameMs:1000/60,fps:60,p95FrameMs:18,slowFrameShare:.02,pressure:.12,
  rendererCalls:103,performanceTier:'high',counts:{...EMPTY_QUALITY_SNAPSHOT_V826.counts,sparks:4,foamBubbles:8},...o});
const frame=(o={})=>({snapshot:snap(),genre:'rap',count:1,trackId:'songA',progressMs:0,durationMs:180000,
 section:'intro',liveShow:true,...o});
const reset=()=>a.clearAcceptanceV829();
const play=(genre='rap',count=1,trackId='songA',tier='high')=>{
 a.beginAcceptanceV829(genre,count);
 for(let n=0;n<360;n++){
  const section=n<40?'intro':n<160?'verse':n<220?'hook':n<270?'build':n<335?'drop':'finale';
  a.recordAcceptanceV829(frame({genre,count,trackId,progressMs:n*500,section,snapshot:snap({performanceTier:tier})}));
 }
 return a.getAcceptanceV829().cases[a.acceptanceKeyV829(genre,count)];
};
check('matrix exactly 3 genres × 3 counts',()=>assert.equal(a.ACCEPTANCE_GENRES_V829.length*a.ACCEPTANCE_COUNTS_V829.length,9));
check('acceptance starts with empty evidence',()=>{reset();assert.equal(a.acceptanceReportV829(a.getAcceptanceV829()).allPassed,false);});
check('nine rows must be visible even without data',()=>assert.equal(a.acceptanceReportV829(a.getAcceptanceV829()).rows.length,9));
check('case has six pending reviewer fields',()=>assert.deepEqual(Object.values(a.newAcceptanceCaseV829('rap',1).reviews),Array(6).fill('pending')));
check('invalid genre refused',()=>{reset();a.beginAcceptanceV829('dubstep',1);assert.equal(a.getAcceptanceV829().active,null)});
check('invalid count refused',()=>{reset();a.beginAcceptanceV829('rap',3);assert.equal(a.getAcceptanceV829().active,null)});
check('case key stable',()=>assert.equal(a.acceptanceKeyV829('rock',4),'rock:4'));
check('data never auto accepted',()=>{reset();let c=play();assert(c.fullSong);assert.equal(a.acceptanceVerdictV829(c),'review')});
check('real samples count not simulated benchmarks',()=>{let c=a.getAcceptanceV829().cases['rap:1'];assert(c.windows>300);assert(c.sampledSeconds>=170);});
check('measured averages correct',()=>{let c=a.getAcceptanceV829().cases['rap:1'];assert(Math.abs(a.acceptanceFpsV829(c)-60)<.1);assert(Math.abs(a.acceptanceFrameMsV829(c)-16.667)<.01)});
check('tracked sections from verified sample',()=>{let c=a.getAcceptanceV829().cases['rap:1'];assert(c.sections.includes('verse'));assert(c.sections.includes('drop'));});
check('effect counts originate in live snapshot',()=>{let c=a.getAcceptanceV829().cases['rap:1'];assert.equal(c.maxFoam,8);assert.equal(c.maxParticles,4)});
check('reviewer may mark pass',()=>{a.markAcceptanceReviewV829('rap',1,'lyrics','pass');assert.equal(a.getAcceptanceV829().cases['rap:1'].reviews.lyrics,'pass');});
check('cannot pass with other reviews missing',()=>assert.equal(a.acceptanceVerdictV829(a.getAcceptanceV829().cases['rap:1']),'review'));
check('mark all manual reviews produces case acceptance',()=>{for(const field of a.ACCEPTANCE_REVIEWS_V829)a.markAcceptanceReviewV829('rap',1,field,'pass');assert.equal(a.acceptanceVerdictV829(a.getAcceptanceV829().cases['rap:1']),'passed')});
check('explicit failure revokes acceptance',()=>{a.markAcceptanceReviewV829('rap',1,'camera','fail');assert.equal(a.acceptanceVerdictV829(a.getAcceptanceV829().cases['rap:1']),'failed')});
check('review invalid field ignored',()=>{a.markAcceptanceReviewV829('rap',1,'imaginary','pass');assert.equal(Object.keys(a.getAcceptanceV829().cases['rap:1'].reviews).length,6)});
check('review invalid decision ignored',()=>{a.markAcceptanceReviewV829('rap',1,'camera','skipped');assert.equal(a.getAcceptanceV829().cases['rap:1'].reviews.camera,'fail')});
check('record requires liveShow',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame({liveShow:false}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('record requires verified',()=>{a.recordAcceptanceV829(frame({snapshot:snap({verified:false})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('record requires actual playback',()=>{a.recordAcceptanceV829(frame({snapshot:snap({playing:false})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('record requires available snapshot',()=>{a.recordAcceptanceV829(frame({snapshot:snap({available:false})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('record requires enough frames',()=>{a.recordAcceptanceV829(frame({snapshot:snap({sampleCount:5})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('no empty track id',()=>{a.recordAcceptanceV829(frame({trackId:' '}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('no unknown genre',()=>{a.recordAcceptanceV829(frame({genre:'pop'}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('wrong performer count rejected',()=>{a.recordAcceptanceV829(frame({count:2}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('unknown musical section rejected',()=>{a.recordAcceptanceV829(frame({section:'mystery'}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('mid-track capture is not full song',()=>{a.recordAcceptanceV829(frame({progressMs:60000}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('cannot record implausibly short tracks',()=>{a.recordAcceptanceV829(frame({durationMs:20000}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('NaN time rejected',()=>{a.recordAcceptanceV829(frame({progressMs:NaN}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('Infinity duration rejected',()=>{a.recordAcceptanceV829(frame({durationMs:Infinity}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('negative time rejected',()=>{a.recordAcceptanceV829(frame({progressMs:-2}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('no future position',()=>{a.recordAcceptanceV829(frame({progressMs:190000}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('nonfinite FPS rejected',()=>{a.recordAcceptanceV829(frame({snapshot:snap({fps:Infinity})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('nonfinite P95 rejected',()=>{a.recordAcceptanceV829(frame({snapshot:snap({p95FrameMs:NaN})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('normal first window accepted',()=>{a.recordAcceptanceV829(frame());assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,1)});
check('song change stops and invalidates',()=>{a.recordAcceptanceV829(frame({progressMs:500,trackId:'other'}));assert.equal(a.getAcceptanceV829().active,null);assert.equal(a.getAcceptanceV829().cases['rap:1'].invalidated,true)});
check('failed sequence cannot be passed manually',()=>assert.equal(a.acceptanceVerdictV829(a.getAcceptanceV829().cases['rap:1']),'failed'));
check('seek jump invalidates',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame());a.recordAcceptanceV829(frame({progressMs:30000}));assert(a.getAcceptanceV829().cases['rap:1'].invalidated)});
check('seek backward invalidates',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame({progressMs:2500}));a.recordAcceptanceV829(frame({progressMs:500}));assert(a.getAcceptanceV829().cases['rap:1'].invalidated)});
check('quality tier change invalidates',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame());a.recordAcceptanceV829(frame({progressMs:500,snapshot:snap({performanceTier:'balanced'})}));assert(a.getAcceptanceV829().cases['rap:1'].invalidated)});
check('track duration change invalidates',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame());a.recordAcceptanceV829(frame({progressMs:500,durationMs:180500}));assert(a.getAcceptanceV829().cases['rap:1'].invalidated)});
check('pause has no effect on samples',()=>{reset();a.beginAcceptanceV829('rap',1);a.recordAcceptanceV829(frame());a.recordAcceptanceV829(frame({progressMs:500,snapshot:snap({playing:false})}));assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,1)});
check('stopping capture retains evidence',()=>{a.endAcceptanceV829();assert.equal(a.getAcceptanceV829().active,null);assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,1)});
check('starting the same case resets only that case',()=>{a.beginAcceptanceV829('rock',4);a.recordAcceptanceV829(frame({genre:'rock',count:4}));a.beginAcceptanceV829('rap',1);assert.equal(a.getAcceptanceV829().cases['rock:4'].windows,1);assert.equal(a.getAcceptanceV829().cases['rap:1'].windows,0)});
check('incomplete never accepted manually',()=>{for(const f of a.ACCEPTANCE_REVIEWS_V829)a.markAcceptanceReviewV829('rap',1,f,'pass');assert.equal(a.acceptanceVerdictV829(a.getAcceptanceV829().cases['rap:1']),'incomplete')});
check('critical fps rejected even when reviewed',()=>{reset();let c=play('rap',1,'slow','balanced');for(const f of a.ACCEPTANCE_REVIEWS_V829)a.markAcceptanceReviewV829('rap',1,f,'pass');c=a.getAcceptanceV829().cases['rap:1'];c.frames=5;assert.equal(a.acceptanceVerdictV829(c),'failed')});
check('one genre alone cannot complete matrix',()=>assert.equal(a.acceptanceReportV829(a.getAcceptanceV829()).allPassed,false));
check('complete nine measured cases with manual review',()=>{
 reset();for(const g of a.ACCEPTANCE_GENRES_V829)for(const n of a.ACCEPTANCE_COUNTS_V829){play(g,n,`same-${g}`);for(const f of a.ACCEPTANCE_REVIEWS_V829)a.markAcceptanceReviewV829(g,n,f,'pass');}
 const r=a.acceptanceReportV829(a.getAcceptanceV829());assert.equal(r.rows.length,9);assert(r.rows.every(x=>x.status==='passed'));assert.equal(r.allPassed,true);
});
check('genre comparisons demand identical song',()=>{reset();for(const n of a.ACCEPTANCE_COUNTS_V829)play('rock',n,n===4?'different':'song');assert.equal(a.acceptanceReportV829(a.getAcceptanceV829()).comparable[2].comparable,false)});
check('genre comparisons report missing cases',()=>assert.equal(a.acceptanceReportV829(a.getAcceptanceV829()).comparable[0].comparable,false));
check('report does not invent renderer GPU timers',()=>{let r=a.acceptanceReportV829(a.getAcceptanceV829());assert(r.disclaimer.includes('Keine GPU-Zeitmessung'));assert.equal(r.version,'V829')});
check('frontend review panel wired into concert FX settings',()=>{const ui=read('components/visualizer/ConcertFxStudioPanelV810.tsx');assert(ui.includes('<ConcertAcceptancePanelV829 enabled={s.qualityDashboardV826}/>'))});
check('real scene instrumentation invokes acceptance after completed quality sample',()=>{const stage=read('components/visualizer/DynamicStage.tsx');assert(stage.includes('recordAcceptanceV829({snapshot,genre:fxCueV810.genre,count:groupCountV542'));assert(stage.indexOf('recordAcceptanceV829(')>stage.indexOf('completeConcertQualityV826(qualityMonitorV826.current'))});
check('no new R3F meshes are created by acceptance panel',()=>{const ui=read('components/visualizer/ConcertAcceptancePanelV829.tsx');assert(!ui.includes('<instancedMesh'));assert(!ui.includes('useFrame('))});
check('capture is transient and has no fake GLB mesh evidence',()=>{const core=read('components/visualizer/concertAcceptanceV829.ts');assert(!core.includes('localStorage'));assert(!core.includes('setInterval('));assert(core.includes('konfigurierten')===false)});
check('review report downloadable as JSON',()=>{const ui=read('components/visualizer/ConcertAcceptancePanelV829.tsx');assert(ui.includes('JSON.stringify(')&&ui.includes('URL.revokeObjectURL('));});
check('version + mandatory release scripts',()=>{const p=require('../package.json');assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:829|83[0-9]))$/.test(p.version));for(const k of ['check:fast','check:release','build:preflight'])assert(p.scripts[k].includes('npm run test:v829 && npm run test:v829:types &&'));});
console.log(`PASS V829 Ultimate Concert Acceptance: ${groups} test groups`);

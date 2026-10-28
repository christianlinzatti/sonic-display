 'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {coordinateConcertEditionV642:plan}=load('components/visualizer/concertEditionV642');
const {reviewConcertAuditV642:review}=load('components/visualizer/concertEditionReviewV642');
const {auditFullConcertV641:audit}=load('components/visualizer/fullConcertQualityAuditV641');
let cases=0;let simulations=0;
const check=(name,fn)=>{try{fn();cases++;}catch(e){e.message=`V642 ${name}: ${e.message}`;throw e;}};
const sections=['verse','hook','verse','build','hook','drop','break','hook','verse','hook'];
const acts=sections.map((section,index)=>({index,section,startMs:index*24000,endMs:(index+1)*24000,
  chapter:section==='hook'||section==='drop'?'payoff':section==='break'?'respite':section==='build'?'rise':'develop',
  motif:section==='break'?'breath':section==='hook'?'ensemble':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?({1:0,4:1,7:2,9:3})[index]:section==='verse'?[0,2,8].indexOf(index):0}));
const duration=240000;
const full={trackId:'v642-multi-feature',durationMs:duration,genre:'deutschrap',source:'verified-v600',acts,endingSupported:false};
const narrative=(index,transition=1)=>({plan:full,cue:{source:'verified-v600',active:true,act:index,
  chapter:acts[index].chapter,motif:acts[index].motif,repetition:acts[index].repetition,transition}});
const base=(index,priority=null)=>({active:true,act:index,priority:priority??(acts[index].section==='hook'?'ensemble':acts[index].section==='drop'?'drop':acts[index].section==='build'?'build':acts[index].section==='break'?'quiet':'vocal'),chapter:acts[index].chapter,
  repetition:acts[index].repetition,dance:1.02,camera:.96,decoration:.95,face:1.004,lyrics:1});
const story=(index,priority)=>({active:true,act:index,beat:acts[index].section==='hook'?'first-hook':acts[index].section,emphasis:'ensemble',
  hookIndex:acts[index].section==='hook'?acts[index].repetition:-1,envelope:.75,cue:base(index,priority)});
const input=(index=1,opts={})=>({story:story(index,opts.priority),narrative:narrative(index),trackId:full.trackId,durationMs:duration,
  positionMs:acts[index].startMs+12000,section:acts[index].section,playing:true,enabled:true,reducedMotion:false,
  tier:'high',lyricsProtected:false,verifiedVocalFocus:false,manualDance:false,manualCamera:false,manualLighting:false,...opts});
const run=(index=1,opts={})=>plan(input(index,opts));
const same=(index,opts={})=>{const i=input(index,opts);assert.deepEqual(plan(i).cue,i.story.cue);assert.equal(plan(i).active,false);};
check('verified hook produces balanced final cue',()=>assert(run(1).active));
check('injected V629 cue remains baseline when disabled',()=>same(1,{enabled:false}));
check('pause neutral',()=>same(1,{playing:false}));
check('reduced motion neutral',()=>same(1,{reducedMotion:true}));
check('low tier neutral',()=>same(1,{tier:'low'}));
check('no verified narrative neutral',()=>same(1,{narrative:null}));
check('unverified V600 plan neutral',()=>same(1,{narrative:{...narrative(1),plan:{...full,source:'off'}}}));
check('unverified V604 cue neutral',()=>same(1,{narrative:{...narrative(1),cue:{...narrative(1).cue,source:'off'}}}));
check('wrong track neutral',()=>same(1,{trackId:'unknown'}));
check('wrong duration neutral',()=>same(1,{durationMs:duration+3}));
check('wrong section neutral',()=>same(1,{section:'verse'}));
check('wrong chapter neutral',()=>same(1,{narrative:{...narrative(1),cue:{...narrative(1).cue,chapter:'fake'}}}));
check('wrong motif neutral',()=>same(1,{narrative:{...narrative(1),cue:{...narrative(1).cue,motif:'fake'}}}));
check('wrong repetition neutral',()=>same(1,{narrative:{...narrative(1),cue:{...narrative(1).cue,repetition:15}}}));
check('wrong act neutral',()=>same(1,{narrative:{...narrative(1),cue:{...narrative(1).cue,act:7}}}));
check('bad story act neutral',()=>same(1,{story:{...story(1),act:7}}));
check('bad base act neutral',()=>same(1,{story:{...story(1),cue:{...base(1),act:7}}}));
check('missing story active neutral',()=>same(1,{story:{...story(1),active:false}}));
check('missing V623 active neutral',()=>same(1,{story:{...story(1),cue:{...base(1),active:false}}}));
check('bad hook count neutral',()=>same(1,{story:{...story(1),hookIndex:8}}));
check('outside song neutral',()=>same(1,{positionMs:duration}));
check('outside act neutral',()=>same(1,{positionMs:acts[2].startMs+100}));
check('NaN position neutral',()=>same(1,{positionMs:NaN}));
check('invalid transition neutral',()=>same(1,{narrative:narrative(1,NaN)}));
check('negative transition neutral',()=>same(1,{narrative:narrative(1,-.1)}));
check('too strong transition neutral',()=>same(1,{narrative:narrative(1,1.1)}));
check('invalid V623 dance neutral',()=>same(1,{story:{...story(1),cue:{...base(1),dance:NaN}}}));
check('invalid V623 light neutral',()=>same(1,{story:{...story(1),cue:{...base(1),decoration:2}}}));
check('invalid V629 envelope neutral',()=>same(1,{story:{...story(1),envelope:Infinity}}));
check('first hook leads dance',()=>assert.equal(run(1).leadLane,'dance'));
check('second hook leads camera',()=>assert.equal(run(4).leadLane,'camera'));
check('third hook leads light',()=>assert.equal(run(7).leadLane,'light'));
check('fourth hook cycles back to dance',()=>assert.equal(run(9).leadLane,'dance'));
check('no simultaneous hook peaks',()=>{for(const j of [1,4,7,9]){const x=run(j);const b=story(j).cue;const highs=[x.cue.dance>=b.dance,x.cue.camera>=b.camera,x.cue.decoration>=b.decoration].filter(Boolean).length;assert(highs<=1,j+':'+highs);}});
check('hook effect fades on entry',()=>{const i=input(1,{positionMs:acts[1].startMs});assert.deepEqual(plan(i).cue,i.story.cue)});
check('hook effect fades on exit',()=>{const i=input(1,{positionMs:acts[1].endMs-0.00001});assert(Math.abs(plan(i).cue.dance-i.story.cue.dance)<.00001)});
check('transition 0 restores original',()=>{const i=input(1,{narrative:narrative(1,0)});assert.deepEqual(plan(i).cue,i.story.cue)});
check('balanced tier damps scene accents',()=>{const hi=run(1),lo=run(1,{tier:'balanced'});assert(Math.abs(lo.cue.decoration-base(1).decoration)<Math.abs(hi.cue.decoration-base(1).decoration));});
check('lyrics trump hook',()=>{const v=run(4,{lyricsProtected:true});assert.equal(v.focus,'lyrics');assert.equal(v.leadLane,'none');assert(v.cue.decoration<base(4).decoration);});
check('confirmed singer overrides hook',()=>{const x=run(1,{verifiedVocalFocus:true});assert.equal(x.focus,'vocal');assert.equal(x.leadLane,'none');assert(x.cue.dance<base(1).dance)});
check('lyrics override singer',()=>assert.equal(run(1,{verifiedVocalFocus:true,lyricsProtected:true}).focus,'lyrics'));
check('break protected and quiet',()=>{const x=run(6);assert.equal(x.focus,'rest');assert(x.cue.decoration<base(6).decoration);});
check('build has no new unsupported drops',()=>{const x=run(3);assert.equal(x.focus,'build');assert(x.cue.dance<=base(3).dance);});
check('audible verified drop uses only light lane',()=>{const x=run(5);assert.equal(x.focus,'drop');assert.equal(x.leadLane,'light');assert(x.cue.camera<base(5).camera);});
check('unsupported drop cannot increase light',()=>{const x=run(5,{priority:'quiet'});assert(x.cue.decoration<base(5,'quiet').decoration);assert.notEqual(x.focus,'drop');});
check('authoring locks all three lanes',()=>{const i=input(1,{manualDance:true,manualCamera:true,manualLighting:true});assert.deepEqual(plan(i).cue,i.story.cue);});
check('manual lighting preserves face and decoration',()=>{const x=run(1,{manualLighting:true});assert.equal(x.cue.decoration,base(1).decoration);assert.equal(x.cue.face,base(1).face);});
check('manual dance preserves dancer gain',()=>assert.equal(run(1,{manualDance:true}).cue.dance,base(1).dance));
check('manual camera preserves camera gain',()=>assert.equal(run(1,{manualCamera:true}).cue.camera,base(1).camera));
check('word timing and manual actor names not present',()=>{const txt=fs.readFileSync('components/visualizer/concertEditionV642.ts','utf8');for(const forbidden of ['lyrics.lines','phoneme','setInterval','requestAnimationFrame','new WebGLRenderer','artistCredits'])assert(!txt.includes(forbidden),forbidden);});
check('stage consumes V642 cue as shared final gate',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('const concertDramaturgyV623=concertEditionV642.cue'));assert(s.includes('concertEditionV642=coordinateConcertEditionV642'));});
check('stage exposes debug metadata without lyrics text',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('data-v642-focus={concertEditionV642.focus}'));assert(s.includes('data-v642-lane={concertEditionV642.leadLane}'));});
check('V641 recorder remains opt in',()=>assert(fs.readFileSync('components/visualizer/FullConcertQualityAuditPanelV641.tsx','utf8').includes('onClick={start}')));
check('QA actions read only',()=>{const s=fs.readFileSync('components/visualizer/FullConcertQualityAuditPanelV641.tsx','utf8');assert(s.includes('reviewConcertAuditV642(report)'));assert(s.includes('data-v642-qa-actions="read-only"'));});
const make=(findings)=>({format:'sonic-v641-live-song-audit',samples:110,status:'broad-coverage-needs-human-review',findings});
const f=(id)=>({id,detail:'example',severity:'review',timeMs:10000});
check('no QA actions without samples',()=>assert.deepEqual(review(make([f('low-fps')])&&{...make([f('low-fps')]),samples:0}),[]));
check('real FPS warning gives settings to inspect',()=>assert(review(make([f('low-fps')]))[0].advice.includes('LED/Gobo')));
check('avatar framing is a human review, not auto camera',()=>assert.equal(review(make([f('avatar-framing')]))[0].priority,'review-scene'));
check('detected stale shot is not a declared visual failure',()=>assert(review(make([f('long-shot')]))[0].advice.includes('kein Fehler')));
check('missing GLB comparison flags measurement',()=>assert(review(make([f('no-glb-proof')]))[0].advice.includes('benchmarkV592')));
check('duplicates do not clutter recommendations',()=>assert.equal(review(make([f('low-fps'),f('low-fps')])).length,1));
check('unknown findings not guessed',()=>assert.deepEqual(review(make([f('fabricated-song-chapter')])),[]));
check('bounded review to 8',()=>assert(review(make(['coverage','song-start-missing','song-end-missing','low-fps','avatar-framing','lyrics-overlap','fps-missing','p95-missing','long-shot','long-motif'].map(f))).length<=8));
check('all recommendations lack automatic approvals',()=>assert(!JSON.stringify(review(make([f('low-fps')]))).includes('approved')));
const ids=['coverage','song-start-missing','song-end-missing','fps-missing','p95-missing','low-fps','avatar-framing','lyrics-overlap','long-shot','long-motif','no-glb-proof','no-avatars'];
check('each known warning yields a distinct advisory',()=>ids.forEach(id=>assert.equal(review(make([f(id)]))[0].id,id)));
check('baseline V641 audit remains unchanged',()=>assert.equal(audit([]).automaticallyApproved,false));
for(let j=0;j<12000;j++){
  const index=j%10,act=acts[index],p=act.startMs+(j%23998)+1;
  const opts={positionMs:p,lyricsProtected:j%5===0,verifiedVocalFocus:j%11===0,
    manualDance:j%7===0,manualCamera:j%13===0,manualLighting:j%17===0,tier:j%3===0?'balanced':'high'};
  const i=input(index,opts),x=plan(i);assert(x.active);
  assert(x.cue.dance>=.97&&x.cue.dance<=1.035);
  assert(x.cue.camera>=.8&&x.cue.camera<=1);
  assert(x.cue.decoration>=.72&&x.cue.decoration<=1);
  assert(x.cue.face>=1&&x.cue.face<=1.02);
  assert.equal(x.cue.lyrics,i.story.cue.lyrics);
  if(opts.manualDance)assert.equal(x.cue.dance,i.story.cue.dance);
  if(opts.manualLighting)assert.equal(x.cue.decoration,i.story.cue.decoration);
  if(opts.manualCamera)assert.equal(x.cue.camera,i.story.cue.camera);
  simulations++;
}
check('12,000 deterministic cross-lane samples',()=>assert.equal(simulations,12000));
console.log(`PASS V642: ${cases} regression groups, ${simulations} cross-lane song samples`);

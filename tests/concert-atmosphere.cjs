const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {planConcertAtmosphere}=load('lib/concertAtmosphere.ts'),{concertScoreV1134}=load('lib/concertScoreV1134.ts'),{normalizeCrewSettings}=load('components/visualizer/sonicCrewDirector.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs');
const cue=concertScoreV1134({trackId:'atmosphere',progressMs:17000,genre:'house',lyrics,durationMs:100000,count:3,scenery:true,showPlans:true,showStyle:'cinema'});
const plan=(extra={})=>planConcertAtmosphere({cue,active:true,enabled:true,playing:true,reducedMotion:false,tier:'high',floorAllowed:true,scale:.65,...extra});
const verse=plan(),lift=plan({cue:{...cue,act:'lift',chorusVisit:1}}),second=plan({cue:{...cue,act:'lift',chorusVisit:2}}),finale=plan({cue:{...cue,act:'finale'}});
assert.notEqual(lift.motif,second.motif);assert(lift.amount>verse.amount);assert.equal(finale.motif,verse.motif);assert(finale.weights.filter(n=>n>0).length===2);assert(Math.abs(finale.weights.reduce((a,b)=>a+b,0)-1)<1e-9);
assert(verse.floor&&verse.moving);assert.equal(plan({playing:false}).floor,false);assert.equal(plan({playing:false}).moving,false);assert.equal(plan({playing:false}).still,false,'Paused room retains its song-time composition');
for(const key of ['reading','lyricFocus']){const text=plan({cue:{...cue,[key]:true}});assert.equal(text.floor,false);assert.equal(text.moving,false);assert.equal(text.amount,0);}
for(const extra of [{reducedMotion:true},{tier:'low'}]){const quiet=plan(extra);assert.equal(quiet.moving,false);assert.equal(quiet.floor,false);assert(quiet.amount<verse.amount);assert(quiet.still);}
for(const extra of [{active:false},{enabled:false},{scale:0},{scale:NaN}])assert.equal(plan(extra).active,false);
assert.equal(plan({floorAllowed:false}).floor,false);
const build=plan({cue:{...cue,act:'build',anticipationProgress:0}}),later=plan({cue:{...cue,act:'build',anticipationProgress:1}});assert(later.amount>build.amount);assert(later.spread>build.spread);assert.equal(later.floor,false);
for(const style of ['cinema','neon','groove','festival'])for(const act of ['breathe','story','build','lift','finale'])for(const tier of ['low','balanced','high']){
 const p=plan({cue:{...cue,production:{...cue.production,id:style},act},tier});assert(p.amount>=0&&p.amount<=1);assert(p.floorGain>=0&&p.floorGain<.5);assert(p.weights.every(n=>Number.isFinite(n)&&n>=0&&n<=1));assert(Math.abs(p.weights.reduce((a,b)=>a+b,0)-1)<1e-9);
}
assert.equal(normalizeCrewSettings({immersiveFx:false}).immersiveFx,false);assert.equal(normalizeCrewSettings({immersiveFx:'yes'}).immersiveFx,undefined);
console.log('PASS concert atmosphere: coherent opening/build/refrain/finale, four bounded motifs, reprise blend, safe lyric/rap/pause/reduced/tier/manual guards, floor ownership and persisted opt-out');
const heroes=new Set();
for(let visit=1;visit<=3;visit++){
 const p=plan({cue:{...cue,reading:false,lyricFocus:false,act:'lift',chorusVisit:visit}});heroes.add(p.hero);assert(p.heroGain>0&&p.heroGain<=.55);assert(p.heroPulse>=.85&&p.heroPulse<=1);
}
assert.equal(heroes.size,3,'Repeated refrains get three distinct, bounded stage accents');
for(const extra of [{playing:false},{reducedMotion:true},{tier:'low'},{enabled:false},{active:false},{cue:{...cue,act:'lift',reading:true}},{cue:{...cue,act:'lift',lyricFocus:true}}]){
 const p=plan(extra);assert.equal(p.hero,'off');assert.equal(p.heroGain,0);
}
console.log('PASS hero stage: portals, meteors and orbital fans; bounded phrase accents, pause, text, opt-out and low-tier guards');

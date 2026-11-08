'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepStoryArcV1091:step,INITIAL_STORY_ARC_V1091:INITIAL,sampleStoryArcGainV1091:sample}=load('lib/arena360StoryArcDirectorV1091');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const low={energyEnvelope:.16,bass:.18,attack:.12,beat:false,beatStrength:.1};
const energy={energyEnvelope:.62,bass:.55,attack:.2,beat:false,beatStrength:.3};
const real={energyEnvelope:.88,bass:.81,attack:.9,beat:true,beatStrength:.92};
const args=(override={})=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 performanceTier:'balanced',trackId:'s1',progressMs:5000,durationMs:180000,
 deltaSeconds:.016,strength:65,style:'balanced',sectionHint:'verse',audio:low,...override});
for(const v of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
 {strength:0},{performanceTier:'low'},{performanceTier:null}]){
 const out=step(INITIAL,args(v));assert.equal(out.active,false);assert.equal(sample(out.state),1);
}
for(const v of [{trackId:''},{trackId:'x'.repeat(161)},{progressMs:-1},{progressMs:190000},
 {durationMs:0},{durationMs:NaN},{deltaSeconds:Infinity},{deltaSeconds:.4},
 {strength:-1},{strength:90},{style:'invalid'}]){
 assert.equal(step(INITIAL,args(v)).active,false);
}
for(const k of ['energyEnvelope','bass','attack','beatStrength'])for(const v of [-1,2,NaN,Infinity])
 assert.equal(step(INITIAL,args({audio:{...real,[k]:v}})).reason,'audio');
assert.equal(step(INITIAL,args({audio:{...real,beat:'yes'}})).reason,'audio');
let previous=step(INITIAL,args()).state;
assert.equal(previous.gain,1,'first frame never darkens existing light');
for(let i=1;i<=250;i++){
 const result=step(previous,args({progressMs:5000+16*i}));
 assert(result.state.gain<=previous.gain+1e-8,'quiet chapter only dims');
 assert(result.state.gain>=.5&&result.state.gain<=1);
 previous=result.state;
}
assert(previous.gain<.85,'verified measured quiet passage gets visible optical change');
const madeUpDrop=step(previous,args({progressMs:9100,sectionHint:'drop',audio:energy}));
assert.notEqual(madeUpDrop.state.scene,'accent','authored section cannot fake a beat/drop');
const actualDrop=step(previous,args({progressMs:9100,sectionHint:'verse',audio:real}));
assert.equal(actualDrop.state.scene,'accent','only a measured strong attack can produce accent');
assert(actualDrop.state.gain>previous.gain&&actualDrop.state.gain<=1);
assert(actualDrop.state.gain-previous.gain<.05,'no hard flash jump');
for(const v of [{playing:false},{reducedMotion:true},{enabled:false}])
 assert.equal(sample(step(previous,args(v)).state),1,'disabled chapter restores original visuals');
for(const v of [{progressMs:3000},{progressMs:51000},{trackId:'s2'}])
 assert.equal(step(previous,args(v)).reason,'priming','seek/song switch resets');
assert.equal(sample({gain:Infinity}),1);assert.equal(sample({gain:-20}),.5);assert.equal(sample(undefined),1);
let state=INITIAL;
for(let i=0;i<170000;i++){
 const a=i%37===0?real:i%7===0?energy:low;
 const res=step(state,args({trackId:'s'+Math.floor(i/13000),progressMs:i*17%176000,
  audio:a,style:i%3===0?'balanced':i%3===1?'festival':'cinematic',
  strength:i%81,sectionHint:i%5===0?'drop':i%7===0?'build':'verse'}));
 assert(Number.isFinite(res.state.gain)&&res.state.gain>=.5&&res.state.gain<=1);
 assert(Number.isFinite(res.state.energyAverage)&&res.state.energyAverage>=0&&res.state.energyAverage<=1);
 assert(res.state.scene!=='accent'||state.scene==='accent'||(a.beat&&a.attack>=.65&&a.beatStrength>=.77));
 state=res.state;
}
const core=read('lib/arena360StoryArcDirectorV1091.ts');
for(const forbidden of ['Date.now(', 'Math.random(', 'fetch(', 'setTimeout(', 'setInterval(',
 'localStorage.', 'navigator.', 'requestAnimationFrame('])assert(!core.includes(forbidden));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('storyArcStateV1091.current=stepStoryArcV1091('));
assert(stage.includes("ledWallPatternV1059==='auto'"));
assert(stage.includes("hologramPattern==='auto'"));
for(const f of ['ArenaLedWallV1059.tsx','ArenaLaserFansV1036.tsx','ArenaLaserTunnelsV1039.tsx']){
 const s=read('components/visualizer/stages/'+f);
 assert(s.includes('sampleStoryArcGainV1091(storyArcStateV1091?.current)'),'renderer route '+f);
 assert(s.includes('sampleMusicalDynamicsGainV1090('),'V1090 compatible '+f);
}
const keys=['StoryArcEnabledV1091','StoryArcStrengthV1091','StoryArcStyleV1091'];
for(const k of keys){
 assert(read('types/music.ts').includes('arena'+k+'?:'),'typed '+k);
 assert(read('components/visualizer/registry.tsx').includes('arena'+k+'?:'),'registry '+k);
 assert(read('components/visualizer/VisualizerStage.tsx').includes('arena'+k+'={preferences.arena'+k),'visualizer '+k);
 assert(read('components/visualizer/ThreeAvatar.tsx').includes('story'+k.slice(5)+'={props.arena'+k),'avatar '+k);
 assert(read('components/visualizer/stages/index.tsx').includes('story'+k.slice(5)+'={story'+k.slice(5)+'}'),'bridge '+k);
}
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(panel.includes('arena-v1091-story-arc')&&panel.includes('arenaStoryArcEnabledV1091:false'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaStoryArcEnabledV1091:false'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=1091);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v1091 && npm run test:v1091:types &&'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1091-story-arc-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1091-story-arc-regression.cjs'));
console.log('PASS V1091: 170000 song-scoped, dim-only narrative samples; guards, scene stability, legacy renderer bridges');

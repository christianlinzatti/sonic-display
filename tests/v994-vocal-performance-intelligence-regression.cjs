'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_VOCAL_V994,normalizeVocalV994,planVocalPerformanceV994,
 addVocalFaceV994,vocalRateV994,OFF_VOCAL_V994}=load('components/visualizer/vocalPerformanceIntelligenceV994');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
const words=[
 {text:'Bam',startMs:1000,endMs:1190},{text:'ja',startMs:1210,endMs:1450},
 {text:'Druck',startMs:1470,endMs:1720},{text:'oh',startMs:1740,endMs:1970},
 {text:'Ruhe',startMs:2540,endMs:2880},{text:'aber',startMs:3000,endMs:3240},
 {text:'schnell',startMs:3270,endMs:3500},{text:'weich',startMs:3900,endMs:4140}
];
const lyrics={synced:true,provider:'spotify',lines:[{text:words.map(w=>w.text).join(' '),startMs:950,endMs:4500,words}]};
const face={jaw:.48,wide:.36,round:.16,lipsClosed:0,smile:.10,brow:.14,blink:.12,cheek:.08,squint:.04};
const opts={lyrics,effectiveTimeMs:1820,activeWord:'oh',playing:true,enabled:true,
 rap:true,verifiedWord:true,roleAllowed:true,manualSilent:false,manualPriority:false,
 reducedMotion:false,preserveAudioMouth:false,intensity:85};
const settings={...DEFAULT_VOCAL_V994,enabled:true};
const context={settings,trackId:'song-A',activeTrackId:'song-A',signalPlaying:true,
 signalEnabled:true,tier:'high',face};
const sample=(options={},patch={})=>planVocalPerformanceV994({...opts,...options},{...context,...patch});
let n=0;function check(label,fn){try{fn();n++;console.log('PASS V994 '+label)}catch(e){e.message='V994 '+label+': '+e.message;throw e;}}
check('opt-out defaults and strict normalization',()=>{
 assert.equal(DEFAULT_VOCAL_V994.enabled,false);
 assert.equal(normalizeVocalV994({enabled:'true'}).enabled,false);
 assert.equal(normalizeVocalV994({style:'unknown'}).style,'natural');
 assert.equal(normalizeVocalV994({style:'rap-flow'}).style,'rap-flow');
 assert.equal(normalizeVocalV994({style:'stage'}).style,'stage');
 assert.equal(normalizeVocalV994({intensity:Infinity}).intensity,55);
 assert.equal(normalizeVocalV994({intensity:-9}).intensity,0);
 assert.equal(normalizeVocalV994({intensity:1000}).intensity,100);
 assert.equal(normalizeVocalV994({mouthTiming:false}).mouthTiming,false);
});
check('verified connected and phrase-end word evidence',()=>{
 const a=sample({effectiveTimeMs:1330,activeWord:'ja'});
 assert.equal(a.mode,'connected');assert.equal(a.wordStartMs,1210);
 const b=sample();assert(b.active&&b.mode==='phrase-end');assert.equal(b.source,'verified-word');
 const c=sample({effectiveTimeMs:1110,activeWord:'Bam'});assert.equal(c.active,false);
});
check('time envelope is bounded and zero at each word boundary',()=>{
 assert.equal(sample({effectiveTimeMs:1740}).active,false);
 assert(sample({effectiveTimeMs:1820}).gain>0);
 assert(sample({effectiveTimeMs:1969}).gain<sample({effectiveTimeMs:1820}).gain);
 assert(!sample({effectiveTimeMs:1970,activeWord:'oh'}).active);
 assert(!sample({effectiveTimeMs:2250,activeWord:'oh'}).active);
});
check('word, song and playback authorization gates',()=>{
 for(const [op,ctx] of [
  [{playing:false},{}],[{enabled:false},{}],[{verifiedWord:false},{}],
  [{roleAllowed:false},{}],[{manualSilent:true},{}],[{manualPriority:true},{}],
  [{rap:false},{}],[{reducedMotion:true},{}],[{preserveAudioMouth:true},{}],
  [{activeWord:'falsch'},{}],[{effectiveTimeMs:NaN},{}],
  [{effectiveTimeMs:-1},{}],[{lyrics:null},{}],
  [{lyrics:{...lyrics,synced:false}},{}],
  [{editedWords:[{startMs:1740,text:'edited'}]},{}],
  [{}, {trackId:'song-B'}],[{}, {activeTrackId:'song-B'}],
  [{},{signalPlaying:false}],[{},{signalEnabled:false}],
  [{},{protectedMouth:true}],[{},{tier:'low'}],
  [{},{settings:{...settings,enabled:false}}],
  [{},{settings:{...settings,intensity:0}}],
  [{},{face:{...face,lipsClosed:.3}}],
 ])assert.strictEqual(sample(op,ctx),OFF_VOCAL_V994,JSON.stringify([op,ctx]));
});
check('existing B/P/M lip closures and next onset are protected',()=>{
 const l={...lyrics,lines:[{...lyrics.lines[0],words:[
  {text:'ja',startMs:1000,endMs:1200},{text:'Boom',startMs:1220,endMs:1430}]}]};
 assert(!sample({lyrics:l,effectiveTimeMs:1100,activeWord:'ja'}).active);
 assert(!sample({effectiveTimeMs:1050,activeWord:'Bam'}).active);
});
check('mouth rate modifies only jaw/wide/round, never targets or seal',()=>{
 const cue=sample();assert(cue.active);
 assert(vocalRateV994(cue,'jaw',true)>1);assert(vocalRateV994(cue,'jaw',false)<1);
 assert(vocalRateV994(cue,'wide',true)>1);assert(vocalRateV994(cue,'round',false)<1);
 for(const name of ['lipsClosed','smile','blink','brow','squint','eye']){
  assert.equal(vocalRateV994(cue,name,true),1);
  assert.equal(vocalRateV994(cue,name,false),1);
 }
});
check('face changes only expression channels and not existing input',()=>{
 const cue=sample(),frame={face,custom:'original'};
 const newFrame=addVocalFaceV994(frame,cue);
 assert.notStrictEqual(newFrame,frame);assert.equal(newFrame.custom,'original');
 assert.strictEqual(frame.face,face);
 for(const c of ['jaw','wide','round','lipsClosed','blink','smile'])assert.equal(newFrame.face[c],face[c]);
 for(const c of ['brow','cheek','squint'])assert(newFrame.face[c]>=face[c]&&newFrame.face[c]<=1);
 assert.strictEqual(addVocalFaceV994(frame,OFF_VOCAL_V994),frame);
});
check('individual opt-in checkboxes affect only their own channels',()=>{
 const x=sample({},{settings:{...settings,mouthTiming:false}});
 assert(x.active);assert.equal(vocalRateV994(x,'jaw',true),1);assert(x.headPitch!==0);
 const y=sample({},{settings:{...settings,phraseExpression:false}});
 assert.equal(y.brow,0);assert.equal(y.cheek,0);assert.equal(y.squint,0);
 const z=sample({},{settings:{...settings,headAccents:false}});
 assert.equal(z.headPitch,0);assert(z.jawAttack>1);
});
check('balanced reduces gains, styles do not exceed safety limits',()=>{
 assert(sample({}, {tier:'balanced'}).gain<sample().gain);
 for(const style of ['natural','rap-flow','stage']){
  const a=sample({}, {settings:{...settings,style}});
  assert(a.active);assert(Math.abs(a.headPitch)<=.014);
  assert(a.jawAttack<=1.075&&a.jawRelease>=.93);
 }
});
check('10,000 deterministic sampled frames bounded across all settings',()=>{
 let seed=98765;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let i=0;i<10000;i++){
  const w=words[Math.floor(rand()*words.length)];
  const c=sample({activeWord:w.text,effectiveTimeMs:w.startMs+rand()*(w.endMs-w.startMs)},
   {settings:{...settings,intensity:rand()*100,style:['natural','rap-flow','stage'][i%3]}});
  for(const k of ['gain','headPitch','brow','cheek','squint','jawAttack','jawRelease','vowelAttack','vowelRelease'])assert(Number.isFinite(c[k]),k);
  assert(c.gain>=0&&c.gain<=1);assert(Math.abs(c.headPitch)<=.014);
  assert(c.jawAttack>=1&&c.jawAttack<=1.076);assert(c.jawRelease>=.93&&c.jawRelease<=1);
  assert(c.vowelAttack>=1&&c.vowelAttack<=1.043);assert(c.vowelRelease>=.955&&c.vowelRelease<=1);
 }
});
check('concert bridge validates preferences and discards stale song',()=>{
 const signal={...bridge.OFF_CONCERT_SIGNAL_V882,trackId:'song-A',durationMs:120000,
  playing:true,enabled:true,intensity:.8,sceneSource:'verified',sceneStartMs:60000,
  vocalSettingsV994:{...settings,intensity:999,style:'invalid'}};
 bridge.publishConcertStageSyncV882(signal);
 const snap=bridge.readConcertStageSyncV882();
 assert.equal(snap.vocalSettingsV994.intensity,100);
 assert.equal(snap.vocalSettingsV994.style,'natural');
 assert.equal(sample({}, {settings:snap.vocalSettingsV994,activeTrackId:snap.trackId}).active,true);
 bridge.publishConcertStageSyncV882({...signal,vocalSettingsV994:{...settings,enabled:false}});
 assert.equal(bridge.readConcertStageSyncV882().vocalSettingsV994.enabled,false);
 bridge.publishConcertStageSyncV882(null);
 assert.equal(bridge.readConcertStageSyncV882().trackId,'');
});
check('GLB and procedural use existing face, mouth and head pipelines',()=>{
 const glb=read('components/visualizer/VocalRigV368.tsx');
 const proc=read('components/visualizer/ProceduralDancerAvatarV492.tsx');
 assert(glb.includes('vocalV994=planVocalPerformanceV994(optionsV538'));
 assert(glb.includes('vocalRateV994(vocalV994,c,attackingV581)'));
 assert(glb.includes('vocalV994.headPitch'));
 assert(glb.includes('addVocalFaceV994(expressiveArtistFaceV645,vocalV994)'));
 assert(proc.includes('vocalV994=planVocalPerformanceV994(optionsV538'));
 assert(proc.includes("vocalRateV994(vocalV994,'jaw'"));
 assert(proc.includes('vocalV994.headPitch'));
 assert(!read('components/visualizer/vocalPerformanceIntelligenceV994.ts').includes('useFrame('));
});
check('UI, local settings, CI and release scripts are present',()=>{
 const ui=read('components/visualizer/LiveFxDeckV881.tsx'),sync=read('components/visualizer/concertStageSyncV882.ts');
 assert(ui.includes('V994 · Vocal Performance Intelligence'));
 assert(ui.includes('VOCAL_KEY_V994')&&ui.includes('updateVocalV994'));
 assert(ui.includes('vocalSettingsV994:normalizeVocalV994'));
 assert(sync.includes('normalizeVocalV994(input.vocalSettingsV994)'));
 const pkg=JSON.parse(read('package.json'));
 assert(Number(pkg.sonicFeatureRelease.slice(1))>=994);assert(Number(pkg.sonicRoadmapRelease.slice(1))>=994);
 assert(pkg.scripts.prebuild.includes('npm run test:v994 && npm run test:v994:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v994-vocal-performance-intelligence-regression.cjs'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v994'));
});
console.log('PASS V994: '+n+' groups');

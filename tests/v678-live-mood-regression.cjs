'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const read=p=>fs.readFileSync(p,'utf8');
const source='lib/live-mood-v678.ts';
const compiled=ts.transpileModule(read(source),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(compiled.diagnostics.length,0,'mood TypeScript syntax');
const mood={};vm.runInNewContext(compiled.outputText,{exports:mood,require:()=>{throw Error('Mood core must not import IO dependencies');},Math,Number,Date,Object,Array,Set,Map,JSON},{filename:source});
let count=0;const test=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V678 / ${name}: ${e.message}`;throw e;}};
const data={
 calm:{volume:.07,energyEnvelope:.08,bass:.04,highs:.09,beatStrength:.05,attack:.02},
 atmospheric:{volume:.28,energyEnvelope:.3,bass:.12,highs:.44,beatStrength:.12,attack:.08},
 driving:{volume:.53,energyEnvelope:.47,bass:.35,highs:.40,beatStrength:.35,attack:.21},
 intense:{volume:.82,energyEnvelope:.84,bass:.88,highs:.67,beatStrength:.9,attack:.86},
};
const warm=(type,frames=30,start=10000,trackId='song')=>{let s=mood.EMPTY_LIVE_MOOD_V678;for(let i=0;i<frames;i++)s=mood.advanceLiveMoodV678(s,trackId,start+i*100,data[type],true);return s;};
test('no classification before 8 samples',()=>assert.equal(mood.classifyAcousticMoodV678(Array(7).fill(data.intense)),null));
for(const key of ['calm','atmospheric','driving','intense'])test(`${key} has distinct acoustic response`,()=>assert.equal(mood.classifyAcousticMoodV678(Array(12).fill(data[key])),key));
test('live microphone silence is NOT classified as calm mood',()=>assert.equal(mood.classifyAcousticMoodV678(Array(20).fill({volume:0,energyEnvelope:0,bass:0,highs:0,beatStrength:0,attack:0})),null));
test('does not classify unknown with zero samples',()=>assert.equal(mood.classifyAcousticMoodV678([]),null));
test('finite bounded numeric normalization',()=>{const out=mood.safeMoodSampleV678({volume:Infinity,energyEnvelope:-4,bass:NaN,highs:5,beatStrength:2,attack:-1});assert.deepEqual(Object.values(out),[0,0,0,1,1,0]);});
test('sustained evidence required for first mood',()=>{assert.equal(warm('intense',8).mood,null);assert.equal(warm('intense',11).mood,null);assert.equal(warm('intense',13).mood,'intense');});
test('same track stable over 30 frames',()=>assert.equal(warm('driving').mood,'driving'));
test('high energy cannot be inferred from one frame',()=>{let s=warm('calm');s=mood.advanceLiveMoodV678(s,'song',13100,data.intense,true);assert.equal(s.mood,'calm');});
test('recovers to a different stable mood after a long segment',()=>{let s=warm('calm');for(let i=0;i<65;i++)s=mood.advanceLiveMoodV678(s,'song',13100+i*100,data.intense,true);assert.equal(s.mood,'intense');});
test('track switch clears previous mood and samples',()=>{const s=mood.advanceLiveMoodV678(warm('intense'),'new-song',14000,data.calm,true);assert.equal(s.trackId,'new-song');assert.equal(s.mood,null);assert.equal(s.samples.length,1);});
test('sustained microphone silence clears stale classification',()=>{let s=warm('intense');const silent={volume:0,energyEnvelope:0,bass:0,highs:0,beatStrength:0,attack:0};for(let i=0;i<55;i++)s=mood.advanceLiveMoodV678(s,'song',13000+i*100,silent,true);assert.equal(s.mood,null);});
test('mic unavailable clears every buffer',()=>{const s=mood.advanceLiveMoodV678(warm('intense'),'song',14000,data.intense,false);assert.equal(s.mood,null);assert.equal(s.samples.length,0);});
test('disconnected song clears buffer',()=>assert.equal(mood.advanceLiveMoodV678(warm('intense'),'',14000,data.intense,true).mood,null));
test('stale samples >2s reset rather than reused',()=>{const s=mood.advanceLiveMoodV678(warm('intense'),'song',20000,data.intense,true);assert.equal(s.samples.length,1);assert.equal(s.mood,null);});
test('same-frame timestamps ignored',()=>{const s=warm('intense'),next=mood.advanceLiveMoodV678(s,'song',s.samples.at(-1).atMs,data.calm,true);assert.equal(s,next);});
test('negative-time sequence ignored',()=>{const s=warm('intense'),next=mood.advanceLiveMoodV678(s,'song',400,data.calm,true);assert.equal(s,next);});
test('invalid clock rejected',()=>assert.equal(mood.advanceLiveMoodV678(warm('intense'),'song',NaN,data.intense,true).mood,null));
test('sample count capped to 40',()=>assert.equal(warm('driving',1000).samples.length,40));
test('unknown mood or disabled produces identity cue',()=>{assert.equal(mood.moodStageCueV678(null,50,true).lightDelta,0);assert.equal(mood.moodStageCueV678('intense',100,false).danceFactor,1);});
test('strength zero is identity',()=>{const v=mood.moodStageCueV678('intense',0,true);assert.equal(v.lightDelta,0);assert.equal(v.danceFactor,1);});
test('bounded cues for any strength',()=>{for(const type of Object.keys(data)){for(const strength of [-99,0,40,100,900,NaN]){const v=mood.moodStageCueV678(type,strength,true);assert(Math.abs(v.lightDelta)<=8);assert(v.danceFactor<=1.0800001&&v.danceFactor>=.9299999);assert(Math.abs(v.aggressionDelta)<=.06);}}});
test('disabled cues never round or clamp existing director values',()=>{const zero=mood.moodStageCueV678(null,100,false);assert.equal(mood.modulateMoodLightV678(77.55,zero),77.55);assert.equal(mood.modulateMoodDanceV678(2.25,zero),2.25);});
test('light stays in 0-100',()=>{assert.equal(mood.modulateMoodLightV678(100,mood.moodStageCueV678('intense',100,true)),100);assert.equal(mood.modulateMoodLightV678(0,mood.moodStageCueV678('calm',100,true)),0);});
test('dance stays 0-1.5',()=>assert.equal(mood.modulateMoodDanceV678(999,mood.moodStageCueV678('intense',100,true)),1.5));
test('labels describe acoustics rather than true emotions',()=>{for(const label of Object.values(mood.MOOD_LABELS_V678)){assert(label.label&&label.description);assert(!/traurig|wütend|psychologisch/i.test(label.label));}});
const stage=read('components/visualizer/VisualizerStage.tsx');const provider=read('components/LiveMoodProviderV678.tsx');const page=read('app/page.tsx');const ui=read('components/ConcertLookDesignerV676.tsx');const prefs=read('context/UiPreferencesContext.tsx');const types=read('types/music.ts');const css=read('app/globals.css');const pkg=require('../package.json');
test('mood provider inside actual Audio + Visualizer providers',()=>{assert(page.includes('<VisualizerProvider><LiveMoodProviderV678>'));assert(page.includes('<SmartConcertLookControllerV677/>'));});
test('never uses fake audio unless microphone truly active',()=>{assert(provider.includes('audioActive&&connected&&isPlaying'));assert(!provider.includes('useEstimatedBeat'));assert(!provider.includes('fetch('));});
test('opt in false by default',()=>{assert(prefs.includes('liveMoodEnabledV678:false'));assert(types.includes('liveMoodEnabledV678?: boolean'));assert(provider.includes('liveMoodEnabledV678===true'));});
test('mood library does not collect/store users audio',()=>{assert(!provider.includes('localStorage'));assert(!provider.includes('sessionStorage'));assert(!provider.includes('MediaRecorder'));assert(!read(source).includes('fetch('));});
test('stage applies only to final light and dance intensity',()=>{for(const token of ['modulateMoodLightV678(concertDynamicsPercentV502','modulateMoodDanceV678(concertDynamicsPercentV502','moodDanceCueV678','data-v678-source'])assert(stage.includes(token),token);});
test('manual choreographies remain ahead of mood dance',()=>{for(const token of ["avatarMotionMode==='choreography'",'avatarTimelineEnabled','avatarBlendEnabled','smartDanceOverride',"avatarDancePreset??'auto'"])assert(stage.includes(token),token);});
test('reduced-motion guard',()=>assert(stage.includes('!preferences.reducedMotion')));
test('no preference updates in live mood engine or stage',()=>assert(!provider.includes('updatePreferences')));
test('user can tune effects without altering saved look patch',()=>{assert(ui.includes('liveMoodStrengthV678'));assert(ui.includes('liveMoodDanceV678'));assert(ui.includes('Keine Live-Mikrofonanalyse'));assert(ui.includes('Kein ausreichendes Audiosignal'));assert(!read('lib/concert-look-designer-v676.ts').includes('liveMoodEnabledV678'));});
test('truthful UI disclaims psychological inference',()=>{assert(ui.includes('keine zuverlässig erkannten Gefühle'));assert(ui.includes('Spotify-Taktsimulationen'));});
test('responsive and reduced-motion styles',()=>{assert(css.includes('.live-mood-panel-v678'));assert(css.includes('@media(max-width:650px)'));assert(css.includes('@media(prefers-reduced-motion:reduce)'));});
test('release scripts and docs',()=>{assert(Number(pkg.version.match(/-v(\d+)$/)[1])>=678);assert(pkg.scripts['check:release'].includes('npm run test:v678'));assert(pkg.scripts['test:smoke:v678'].includes('test:smoke:v677'));assert(read('ARCHITECTURE.md').includes('V678'));assert(read('V678-LIVE-ACOUSTIC-MOOD.md').includes('Mikrofon'));});
console.log(`PASS V678 Live Acoustic Mood: ${count} checks`);

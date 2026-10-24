require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');const cache={};
function load(relative){if(cache[relative])return cache[relative];
 const source=fs.readFileSync(path.join(root,'components/visualizer',relative+'.ts'),'utf8');
 const js=ts.transpileModule(source,{fileName:relative+'.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};new Function('module','exports','require',js)(module,module.exports,id=>id.startsWith('./')?load(path.posix.normalize(path.posix.join(path.posix.dirname(relative),id.slice(2)))):require(id));cache[relative]=module.exports;return module.exports;
}
const {initialUnifiedV402:initial,advanceUnifiedV402:advance,chooseUnifiedModeV402:choose,unifiedExperienceV402:experience,gateUnifiedDanceV402:gate}=load('unifiedConcertDirectorV402');
const {initialExperienceV396,advanceExperienceV396}=load('performanceExperienceV396');
const {initialConcertShowV387,advanceConcertShowV387}=load('concertShowDirectorV387');
const {initialFestivalShowV394,advanceFestivalShowV394}=load('festivalShowDirectorV394');
const basic={trackId:'track-x',progressMs:1000,playing:true,reducedMotion:false,mode:'festival',strength:100,
 section:'verse',genre:'Deutschrap',energy:.85,beat:.85,performers:3,activeLyrics:true,hasVocalTiming:true,performanceTier:'high'};
let state=initial(),cue=advance(state,basic);
assert.equal(cue.active,true);assert.equal(cue.section,'verse');assert.equal(cue.concertMode,'balanced');
assert.equal(cue.festivalMode,'off','No fabricated electronic genre');
assert.equal(cue.vocalMode,'expressive','Rap verse with timed vocals');assert.equal(cue.ensembleMode,'subtle');
cue=advance(state,{...basic,progressMs:1900});assert(cue.intensity>0);
const vocalVerse=cue.vocalGain,verseDance=cue.groupGain;
cue=advance(state,{...basic,section:'hook',progressMs:2000});assert.equal(cue.section,'verse','single section hint not a cut');
cue=advance(state,{...basic,section:'hook',progressMs:2250});assert.equal(cue.section,'verse');
cue=advance(state,{...basic,section:'hook',progressMs:2350});assert.equal(cue.section,'hook');
cue=advance(state,{...basic,section:'hook',progressMs:3000});assert.equal(cue.vocalMode,'subtle');assert(cue.groupGain>verseDance);assert(cue.vocalGain<vocalVerse);
cue=advance(state,{...basic,section:'drop',genre:'Hardstyle',progressMs:4000,mode:'festival'});
assert.equal(cue.section,'hook','Short false drop not promoted');
cue=advance(state,{...basic,section:'drop',genre:'Hardstyle',progressMs:4350,mode:'festival'});
assert.equal(cue.section,'drop');assert.equal(cue.festivalMode,'festival');assert.equal(cue.ensembleMode,'expressive');
const low=advance(initial(),{...basic,progressMs:2400,section:'drop',genre:'Hardtekk',performanceTier:'low'});
const high=advance(initial(),{...basic,progressMs:2400,section:'drop',genre:'Hardtekk',performanceTier:'high'});
assert.equal(low.festivalMode,'cinematic');assert.equal(high.festivalMode,'festival');
assert(low.intensity<=high.intensity);
const mild=advance(initial(),{...basic,mode:'balanced'});
assert(mild.intensity<=high.intensity);
for(const diff of [{mode:'off'},{strength:0},{playing:false},{reducedMotion:true},{trackId:''},{progressMs:NaN},{strength:NaN}]){
 assert.equal(advance(initial(),{...basic,...diff}).active,false,JSON.stringify(diff));
}
const vocalOff=advance(initial(),{...basic,vocal:false});assert.equal(vocalOff.vocalMode,'off');
const danceOff=advance(initial(),{...basic,dance:false});assert.equal(danceOff.ensembleMode,'off');
const allOff=advance(initial(),{...basic,vocal:false,dance:false,camera:false,lighting:false});
assert.equal(allOff.concertMode,'off');assert.equal(allOff.festivalMode,'off');
assert.equal(advance(initial(),{...basic,activeLyrics:false}).vocalMode,'off');
assert.equal(advance(initial(),{...basic,hasVocalTiming:false}).vocalMode,'off');
assert.equal(advance(initial(),{...basic,performers:1}).ensembleMode,'off');
assert.equal(advance(state,{...basic,trackId:'track-y',section:'build',progressMs:100}).section,'build','Track change resets');
assert.equal(advance(state,{...basic,trackId:'track-y',section:'verse',progressMs:40000}).section,'verse','Seek forward resets');
assert.equal(advance(state,{...basic,trackId:'track-y',section:'break',progressMs:100}).section,'break','Seek back resets');
assert.equal(choose('festival','balanced',true,'off'),'festival','Manual own show wins');
assert.equal(choose('off','balanced',true,'festival'),'balanced','V396 wins');
assert.equal(choose('off','off',false,'festival'),'festival','V402 fallback');
const previous=advanceExperienceV396(initialExperienceV396(),{...basic,mode:'expressive'});
assert.equal(previous.active,true);assert.equal(experience(previous,high),previous,'V396 has priority');
const empty=advanceExperienceV396(initialExperienceV396(),{...basic,mode:'off'});
const mix=experience(empty,high);assert.equal(mix.active,true);assert.equal(mix.section,'drop');assert.equal(mix.ensembleMode,'expressive');assert.equal(mix.vocalMode,'subtle');
assert.equal(experience(empty,advance(initial(),{...basic,mode:'off'})),empty,'No changed settings when off');
const concert=advanceConcertShowV387(initialConcertShowV387(),{...basic,mode:'balanced',progressMs:1500});
assert.equal(gate(concert,danceOff,false).danceGain,1,'V402 dance switch suppresses implicit V387 dance modulation');
assert.equal(gate(concert,danceOff,true),concert,'Existing manually selected V387 remains unchanged');
assert.equal(gate(concert,high,false),concert,'Dance enabled leaves cues unchanged');
const fest=advanceFestivalShowV394(initialFestivalShowV394(),{...basic,section:'drop',genre:'Hardstyle',mode:'festival',progressMs:1500});
assert.equal(fest.cue.section,'drop','V394 integration remains available');
for(const [filename,parts] of Object.entries({
 'types/music.ts':['avatarUnifiedModeV402','avatarUnifiedLightingV402','avatarUnifiedVocalV402'],
 'context/UiPreferencesContext.tsx':['avatarUnifiedModeV402:"off"','avatarUnifiedStrengthV402:70'],
 'components/SettingsPanel.tsx':['v402-unified-concert-settings','Unified Concert Show Director','avatarUnifiedCameraV402','avatarUnifiedVocalV402'],
 'components/visualizer/VisualizerStage.tsx':['advanceUnifiedV402','unifiedExperienceV402','sharedExperienceCueV402','gateUnifiedDanceV402','unifiedCueV402.concertMode','unifiedCueV402.festivalMode','section:unifiedSectionV402,genre'],
 'components/visualizer/ThreeAvatar.tsx':['resolveEnsembleSettingsV396','props.experienceCueV396'],
 'components/visualizer/StageCameraDirectorV289.tsx':['composeVocalCameraV401'],
 'components/visualizer/DynamicStage.tsx':['concertShowCueV387','festivalShowCueV394','authoredLightsV386'],
 })){
 const contents=fs.readFileSync(path.join(root,filename),'utf8');for(const part of parts)assert(contents.includes(part),`${filename} missing ${part}`);
}
const packageJson=require('../package.json');assert.ok((Number(String(packageJson.version).match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 402));
assert(packageJson.scripts['verify:offline'].includes('test:v402'));
console.log('PASS V402 unified concert: multi-section timing, safety, genre, performance budget, manual priority, all channels, wiring');

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepGenreShowV1093:step,resolveGenreShowFamilyV1093:family,
 sampleGenreShowGainV1093:sample,INITIAL_GENRE_SHOW_V1093:INITIAL}=load('lib/arena360GenreShowIntelligenceV1093');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const calm={energyEnvelope:.20,bass:.17,beat:false,beatStrength:.1,attack:.1};
const verse={energyEnvelope:.64,bass:.55,beat:false,beatStrength:.3,attack:.2};
const beat={energyEnvelope:.92,bass:.85,beat:true,beatStrength:.96,attack:.93};
const args=(over={})=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 performanceTier:'balanced',trackId:'song',progressMs:7000,durationMs:175000,
 deltaSeconds:.016,strength:60,genre:'Deutschrap',mode:'auto',sectionHint:'verse',audio:verse,...over});
for(const [s,m,expected] of [
 ['Deutschrap','auto','deutschrap'],['German Hip Hop','auto','deutschrap'],
 ['Hardtekk','auto','hardtekk'],['Hardstyle','auto','hardtekk'],
 ['NDH','auto','deutschrock'],['Deutschrock','auto','deutschrock'],
 ['Synth-Pop','auto','pop'],['Deutschpop','auto','pop'],
 ['samba','auto',null],['','auto',null],['rap','auto',null],
 ['unknown','deutschrap','deutschrap'],['unknown','hardtekk','hardtekk'],
 ['unknown','deutschrock','deutschrock'],['unknown','pop','pop'],
 ['Deutschrap','bad',null]])assert.equal(family(s,m),expected,`${s} ${m}`);
for(const o of [{enabled:false},{playing:false},{reducedMotion:true},
 {reactive:false},{strength:0},{performanceTier:'low'},{performanceTier:null}]){
 const out=step(INITIAL,args(o));assert(!out.active);assert.equal(sample(out.state,'led'),1);
}
for(const o of [{trackId:''},{trackId:'x'.repeat(165)},{progressMs:-1},
 {progressMs:1800001},{durationMs:0},{durationMs:NaN},{deltaSeconds:Infinity},
 {deltaSeconds:-1},{strength:-1},{strength:81}])assert(!step(INITIAL,args(o)).active);
assert.equal(step(INITIAL,args({genre:'Unknown'})).reason,'genre');
for(const field of ['energyEnvelope','bass','beatStrength','attack'])for(const n of [-1,1.1,NaN,Infinity])
 assert.equal(step(INITIAL,args({audio:{...beat,[field]:n}})).reason,'audio');
assert.equal(step(INITIAL,args({audio:{...beat,beat:'yes'}})).reason,'audio');
assert.equal(step(INITIAL,args()).reason,'priming');
for(const chan of ['led','laser','crowd'])assert.equal(sample(INITIAL,chan),1);
const curves={};
for(const genre of ['deutschrap','hardtekk','deutschrock','pop']){
 let current=step(INITIAL,args({genre:'Unknown',mode:genre})).state;
 for(let i=1;i<320;i++){
  const x=step(current,args({genre:'Unknown',mode:genre,progressMs:7000+i*16,
   sectionHint:'verse',audio:verse}));
  assert(x.active);assert(!x.accentDetected);current=x.state;
 }
 curves[genre]=['led','laser','crowd'].map(channel=>sample(current,channel));
 assert(curves[genre].every(v=>v>=.55&&v<=1));
}
assert(new Set(Object.values(curves).map(v=>v.join(','))).size===4,'4 distinct genre arcs');
assert(curves.deutschrap[0]<curves.hardtekk[0],'Deutschrap reduces verses compared with Hardtekk');
assert(curves.deutschrock[2]>curves.hardtekk[2],'Deutschrock favors arena crowd');
let current=step(INITIAL,args()).state;
for(let i=1;i<90;i++)current=step(current,args({progressMs:7000+i*16,sectionHint:'hook',audio:calm})).state;
assert(!step(current,args({progressMs:8500,sectionHint:'drop',audio:calm})).accentDetected,
 'A planned drop cannot invent a measured attack');
let hit=step(current,args({progressMs:8500,sectionHint:'verse',audio:beat}));
assert(hit.accentDetected);
assert(!step(hit.state,args({progressMs:8516,sectionHint:'hook',audio:beat})).accentDetected,'held beat');
const empty=step(hit.state,args({progressMs:8516,audio:verse}));
assert(!step(empty.state,args({progressMs:8532,audio:beat})).accentDetected,'cooldown');
for(const o of [{trackId:'different'},{progressMs:1000},{progressMs:30000},
 {genre:'Hardstyle'},{mode:'pop'}]){
 const r=step(current,args(o));assert.equal(r.reason,'priming');
 assert.equal(sample(r.state,'led'),1);
}
assert.equal(sample(undefined,'laser'),1);
assert.equal(sample({...current,ledGain:NaN},'led'),1);
let state=INITIAL;
for(let i=0;i<180000;i++){
 const genre=['Deutschrap','Hardtekk','Deutschrock','Pop'][i%4];
 const a=i%71===0?beat:i%12<3?calm:verse;
 const r=step(state,args({trackId:'song'+Math.floor(i/10000),genre,
  sectionHint:['intro','verse','build','hook','break','finale'][i%6],
  progressMs:(i*17)%160000,strength:i%81,audio:a}));
 for(const chan of ['led','laser','crowd']){const x=sample(r.state,chan);
  assert(Number.isFinite(x));assert(x>=.55&&x<=1);}
 if(r.accentDetected)assert(a.beat&&a.beatStrength>=.76&&a.attack>=.68);
 state=r.state;
}
const core=read('lib/arena360GenreShowIntelligenceV1093.ts');
for(const forbidden of ['Date.now(', 'Math.random(', 'fetch(', 'setInterval(', 'setTimeout(',
 'localStorage.', 'navigator.', 'requestAnimationFrame(', 'window.', 'Govee'])
 assert(!core.includes(forbidden),'no additional timer, hardware, or network: '+forbidden);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('stepGenreShowV1093('));
assert(stage.includes("genre,mode:genreShowModeV1093,sectionHint:section,audio"));
for(const hint of ["ledWallPatternV1059==='auto'", "hologramPattern==='auto'", "phoneMode==='wave'"])
 assert(stage.includes(hint),'manual mode retained: '+hint);
for(const f of ['components/visualizer/stages/ArenaLedWallV1059.tsx',
 'components/visualizer/stages/ArenaLaserFansV1036.tsx',
 'components/visualizer/stages/ArenaLaserTunnelsV1039.tsx',
 'components/visualizer/stages/ArenaAudienceV1032.tsx'])
 assert(read(f).includes('sampleGenreShowGainV1093('),'renderer uses existing batches: '+f);
for(const suf of ['Enabled','Strength','Mode']){
 const setting='arenaGenreShow'+suf+'V1093',wire='genreShow'+suf+'V1093';
 assert(read('types/music.ts').includes(setting+'?:'));
 assert(read('components/visualizer/registry.tsx').includes(setting+'?:'));
 assert(read('components/visualizer/VisualizerStage.tsx').includes(setting+'={preferences.'+setting));
 assert(read('components/visualizer/ThreeAvatar.tsx').includes(wire+'={props.'+setting));
 assert(read('components/visualizer/stages/index.tsx').includes(wire+'={'+wire+'}'));
}
assert(read('context/UiPreferencesContext.tsx').includes('arenaGenreShowEnabledV1093:false'));
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(panel.includes('arena-v1093-genre-show'));
assert(panel.includes('arenaGenreShowEnabledV1093:false'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1093');assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v1093 && npm run test:v1093:types &&'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1093-genre-show-intelligence-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1093(root)'));
console.log('PASS V1093: four independent genre dramaturgies, 180000 bounded song samples, safe opt-in stage/crowd wiring');

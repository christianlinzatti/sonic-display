'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src='components/visualizer/cinematicConcertDirectorV761.ts';
const compiled=ts.transpileModule(read(src),{fileName:src,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};new Function('module','exports','require',compiled.outputText)(mod,mod.exports,()=>{throw Error('unexpected runtime import')});
const v=mod.exports;let checks=0;
function ok(x,label){assert.ok(x,label);checks++;}function eq(x,y,label){assert.deepEqual(x,y,label);checks++;}
const sections=['verse','build','hook','verse','build','hook','drop','break','verse','hook','drop'];
const acts=sections.map((section,index)=>({index,section,startMs:index*32000,endMs:(index+1)*32000,
 chapter:section==='hook'?'payoff':'develop',motif:'wide',repetition:sections.slice(0,index).filter(s=>s===section).length,
 danceGain:.01,cameraGain:.01,lightGain:.01}));
const narrative={source:'verified-v600',trackId:'track',durationMs:sections.length*32000,genre:'deutschrap',acts,endingSupported:false};
const plan=v.planCinematicConcertV761(narrative);
const base={active:true,genre:'deutschrap',source:'imported',section:'verse',dance:1,camera:1,lighting:1,lyrics:.05,evidence:'labeled'};
const settings={...v.DEFAULT_CINEMATIC_CONCERT_V761};
const story={active:true,source:'verified-v600',act:0,chapter:'develop',motif:'portrait',repetition:0,transition:1,dynamics:base};
const inputs={settings,narrative:story,base,trackId:'track',progressMs:12000,playing:true,reducedMotion:false,tier:'high',manualDance:false,manualCamera:false,manualLighting:false,manualLyrics:false,lyricsProtected:false,verifiedSinger:false};
const sample=(patch={})=>v.sampleCinematicConcertV761(plan,{...inputs,...patch});
eq(v.normalizeCinematicConcertV761(null),settings);
eq(v.normalizeCinematicConcertV761({strength:Infinity,variety:-1,transitionMs:9000,protectLyrics:false}),
  {...settings,variety:0,transitionMs:3000,protectLyrics:false});
ok(plan.source==='verified-v604'&&plan.actCount===11,'verified storyboard');
const lowVariety=v.planCinematicConcertV761(narrative,{...settings,variety:0});
ok(lowVariety.scenes.length===acts.length,'zero variety only scene per act');
ok(v.planCinematicConcertV761(narrative,{...settings,variety:40}).scenes.length>lowVariety.scenes.length,'more scenes for medium variety');
ok(plan.scenes.length>lowVariety.scenes.length,'default 70 has more scenes');
ok(plan.scenes.length>plan.actCount,'sub-scenes inside long acts');
for(let i=1;i<plan.scenes.length;i++){
 const a=plan.scenes[i-1],b=plan.scenes[i];ok(a.intent!==b.intent,'no consecutive duplicated visual motif');
 ok(a.endMs<=b.startMs,'nonoverlapping ordered scenes');
}
const hooks=plan.scenes.filter(s=>s.section==='hook');
ok(new Set(hooks.slice(0,3).map(s=>s.intent)).size>=2,'hook motif variety');
for(const patch of [
 {settings:{...settings,enabled:false}},{settings:{...settings,strength:0}},
 {trackId:'other'},{playing:false},{reducedMotion:true},{tier:'low'},
 {progressMs:NaN},{progressMs:-1},{progressMs:narrative.durationMs},
 {narrative:{...story,active:false}},{narrative:{...story,source:'off'}},
 {narrative:{...story,act:3}},{base:{...base,active:false}},
 {base:{...base,section:'drop'}}
]){const r=sample(patch);ok(!r.active,'safety bypass '+Object.keys(patch));eq(r.dynamics,patch.base??base,'bypass leaves original baseline');}
for(const invalid of [
 {...narrative,source:'unavailable'},
 {...narrative,acts:[]},
 {...narrative,acts:[{...acts[0],startMs:-1}]},
 {...narrative,acts:[{...acts[0],endMs:100}]},
 {...narrative,acts:[{...acts[0],endMs:narrative.durationMs+1}]},
 {...narrative,acts:[acts[0],{...acts[1],startMs:100}]},
 {...narrative,acts:[{...acts[0],section:'made-up'}]},
 {...narrative,trackId:''},
 {...narrative,durationMs:NaN},
 {...narrative,acts:acts.map((a,i)=>({...a,index:i===3?55:i}))}
])eq(v.planCinematicConcertV761(invalid).source,'unavailable','reject malformed plan');
const active=sample();ok(active.active,'active inside validated verse');
for(const k of ['dance','camera','lighting'])ok(Number.isFinite(active.dynamics[k])&&active.dynamics[k]>=.88&&active.dynamics[k]<=1.12,'bounded '+k);
eq(sample({manualDance:true}).dynamics.dance,base.dance,'manual choreography wins');
eq(sample({manualCamera:true}).dynamics.camera,base.camera,'manual camera wins');
eq(sample({manualLighting:true}).dynamics.lighting,base.lighting,'manual lighting wins');
eq(sample({manualLyrics:true}).dynamics.lyrics,base.lyrics,'manual lyrics wins');
for(const scene of plan.scenes){
 const cue={...story,act:scene.actIndex};const sceneBase={...base,section:scene.section};
 for(const ms of [scene.startMs,scene.endMs-1,Math.floor((scene.startMs+scene.endMs)/2)]){
  const x=sample({progressMs:ms,narrative:cue,base:sceneBase});ok(x.active,'act sample');
  ok(x.intent===scene.intent,'scene identity');ok(x.blend>=0&&x.blend<=1,'bounded fade');
  if(ms===scene.startMs)eq(x.dynamics,sceneBase,'seamless scene entry');
 }
 const protectedScene=sample({progressMs:(scene.startMs+scene.endMs)/2,narrative:cue,base:sceneBase,lyricsProtected:true});
 eq(protectedScene.dynamics.lyrics,sceneBase.lyrics,'protected synced lyrics unchanged');
 ok(protectedScene.dynamics.lighting<=sceneBase.lighting+.000001,'protected lyrics no extra beam glow');
}
const neutral=sample({narrative:{...story,act:0},progressMs:33000});ok(!neutral.active,'stale act never accepted');
for(let i=0;i<30000;i++){
 const scene=plan.scenes[i%plan.scenes.length];
 const ms=scene.startMs+(.1+(i%82)/100)*(scene.endMs-scene.startMs);
 const b={...base,section:scene.section};
 const input={...inputs,narrative:{...story,act:scene.actIndex},base:b,progressMs:ms,
  tier:i%3?'balanced':'high',lyricsProtected:i%5===0,
  manualCamera:i%7===0,manualDance:i%11===0,manualLighting:i%13===0,manualLyrics:i%17===0};
 const r=v.sampleCinematicConcertV761(plan,input);
 ok(r.active&&Number.isFinite(r.dynamics.camera)&&Number.isFinite(r.blend),'numeric stable');
 eq(r,v.sampleCinematicConcertV761(plan,input),'deterministic seek');
 if(input.manualCamera)eq(r.dynamics.camera,b.camera,'manual camera untouched');
 if(input.manualDance)eq(r.dynamics.dance,b.dance,'manual dance untouched');
 if(input.manualLighting)eq(r.dynamics.lighting,b.lighting,'manual light untouched');
 if(input.manualLyrics||input.lyricsProtected)eq(r.dynamics.lyrics,b.lyrics,'manual/protected lyrics untouched');
}
const stage=read('components/visualizer/VisualizerStage.tsx');
for(const text of ['planCinematicConcertV761','sampleCinematicConcertV761','cinematicCueV761','directedDynamicsV761','data-v761-scene'])ok(stage.includes(text),'live integration '+text);
ok(stage.indexOf('sampleCinematicConcertV761(')>stage.indexOf('sampleFullSongDramaturgyV604('),'V604 evidence first');
ok(stage.indexOf('sampleCinematicConcertV761(')<stage.indexOf('planIntegratedConcertQualityV750('),'V750 later quality authority');
ok(stage.includes('coordinateConcertDynamicsV654(directedDynamicsV761,concertFlowV654)'), 'V654 common camera/light/dance chain');
ok(stage.includes('concertLyricAccentV502={directedDynamicsV761.lyrics}'),'decorative 2D lyrics only');
ok(!read(src).includes('window.')&&!read(src).includes('fetch('),'pure deterministic planner');
const panel=read('components/SettingsPanel.tsx');ok(panel.includes('V761 · Cinematic Concert Director 4.0')&&panel.includes('cinematicConcertV761'),'settings live controls');
ok(read('context/UiPreferencesContext.tsx').includes('cinematicConcertV761:{enabled:true'),'settings persistent');
ok(read('types/music.ts').includes('cinematicConcertV761?:'),'settings typed');
const pkg=JSON.parse(read('package.json'));ok(/^0\.1\.0-v(?:76[1-9]|7[7-9]\d|[89]\d\d)$/.test(pkg.version),'release version at least V761');
ok(pkg.scripts['check:fast'].includes('npm run test:v761 && npm run test:v761:types'),'prebuild runs V761 checks');
console.log(`PASS V761 Cinematic Concert Director: ${checks.toLocaleString('en-US')} checks`);

'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');const source=f=>fs.readFileSync(path.join(root,f),'utf8');
const file='components/visualizer/cinematicScenicLightingV762.ts';
const built=ts.transpileModule(source(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(built.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};new Function('module','exports','require',built.outputText)(mod,mod.exports,()=>{throw Error('No runtime imports expected')});
const v=mod.exports;let checks=0;const ok=(x,t)=>{assert.ok(x,t);checks++};const eq=(x,y,t)=>{assert.deepEqual(x,y,t);checks++};
const acts=['verse','build','hook','drop','break'].map((section,index)=>({index,section,startMs:index*32000,endMs:(index+1)*32000}));
const narrative={plan:{source:'verified-v600',trackId:'sonic',durationMs:acts.length*32000,acts},cue:{active:true,source:'verified-v600',act:0}};
const scene={active:true,reason:'verified-act',blend:1,actIndex:0,sceneIndex:0,repetition:0,intent:'portrait'};
const settings={...v.DEFAULT_DYNAMIC_STAGE_LIGHTING_V762,enabled:true};
const input={settings,scene,narrative,trackId:'sonic',progressMs:10000,genre:'Deutschrap',playing:true,reactive:true,reducedMotion:false,tier:'high',authored:false,blackout:false,lyricsProtected:false,visualsEnabled:true,ledBudget:1,hazeBudget:1,energy:.7,kick:.6};
const plan=(patch={})=>v.planDynamicStageLightingV762({...input,...patch});
eq(v.normalizeDynamicStageLightingV762({strength:Infinity,gobos:false,enabled:true}).strength,60,'finite fallback');
eq(v.normalizeDynamicStageLightingV762({strength:-5}).strength,0,'clamped strength');
eq(v.normalizeDynamicStageLightingV762({strength:990}).strength,100,'clamped max');
eq(v.classifyScenicGenreV762('Hardtekk'),'hardtekk');eq(v.classifyScenicGenreV762('Hardstyle'),'hardstyle');eq(v.classifyScenicGenreV762('Deutschrap'),'rap');eq(v.classifyScenicGenreV762('NDH Rock'),'rock');eq(v.classifyScenicGenreV762('Synthpop'),'pop');
ok(plan({genre:'Hardtekk'}).goboPhase!==plan({genre:'Hardstyle'}).goboPhase,'Hardtekk vs Hardstyle movement cadence');
const live=plan();ok(live.active&&live.genre==='rap'&&live.reason==='verified-v761','live verified scene');ok(live.goboOpacity>0,'gobo real output');ok(live.ledGain>1&&live.beamGain>1&&live.hazeGain>1,'existing system gains');
for(const patch of [
 {settings:{...settings,enabled:false}}, {settings:{...settings,strength:0}},
 {scene:null},{scene:{...scene,active:false}},{scene:{...scene,reason:'off'}},{scene:{...scene,blend:0}},
 {scene:{...scene,actIndex:1}}, {narrative:null},{narrative:{...narrative,plan:{...narrative.plan,source:'unavailable'}}},
 {narrative:{...narrative,cue:{...narrative.cue,source:'off'}}},
 {narrative:{...narrative,cue:{...narrative.cue,active:false}}},
 {trackId:'other'},{trackId:''},{progressMs:-1},{progressMs:NaN},{progressMs:1e9},
 {playing:false},{reactive:false},{reducedMotion:true},{tier:'low'},{authored:true},{blackout:true},
 {visualsEnabled:false},{ledBudget:NaN},{hazeBudget:NaN}
])eq(plan(patch),v.SCENIC_LIGHTING_OFF_V762,'safety '+JSON.stringify(patch).slice(0,100));
for(const key of ['gobos','ledWall','spotlights','floorHaze']){
 const result=plan({settings:{...settings,[key]:false}});
 ok(result.active,'one effect disabled not rest');
 if(key==='gobos')eq(result.goboOpacity,0);if(key==='ledWall')eq(result.ledGain,1);
 if(key==='spotlights'){eq(result.beamGain,1);eq(result.beamOffset,0)}
 if(key==='floorHaze')eq(result.hazeGain,1);
}
const guarded=plan({lyricsProtected:true});ok(guarded.goboOpacity<=live.goboOpacity,'lyrics dim gobos');ok(guarded.ledGain<=live.ledGain,'lyrics dim LEDs');ok(guarded.beamGain<=live.beamGain,'lyrics dim beam');eq(guarded.beamOffset,0,'lyrics keep lead beam');
for(let i=0;i<25000;i++){
 const idx=i%acts.length,sceneIdx=i%64;
 const p=plan({scene:{...scene,sceneIndex:sceneIdx,actIndex:idx,repetition:i%12,blend:((i%100)+1)/100},
  narrative:{...narrative,cue:{...narrative.cue,act:idx}},progressMs:acts[idx].startMs+1500+(i%20000),
  genre:['Deutschrap','Hardtekk','Rock','Pop','Other'][idx],kick:Math.sin(i),energy:Math.cos(i),tier:i%3===0?'balanced':'high',
  ledBudget:(i%11)/10,hazeBudget:(i%9)/8});
 ok(p.active,'bounded act active');
 for(const [name,min,max] of [['goboOpacity',0,.15],['ledGain',1,1.1],['beamGain',1,1.1],['beamOffset',-.25,.25],['hazeGain',1,1.14]]){
  ok(Number.isFinite(p[name])&&p[name]>=min-1e-9&&p[name]<=max+1e-9,name+' finite and capped');
 }
 ok(p.goboPattern>=0&&p.goboPattern<=3&&Number.isInteger(p.goboPattern),'pattern index');
}
// No fake geometry, no bypass around the authored/manual path; validate concrete source integration.
const stage=source('components/visualizer/DynamicStage.tsx');const atmos=source('components/visualizer/ConcertAtmosphereRendererV308.tsx');
const three=source('components/visualizer/ThreeAvatar.tsx');const parent=source('components/visualizer/VisualizerStage.tsx');
const settingsPanel=source('components/SettingsPanel.tsx');const context=source('context/UiPreferencesContext.tsx');
for(const token of ['planDynamicStageLightingV762','v762-floor-gobo','GOBO_FRAGMENT_V762','scenicV762.ledGain','scenicCueV762.current.beamGain','scenicCueRefV762={scenicCueV762}'])ok(stage.includes(token),'stage render integration '+token);
for(const token of ['scenicCueRefV762','scenicCueRefV762?.current.hazeGain'])ok(atmos.includes(token),'reuse existing haze '+token);
for(const text of ['scenicLightingV762={preferences.scenicLightingV762}','cinematicCueV761={cinematicCueV761}'])ok(parent.includes(text),'stage prop '+text);
ok(three.includes('scenicLightingV762={props.scenicLightingV762}'),'three props');
ok(settingsPanel.includes('scenicLightingV762.enabled')&&settingsPanel.includes('Gobo-Lichtmuster'),'user settings');
ok(context.includes('scenicLightingV762:{enabled:false'),'feature opt-in default');
const gobo=source('components/visualizer/scenicGoboShaderV762.ts');
ok(gobo.includes('smoothstep')&&gobo.includes('uOpacity')&&!gobo.includes('discard;'),'soft gobo shader');
console.log('PASS V762:',checks,'policy, bounds, manual control, geometry and wiring assertions');

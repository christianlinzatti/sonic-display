'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v887=load('components/visualizer/cinematicFogDirectorV887');
const v885=load('components/visualizer/dynamicConcertAtmosphereV885');
const v882=load('components/visualizer/concertStageSyncV882');
const {ATMOSPHERE_FRAGMENT_V887:shader}=load('components/visualizer/cinematicFogShaderV887');
const {ATMOSPHERE_FRAGMENT_V814:oldShader}=load('components/visualizer/atmosphereShaderV814');
const read=file=>fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
let count=0;function check(name,fn){try{fn();count++;}catch(e){e.message=`V887 ${name}: ${e.message}`;throw e;}}
const S=v887.DEFAULT_FOG_V887;
const scenes=[
 {index:0,startMs:0,endMs:30000,section:'verse',intent:'wide'},
 {index:1,startMs:30000,endMs:53000,section:'build',intent:'rise'},
 {index:2,startMs:53000,endMs:76000,section:'drop',intent:'pulse'},
 {index:3,startMs:76000,endMs:103000,section:'hook',intent:'wide'},
 {index:4,startMs:103000,endMs:120000,section:'outro',intent:'breath'},
];
const timeline={trackId:'song',durationMs:120000,source:'verified-v604',scenes};
const plan=v885.buildAtmospherePlanV885({timeline,trackId:'song',durationMs:120000,genre:'Deutschrap',settings:v885.DEFAULT_ATMOSPHERE_V885});
const base={active:true,phase:12.5,color:'#70a1c3',floorOpacity:.12,shaftsOpacity:.07};
const sample=(t=55000,extra={})=>v887.planCinematicFogV887({settings:S,plan,base,trackId:'song',durationMs:120000,
 positionMs:t,genre:'Deutschrap',playing:true,autoEnabled:true,reducedMotion:false,tier:'high',
 hazeBudget:1,performanceGain:1,...extra});
check('safe defaults',()=>assert.deepEqual(S,{enabled:true,mood:'auto',motion:'rolling',intensity:65,floor:true,shafts:true,protectLyrics:true}));
for(const raw of [null,undefined,'abc',55,[],{},false])check(`invalid raw ${String(raw)}`,()=>assert.deepEqual(v887.normalizeCinematicFogV887(raw),S));
check('valid setting override',()=>assert.deepEqual(v887.normalizeCinematicFogV887({enabled:false,mood:'electric',motion:'festival',intensity:27,floor:false,shafts:false,protectLyrics:false}),
 {enabled:false,mood:'electric',motion:'festival',intensity:27,floor:false,shafts:false,protectLyrics:false}));
check('input range clamped',()=>{assert.equal(v887.normalizeCinematicFogV887({intensity:-12}).intensity,0);assert.equal(v887.normalizeCinematicFogV887({intensity:500}).intensity,100);assert.equal(v887.normalizeCinematicFogV887({intensity:12.6}).intensity,13)});
for(const x of [NaN,Infinity,-Infinity,'100'])check(`invalid intensity ${String(x)}`,()=>assert.equal(v887.normalizeCinematicFogV887({intensity:x}).intensity,65));
check('unknown mood/motion fail closed',()=>{assert.equal(v887.normalizeCinematicFogV887({mood:'<svg>',motion:'strobe'}).mood,'auto');assert.equal(v887.normalizeCinematicFogV887({motion:'strobe'}).motion,'rolling');});
for(const [genre,expected] of [['Deutschrap','noir'],['Hardtekk','electric'],['Hardstyle','electric'],['Deutschrock','arena'],['Industrial Metal','arena'],['Pop','dream'],['','dream']])
 check(`genre ${genre}`,()=>assert.equal(v887.selectFogMoodV887(genre),expected));
check('user mood override',()=>assert.equal(v887.selectFogMoodV887('Deutschrap','arena'),'arena'));
check('profile previews differ',()=>{const a=v887.previewFogV887('Deutschrap','auto'),b=v887.previewFogV887('Hardtekk','auto');assert.notEqual(a.color,b.color);assert.match(a.color,/^#[0-9a-f]{6}$/);});
check('verified scene yields subtle cinematic opacity',()=>{const c=sample();assert.equal(c.mode,'cinematic');assert(c.active);assert(c.floorOpacity>0&&c.floorOpacity<=.17);assert(c.shaftsOpacity>0&&c.shaftsOpacity<=.09);});
check('high-energy drop brings visible but capped floor gain',()=>assert(sample().floorOpacity>base.floorOpacity));
check('strict color profile and script-safe label',()=>{const c=sample();assert.equal(c.color,plan.scenes[2].primary);assert.match(c.label,/^Deutschrap/)});
check('manual selection changes color',()=>assert.equal(sample(55000,{settings:{...S,mood:'electric'}}).color,'#48dce5'));
check('quiet scene gets reduced opacity',()=>assert(sample(107000).floorOpacity<sample(55000).floorOpacity));
check('build-up gets intermediate opacity',()=>assert(sample(31000).floorOpacity<sample(55000).floorOpacity));
check('outro 1 millisecond before end valid',()=>assert.equal(sample(119999).mode,'cinematic'));
check('no matching scene at final position',()=>assert.equal(sample(120000).mode,'off'));
check('disabled feature restores legacy V814 accurately',()=>{
 const c=sample(55000,{settings:{...S,enabled:false}});assert.equal(c.mode,'legacy');assert.equal(c.floorOpacity,base.floorOpacity);assert.equal(c.shaftsOpacity,base.shaftsOpacity);assert.equal(c.color,base.color);assert.equal(c.drift,0);assert.equal(c.warp,0);
});
check('disabled feature preserves legacy during pause',()=>assert.equal(sample(55000,{settings:{...S,enabled:false},playing:false}).mode,'legacy'));
const guards=[['pause',{playing:false}],['master auto off',{autoEnabled:false}],['reducedMotion',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],['manual lighting',{manualLighting:true}],['manual FX',{manualFx:true}],['lyrics',{lyricsProtected:true}],['low tier',{tier:'low'}],['no haze budget',{hazeBudget:0}],['negative performance gain',{performanceGain:-1}],['no performance',{performanceGain:0}],['intensity zero',{settings:{...S,intensity:0}}],['floor and shafts off',{settings:{...S,floor:false,shafts:false}}],['negative time',{positionMs:-1}],['nonfinite time',{positionMs:NaN}],['unbounded time',{positionMs:Infinity}]];
for(const [name,change] of guards)check(`gate ${name}`,()=>{const c=sample(55000,change);assert.equal(c.mode,'off');assert.equal(c.floorOpacity,0);assert.equal(c.shaftsOpacity,0);assert.equal(c.drift,0);});
check('lyrics guard adjustable',()=>assert.equal(sample(55000,{settings:{...S,protectLyrics:false},lyricsProtected:true}).mode,'cinematic'));
check('fog floor independent',()=>assert.equal(sample(55000,{settings:{...S,floor:false}}).floorOpacity,0));
check('fog shafts independent',()=>assert.equal(sample(55000,{settings:{...S,shafts:false}}).shaftsOpacity,0));
check('still fog never drifts or warps',()=>{const c=sample(55000,{settings:{...S,motion:'still'}});assert.equal(c.drift,0);assert.equal(c.warp,0);});
check('festival fog moves more than rolling',()=>{const a=sample(55000),b=sample(55000,{settings:{...S,motion:'festival'}});assert(b.drift>a.drift);assert(b.warp>a.warp);});
check('genre-specific color selection',()=>assert.notEqual(sample(55000,{genre:'Deutschrap'}).color,sample(55000,{genre:'Hardtekk',settings:{...S,mood:'electric'}}).color));
check('unavailable storyboard cannot activate cinematic effect',()=>assert.equal(sample(55000,{plan:{...plan,source:'unavailable'}}).mode,'legacy'));
check('missing storyboard cannot activate cinematic effect',()=>assert.equal(sample(55000,{plan:null}).mode,'legacy'));
check('song mismatch never activates cinematic effect',()=>assert.equal(sample(55000,{trackId:'other'}).mode,'legacy'));
check('duration mismatch never activates cinematic effect',()=>assert.equal(sample(55000,{durationMs:123000}).mode,'legacy'));
check('missing interval stays off',()=>{const gap=v885.buildAtmospherePlanV885({timeline:{...timeline,scenes:[{...scenes[0],endMs:25000},...scenes.slice(1)]},trackId:'song',durationMs:120000,genre:'Deutschrap',settings:v885.DEFAULT_ATMOSPHERE_V885});assert.equal(sample(27500,{plan:gap}).mode,'off');});
check('inactive V814 is not revived',()=>{assert.equal(sample(55000,{base:{...base,active:false}}).floorOpacity,0);});
check('phase stays finite',()=>{const c=sample();assert(Number.isFinite(c.phase));});
check('effect ceilings on whole song sampled every 250 ms',()=>{
 for(let t=0;t<120000;t+=250){const c=sample(t);assert(c.floorOpacity>=0&&c.floorOpacity<=.17);assert(c.shaftsOpacity>=0&&c.shaftsOpacity<=.09);assert(c.warp>=0&&c.warp<=1);assert(Number.isFinite(c.drift));}
});
check('conservative balanced quality',()=>assert(sample(55000,{tier:'balanced'}).floorOpacity<sample().floorOpacity));
check('zero performance gain suppresses',()=>assert.equal(sample(55000,{performanceGain:0}).active,false));
check('no transparency injection in shaders',()=>{assert(shader.includes('clamp(softened*uOpacity,0.0,.17)'));assert(shader.includes('uFogWarpV887'));assert(shader.includes('uFogSoftV887'));assert(shader.includes('uFogDriftV887'));});
check('V814 shader composited with no mesh replacement',()=>{assert(shader.includes('varying vec2 vUv;')&&oldShader.includes('varying vec2 vUv;'));assert(shader.includes('float fog1=sin('));assert(shader.includes('float fog2=cos('));assert(shader.includes('uKind<.5'));assert.equal((shader.match(/void main\(/g)||[]).length,1)});
check('V814 zero new uniforms preserve legacy contribution',()=>{const a=sample(55000,{settings:{...S,enabled:false}});assert.equal(a.drift,0);assert.equal(a.warp,0);assert.equal(a.softness,0)});
check('V887 event persisted through V882 boundary',()=>{
 v882.publishConcertStageSyncV882({trackId:'song',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:1,
  sceneSource:'verified',section:'hook',look:'cinema',sceneStartMs:75000,manual:null,manualId:0,manualStartMs:-1,
  sync:v882.DEFAULT_CONCERT_SYNC_V882,atmospherePlan:plan,fogSettingsV887:{...S,mood:'electric'}});
 assert.equal(v882.readConcertStageSyncV882().fogSettingsV887.mood,'electric');
 v882.publishConcertStageSyncV882(null);
});
check('bridge resets on explicit clear',()=>assert.equal(v882.readConcertStageSyncV882().enabled,false));
check('3D uses same V814 meshes and both new shader uniforms',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.includes('planCinematicFogV887({'));assert.equal((src.match(/fragmentShader=\{ATMOSPHERE_FRAGMENT_V887\}/g)||[]).length,2);assert(src.includes('v814-floor-haze'));assert(src.includes('v814-backstage-light-shafts'));assert.equal((src.match(/uFogWarpV887:\{value:0\}/g)||[]).length,2);});
check('3D stage honors blackout and manual lighting',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.includes('blackout:timelineCue.blackout>0'));assert(src.includes('manualLighting:manualLightingV763||authoredLightsV386'));});
check('UI exposes all new V887 switches and export',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');for(const name of ['V887 · Cinematic Fog','fogSettingsV887.motion','fogSettingsV887.floor','fogSettingsV887.shafts','exportFogV887','FOG_STORAGE_KEY_V887'])assert(src.includes(name));});
check('export only from verified scenes',()=>assert.equal(v887.exportFogPlanV887(null,S,'Deutschrap'),null));
check('export includes stable song, intervals and settings',()=>{const obj=JSON.parse(v887.exportFogPlanV887(plan,S,'Deutschrap'));assert.equal(obj.schema,'sonic-cinematic-fog-v887');assert.equal(obj.trackId,'song');assert.equal(obj.scenes.length,5);assert.equal(obj.settings.intensity,65);});
check('package version and CI gate v887',()=>{const pkg=JSON.parse(read('package.json'));const lock=JSON.parse(read('package-lock.json'));assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=887);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v887 && npm run test:v887:types && npm run test:v887:ui-types'));});
console.log(`V887 Cinematic Fog & Haze: ${count}/${count} Tests bestanden.`);

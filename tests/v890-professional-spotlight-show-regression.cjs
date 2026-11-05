'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const spot=load('components/visualizer/professionalSpotlightShowV890');
const v885=load('components/visualizer/dynamicConcertAtmosphereV885');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let checks=0;
function test(name,fn){try{fn();checks++;}catch(e){e.message=`V890 ${name}: ${e.message}`;throw e;}}
const S=spot.DEFAULT_SPOTLIGHT_V890;
const timeline={trackId:'track-1',durationMs:120000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:22000,section:'verse',intent:'portrait'},
 {index:1,startMs:22000,endMs:44000,section:'build',intent:'rise'},
 {index:2,startMs:44000,endMs:70000,section:'drop',intent:'pulse'},
 {index:3,startMs:70000,endMs:97000,section:'hook',intent:'wide'},
 {index:4,startMs:97000,endMs:120000,section:'finale',intent:'finale'},
]};
const plan=v885.buildAtmospherePlanV885({timeline,trackId:'track-1',durationMs:120000,genre:'Hardtekk',settings:v885.DEFAULT_ATMOSPHERE_V885});
const sample=(positionMs=50000,patch={})=>spot.planSpotlightV890({
 settings:S,plan,trackId:'track-1',durationMs:120000,positionMs,playing:true,autoEnabled:true,
 reducedMotion:false,tier:'high',stageSpots:true,beams:true,groupCount:2,genre:'Hardtekk',existingGain:1,...patch,
});
test('defaults',()=>assert.deepEqual(S,{enabled:true,style:'auto',mood:'auto',intensity:70,followArtists:true,protectLyrics:true,softTransitions:true}));
for(const invalid of [null,undefined,[],false,7,'hi',Infinity])test('default for '+String(invalid),()=>assert.deepEqual(spot.normalizeSpotlightV890(invalid),S));
test('full override',()=>assert.deepEqual(spot.normalizeSpotlightV890({enabled:false,style:'cross',mood:'arena',intensity:15,followArtists:false,protectLyrics:false,softTransitions:false}),{enabled:false,style:'cross',mood:'arena',intensity:15,followArtists:false,protectLyrics:false,softTransitions:false}));
for(const v of [NaN,Infinity,-Infinity,'75',null])test('invalid intensity '+String(v),()=>assert.equal(spot.normalizeSpotlightV890({intensity:v}).intensity,70));
test('low intensity clamp',()=>assert.equal(spot.normalizeSpotlightV890({intensity:-100}).intensity,0));
test('high intensity clamp',()=>assert.equal(spot.normalizeSpotlightV890({intensity:130}).intensity,100));
test('rounded intensity',()=>assert.equal(spot.normalizeSpotlightV890({intensity:76.9}).intensity,77));
test('unknown style rejected',()=>assert.equal(spot.normalizeSpotlightV890({style:'strobe'}).style,'auto'));
test('unknown mood rejected',()=>assert.equal(spot.normalizeSpotlightV890({mood:'laser'}).mood,'auto'));
for(const [g,expected] of [['Deutschrap','noir'],['Hip-Hop','noir'],['Rap','noir'],['Hardtekk','electric'],['Hardstyle','electric'],['Industrial metal','arena'],['Deutschrock','arena'],['Pop','dream'],['','dream']])test('genre '+g,()=>assert.equal(spot.spotlightMoodV890(g,'auto'),expected));
test('manually selected mood',()=>assert.equal(spot.spotlightMoodV890('Hardtekk','arena'),'arena'));
for(const [section,intent,genre,expected] of [['verse','wide','Deutschrap','follow'],['verse','portrait','Deutschrap','portrait'],['build','rise','Hardtekk','cross'],['hook','wide','Deutschrap','fan'],['drop','pulse','Deutschrap','cross'],['drop','pulse','Hardtekk','fan'],['finale','finale','Rock','fan'],['break','breath','Pop','portrait'],['intro','intro','Pop','portrait']])test('scene '+section+' '+genre,()=>assert.equal(spot.suggestedSpotlightV890(section,intent,genre),expected));
for(const [t,expect] of [[3000,'portrait'],[29000,'cross'],[52000,'fan'],[78000,'fan'],[105000,'fan']])test('active '+t,()=>{const c=sample(t);assert.equal(c.active,true);assert.equal(c.style,expect);});
test('song-scoped plan',()=>assert.equal(sample().sceneIndex,2));
test('only stage lighting caps',()=>{const c=sample();assert(c.leftGain<=1&&c.rightGain<=1&&c.beamGain<=1);assert(c.angle>=.22&&c.angle<=.41);assert(Math.abs(c.leftShift)<=.44&&Math.abs(c.rightShift)<=.44);});
test('fan wider than portrait',()=>assert(sample(60000).angle>sample(10000).angle));
test('artist follow intentionally bound',()=>{const c=sample(10000);assert.equal(c.follow,true);assert.equal(sample(10000,{settings:{...S,followArtists:false}}).follow,false);});
test('cross in 2 directions',()=>{const c=sample(28000);assert(c.leftShift>0);assert(c.rightShift<0);});
test('0 intensity disables',()=>assert.equal(sample(55000,{settings:{...S,intensity:0}}).active,false));
test('zero power never raises brightness',()=>{for(let t=0;t<120000;t+=123){const c=sample(t);assert(c.leftGain<=1&&c.rightGain<=1&&c.beamGain<=1);}});
test('low tier fully off',()=>assert.equal(sample(55000,{tier:'low'}).active,false));
test('balanced gentler',()=>{const a=sample(28000),b=sample(28000,{tier:'balanced'});assert(Math.abs(b.leftShift)<Math.abs(a.leftShift));});
test('end-of-scene taper',()=>{const near=sample(69990),middle=sample(62000);assert(Math.abs(near.angle-.30)<Math.abs(middle.angle-.30));});
for(const [name,patch] of [
 ['disabled',{settings:{...S,enabled:false}}],['global off',{autoEnabled:false}],['pause',{playing:false}],
 ['reduce motion',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],
 ['manual lighting',{manualLighting:true}],['manual FX',{manualFx:true}],['lyrics',{lyricsProtected:true}],
 ['both lights off',{stageSpots:false,beams:false}],['zero timeline gain',{existingGain:0}],
 ['bad group count',{groupCount:5}],['empty cast',{groupCount:0}],['mismatched song',{trackId:'other'}],
 ['mismatched duration',{durationMs:130000}],['no plan',{plan:null}],['unverified',{plan:{...plan,source:'unavailable'}}],
 ['unknown duration',{durationMs:NaN}],['unknown position',{positionMs:NaN}],['negative position',{positionMs:-1}],
 ['after song',{positionMs:120000}],['short song',{durationMs:9000}],['low performance',{tier:'low'}]
])test('protect '+name,()=>{const c=sample(50000,patch);assert.equal(c.active,false);assert.equal(c.leftGain,1);assert.equal(c.rightGain,1);assert.equal(c.angle,.30);});
test('lyric protection optout',()=>assert.equal(sample(55000,{lyricsProtected:true,settings:{...S,protectLyrics:false}}).active,true));
test('independent light/beam ability',()=>assert.equal(sample(55000,{stageSpots:false,beams:true}).active,true));
test('unverified gap returns off',()=>{const a={...plan,scenes:plan.scenes.filter(s=>s.index!==2)};assert.equal(sample(50000,{plan:a}).active,false);});
test('deterministic same frame',()=>assert.deepEqual(sample(),sample()));
test('no plan mutation',()=>{const before=JSON.stringify(plan);sample();assert.equal(JSON.stringify(plan),before);});
test('export verified',()=>{const str=spot.exportSpotlightPlanV890(plan,S,'Hardtekk'),v=JSON.parse(str);assert.equal(v.schema,'sonic-professional-spotlight-v890');assert.equal(v.scenes.length,5);assert.equal(v.scenes[2].style,'fan');});
test('export unverified off',()=>{assert.equal(spot.exportSpotlightPlanV890(null,S,'Pop'),null);assert.equal(spot.exportSpotlightPlanV890({...plan,source:'unavailable'},S,'Pop'),null);});
test('bridge preserves settings',()=>{bridge.publishConcertStageSyncV882({trackId:'track-1',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:44000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},spotlightSettingsV890:{...S,style:'cross'},atmospherePlan:plan});assert.equal(bridge.readConcertStageSyncV882().spotlightSettingsV890.style,'cross');bridge.publishConcertStageSyncV882(null);});
test('UI storage and exports',()=>{const ui=read('components/visualizer/LiveFxDeckV881.tsx');for(const k of ['SPOTLIGHT_STORAGE_KEY_V890','setSpotlightSettingsV890','spotlightReadyV890','exportSpotlightPlanV890','V890 · Professional Spotlight Show','Spotlight-Dramaturgie'])assert(ui.includes(k));});
test('renderer 3D integration',()=>{const s=read('components/visualizer/ConcertAtmosphereRendererV308.tsx');for(const k of ['planSpotlightV890({','spotlightV890.beamGain','spotlightV890.leftGain','spotlightV890.rightGain','spotlightV890.angle','spotlightV890.leftShift','spotlightV890.follow'])assert(s.includes(k));});
test('no new 3D spotlights',()=>{const s=read('components/visualizer/ConcertAtmosphereRendererV308.tsx');assert.equal((s.match(/<spotLight\b/g)||[]).length,2);});
test('never creates independent visual rig',()=>assert(!/new SpotLight|new WebGLRenderer|setInterval\(|strobe\s*[:=(]/i.test(read('components/visualizer/professionalSpotlightShowV890.ts'))));
test('project and lock versions',()=>{const a=JSON.parse(read('package.json')),b=JSON.parse(read('package-lock.json'));assert.match(a.version,/^0\.1\.0-v(?:890|891|892|893|894|895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(b.version,a.version);assert.equal(b.packages[''].version,a.version);});
test('CI and Windows',()=>{assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v890:ui-types'));assert(read('scripts/verify-v890-windows.ps1').includes('verify:v890:focused'));});
test('release note',()=>assert(read('docs/features/stage/PROFESSIONAL_SPOTLIGHT_SHOW_V890.md').includes('V890')));
console.log(`V890 Professional Spotlight Show: PASS ${checks} checks`);

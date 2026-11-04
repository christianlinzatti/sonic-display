'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v888=load('components/visualizer/laserShowDirectorV888');
const v885=load('components/visualizer/dynamicConcertAtmosphereV885');
const v882=load('components/visualizer/concertStageSyncV882');
const {LASER_SHOW_FRAGMENT_V888:shader}=load('components/visualizer/laserShowShaderV888');
const {LASER_MATRIX_FRAGMENT_V811:oldShader}=load('components/visualizer/laserMatrixShaderV811');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let n=0;function check(name,fn){try{fn();n++}catch(e){e.message=`V888 ${name}: ${e.message}`;throw e;}}
const S=v888.DEFAULT_LASER_SHOW_V888;
const timeline={trackId:'song',durationMs:120000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:25000,section:'verse',intent:'portrait'},
 {index:1,startMs:25000,endMs:45000,section:'build',intent:'rise'},
 {index:2,startMs:45000,endMs:70000,section:'drop',intent:'pulse'},
 {index:3,startMs:70000,endMs:95000,section:'hook',intent:'wide'},
 {index:4,startMs:95000,endMs:120000,section:'outro',intent:'breath'},
]};
const plan=v885.buildAtmospherePlanV885({timeline,trackId:'song',durationMs:120000,genre:'Hardtekk',settings:v885.DEFAULT_ATMOSPHERE_V885});
const sample=(t=50000,extra={})=>v888.planLaserShowV888({settings:S,plan,trackId:'song',durationMs:120000,
 positionMs:t,playing:true,autoEnabled:true,reducedMotion:false,tier:'high',budget:1,
 performanceGain:1,existingLaserOpacity:.12,laserEnabled:true,...extra});
check('default settings',()=>assert.deepEqual(S,{enabled:true,pattern:'auto',motion:'cinematic',intensity:70,protectLyrics:true,useScenePalette:true}));
for(const x of [undefined,null,0,'abc',[],{},false])check(`normalize invalid ${String(x)}`,()=>assert.deepEqual(v888.normalizeLaserShowV888(x),S));
check('legit settings',()=>assert.deepEqual(v888.normalizeLaserShowV888({enabled:false,pattern:'prism',motion:'calm',intensity:44,protectLyrics:false,useScenePalette:false}),
 {enabled:false,pattern:'prism',motion:'calm',intensity:44,protectLyrics:false,useScenePalette:false}));
for(const x of [NaN,Infinity,-Infinity,'87'])check(`invalid intensity ${x}`,()=>assert.equal(v888.normalizeLaserShowV888({intensity:x}).intensity,70));
check('intensity clipped',()=>{assert.equal(v888.normalizeLaserShowV888({intensity:-4}).intensity,0);assert.equal(v888.normalizeLaserShowV888({intensity:999}).intensity,100);});
check('bad modes fail closed',()=>{assert.equal(v888.normalizeLaserShowV888({pattern:'flash'}).pattern,'auto');assert.equal(v888.normalizeLaserShowV888({motion:'strobe'}).motion,'cinematic');});
check('V885 source is verified',()=>assert.equal(plan.source,'verified-v604'));
for(const [section,expect] of [['verse','fan'],['build','cross'],['drop','tunnel'],['hook','prism'],['break','fan'],['outro','fan']]){
 check(`section ${section}`,()=>assert.equal(v888.chooseLaserPatternV888(section,'wide'),expect));
}
for(const [time,pattern,mode] of [[0,'fan',1],[24999,'fan',1],[25000,'cross',3],[44999,'cross',3],[45000,'tunnel',2],[69999,'tunnel',2],[70000,'prism',4],[95000,'fan',1],[119999,'fan',1]]){
 check(`cue ${time}`,()=>{const c=sample(time);assert.equal(c.active,true);assert.equal(c.pattern,pattern);assert.equal(c.mode,mode);});
}
check('drop more pronounced than verse',()=>assert(sample(50000).power>sample(5000).power));
check('outro deliberately calmer',()=>assert(sample(110000).power<sample(50000).power));
check('gradual build',()=>assert(sample(35000).power<sample(50000).power));
check('bounds enforced',()=>{const c=sample();assert(c.power>0&&c.power<=.9);assert(c.spread>=1&&c.spread<=1.4);assert(c.motion>=0&&c.motion<=.72);});
check('deterministic position-driven phase',()=>assert.equal(sample(50000).phase,50));
check('palette uses verified scene',()=>assert.equal(sample(50000).primary,plan.scenes[2].primary));
check('palette can be disabled',()=>assert.equal(sample(50000,{settings:{...S,useScenePalette:false}}).primary,'#35b5d8'));
check('override any section without inventing a drop',()=>{const c=sample(5000,{settings:{...S,pattern:'tunnel'}});assert.equal(c.pattern,'tunnel');assert(c.power<sample(50000).power);});
check('calm motion',()=>assert(sample(50000,{settings:{...S,motion:'calm'}}).motion<sample().motion));
check('festival motion',()=>assert(sample(50000,{settings:{...S,motion:'festival'}}).motion>sample().motion));
check('balanced tier reduces power',()=>assert(sample(50000,{tier:'balanced'}).power<sample().power));
check('performance gain lowers power',()=>assert(sample(50000,{performanceGain:.25}).power<sample().power));
check('budget lowers power',()=>assert(sample(50000,{budget:.3}).power<sample().power));
const guards=[['feature disabled',{settings:{...S,enabled:false}}],['intensity zero',{settings:{...S,intensity:0}}],['pause',{playing:false}],['auto disabled',{autoEnabled:false}],['reduced motion',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],['manual light',{manualLighting:true}],['manual laser',{manualLaser:true}],['manual FX',{manualFx:true}],['lyrics focus',{lyricsProtected:true}],['low tier',{tier:'low'}],['no budget',{budget:0}],['no performance',{performanceGain:0}],['no underlying laser',{existingLaserOpacity:0}],['lasers off',{laserEnabled:false}],['bad time',{positionMs:NaN}],['negative time',{positionMs:-100}],['end position',{positionMs:120000}],['bad duration',{durationMs:Infinity}],['mismatched duration',{durationMs:130000}],['song mismatch',{trackId:'different'}],['unverified plan',{plan:{...plan,source:'unavailable'}}],['missing plan',{plan:null}]];
for(const [name,patch] of guards)check(`guard ${name}`,()=>{const c=sample(50000,patch);assert.equal(c.active,false);assert.equal(c.power,0);assert.equal(c.mode,0);});
check('lyrics protection can be overridden',()=>assert(sample(50000,{lyricsProtected:true,settings:{...S,protectLyrics:false}}).active));
check('invalid negative intensity forbidden',()=>assert.equal(sample(50000,{settings:{...S,intensity:-10}}).active,false));
check('very large intensity forbidden',()=>assert.equal(sample(50000,{settings:{...S,intensity:1000}}).active,false));
check('no physical laser services in shader',()=>{assert(!/fetch\s*\(|navigator|websocket|createElement|setInterval|setTimeout/i.test(shader));});
for(const uniform of ['uLaser88Power','uLaser88Mode','uLaser88Phase','uLaser88Motion','uLaser88Spread'])check(`new uniform ${uniform}`,()=>assert(shader.includes('uniform float '+uniform)));
check('old V811 uniforms retained',()=>{for(const u of ['uOpacity','uFanSpread','uFanMotion','uRibbons','uLaserOn'])assert(shader.includes('uniform float '+u));});
check('legacy V811 alpha ceiling retained',()=>assert(shader.includes('float alpha=clamp((style+ribbon*.45)*wings*vertical*uOpacity,0.0,.14);')));
check('old V811 exported source unchanged',()=>assert(!oldShader.includes('uLaser88Power')));
check('shader new patterns bounded',()=>{for(const x of ['fan88','tunnel88','crossing88','prism88'])assert(shader.includes(x));assert(shader.includes('uLaser88Power>0.001'));assert(shader.includes('clamp(uLaser88Power,0.0,.90)'));});
check('one laser mesh only',()=>assert.equal((read('components/visualizer/DynamicStage.tsx').match(/name="v811-laser-matrix"/g)||[]).length,1));
check('stage integrates shader',()=>assert(read('components/visualizer/DynamicStage.tsx').includes('fragmentShader={LASER_SHOW_FRAGMENT_V888}')));
check('stage uses on-frame safety guards',()=>{const t=read('components/visualizer/DynamicStage.tsx');for(const x of ['manualLaser:authoredFxV823','seekBlocked:playback.positionMs','laserEnabled:concertFxV810?.lasers','plan:liveSignalV882.atmospherePlan','existingLaserOpacity:fxCueV810.laserOpacity'])assert(t.includes(x));});
check('single shader uniform initialization',()=>{const t=read('components/visualizer/DynamicStage.tsx');for(const u of ['uLaser88Power:{value:0}','uLaser88Mode:{value:0}','uLaser88Phase:{value:0}','uLaser88Motion:{value:0}','uLaser88Spread:{value:1}'])assert(t.includes(u));});
check('UI settings load and persist',()=>{const t=read('components/visualizer/LiveFxDeckV881.tsx');assert(t.includes('window.localStorage.getItem(LASER_SHOW_KEY_V888)'));assert(t.includes('window.localStorage.setItem(LASER_SHOW_KEY_V888'));});
check('UI controls and reset protection',()=>{const t=read('components/visualizer/LiveFxDeckV881.tsx');assert(t.includes('V888 · Laser Show Director'));assert(t.includes('exportLaserShowV888'));assert(t.includes('laserSettingsV888:normalizeLaserShowV888'));assert(t.includes('laserReadyV888'));});
check('bridge rejects settings outside valid keys',()=>{v882.publishConcertStageSyncV882({trackId:'song',durationMs:120000,playing:true,enabled:true,reducedMotion:false,intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:0,manual:null,manualId:0,manualStartMs:-1,sync:v882.DEFAULT_CONCERT_SYNC_V882,laserSettingsV888:{...S,pattern:'bad',intensity:Infinity}}); const s=v882.readConcertStageSyncV882();assert.equal(s.laserSettingsV888.pattern,'auto');assert.equal(s.laserSettingsV888.intensity,70);v882.publishConcertStageSyncV882(null);});
check('bridge snapshots update when laser options change',()=>{
 const base={trackId:'song',durationMs:120000,playing:true,enabled:true,reducedMotion:false,intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:0,manual:null,manualId:0,manualStartMs:-1,sync:v882.DEFAULT_CONCERT_SYNC_V882};
 let calls=0;const unsub=v882.subscribeConcertStageSyncV882(()=>{calls++});
 v882.publishConcertStageSyncV882({...base,laserSettingsV888:{...S,pattern:'fan'}});
 v882.publishConcertStageSyncV882({...base,laserSettingsV888:{...S,pattern:'cross'}});
 assert.equal(v882.readConcertStageSyncV882().laserSettingsV888.pattern,'cross');assert(calls>=2);
 unsub();v882.publishConcertStageSyncV882(null);
});
check('valid show plan export',()=>{const s=v888.exportLaserShowV888(plan,S);assert(s);const j=JSON.parse(s);assert.equal(j.schema,'sonic-laser-show-v888');assert.equal(j.scenes[2].pattern,'tunnel');assert.equal(j.trackId,'song');});
check('export refuses missing evidence',()=>{assert.equal(v888.exportLaserShowV888(null,S),null);assert.equal(v888.exportLaserShowV888({...plan,source:'unavailable'},S),null);});
check('all exported patterns have finite time ranges',()=>{const j=JSON.parse(v888.exportLaserShowV888(plan,S));for(const s of j.scenes){assert(s.startMs<s.endMs);assert(['fan','tunnel','cross','prism'].includes(s.pattern));}});
check('package and lock align',()=>{const p=JSON.parse(read('package.json'));const lock=JSON.parse(read('package-lock.json'));assert(/^0\.1\.0-v\d+$/.test(p.version)&&Number(p.version.split('-v')[1])>=888);assert.equal(lock.version,p.version);assert.equal(lock.packages[''].version,p.version);});
check('CI runs new gates',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v888:ui-types')));
check('Windows release script exists',()=>assert(read('scripts/verify-v888-windows.ps1').includes('verify:v888:focused')));
check('docs describe safety',()=>assert(read('LASER_SHOW_DIRECTOR_V888.md').includes('V888')));
console.log(`V888 Laser Show Director: PASS ${n} checks`);

'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v885=load('components/visualizer/dynamicConcertAtmosphereV885');
const v882=load('components/visualizer/concertStageSyncV882');
const {DEFAULT_ATMOSPHERE_V885:defaults,normalizeAtmosphereV885:normalize,
 resolveAtmospherePaletteV885:resolve,buildAtmospherePlanV885:build,
 sampleAtmosphereV885:sample,exportAtmospherePlanV885:exportPlan,OFF_ATMOSPHERE_V885:off,
 previewAtmospherePaletteV885:preview}=v885;
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=`V885 ${name}: ${e.message}`;throw e;}}
const scenes=[
 {index:0,startMs:0,endMs:30000,section:'verse',intent:'wide'},
 {index:1,startMs:30000,endMs:53000,section:'build',intent:'rise'},
 {index:2,startMs:53000,endMs:76000,section:'drop',intent:'pulse'},
 {index:3,startMs:76000,endMs:103000,section:'hook',intent:'wide'},
 {index:4,startMs:103000,endMs:120000,section:'outro',intent:'breath'},
];
const timeline={trackId:'song',durationMs:120000,source:'verified-v604',scenes};
const base={timeline,trackId:'song',durationMs:120000,genre:'Deutschrap',settings:defaults};
const plan=build(base);
const at=(positionMs,extra={})=>sample({plan,settings:defaults,trackId:'song',durationMs:120000,
 positionMs,playing:true,reducedMotion:false,autoEnabled:true,tier:'high',...extra});
check('default settings are conservative',()=>assert.deepEqual(defaults,{enabled:true,palette:'auto',pace:'cinematic',intensity:55,lights:true,environment:true,haze:true,overlay:true}));
check('invalid payloads fall back',()=>{for(const raw of [null,undefined,[],true,'no',0,{}])assert.deepEqual(normalize(raw),defaults);});
check('user switches and custom preset survive parsing',()=>assert.deepEqual(normalize({enabled:false,palette:'electric',pace:'festival',intensity:25,lights:false,environment:false,haze:false,overlay:false}),
 {enabled:false,palette:'electric',pace:'festival',intensity:25,lights:false,environment:false,haze:false,overlay:false}));
check('intensity clamped, rounded and invalid rejected',()=>{assert.equal(normalize({intensity:111}).intensity,100);assert.equal(normalize({intensity:-4}).intensity,0);
 assert.equal(normalize({intensity:34.6}).intensity,35);assert.equal(normalize({intensity:Infinity}).intensity,55);});
check('unknown schemes fall back, never HTML injection',()=>{assert.equal(normalize({palette:'<svg>'}).palette,'auto');assert.equal(normalize({pace:'strobe'}).pace,'cinematic');});
check('palette preview offers colors even without valid timeline',()=>{
 const chips=preview('electric');assert.match(chips.primary,/^#[0-9a-f]{6}$/);
 assert.notEqual(chips.primary,chips.secondary);assert.notEqual(preview('noir').primary,chips.primary);
});
check('genre routing Deutschrap',()=>assert.equal(resolve('auto','Deutschrap'),'noir'));
check('genre routing Hardtekk',()=>assert.equal(resolve('auto','Hardtekk'),'electric'));
check('genre routing Deutschrock',()=>assert.equal(resolve('auto','Deutschrock'),'arena'));
check('genre routing Pop',()=>assert.equal(resolve('auto','Pop'),'dream'));
check('manual palette overrides genre',()=>assert.equal(resolve('dream','Hardtekk'),'dream'));
check('live deck genre override respected',()=>assert.equal(resolve('auto','Pop','rap'),'noir'));
check('verified plan built and song scoped',()=>{assert.equal(plan.source,'verified-v604');assert.equal(plan.trackId,'song');assert.equal(plan.palette,'noir');assert.equal(plan.scenes.length,5);});
check('scene indices and time ranges unchanged',()=>assert.deepEqual(plan.scenes.map(s=>[s.index,s.startMs,s.endMs]),scenes.map(s=>[s.index,s.startMs,s.endMs])));
check('calm scenes have smaller strength than drops',()=>assert(plan.scenes[4].strength<plan.scenes[2].strength));
check('palette changes between sections',()=>assert.notEqual(plan.scenes[0].primary,plan.scenes[2].primary));
check('all colors valid hex',()=>{for(const s of plan.scenes)for(const k of ['primary','secondary','ambient'])assert.match(s[k],/^#[0-9a-f]{6}$/);});
check('no invented plan from missing timeline',()=>assert.equal(build({...base,timeline:null}).scenes.length,0));
check('no invented plan from unverified source',()=>assert.equal(build({...base,timeline:{...timeline,source:'unavailable'}}).source,'unavailable'));
check('invalid track mismatch off',()=>assert.equal(build({...base,trackId:'other'}).source,'unavailable'));
check('invalid duration mismatch off',()=>assert.equal(build({...base,durationMs:129000}).source,'unavailable'));
check('overlapping verified scenes fail closed',()=>assert.equal(build({...base,timeline:{...timeline,scenes:scenes.map((s,i)=>i===2?{...s,startMs:50000}:s)}}).source,'unavailable'));
check('nonfinite scene bounds fail closed',()=>assert.equal(build({...base,timeline:{...timeline,scenes:scenes.map((s,i)=>i===1?{...s,endMs:NaN}:s)}}).source,'unavailable'));
check('gap does not blend disconnected scenes',()=>{
 const withGap={...timeline,scenes:[{...scenes[0],endMs:29000},...scenes.slice(1)]};
 const g=build({...base,timeline:withGap});assert.equal(g.scenes[1].fadeMs,0);
 assert.deepEqual(sample({...{plan:g,settings:defaults,trackId:'song',durationMs:120000,playing:true,reducedMotion:false,autoEnabled:true},positionMs:29500}),off);
});
check('normal cinematic seam lasts 3 seconds',()=>assert.equal(plan.scenes[1].fadeMs,3000));
check('gentle seam longer, festival quicker',()=>{
 const gentle=build({...base,settings:{...defaults,pace:'gentle'}}),festival=build({...base,settings:{...defaults,pace:'festival'}});
 assert.equal(gentle.scenes[1].fadeMs,4800);assert.equal(festival.scenes[1].fadeMs,1600);
});
check('first scene never fades from imaginary previous',()=>assert.equal(plan.scenes[0].fadeMs,0));
check('first sample is fully blended within first scene',()=>assert.equal(at(0).blend,1));
check('crossfade moves smoothly from previous palette',()=>{
 const start=at(30000),mid=at(31500),end=at(33000);
 assert.equal(start.blend,0);assert(mid.blend>.45&&mid.blend<.55);assert.equal(end.blend,1);
 assert.equal(start.primary,plan.scenes[0].primary);assert.equal(end.primary,plan.scenes[1].primary);
});
check('binary-search sampler handles final scene edge exactly',()=>{
 assert.equal(at(119999).sceneIndex,4);assert.deepEqual(at(120000),off);
});
check('continuous bounded swatches during crossfade',()=>{
 for(let i=30000;i<=33000;i+=127){const c=at(i);assert.match(c.primary,/^#[a-f0-9]{6}$/);assert(c.blend>=0&&c.blend<=1);}
});
check('peak accents more colorful than quiet passage',()=>assert(at(54000).overlayOpacity>at(107000).overlayOpacity));
check('tint and haze have strict ceilings and no flash',()=>{
 for(let t=0;t<120000;t+=97){const c=at(t);assert(c.lightsMix>=0&&c.lightsMix<=.16);
 assert(c.environmentMix>=0&&c.environmentMix<=.12);assert(c.hazeOpacity<=.065);assert(c.overlayOpacity<=.14);}
});
check('all channels separately switchable',()=>{
 for(const [setting,field] of [['lights','lightsMix'],['environment','environmentMix'],['haze','hazeOpacity'],['overlay','overlayOpacity']]){
  const q=at(54000,{settings:{...defaults,[setting]:false}});assert.equal(q[field],0);
 }
});
check('all channels off yields inactive',()=>assert.equal(at(54000,{settings:{...defaults,lights:false,environment:false,haze:false,overlay:false}}).active,false));
check('paused off',()=>assert.deepEqual(at(54000,{playing:false}),off));
check('reduced-motion off',()=>assert.deepEqual(at(54000,{reducedMotion:true}),off));
check('master automation off',()=>assert.deepEqual(at(54000,{autoEnabled:false}),off));
check('V885 disabled off',()=>assert.deepEqual(at(54000,{settings:{...defaults,enabled:false}}),off));
check('intensity zero off',()=>assert.deepEqual(at(54000,{settings:{...defaults,intensity:0}}),off));
check('seek guard off',()=>assert.deepEqual(at(54000,{seekBlocked:true}),off));
check('blackout off',()=>assert.deepEqual(at(54000,{blackout:true}),off));
check('manual show effect temporarily wins',()=>assert.deepEqual(at(54000,{manualFx:true}),off));
check('low GPU tier off',()=>assert.deepEqual(at(54000,{tier:'low'}),off));
check('manual lighting bypasses all 3D palette changes',()=>{
 const q=at(54000,{manualLighting:true});assert.equal(q.lightsMix,0);assert.equal(q.environmentMix,0);assert.equal(q.hazeOpacity,0);
});
check('lyrics focus prevents 2D overlay, haze and color',()=>{
 const q=at(54000,{lyricsProtected:true});assert.equal(q.overlayOpacity,0);assert.equal(q.hazeOpacity,0);
 assert.equal(q.lightsMix,0);assert.equal(q.environmentMix,0);
});
check('mismatched song, duration and invalid clock off',()=>{
 for(const x of [{trackId:'other'},{durationMs:120001},{positionMs:NaN},{positionMs:Infinity},{positionMs:-2},{positionMs:120000}])
 assert.deepEqual(at(54000,x),off);
});
check('stale plan cannot run on other song',()=>assert.deepEqual(at(54000,{plan:{...plan,trackId:'old'}}),off));
check('no effect in genuine timeline gap',()=>{
 const t={...timeline,scenes:[{...scenes[0],endMs:29500},...scenes.slice(1)]};
 const p=build({...base,timeline:t});assert.deepEqual(at(29800,{plan:p}),off);
});
check('display label follows verified section',()=>assert.match(at(54000).label,/drop/));
check('JSON exported with verified source and no made up detections',()=>{
 const data=JSON.parse(exportPlan(plan,defaults));assert.equal(data.schema,'sonic-dynamic-concert-atmosphere-v885');
 assert.equal(data.source,'verified-v604');assert.equal(data.scenes.length,5);assert(!('beats' in data));
});
check('unverified exports disabled',()=>assert.equal(exportPlan(build({...base,timeline:null}),defaults),null));
const signal={trackId:'song',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:.6,
 sceneSource:'verified',section:'drop',sceneStartMs:53000,look:'neon',manual:null,manualId:0,manualStartMs:-1,
 sync:{stage:true,lights:true,dance:true},atmospherePlan:plan,atmosphereSettings:defaults};
check('real V882 signal carries the valid V885 plan',()=>{
 v882.publishConcertStageSyncV882(signal);assert.equal(v882.readConcertStageSyncV882().atmospherePlan,plan);
});
check('real V882 signal rejects stale V885 plan',()=>{
 v882.publishConcertStageSyncV882({...signal,atmospherePlan:{...plan,trackId:'other'}});
 assert.equal(v882.readConcertStageSyncV882().atmospherePlan,null);
});
check('real V882 signal cancels atmosphere when paused',()=>{
 v882.publishConcertStageSyncV882({...signal,playing:false});assert.equal(v882.readConcertStageSyncV882().atmospherePlan,null);
});
check('real V882 signal snapshot stable across identical input',()=>{
 v882.publishConcertStageSyncV882(signal);const snapshot=v882.readConcertStageSyncV882();
 v882.publishConcertStageSyncV882(signal);assert.equal(v882.readConcertStageSyncV882(),snapshot);
});
check('real V882 signal exposes atmosphere seek guard',()=>{
 v882.publishConcertStageSyncV882({...signal,atmosphereSeekBlockedUntilMs:60000});
 assert.equal(v882.readConcertStageSyncV882().atmosphereSeekBlockedUntilMs,60000);
});
check('real V882 signal blocks stale track/duration',()=>{
 v882.publishConcertStageSyncV882({...signal,trackId:'a',atmospherePlan:plan});
 assert.equal(v882.readConcertStageSyncV882().atmospherePlan,null);
});
check('3D stage consumes same signal, no parallel light rig',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.includes('sampleAtmosphereV885({'));assert(src.includes('targetPrimary.current.lerp(atmospherePrimaryV885.current'));
 assert(src.includes('backgroundTargetV622.current.lerp(atmosphereAmbientV885.current'));
 assert(src.includes('manualLighting:manualLightingV763||authoredLightsV386'));
});
check('real UI has controls, persisted settings and visual overlay',()=>{
 const src=fs.readFileSync('components/visualizer/LiveFxDeckV881.tsx','utf8');
 for(const fragment of ['ATMOSPHERE_STORAGE_KEY_V885','buildAtmospherePlanV885','exportAtmospherePlanV885',
  'concert-atmosphere-wash-v885','concert-atmosphere-haze-v885','Atmosphären-Regie aktiv','Atmosphärenplan als JSON exportieren'])assert(src.includes(fragment));
});
check('real overlay uses safe CSS, not a flash animation',()=>{
 const css=fs.readFileSync('app/globals.css','utf8');
 assert(css.includes('.concert-atmosphere-wash-v885'));assert(css.includes('pointer-events:none'));
 assert(css.includes('.concert-atmosphere-haze-v885'));assert(!css.includes('@keyframes v885-flash'));
});
v882.publishConcertStageSyncV882(null);
console.log(`V885 Dynamic Concert Atmosphere: ${checks}/${checks} Prüfungen bestanden.`);

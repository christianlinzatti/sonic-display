'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v889=load('components/visualizer/advancedParticleDirectorV889');
const v885=load('components/visualizer/dynamicConcertAtmosphereV885');
const v882=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=`V889 ${label}: ${e.message}`;throw e;}}
const S=v889.DEFAULT_PARTICLE_V889;
const timeline={trackId:'track-1',durationMs:120000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:25000,section:'verse',intent:'portrait'},
 {index:1,startMs:25000,endMs:45000,section:'build',intent:'rise'},
 {index:2,startMs:45000,endMs:70000,section:'drop',intent:'pulse'},
 {index:3,startMs:70000,endMs:95000,section:'hook',intent:'wide'},
 {index:4,startMs:95000,endMs:120000,section:'finale',intent:'finale'},
]};
const plan=v885.buildAtmospherePlanV885({timeline,trackId:'track-1',durationMs:120000,genre:'Hardtekk',settings:v885.DEFAULT_ATMOSPHERE_V885});
const source={
 particles:{active:true,sparks:22,shards:18,confetti:48,rings:3,sparkOpacity:.28,shardOpacity:.28,confettiOpacity:.42,ringOpacity:.15,phase:48,beat:.7},
 foam:{active:true,bubbles:96,mist:100,opacity:.45,phase:48,power:.6,side:'both',color:'#f1fcff',experienceV843:{active:true,style:'festival',arc:.8,flutter:.3,settle:.4,burst:.5}},
 bubbles:{active:true,count:38,opacity:.2,phase:48,riseSpeed:1.25},
 streamers:{active:true,count:40,opacity:.28,phase:48,fallSpeed:1.2,spread:1,curl:1.2},
 festival:{active:true,moment:'confetti',co2Count:0,co2Opacity:0,sparkGain:.2,confettiGain:.22,strobeGain:0,phase:48},
 finale:{active:true,moment:'metallic-rain',rainCount:50,wheelCount:0,rainOpacity:.32,wheelOpacity:0,phase:48,fallSpeed:1,wheelSpeed:0,palette:'gold'},
};
const sample=(positionMs=50000,extra={})=>v889.directParticlesV889({settings:S,plan,trackId:'track-1',durationMs:120000,positionMs,
 genre:'Hardtekk',playing:true,autoEnabled:true,reducedMotion:false,tier:'high',groupCount:2,...source,...extra});
const channels=['particles','foam','bubbles','streamers','festival','finale'];
check('defaults',()=>assert.deepEqual(S,{enabled:true,mode:'cinematic',mood:'auto',focus:'auto',intensity:75,protectLyrics:true,bubbles:true,foam:true,streamers:true,confetti:true}));
for(const v of [undefined,null,'',false,5,[],{},Infinity])check('invalid defaults '+String(v),()=>assert.deepEqual(v889.normalizeParticleV889(v),S));
check('settings full override',()=>assert.deepEqual(v889.normalizeParticleV889({enabled:false,mode:'festival',mood:'arena',focus:'streamers',intensity:40,protectLyrics:false,bubbles:false,foam:false,streamers:false,confetti:false}),{enabled:false,mode:'festival',mood:'arena',focus:'streamers',intensity:40,protectLyrics:false,bubbles:false,foam:false,streamers:false,confetti:false}));
for(const v of [NaN,Infinity,-Infinity,'75',null])check('invalid intensity '+v,()=>assert.equal(v889.normalizeParticleV889({intensity:v}).intensity,75));
check('intensity below 0',()=>assert.equal(v889.normalizeParticleV889({intensity:-5}).intensity,0));
check('intensity above 100',()=>assert.equal(v889.normalizeParticleV889({intensity:500}).intensity,100));
check('rounded intensity',()=>assert.equal(v889.normalizeParticleV889({intensity:49.8}).intensity,50));
check('injected focus rejected',()=>assert.equal(v889.normalizeParticleV889({focus:'<svg>'}).focus,'auto'));
check('fake flashing mode rejected',()=>assert.equal(v889.normalizeParticleV889({mode:'strobe'}).mode,'cinematic'));
for(const [name,expect] of [['Deutschrap','noir'],['Rap','noir'],['Hardtekk','electric'],['Hardstyle','electric'],['Industrial Metal','arena'],['Deutschrock','arena'],['Pop','dream'],['','dream']])check('genre '+name,()=>assert.equal(v889.selectParticleMoodV889(name),expect));
check('user mood wins',()=>assert.equal(v889.selectParticleMoodV889('Hardtekk','dream'),'dream'));
for(const [sec,genre,hero] of [['verse','Hardtekk','bubbles'],['build','Hardtekk','foam'],['drop','Hardtekk','foam'],['hook','Hardtekk','streamers'],['finale','Hardtekk','confetti'],['intro','Pop','bubbles'],['drop','Pop','confetti'],['hook','Pop','bubbles'],['hook','Deutschrock','confetti'],['outro','Pop','confetti'],['unknown','Pop','none']])check('song focus '+sec+' '+genre,()=>assert.equal(v889.suggestedParticleHeroV889(sec,genre,S),hero));
check('focus override is a priority not a trigger',()=>assert.equal(v889.suggestedParticleHeroV889('verse','Hardtekk',{...S,focus:'foam'}),'foam'));
for(const [sec,t] of [['verse',5000],['build',30000],['drop',50000],['hook',80000],['finale',100000]])check('matching confirmed scene '+sec,()=>{const r=sample(t);assert.equal(r.section,sec);assert.equal(r.reason,'mixed');assert.notEqual(r.hero,'none');});
check('hardtekk drop chooses foam',()=>assert.equal(sample().hero,'foam'));
check('hardtekk finale chooses confetti',()=>assert.equal(sample(103000).hero,'confetti'));
check('balanced mode not more than original',()=>assert(sample(50000,{settings:{...S,mode:'balanced'}}).foam.opacity<=source.foam.opacity));
check('festival mode has more secondary particles than cinematic',()=>assert(sample(50000,{settings:{...S,mode:'festival'}}).bubbles.count>=sample().bubbles.count));
check('manual desired effect never revives inactive source',()=>{const r=sample(50000,{settings:{...S,focus:'foam'},foam:{...source.foam,active:false}});assert.notEqual(r.hero,'foam');assert.equal(r.foam.active,false);});
check('one inactive option does not mutate its channel',()=>{const r=sample(50000,{settings:{...S,bubbles:false,foam:false}});assert.strictEqual(r.bubbles,source.bubbles);assert.strictEqual(r.foam,source.foam);});
check('manual foam lane is identical',()=>assert.strictEqual(sample(50000,{authoredLanes:['foam']}).foam,source.foam));
check('manual particles lane is identical across all particle types',()=>{const r=sample(50000,{authoredLanes:['particles']});for(const ch of ['particles','bubbles','streamers','festival','finale'])assert.strictEqual(r[ch],source[ch]);});
check('both lanes authored = untouched',()=>{const r=sample(50000,{authoredLanes:['particles','foam']});assert.equal(r.reason,'no-particles');for(const ch of channels)assert.strictEqual(r[ch],source[ch]);});
check('strobe unaffected (never enabled)',()=>assert.equal(sample().festival.strobeGain,source.festival.strobeGain));
check('existing sparks/shards unchanged',()=>{const r=sample();assert.equal(r.particles.sparks,source.particles.sparks);assert.equal(r.particles.shards,source.particles.shards);});
check('existing manual CO2 unchanged',()=>{const r=sample();assert.equal(r.festival.co2Count,source.festival.co2Count);assert.equal(r.festival.co2Opacity,source.festival.co2Opacity);});
check('foam stays in same stage wing',()=>assert.equal(sample().foam.side,source.foam.side));
check('no new hardware',()=>assert.equal(sample().foam.color,source.foam.color));
check('bubble rising motion gently changed',()=>assert(sample().bubbles.riseSpeed<=source.bubbles.riseSpeed));
check('streamer curl remains under original',()=>assert(sample().streamers.curl<=source.streamers.curl));
check('foam pose never becomes stronger',()=>{const a=sample().foam.experienceV843,b=source.foam.experienceV843;assert(a.arc<=b.arc);assert(a.flutter<=b.flutter);});
for(const [label,patch] of [
 ['disabled',{settings:{...S,enabled:false}}],['master off',{autoEnabled:false}],['0 intensity',{settings:{...S,intensity:0}}],
 ['paused',{playing:false}],['reduced motion',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],
 ['manual lighting',{manualLighting:true}],['manual FX',{manualFx:true}],['low quality',{tier:'low'}],
 ['lyrics guard',{lyricsProtected:true}],['no valid group',{groupCount:0}],['five avatars',{groupCount:5}],
 ['song mismatch',{trackId:'other'}],['duration mismatch',{durationMs:121000}],['no plan',{plan:null}],
 ['unverified plan',{plan:{...plan,source:'unavailable'}}],['missing position',{positionMs:NaN}],
 ['infinite time',{positionMs:Infinity}],['negative position',{positionMs:-1}],['after song',{positionMs:120000}],
 ['no duration',{durationMs:0}]
])check('guard '+label,()=>{const r=sample(50000,patch);assert.notEqual(r.reason,'mixed');for(const ch of channels)assert.strictEqual(r[ch],source[ch]);});
check('lyrics protection opt-out still dims',()=>assert.equal(sample(50000,{lyricsProtected:true,settings:{...S,protectLyrics:false}}).reason,'mixed'));
check('vocal focus reduces more',()=>assert(sample(50000,{vocalFocus:true}).streamers.count<=sample().streamers.count));
check('large cast reduces more',()=>assert(sample(50000,{groupCount:4}).streamers.count<=sample().streamers.count));
check('balanced tier reduces density',()=>assert(sample(50000,{tier:'balanced'}).streamers.count<=sample().streamers.count));
check('no visible particles never creates new ones',()=>{const i=Object.fromEntries(channels.map(c=>[c,{...source[c],active:false}]));const r=sample(50000,i);assert.equal(r.reason,'no-particles');for(const ch of channels)assert.strictEqual(r[ch],i[ch]);});
check('no new green light/laser or flashes',()=>assert(!/fetch\(|websocket|strobe\s*:\s*true|new InstancedMesh|setInterval\(/.test(read('components/visualizer/advancedParticleDirectorV889.ts'))));
check('deterministic at same timestamp',()=>assert.deepEqual(sample(50000),sample(50000)));
check('seek repeat yields same state',()=>assert.deepEqual(sample(52000),sample(52000)));
check('not destructive',()=>{sample();assert.equal(source.foam.opacity,.45);assert.equal(source.bubbles.count,38);});
check('no brightness, density or power increase on dense song sample',()=>{
 for(let t=0;t<120000;t+=225){const r=sample(t);for(const [field,base] of [['count','bubbles'],['count','streamers']])assert(r[base][field]<=source[base][field]);
  for(const [channel,fields] of Object.entries({particles:['confetti','confettiOpacity'],foam:['bubbles','mist','power','opacity'],festival:['confettiGain'],finale:['rainCount','rainOpacity']}))for(const field of fields)assert(r[channel][field]<=source[channel][field],`${channel}.${field} at ${t}`);
 }
});
check('gaps never generate effects',()=>{const badPlan={...plan,scenes:[plan.scenes[0],...plan.scenes.slice(2)]};const r=sample(32000,{plan:badPlan});assert.equal(r.reason,'unverified');});
check('valid export',()=>{const raw=v889.exportParticlePlanV889(plan,S,'Hardtekk');assert(raw);const parsed=JSON.parse(raw);assert.equal(parsed.schema,'sonic-particle-director-v889');assert.equal(parsed.trackId,'track-1');assert.equal(parsed.scenes.length,5);assert.equal(parsed.scenes[2].priority,'foam');assert.match(parsed.note,/keine garantierten/);});
check('no fake export without evidence',()=>{assert.equal(v889.exportParticlePlanV889(null,S,'Pop'),null);assert.equal(v889.exportParticlePlanV889({...plan,source:'unavailable'},S,'Pop'),null);});
check('bridge normalizes unsafe settings',()=>{v882.publishConcertStageSyncV882({trackId:'track-1',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:45000,manual:null,manualId:0,manualStartMs:-1,sync:v882.DEFAULT_CONCERT_SYNC_V882,particleSettingsV889:{...S,mode:'strobo',intensity:Infinity}});const snap=v882.readConcertStageSyncV882();assert.equal(snap.particleSettingsV889.mode,'cinematic');assert.equal(snap.particleSettingsV889.intensity,75);v882.publishConcertStageSyncV882(null);});
check('bridge notifies after settings change',()=>{const b={trackId:'track-1',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:45000,manual:null,manualId:0,manualStartMs:-1,sync:v882.DEFAULT_CONCERT_SYNC_V882};let n=0;const off=v882.subscribeConcertStageSyncV882(()=>n++);v882.publishConcertStageSyncV882({...b,particleSettingsV889:{...S,focus:'foam'}});v882.publishConcertStageSyncV882({...b,particleSettingsV889:{...S,focus:'bubbles'}});assert.equal(v882.readConcertStageSyncV882().particleSettingsV889.focus,'bubbles');assert(n>=2);off();v882.publishConcertStageSyncV882(null);});
check('stage applies after V880',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.indexOf('directParticlesV889({')>src.indexOf('planSmartConcertExperienceV880({'));assert(src.includes('authoredLanes:authoredLanesV850'));assert(src.includes('particleMixV889.particles'));assert(src.includes('particleMixV889.foam'));});
check('stage does not allocate new meshes',()=>{const s=read('components/visualizer/DynamicStage.tsx');assert(!s.includes('<AdvancedParticleRendererV889'));});
check('UI persists settings',()=>{const s=read('components/visualizer/LiveFxDeckV881.tsx');assert(s.includes('window.localStorage.getItem(PARTICLE_STORAGE_KEY_V889)'));assert(s.includes('window.localStorage.setItem(PARTICLE_STORAGE_KEY_V889'));assert(s.includes('particleSettingsV889:normalizeParticleV889'));});
check('UI exposes sliders and switches',()=>{const s=read('components/visualizer/LiveFxDeckV881.tsx');for(const k of ['V889 · Advanced Particle FX','particleSettingsV889.mode','particleSettingsV889.focus','particleSettingsV889.intensity','exportParticleV889'])assert(s.includes(k));});
check('version and lock sync',()=>{const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));assert.match(p.version,/^0\.1\.0-v(?:889|890|891|892|893|894|895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version);});
check('CI gate',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v889:ui-types')));
check('Windows gate',()=>assert(read('scripts/verify-v889-windows.ps1').includes('verify:v889:focused')));
check('release docs',()=>assert(read('docs/features/stage/ADVANCED_PARTICLE_FX_V889.md').includes('V889')));
console.log(`V889 Advanced Particle FX: PASS ${checks} checks`);

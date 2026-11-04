'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/ultimateGenreStageV894');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=(file)=>fs.readFileSync(path.resolve(__dirname,'..',file),'utf8');
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=`V894 ${label}: ${e.message}`;throw e;}}
const atmosphere={trackId:'v894-song',durationMs:202000,source:'verified-v604',palette:'noir',scenes:[
 {index:0,startMs:0,endMs:22000,section:'intro',intent:'wide',name:'Intro'},
 {index:1,startMs:22000,endMs:62000,section:'verse',intent:'portrait',name:'Verse'},
 {index:2,startMs:62000,endMs:85000,section:'build',intent:'rise',name:'Build'},
 {index:3,startMs:85000,endMs:119000,section:'drop',intent:'pulse',name:'Drop'},
 {index:4,startMs:119000,endMs:144000,section:'break',intent:'breath',name:'Break'},
 {index:5,startMs:144000,endMs:177000,section:'hook',intent:'ensemble',name:'Hook'},
 {index:6,startMs:177000,endMs:202000,section:'finale',intent:'wide',name:'Finale'},
]};
const plan=v.buildGenreStagePlanV894(atmosphere);
const settings={...v.DEFAULT_GENRE_STAGE_V894};
const run=(positionMs=91000,patch={})=>v.sampleGenreStageV894({plan,settings,trackId:'v894-song',durationMs:202000,positionMs,
 playing:true,autoEnabled:true,genre:'Hardtekk',reducedMotion:false,tier:'high',...patch});
check('enabled by default, remains gated by verified plan',()=>assert.equal(settings.enabled,true));
check('default options',()=>assert.deepEqual(settings,{enabled:true,look:'auto',intensity:60,pace:'concert',architecture:true,lightTint:true,protectLyrics:true}));
check('seven verified intervals',()=>{assert.equal(plan.source,'verified-v604');assert.deepEqual(plan.scenes.map(s=>s.section),['intro','verse','build','drop','break','hook','finale']);});
check('no mutation of source',()=>{const before=JSON.stringify(atmosphere);v.buildGenreStagePlanV894(atmosphere);assert.equal(JSON.stringify(atmosphere),before);});
check('deterministic plan',()=>assert.deepEqual(v.buildGenreStagePlanV894(atmosphere),plan));
for(const value of [undefined,null,false,[],0,'bad',NaN,Infinity,{},new Date()])check(`normalize ${String(value)}`,()=>assert.deepEqual(v.normalizeGenreStageV894(value),settings));
for(const look of ['auto','noir','reactor','rock-arena','prism'])check('look '+look,()=>assert.equal(v.normalizeGenreStageV894({look}).look,look));
for(const bad of [null,40,'','flash','rock',[],{}])check('reject look '+String(bad),()=>assert.equal(v.normalizeGenreStageV894({look:bad}).look,'auto'));
for(const pace of ['smooth','concert','festival'])check('pace '+pace,()=>assert.equal(v.normalizeGenreStageV894({pace}).pace,pace));
for(const bad of [null,'','slow','glitch',123])check('reject pace '+String(bad),()=>assert.equal(v.normalizeGenreStageV894({pace:bad}).pace,'concert'));
for(const amount of [-88,-1,0,8.2,59.9,100,1000])check('intensity '+amount,()=>assert.equal(v.normalizeGenreStageV894({intensity:amount}).intensity,Math.max(0,Math.min(100,Math.round(amount)))));
for(const bad of [null,'70',NaN,Infinity,-Infinity])check('invalid intensity '+String(bad),()=>assert.equal(v.normalizeGenreStageV894({intensity:bad}).intensity,60));
for(const flag of ['enabled','architecture','lightTint','protectLyrics'])check('boolean '+flag,()=>{assert.equal(v.normalizeGenreStageV894({[flag]:false})[flag],false);assert.equal(v.normalizeGenreStageV894({[flag]:'false'})[flag],true);});
for(const [genre,look] of [['Deutschrap','noir'],['Hip-Hop','noir'],['trap','noir'],['Hardtekk','reactor'],['Hardstyle','reactor'],['Techno','reactor'],['NDH/Industrial Metal','rock-arena'],['Deutschrock','rock-arena'],['Rock','rock-arena'],['Pop','prism'],['Synthpop','prism'],['','prism'],[null,'prism']])check('genre look '+String(genre),()=>assert.equal(v.resolveGenreStageLookV894('auto',genre),look));
for(const look of ['noir','reactor','rock-arena','prism'])check('forced look '+look,()=>assert.equal(v.resolveGenreStageLookV894(look,'Hardtekk'),look));
check('all four palettes have real hex and labels',()=>{for(const look of ['noir','reactor','rock-arena','prism']){const p=v.GENRE_STAGE_LOOKS_V894[look];assert.match(p.primary,/^#[a-f0-9]{6}$/i);assert.match(p.secondary,/^#[a-f0-9]{6}$/i);assert(p.label.length>5);assert(p.description.length>9);}});
check('no plan without verified evidence',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,source:'unavailable'}).source,'unavailable'));
for(const bad of [null,undefined,'',{},['x']])check('invalid track '+String(bad),()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,trackId:bad}).source,'unavailable'));
for(const bad of [0,1000,Infinity,2000000])check('invalid duration '+bad,()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,durationMs:bad}).source,'unavailable'));
check('overlap skipped',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[atmosphere.scenes[0],{...atmosphere.scenes[1],startMs:19000}]}).scenes.length,1));
check('fake song section rejected',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[{...atmosphere.scenes[0],section:'imaginary-drop'}]}).source,'unavailable'));
check('time after song rejected',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[{...atmosphere.scenes[0],endMs:300000}]}).source,'unavailable'));
check('name clipped',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[{...atmosphere.scenes[0],name:'x'.repeat(90)}]}).scenes[0].name.length,64));
check('no scenes unavailable',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[]}).source,'unavailable'));
check('unknown scene invalid',()=>assert.equal(v.buildGenreStagePlanV894({...atmosphere,scenes:[{...atmosphere.scenes[0],startMs:NaN}]}).source,'unavailable'));
for(const [label,patch] of [
 ['no plan',{plan:null}],['unverified',{plan:{...plan,source:'unavailable'}}],
 ['other track',{trackId:'no'}],['plan mismatch',{plan:{...plan,trackId:'no'}}],
 ['duration mismatch',{durationMs:210000}],['plan duration mismatch',{plan:{...plan,durationMs:210000}}],
 ['paused',{playing:false}],['master off',{autoEnabled:false}],['reduced motion',{reducedMotion:true}],
 ['low tier',{tier:'low'}],['blackout',{blackout:true}],['seek guard',{seekBlocked:true}],
 ['manual lighting',{manualLighting:true}],['manual FX',{manualFx:true}],
 ['switch off',{settings:{...settings,enabled:false}}],['zero intensity',{settings:{...settings,intensity:0}}],
 ['no channels',{settings:{...settings,architecture:false,lightTint:false}}],
 ['negative timestamp',{positionMs:-1}],['invalid timestamp',{positionMs:NaN}],
 ['at song end',{positionMs:202000}],['past end',{positionMs:210000}]
])check('guard '+label,()=>assert.deepEqual(run(91000,patch),v.GENRE_STAGE_OFF_V894));
for(const [ms,section] of [[4000,'intro'],[33000,'verse'],[68000,'build'],[91000,'drop'],[125000,'break'],[160000,'hook'],[185000,'finale']])check('section '+section,()=>{const c=run(ms);assert.equal(c.section,section);assert.equal(c.active,true);});
check('effect strength drop over break',()=>assert(run(92000).architectureOpacity>run(130000).architectureOpacity));
check('balanced tier reduces scene budget',()=>assert(run(92000,{tier:'balanced'}).architectureOpacity<run(92000).architectureOpacity));
check('lyrics protection fades stage',()=>assert(run(92000,{lyricsProtected:true}).architectureOpacity<run(92000).architectureOpacity));
check('visible lyrics protection',()=>assert(run(92000,{lyricsVisible:true}).architectureOpacity<run(92000).architectureOpacity));
check('vocal focus protection',()=>assert(run(92000,{vocalFocus:true}).architectureOpacity<run(92000).architectureOpacity));
check('lyrics toggle disables attenuation',()=>assert.equal(run(92000,{settings:{...settings,protectLyrics:false},lyricsVisible:true}).architectureOpacity,run(92000,{settings:{...settings,protectLyrics:false}}).architectureOpacity));
check('no architecture channel',()=>{const c=run(92000,{settings:{...settings,architecture:false}});assert.equal(c.architectureOpacity,0);assert(c.lightMix>0);});
check('no light color channel',()=>{const c=run(92000,{settings:{...settings,lightTint:false}});assert.equal(c.lightMix,0);assert(c.architectureOpacity>0);});
check('global light sync respected',()=>{const c=run(92000,{lightsAllowed:false});assert.equal(c.lightMix,0);assert(c.architectureOpacity>0);});
check('gentle fade never strobe',()=>{for(const pace of ['smooth','concert','festival']){const a=run(85000,{settings:{...settings,pace}});assert.equal(a.architectureOpacity,0);assert.equal(a.lightMix,0);const b=run(90000,{settings:{...settings,pace}});assert(b.architectureOpacity>=0);}});
check('always budget constrained',()=>{for(let ms=0;ms<202000;ms+=79){const c=run(ms);assert(c.architectureOpacity<=.58&&c.architectureOpacity>=0);assert(c.lightMix<=.14&&c.lightMix>=0);assert(Number.isFinite(c.fade));}});
check('no extra hardware interfaces',()=>{const s=read('components/visualizer/ultimateGenreStageV894.ts');for(const forbidden of ['setTimeout(','setInterval(','fetch(','navigator.','WebSocket(','requestAnimationFrame(','Math.random(','strobe','hardwareControl'])assert(!s.includes(forbidden),forbidden);});
check('one instanced architecture',()=>{const src=read('components/visualizer/GenreStageArchitectureV894.tsx');assert(src.includes('<instancedMesh'));assert(src.includes('m.setMatrixAt'));assert(src.includes('m.setColorAt'));assert(src.includes('m.visible=opacity.current>.001'));assert(!src.includes('<pointLight'));assert(!src.includes('<spotLight'));assert(!src.includes('setTimeout('));});
check('four distinct layouts',()=>{const src=read('components/visualizer/GenreStageArchitectureV894.tsx');for(const look of ['noir','reactor',"'rock-arena'",'prism'])assert(src.includes(look));assert(src.includes('MAX=32'));});
check('bridge guards metadata',()=>{const sig={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:85000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},genreStageSettingsV894:settings,genreStagePlanV894:plan};bridge.publishConcertStageSyncV882(sig);assert.deepEqual(bridge.readConcertStageSyncV882().genreStagePlanV894,plan);assert.deepEqual(bridge.readConcertStageSyncV882().genreStageSettingsV894,settings);bridge.publishConcertStageSyncV882(null);});
check('bridge rejects wrong track',()=>{const sig={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:85000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},genreStageSettingsV894:settings,genreStagePlanV894:{...plan,trackId:'not-song'}};bridge.publishConcertStageSyncV882(sig);assert.equal(bridge.readConcertStageSyncV882().genreStagePlanV894,null);bridge.publishConcertStageSyncV882(null);});
check('renderer integrates real stage',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.includes('<GenreStageArchitectureV894 cueRef={genreStageCueV894}/>'));assert(src.includes('sampleGenreStageV894({'));assert(src.includes("liveSignalV882.sync.stage&&theme!=='minimal'"));assert(src.includes('lightsAllowed:liveSignalV882.sync.lights'));assert(src.includes('genreStagePrimaryV894.current.set'));});
check('panel persisted and adjustable',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');for(const token of ['GENRE_STAGE_KEY_V894','genreStageReadyV894','setGenreStageSettingsV894','genreStagePlanV894','V894 · Ultimate Genre Stage','downloadGenreStageV894'])assert(src.includes(token),token);});
check('export verified and complete',()=>{const json=v.exportGenreStageV894(plan,settings,'Deutschrap');const out=JSON.parse(json);assert.equal(out.schema,'sonic-ultimate-genre-stage-v894');assert.equal(out.genreLook,'noir');assert.equal(out.scenes.length,7);});
check('no unverified export',()=>assert.equal(v.exportGenreStageV894({...plan,source:'unavailable'},settings,'Hardtekk'),null));
check('no empty export',()=>assert.equal(v.exportGenreStageV894({...plan,scenes:[]},settings,'Hardtekk'),null));
check('CI wired',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('V894 Ultimate Genre Stage')));
check('release version lockfile',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert.match(pkg.version,/^0\.1\.0-v(?:894|895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);});
console.log(`V894 Ultimate Genre Stage PASS: ${checks} checks`);

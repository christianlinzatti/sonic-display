'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/virtualPyrotechnicsV891');
const atm=load('components/visualizer/dynamicConcertAtmosphereV885');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let n=0;const test=(label,fn)=>{try{fn();n++;}catch(e){e.message='V891 '+label+': '+e.message;throw e;}};
const timeline={trackId:'track-891',durationMs:130000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:23000,section:'verse',intent:'portrait'},
 {index:1,startMs:23000,endMs:45000,section:'build',intent:'rise'},
 {index:2,startMs:45000,endMs:72000,section:'drop',intent:'pulse'},
 {index:3,startMs:72000,endMs:101000,section:'hook',intent:'wide'},
 {index:4,startMs:101000,endMs:130000,section:'finale',intent:'finale'}]};
const plan=atm.buildAtmospherePlanV885({timeline,trackId:'track-891',durationMs:130000,genre:'Hardtekk',settings:atm.DEFAULT_ATMOSPHERE_V885});
const S={...v.DEFAULT_PYRO_V891,enabled:true};
const sample=(t=47000,patch={})=>v.planPyroV891({settings:S,plan,trackId:'track-891',durationMs:130000,positionMs:t,
 genre:'Hardtekk',playing:true,autoEnabled:true,reducedMotion:false,tier:'high',...patch});
test('default intentionally off',()=>assert.equal(v.DEFAULT_PYRO_V891.enabled,false));
test('all three FX opt-ins',()=>assert.equal(['flames','jets','sparks'].filter(k=>v.DEFAULT_PYRO_V891[k]).length,3));
for(const raw of [null,undefined,NaN,false,0,'x',[],{},Infinity])test('normalize empty '+String(raw),()=>assert.deepEqual(v.normalizePyroV891(raw),v.DEFAULT_PYRO_V891));
test('normalize full overrides',()=>assert.deepEqual(v.normalizePyroV891({enabled:true,style:'jets',mode:'festival',intensity:35,protectLyrics:false,flames:false,jets:true,sparks:false}),
 {enabled:true,style:'jets',mode:'festival',intensity:35,protectLyrics:false,flames:false,jets:true,sparks:false}));
for(const x of [NaN,Infinity,-Infinity,'40',null])test('reject invalid intensity '+x,()=>assert.equal(v.normalizePyroV891({intensity:x}).intensity,60));
for(const [input,expected] of [[-30,0],[340,100],[70.6,71],[0,0],[100,100]])test('clamp '+input,()=>assert.equal(v.normalizePyroV891({intensity:input}).intensity,expected));
for(const [field,value,expected] of [['style','strobe','auto'],['style','<script>','auto'],['mode','laser','cinematic'],['enabled',1,false],['sparks',0,true]])test('reject '+field,()=>assert.equal(v.normalizePyroV891({[field]:value})[field],expected));
for(const [section,genre,expected] of [
 ['build','Hardtekk','jets'],['drop','Hardtekk','flames'],['drop','Deutschrock','flames'],['drop','Industrial metal','flames'],
 ['drop','Deutschrap','jets'],['hook','Pop','jets'],['hook','Deutschrap','sparks'],['finale','Hardtekk','sparks'],
 ['intro','Hardtekk','none'],['verse','Hardtekk','none'],['break','Deutschrap','none'],['outro','Hardtekk','none']])
 test('suggest '+section+'/'+genre,()=>assert.equal(v.suggestedPyroV891(section,genre),expected));
for(const [t,expected] of [[1000,'none'],[23200,'none'],[24000,'jets'],[46100,'flames'],[47800,'none'],[73000,'sparks'],[103000,'sparks'],[129900,'none']])
 test('scene playback '+t,()=>{const c=sample(t);assert.equal(c.kind,expected);assert.equal(c.active,expected!=='none');});
test('drop starts once',()=>assert.equal(sample(50000).active,false));
test('phase monotonic',()=>assert(sample(46000).phase<sample(46500).phase));
test('stage cue bounds',()=>{for(let t=0;t<130000;t+=131){const c=sample(t);assert(c.opacity>=0&&c.opacity<=.65);assert(c.count>=0&&c.count<=18);assert(c.phase>=0&&c.phase<=1);}});
test('cinematic lower than festival',()=>assert(sample(46000,{settings:{...S,mode:'festival'}}).opacity>sample(46000).opacity));
test('balanced tier lower',()=>assert(sample(46000,{tier:'balanced'}).opacity<sample(46000).opacity));
test('CO2 existing suppresses jets only',()=>{assert.equal(sample(24000,{existingCo2:true}).active,false);assert.equal(sample(46000,{existingCo2:true}).kind,'flames');});
for(const [label,patch] of [
 ['master disabled',{settings:v.DEFAULT_PYRO_V891}],['global disabled',{autoEnabled:false}],['0 intensity',{settings:{...S,intensity:0}}],
 ['pause',{playing:false}],['reduced motion',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],
 ['manual lights',{manualLighting:true}],['manual FX',{manualFx:true}],['authored particles',{authoredParticles:true}],
 ['lyrics',{lyricsProtected:true}],['vocals',{vocalFocus:true}],['low tier',{tier:'low'}],['other track',{trackId:'other'}],
 ['wrong duration',{durationMs:120000}],['missing plan',{plan:null}],['unverified plan',{plan:{...plan,source:'unavailable'}}],
 ['wrong plan duration',{plan:{...plan,durationMs:123000}}],['wrong plan track',{plan:{...plan,trackId:'different'}}],
 ['infinite time',{positionMs:Infinity}],['unknown time',{positionMs:NaN}],['negative time',{positionMs:-1}],
 ['outside duration',{positionMs:130000}],['short song',{durationMs:9000}],['too long',{durationMs:2000000}],
 ['disabled flame',{settings:{...S,flames:false}}],['manual jets outside peak',{settings:{...S,style:'jets'},positionMs:2000}]] )
 test('guard '+label,()=>assert.deepEqual(sample(46000,patch),v.PYRO_OFF_V891));
test('lyrics optout',()=>assert(sample(46000,{lyricsProtected:true,settings:{...S,protectLyrics:false}}).active));
test('flame cannot launch in verse',()=>assert(!sample(1000,{settings:{...S,style:'flames'}}).active));
test('spark cannot launch in build',()=>assert(!sample(24000,{settings:{...S,style:'sparks'}}).active));
test('jets can launch in drop',()=>assert.equal(sample(46000,{settings:{...S,style:'jets'}}).kind,'jets'));
test('no stale burst on seek',()=>{assert.equal(sample(48000).active,false);assert.equal(sample(46000,{seekBlocked:true}).active,false);});
test('stable frame',()=>assert.deepEqual(sample(46000),sample(46000)));
test('non destructive plan',()=>{const old=JSON.stringify(plan);sample();assert.equal(JSON.stringify(plan),old);});
test('export verified plan',()=>{const a=JSON.parse(v.exportPyroPlanV891(plan,S,'Hardtekk'));assert.equal(a.schema,'sonic-virtual-pyrotechnics-v891');assert.equal(a.cues.length,5);assert.equal(a.cues[2].kind,'flames');assert.equal(a.cues[0].kind,'none');});
test('export unavailable rejected',()=>{assert.equal(v.exportPyroPlanV891(null,S,'Pop'),null);assert.equal(v.exportPyroPlanV891({...plan,source:'unavailable'},S,'Pop'),null);});
test('bridge settings',()=>{
 bridge.publishConcertStageSyncV882({trackId:'track-891',durationMs:130000,playing:true,reducedMotion:false,enabled:true,intensity:1,
 sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:45000,manual:null,manualId:0,manualStartMs:-1,
 sync:{stage:true,lights:true,dance:true},atmospherePlan:plan,pyroSettingsV891:S});
 assert.deepEqual(bridge.readConcertStageSyncV882().pyroSettingsV891,S);
 bridge.publishConcertStageSyncV882(null);
});
test('bridge inactive clean state',()=>assert.equal(bridge.readConcertStageSyncV882().enabled,false));
test('UI presence',()=>{const s=read('components/visualizer/LiveFxDeckV881.tsx');for(const key of ['PYRO_STORAGE_KEY_V891','pyroReadyV891','setPyroSettingsV891','pyroSettingsV891:normalizePyroV891','exportPyroPlanV891','V891 · Virtual Pyrotechnics'])assert(s.includes(key),key);});
test('real stage sampler wired',()=>{const s=read('components/visualizer/DynamicStage.tsx');for(const key of ['planPyroV891({','existingCo2:','authoredParticles:','<VirtualPyroStageV891 cueRef={livePyroV891}/>'])assert(s.includes(key),key);});
test('3 fixed emitters',()=>{const s=read('components/visualizer/VirtualPyroStageV891.tsx');assert.equal((s.match(/<instancedMesh/g)||[]).length,3);assert(s.includes('SPARKS=18'));assert(!s.includes('setInterval('));});
test('no device control or blinking',()=>assert(!/fetch\(|WebSocket\(|navigator\.serial|setInterval\(|new SpotLight|strobeGain/.test(read('components/visualizer/virtualPyrotechnicsV891.ts'))));
test('package lock match',()=>{const a=JSON.parse(read('package.json')),b=JSON.parse(read('package-lock.json'));assert.match(a.version,/^0\.1\.0-v(?:891|892|893|894|895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(b.version,a.version);assert.equal(b.packages[''].version,a.version);});
test('CI registered',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v891:ui-types')));
test('Windows script registered',()=>assert(read('scripts/verify-v891-windows.ps1').includes('verify:v891:focused')));
console.log(`V891 Virtual Pyrotechnics: PASS ${n} checks`);

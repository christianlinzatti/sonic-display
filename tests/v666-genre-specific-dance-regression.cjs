'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/genreDancePerformanceV666');
const old=load('components/visualizer/genreAwareMotionDirectorV536');
const base=()=>({headNod:.22,headTurn:.06,spineSway:.25,hipSway:.23,shoulderRoll:.2,followThrough:.14,
 headLag:.09,chestPulse:.19,armSwing:.31,legGroove:.22,footStep:.24,weightShift:.18,beatImpulse:.8,
 leftArmAccent:.11,rightArmAccent:.13,torsoTwist:.07,expressionJaw:.4,expressionBrow:.09,
 expressionEyeNarrow:.2,expressionHeadTilt:.03});
const input=(changes={})=>({settings:{enabled:true,strength:100,style:'auto'},trackId:'track',modelId:'avatar',genre:'deutschrap',
 section:'hook',seconds:10,delta:1/60,playing:true,reducedMotion:false,manualPriority:false,quality:'high',
 energy:.85,kick:.8,snare:.85,footContactKnown:true,plantedLeft:false,plantedRight:false,...changes});
const step=(s=v.newGenreDanceStateV666(),m=base(),changes={})=>v.stepGenreDanceV666(s,m,input(changes));
let n=0;function test(name,fn){try{fn();n++;}catch(e){e.message=`V666 ${name}: ${e.message}`;throw e;}}
test('automatic genre on by default',()=>{const m=base(),r=step(v.newGenreDanceStateV666(),m,{settings:v.DEFAULT_GENRE_DANCE_SETTINGS_V666});assert.equal(r.active,true);assert.equal(r.style,'deutschrap');});
test('settings are strict and bounded',()=>{
 assert.deepEqual(v.normalizeGenreDanceSettingsV666({enabled:1,strength:Infinity,style:'random'}),{...v.DEFAULT_GENRE_DANCE_SETTINGS_V666,enabled:false});
 assert.deepEqual(v.normalizeGenreDanceSettingsV666({enabled:true,strength:123,style:'rock'}),{enabled:true,strength:100,style:'rock'});
 assert.deepEqual(v.normalizeGenreDanceSettingsV666({enabled:true,strength:-8,style:'pop'}),{enabled:true,strength:0,style:'pop'});
 for(const value of [null,{},[],false,'yes',5])assert.equal(v.normalizeGenreDanceSettingsV666(value).enabled,true);
 assert.equal(v.normalizeGenreDanceSettingsV666({enabled:false}).enabled,false);
 assert.equal(v.normalizeGenreDanceSettingsV666({enabled:'false'}).enabled,false);
});
test('settings blocked storage safely uses automatic defaults',()=>{const oldW=global.window;global.window={localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('quota')}},dispatchEvent(){throw Error('should not dispatch')}};try{assert.equal(v.refreshGenreDanceSettingsV666().enabled,true);assert.equal(v.writeGenreDanceSettingsV666({enabled:true}),false);}finally{global.window=oldW;v.refreshGenreDanceSettingsV666();}});
test('settings persist and react to refresh',()=>{const oldW=global.window,store=new Map();global.Event=global.Event||class Event{constructor(type){this.type=type}};global.window={localStorage:{getItem:k=>store.get(k)??null,setItem:(k,val)=>store.set(k,val)},dispatchEvent(){}};try{assert(v.writeGenreDanceSettingsV666({enabled:true,style:'rock',strength:30}));assert.equal(v.refreshGenreDanceSettingsV666().style,'rock');}finally{global.window=oldW;v.refreshGenreDanceSettingsV666();}});
for(const [label,raw,style] of [['German rap','Deutschrap','deutschrap'],['hardstyle','RAWSTYLE','hardstyle'],['hardtekk','Hard Tekk','hardtekk'],['metal','Industrial Metal','rock'],['rock','Punk Rock','rock'],['pop','Electropop','pop'],['trap','German Trap','deutschrap']])test(`${label} recognized`,()=>assert.equal(v.resolveGenreDanceStyleV666(raw),style));
for(const raw of ['',null,'unknown','house','ambient','classical'])test(`unknown genre ${raw} bypasses`,()=>assert.equal(v.resolveGenreDanceStyleV666(raw),null));
for(const [label,patch] of Object.entries({paused:{playing:false},manual:{manualPriority:true},reduced:{reducedMotion:true},low:{quality:'low'},
 unknown:{genre:'house'},emptyTrack:{trackId:''},emptyModel:{modelId:''},badTime:{seconds:NaN},negativeTime:{seconds:-1},
 badDt:{delta:NaN},stale:{delta:.2},disabled:{settings:{enabled:false,strength:80,style:'rock'}},zero:{settings:{enabled:true,strength:0,style:'pop'}}}))test(`bypass ${label}`,()=>{
 const m=base(),r=step(v.newGenreDanceStateV666(),m,patch);assert.strictEqual(r.motion,m);assert.equal(r.active,false);assert.deepEqual(r.state,v.newGenreDanceStateV666());
});
test('explicit style works without genre detection',()=>assert.equal(step(v.newGenreDanceStateV666(),base(),{genre:'unknown',settings:{enabled:true,strength:75,style:'rock'}}).style,'rock'));
test('all five styles differ across same motion',()=>{
 const out=new Map();for(const style of ['deutschrap','hardstyle','hardtekk','rock','pop']){
 let st=v.newGenreDanceStateV666(),last;
 for(let i=0;i<120;i++){last=step(st,base(),{genre:style,seconds:10+i/60});st=last.state;}
 out.set(style,JSON.stringify([last.motion.headNod,last.motion.shoulderRoll,last.motion.hipSway,last.motion.armSwing,last.motion.chestPulse]));
 }
 assert.equal(new Set(out.values()).size,5,JSON.stringify([...out]));
});
test('rock head movement and pop hip sway are distinctive',()=>{
 const run=genre=>{let st=v.newGenreDanceStateV666(),o;for(let i=0;i<90;i++){o=step(st,base(),{genre,seconds:10+i/60});st=o.state;}return o.motion};
 assert(run('rock').headNod>run('pop').headNod);assert(run('pop').hipSway>run('rock').hipSway);
});
test('quiet passages more restrained than hooks',()=>{
 const run=section=>{let st=v.newGenreDanceStateV666(),o;for(let i=0;i<100;i++){o=step(st,base(),{section,seconds:10+i/60});st=o.state;}return o.motion};
 assert(Math.abs(run('break').headNod-base().headNod)<Math.abs(run('hook').headNod-base().headNod));
});
test('motion never fabricates new signal from zero',()=>{const m=base();for(const key of Object.keys(m))m[key]=0;assert.deepEqual(step(v.newGenreDanceStateV666(),m).motion,m);});
test('optional channels remain absent',()=>{const m=base();delete m.leftArmAccent;delete m.torsoTwist;const o=step(v.newGenreDanceStateV666(),m);assert.equal(o.motion.leftArmAccent,undefined);assert.equal(o.motion.torsoTwist,undefined);});
test('face, feet, headTurn, beat and grounding never altered',()=>{const m=base(),o=step(v.newGenreDanceStateV666(),m);for(const key of ['footStep','legGroove','weightShift','hipCounter','headTurn','beatImpulse','expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt'])assert.equal(o.motion[key],m[key],key);});
test('planted foot never amplifies existing hipSway',()=>{const m=base();for(const genre of ['pop','hardtekk'])assert(step(v.newGenreDanceStateV666(),m,{genre,plantedLeft:true}).motion.hipSway<=m.hipSway);});
test('unknown foot contact never amplifies hip sway',()=>{const m=base();for(const genre of ['pop','hardtekk'])assert(step(v.newGenreDanceStateV666(),m,{genre,footContactKnown:false}).motion.hipSway<=m.hipSway);});
test('V665 grounding control uses defined status setter',()=>{const t=fs.readFileSync('components/visualizer/NaturalDanceControlsV320.tsx','utf8');assert(!/\bsetGroundingStatus\(/.test(t));assert(t.includes('setGroundingStatus665('));});
test('smoothing ramps up and resets on song/model/seek and genre change',()=>{
 let o=step();assert(o.state.blend>0&&o.state.blend<.1);
 for(let i=1;i<=100;i++){o=step(o.state,base(),{seconds:10+i/60});}assert(o.state.blend>.98);
 for(const changes of [{trackId:'next'},{modelId:'new'},{seconds:2},{seconds:13},{genre:'rock'}]){
  const result=step(o.state,base(),changes);assert(result.state.blend<.1,JSON.stringify(changes));
 }
});
test('no mutation and deterministic repeat',()=>{const source=base(),state=v.newGenreDanceStateV666(),inp=input(),snap=JSON.stringify([source,state,inp]);const a=v.stepGenreDanceV666(state,source,inp);assert.equal(JSON.stringify([source,state,inp]),snap);assert.deepEqual(a,v.stepGenreDanceV666(state,source,inp));});
test('reject NaN channels, no contamination',()=>{for(const key of ['headNod','shoulderRoll','hipSway','chestPulse','armSwing']){const m=base();m[key]=NaN;const out=step(v.newGenreDanceStateV666(),m);assert.strictEqual(out.motion,m);assert(!out.active);}});
test('15k frames finite, bounded and no mutation of authored vocal/foot channels',()=>{let s=v.newGenreDanceStateV666();const all=['deutschrap','hardstyle','hardtekk','rock','pop'];for(let i=0;i<15000;i++){
 const m=base(),o=step(s,m,{genre:all[Math.floor(i/3000)],seconds:10+i/60,kick:(i%40)/40,snare:(i%30)/30,energy:(i%70)/70,
 section:i%100<40?'verse':i%100<80?'hook':'drop',plantedLeft:i%3===0});s=o.state;
 for(const key of ['headNod','shoulderRoll','hipSway','chestPulse','armSwing']){assert(Number.isFinite(o.motion[key]));assert(Math.abs(o.motion[key])<=Math.abs(m[key])*1.16+1e-9);}
 assert.equal(o.motion.expressionJaw,m.expressionJaw);assert.equal(o.motion.footStep,m.footStep);
}});
test('V536 recognizes rock/pop independently',()=>{assert.equal(old.motionFamilyV536('Metal Rock'),'rock');assert.equal(old.motionFamilyV536('Indie Pop'),'pop');});
test('V536 prefers correct genre-specific installed motion and keeps manual priority',()=>{
 const c=n=>({name:n,label:n,duration:3,trackCount:150,source:'embedded',category:'dance'});
 const clips=[c('Pop_Sway'),c('Rock_Guitar'),c('Pop_Disco'),c('Rock_Headbang')];
 const inp={clips,trackId:'t',modelKey:'m',progressMs:1000,section:'hook',genre:'rock',bpm:120,energy:.6,slot:0,playing:true,reducedMotion:false,manualPriority:false};
 assert(old.rankGenreMotionsV536(inp,'hook:1')[0].name.startsWith('Rock'));
 assert(old.rankGenreMotionsV536({...inp,genre:'pop'},'hook:1')[0].name.startsWith('Pop'));
 assert.equal(old.stepGenreMotionV536(old.newGenreMotionStateV536(),{...inp,manualPriority:true}).selectedName,null);
});
test('wired into existing V492 rig after V665 and before original IK',()=>{const text=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');assert(text.indexOf('stepRealisticGroundingV665(')<text.indexOf('stepGenreDanceV666('));assert(text.indexOf('stepGenreDanceV666(')<text.indexOf('filterMotionDebugLayers(advancedRapV685'));assert(text.indexOf('filterMotionDebugLayers(advancedRapV685')<text.indexOf('updateFootGrounding({'));assert.equal((text.match(/updateFootGrounding\(\{/g)||[]).length,1);});
test('UI automatic mode + portable backup included',()=>{const ui=fs.readFileSync('components/visualizer/NaturalDanceControlsV320.tsx','utf8');const backup=load('services/settings/unifiedBackup');assert(ui.includes('V666 · Genre-Specific Dance Intelligence'));assert(ui.includes('writeGenreDanceSettingsV666'));assert.equal(backup.groupForBackupKey(v.GENRE_DANCE_SETTINGS_KEY_V666),'avatar');});
console.log('PASS V666 genre-specific dance:',n,'groups, 15,000 frames');

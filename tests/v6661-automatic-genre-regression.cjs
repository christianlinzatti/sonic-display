'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const a=load('components/visualizer/genreDancePerformanceV666');
let tests=0;
const test=(name,fn)=>{try{fn();tests++;}catch(e){e.message=`V666.1 ${name}: ${e.message}`;throw e;}};
const makeMotion=()=>({headNod:.22,shoulderRoll:.15,chestPulse:.25,armSwing:.21,hipSway:.14,spineSway:.1,footStep:.31,expressionJaw:.65});
const input=(changes={})=>({settings:a.DEFAULT_GENRE_DANCE_SETTINGS_V666,trackId:'songA',modelId:'avatarA',genre:'Deutschrap',section:'verse',seconds:5,delta:1/60,playing:true,reducedMotion:false,manualPriority:false,quality:'high',energy:.65,kick:.6,snare:.5,footContactKnown:true,plantedLeft:false,plantedRight:false,...changes});
const step=(s=a.newGenreDanceStateV666(),changes={})=>a.stepGenreDanceV666(s,makeMotion(),input(changes));
test('automatic on with genre auto, no setup',()=>assert.deepEqual(a.DEFAULT_GENRE_DANCE_SETTINGS_V666,{enabled:true,strength:65,style:'auto'}));
test('new device null settings get automatic defaults',()=>assert.deepEqual(a.normalizeGenreDanceSettingsV666(null),a.DEFAULT_GENRE_DANCE_SETTINGS_V666));
test('legacy empty object gets automatic defaults',()=>assert.deepEqual(a.normalizeGenreDanceSettingsV666({}),a.DEFAULT_GENRE_DANCE_SETTINGS_V666));
test('partial legacy strength preserves automatic mode',()=>assert.deepEqual(a.normalizeGenreDanceSettingsV666({strength:30}),{enabled:true,strength:30,style:'auto'}));
test('stored enabled false is respected',()=>assert.equal(a.normalizeGenreDanceSettingsV666({enabled:false,style:'auto'}).enabled,false));
test('invalid explicit on/off flag fails closed',()=>assert.equal(a.normalizeGenreDanceSettingsV666({enabled:'false'}).enabled,false));
test('automatic works without opening settings',()=>{let s=a.newGenreDanceStateV666();let out=step(s);assert.equal(out.active,true);assert.equal(out.style,'deutschrap');assert.notStrictEqual(out.motion,undefined);});
test('genres chosen automatically',()=>{for(const [g,want] of [['Deutschrap','deutschrap'],['Hardstyle','hardstyle'],['Hardtekk','hardtekk'],['Rock','rock'],['Pop','pop']]){const x=step(a.newGenreDanceStateV666(),{genre:g});assert.equal(x.style,want,g);assert.equal(x.active,true);}});
test('unknown genres never guessed',()=>{for(const genre of ['',null,'Ambient','Techno','House']){const x=step(a.newGenreDanceStateV666(),{genre});assert.equal(x.active,false);assert.equal(x.style,null);}});
test('explicit manual style retained even with different tag',()=>assert.equal(step(a.newGenreDanceStateV666(),{settings:{enabled:true,strength:40,style:'rock'},genre:'Pop'}).style,'rock'));
test('explicit user disabled setting stays disabled',()=>assert.equal(step(a.newGenreDanceStateV666(),{settings:{enabled:false,strength:65,style:'auto'}}).active,false));
test('manual choreography, reduced motion, low quality and pause win',()=>{for(const patch of [{manualPriority:true},{reducedMotion:true},{quality:'low'},{playing:false}]){const m=makeMotion();const x=a.stepGenreDanceV666(a.newGenreDanceStateV666(),m,input(patch));assert.equal(x.active,false);assert.strictEqual(x.motion,m);}});
test('genre switching resets smoothing',()=>{let o=step();for(let i=1;i<=100;i++)o=step(o.state,{seconds:5+i/60});assert(o.state.blend>.98);const next=step(o.state,{genre:'Rock',seconds:5+101/60});assert.equal(next.style,'rock');assert(next.state.blend<.1);});
test('track switching resets smoothing',()=>{let o=step();for(let i=1;i<=100;i++)o=step(o.state,{seconds:5+i/60});const next=step(o.state,{trackId:'songB',seconds:5+101/60});assert(next.state.blend<.1);});
test('no new motion channels, lyrics and foot values unchanged',()=>{const m=makeMotion();const x=a.stepGenreDanceV666(a.newGenreDanceStateV666(),m,input());assert.deepEqual(Object.keys(x.motion).sort(),Object.keys(m).sort());assert.equal(x.motion.footStep,m.footStep);assert.equal(x.motion.expressionJaw,m.expressionJaw);});
test('installed motion library starts automatic with empty configuration',()=>{const lib=load('components/visualizer/characterMotionLibrary');assert.equal(lib.sanitizeCharacterMotionStore(null).automatic,true);assert.equal(lib.sanitizeCharacterMotionStore({version:1,motions:[]}).automatic,true);});
test('installed motion library explicit opt out persists',()=>{const lib=load('components/visualizer/characterMotionLibrary');assert.equal(lib.sanitizeCharacterMotionStore({version:1,automatic:false,motions:[]}).automatic,false);});
test('installed motion library never overrides manual choice',()=>{const lib=load('components/visualizer/characterMotionLibrary');const selected=lib.chooseCharacterMotion({version:1,automatic:false,motions:[]},'avatar','deutschrap',120,'hook','/manual.glb');assert.equal(selected,'/manual.glb');});
test('real browser storage missing key means auto',()=>{const w=global.window;global.window={localStorage:{getItem:()=>null,setItem(){throw Error('unexpected')}},dispatchEvent(){}};try{assert.deepEqual(a.refreshGenreDanceSettingsV666(),a.DEFAULT_GENRE_DANCE_SETTINGS_V666);}finally{global.window=w;a.refreshGenreDanceSettingsV666();}});
test('real browser storage explicit false remains off',()=>{const w=global.window;global.window={localStorage:{getItem:()=>JSON.stringify({enabled:false,style:'auto',strength:40}),setItem(){throw Error('unexpected')}},dispatchEvent(){}};try{assert.equal(a.refreshGenreDanceSettingsV666().enabled,false);}finally{global.window=w;a.refreshGenreDanceSettingsV666();}});
test('missing/corrupt browser storage does not crash',()=>{const w=global.window;global.window={localStorage:{getItem:()=>'{bad'},dispatchEvent(){}};try{assert.equal(a.refreshGenreDanceSettingsV666().enabled,true);}finally{global.window=w;a.refreshGenreDanceSettingsV666();}});
test('auto mode in UI and backup',()=>{const ui=fs.readFileSync('components/visualizer/NaturalDanceControlsV320.tsx','utf8');assert(ui.includes('Standardmäßig automatisch aktiv'));assert(ui.includes('Automatisch aus Song-Genre (Standard)'));assert(ui.includes('Automatische Genre-Tanzregie aktiviert'));const backup=load('services/settings/unifiedBackup');assert.equal(backup.groupForBackupKey(a.GENRE_DANCE_SETTINGS_KEY_V666),'avatar');});
test('production regression chain reaches V666.1 and original V666',()=>{
  const pkg=require('../package.json');const scripts=pkg.scripts;
  let command=scripts['check:release'],found=false;
  const visited=new Set();
  for(let depth=0;depth<32;depth++){
    const next=/npm run (test:smoke:v\d+)/.exec(command||'')?.[1];
    if(!next||visited.has(next))break;
    if(next==='test:smoke:v6661'){found=true;break;}
    visited.add(next);command=scripts[next];
  }
  assert(found,'V666.1 must remain reachable through the release smoke chain');
  assert(scripts['test:smoke:v6661'].includes('npm run test:smoke:v666'));
  assert.equal(scripts.prebuild,'npm run check:fast');
});
test('12k auto frames across five genres are bounded',()=>{let state=a.newGenreDanceStateV666();const names=['Deutschrap','Hardstyle','Hardtekk','Rock','Pop'];for(let i=0;i<12000;i++){const m=makeMotion(),r=a.stepGenreDanceV666(state,m,input({genre:names[Math.floor(i/2400)],seconds:5+i/60,section:i%3===0?'hook':i%3===1?'verse':'drop'}));state=r.state;assert(r.active);for(const key of ['headNod','shoulderRoll','chestPulse','armSwing','hipSway'])assert(Math.abs(r.motion[key])<=Math.abs(m[key])*1.16+1e-9);assert.equal(r.motion.expressionJaw,m.expressionJaw);assert.equal(r.motion.footStep,m.footStep);}});
console.log('PASS V666.1 automatic genre dance:',tests,'tests, 12,000 frames');

require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('./typescript-loader.cjs');
function load(file){const source=fs.readFileSync(file,'utf8');const out=ts.transpileModule(source,
 {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(out.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const m={exports:{}};new Function('module','exports','require',out.outputText)(m,m.exports,()=>({}));return m.exports;}
const a=load('services/stageContent/autonomousShowV356.ts');
const q=load('services/stageContent/showQualityV357.ts');
const settings=q.DEFAULT_SHOW_QUALITY_V357;
const baseInput={trackId:'track-v357',progressMs:24000,durationMs:210000,bpm:150,section:'hook',genre:'Hardstyle',
 playing:true,reducedMotion:false,lyricsActive:true,avatarCount:3,automaticShowEnabled:true};
const input={trackId:'track-v357',section:'hook',lyricsActive:true,mediaCount:3,avatarCount:3,reducedMotion:false,playing:true};
const p=a.planAutonomousShowV356(baseInput,{...a.DEFAULT_AUTO_SHOW_V356,lookahead:8});
assert(p.active);
const r=q.refineShowQualityV357(p,input,settings);
assert(r.active);assert.equal(r.moments.length,p.moments.length);assert(r.moments.every(m=>m.provisional));
assert(r.moments.every((m,i)=>m.index===p.moments[i].index&&m.startMs===p.moments[i].startMs&&m.endMs===p.moments[i].endMs));
assert(r.moments.every((m,i)=>m.fxGain<=p.moments[i].fxGain&&m.lightGain<=p.moments[i].lightGain));
assert(r.moments.every(m=>m.fxGain<=.80&&m.lightGain<=1.02));
assert(r.moments.every(m=>['wide','medium'].includes(m.shot)));
assert(r.cue.fxGain<=p.cue.fxGain);assert(r.cue.lightGain<=p.cue.lightGain);
assert.equal(q.refineShowQualityV357(p,input,settings).moments[0].shot,r.moments[0].shot);
// Music position + preview horizon may change, but an absolute phrase has a stable choice.
const shifted=a.planAutonomousShowV356({...baseInput,progressMs:p.moments[3].startMs+50},{...a.DEFAULT_AUTO_SHOW_V356,lookahead:4});
const later=q.refineShowQualityV357(shifted,input,settings);
assert.equal(later.moments[0].shot,r.moments[3].shot);
assert.equal(later.moments[0].formation,r.moments[3].formation);
assert(r.moments.every((m,i)=>i===0||m.shot!==r.moments[i-1].shot));
// Content and camera safety: never use zooming/orbit when lyrics are shown.
const energetic=q.refineShowQualityV357(p,input,{...settings,mode:'energetic',maxFxGain:1.55,protectContent:true});
assert(energetic.moments.every(x=>x.fxGain<=.8));
assert(energetic.moments.every(x=>!['orbit','close'].includes(x.shot)));
const loose=q.refineShowQualityV357(p,{...input,lyricsActive:false,mediaCount:0,avatarCount:2},
 {...settings,protectContent:false,maxFxGain:1.55});
assert(loose.moments.every((m,i)=>m.fxGain<=p.moments[i].fxGain));
const versePlan=a.planAutonomousShowV356({...baseInput,lyricsActive:false,section:'verse'} ,{...a.DEFAULT_AUTO_SHOW_V356,lookahead:8});
const calm=q.refineShowQualityV357(versePlan,{...input,lyricsActive:false,section:'verse'}, {...settings,calmness:100});
assert(calm.moments.every(x=>['wide','medium'].includes(x.shot)));
// Do not modify manual, paused, disabled, reduced motion, mismatched V354 or no clock.
for(const reason of ['disabled','reduced','manual','paused']){
 const raw=reason==='disabled'?{...settings,enabled:false}:settings;
 const ctx={...input,reducedMotion:reason==='reduced',manualOverride:reason==='manual',playing:reason!=='paused'};
 const out=q.refineShowQualityV357(p,ctx,raw);
 assert.equal(out.active,false);assert.deepEqual(out.cue,p.cue);
}
assert.equal(q.refineShowQualityV357(a.planAutonomousShowV356({...baseInput,automaticShowEnabled:false}),input).active,false);
assert.equal(q.refineShowQualityV357(a.planAutonomousShowV356({...baseInput,authoredTimeline:{enabled:true,trackId:'track-v357'}}),input).active,false);
assert.equal(q.refineShowQualityV357(p,{...input,trackId:undefined}).active,false);
const noCamera=a.planAutonomousShowV356(baseInput,{...a.DEFAULT_AUTO_SHOW_V356,camera:false,formations:false});
const unaffected=q.refineShowQualityV357(noCamera,input);
assert(unaffected.moments.every((m,i)=>m.shot===noCamera.moments[i].shot&&m.formation===noCamera.moments[i].formation));
assert.equal(unaffected.cue.cameraShot,undefined);assert.equal(unaffected.cue.danceFormation,undefined);
assert.deepEqual(q.sanitizeShowQualityV357({mode:'other',maxFxGain:Infinity,variety:300,calmness:-20}),
 {...settings,variety:100,calmness:0});
assert.equal(q.sanitizeShowQualityV357({maxFxGain:-1}).maxFxGain,.4);
assert.equal(q.sanitizeShowQualityV357({maxFxGain:99}).maxFxGain,1.55);
const low=q.refineShowQualityV357(p,input,{...settings,variety:0});
assert(low.moments.every((m,i)=>m.shot===p.moments[i].shot));
assert(q.scoreShowQualityV357([],input).score===0);
assert(q.scoreShowQualityV357(p.moments,input).score>=0&&q.scoreShowQualityV357(p.moments,input).score<=100);
assert(q.scoreShowQualityV357(r.moments,input).visualLoad<=q.scoreShowQualityV357(p.moments,input).visualLoad);
// Storage is optional and safe with corrupt values.
let saved='',events=[];
global.window={localStorage:{getItem:()=>saved,setItem:(key,v)=>{assert.equal(key,q.SHOW_QUALITY_KEY_V357);saved=v;}},
 dispatchEvent:(ev)=>events.push(ev.type)};
global.Event=class{constructor(type){this.type=type}};
q.saveShowQualityV357({...settings,mode:'cinematic'});
assert.equal(q.readShowQualityV357().mode,'cinematic');assert(events.includes(q.SHOW_QUALITY_EVENT_V357));
saved='{nope';assert.deepEqual(q.readShowQualityV357(),settings);
delete global.window;delete global.Event;
const stage=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ShowQualitySettingsV357.tsx','utf8');
assert.match(stage,/refineShowQualityV357\(/);assert.match(stage,/qualityResultV357\.cue/);
assert.match(stage,/authoredCueV354\.active\?authoredCueV354/);assert.match(stage,/stabilityGainV355/);
assert.match(fs.readFileSync('components/visualizer/GalleryPreviewEditorV343.tsx','utf8'),/<ShowQualitySettingsV357\/>/);
assert(!ui.includes('<Canvas'));assert(!fs.readFileSync('services/stageContent/showQualityV357.ts','utf8').includes('setInterval'));
const pkg=require('../package.json');assert(['0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v390','0.1.0-v391','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(pkg.version));
assert(pkg.scripts['verify:offline'].includes('test:v356')&&pkg.scripts['verify:offline'].includes('test:v357'));
console.log('PASS V357 automatic show quality, deterministic planning, content caps, user priority, storage and integration');

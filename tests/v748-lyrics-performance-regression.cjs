'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planLyricsPerformanceV748:plan,lyricWordAccentV748:accent,
 normalizeLyricsPerformanceV748:normalize,DEFAULT_LYRICS_PERFORMANCE_V748:defaults}=load('components/visualizer/lyricsPerformanceStudioV748');
const {verifiedLyricWordsV477:verify}=load('components/visualizer/beautifulLyricsV477');
let count=0; const ok=(x,m)=>{assert.ok(x,m);count++}; const eq=(x,y,m)=>{assert.deepEqual(x,y,m);count++};
const line={startMs:1000,endMs:3000,text:'Hallo Welt heute',words:[{text:'Hallo',startMs:1000,endMs:1650},{text:'Welt',startMs:1700,endMs:2300},{text:'heute',startMs:2300,endMs:2990}]};
const args={line,progressMs:2000,playing:true,synchronized:true,reducedMotion:false,wordHighlight:true,immersive:true,avatarCount:2,section:'hook',cameraFocus:false,existingPlateOpacity:.83,existing3DWidth:2.6,existingWidthCh:54,settings:defaults};
const base=plan(args);ok(base.active);ok(base.verifiedWords);ok(base.hook);eq(base.section,'hook');ok(base.plateOpacity>=.83);ok(base.max3DWidth<=2.6);ok(base.maxWidthCh<=54);ok(base.wordGlow>0);ok(base.hookGlow>0);
eq(normalize(),defaults);eq(normalize({strength:300,readability:-40,wordAccent:NaN,hookAccent:Infinity}),{...defaults,strength:100,readability:0,wordAccent:0,hookAccent:0});
for(const scene of ['intro','verse','hook','build','drop','break','outro','none',undefined])for(const playing of [true,false])for(const reducedMotion of [false,true])for(const timed of [true,false]){
 const actual=plan({...args,section:scene,playing,reducedMotion,wordHighlight:timed});
 ok(actual.plateOpacity>=.83);ok(actual.max3DWidth<=2.6);ok(actual.maxWidthCh<=54);
 ok(actual.wordGlow>=0&&actual.wordGlow<=.065);ok(actual.hookGlow>=0&&actual.hookGlow<=.065);
 if(!playing){ok(!actual.active);ok(!actual.hook);ok(actual.wordGlow===0);}
 if(!timed)ok(!actual.verifiedWords);
 if(reducedMotion){ok(actual.wordGlow===0);ok(actual.hookGlow===0);ok(actual.outlineBonus===0);}
 if(scene!=='hook'&&scene!=='drop')ok(!actual.hook);
}
for(const settings of [{enabled:false},{strength:0},{wordAccent:0},{hookAccent:0},{readability:0}]){
 const actual=plan({...args,settings});
 if(settings.enabled===false){ok(!actual.active);ok(!actual.enabled);eq(actual.max3DWidth,2.6);eq(actual.maxWidthCh,54);eq(actual.plateOpacity,.83);}
 if(settings.strength===0){eq(actual.wordGlow,0);eq(actual.hookGlow,0);}
 if(settings.wordAccent===0)eq(actual.wordGlow,0);
 if(settings.hookAccent===0)eq(actual.hookGlow,0);
}
for(const malformed of [
 {...line,words:[]},{...line,words:undefined},{...line,words:[{text:'',startMs:1000,endMs:1500}]},
 {...line,words:[{text:'A',startMs:500,endMs:1800}]},
 {...line,words:[{text:'A',startMs:1200,endMs:1200}]},
 {...line,words:[{text:'A',startMs:NaN,endMs:2000}]},
 {...line,words:[{text:'A',startMs:2900,endMs:3100}]},
 {...line,words:[{text:'A',startMs:1100,endMs:1800},{text:'B',startMs:1500,endMs:2500}]}
 ]){ok(!verify(malformed));ok(!plan({...args,line:malformed}).verifiedWords);}
for(const changed of [{synchronized:false},{playing:false},{reducedMotion:true},{progressMs:999},{progressMs:3000},{progressMs:NaN},{progressMs:Infinity},{wordHighlight:false},{settings:{enabled:false}}]){
 const x=plan({...args,...changed});if(!changed.reducedMotion&&!changed.wordHighlight)ok(!x.wordGlow);
 if(changed.reducedMotion)ok(x.wordGlow===0);
 ok(accent({line,wordIndex:1,progressMs:2000,playing:true,reducedMotion:!!changed.reducedMotion,plan:x})===0||changed.wordHighlight===false);
}
// Deterministic seek / phrase / viewport / timing matrix: no accidental word pulse outside real words.
const seeds=['verse','hook','drop','build','break','unknown'];
for(let i=0;i<18000;i++){
 const ms=(i*127)%5000;const section=seeds[i%6];const cast=1+(i%4);
 const opts={...args,progressMs:ms,section,avatarCount:cast,cameraFocus:i%7===0,immersive:i%3!==0,
   reducedMotion:i%11===0,playing:i%13!==0,settings:{...defaults,strength:i%101,readability:(i*7)%101}};
 const x=plan(opts);count++;
 assert.ok(x.plateOpacity>=.83&&x.plateOpacity<=.98);
 assert.ok(x.max3DWidth>0&&x.max3DWidth<=2.6);
 assert.ok(x.maxWidthCh>=20&&x.maxWidthCh<=54);
 assert.ok(x.wordGlow>=0&&x.wordGlow<=.065);
 assert.ok(x.hookGlow>=0&&x.hookGlow<=.065);
 assert.equal(x.verifiedWords,!!(x.active&&verify(line)));
 assert.equal(x.hook,!!(x.active&&(section==='hook'||section==='drop')));
 const first=accent({line,wordIndex:0,progressMs:ms,playing:opts.playing,reducedMotion:opts.reducedMotion,plan:x});
 const second=accent({line,wordIndex:1,progressMs:ms,playing:opts.playing,reducedMotion:opts.reducedMotion,plan:x});
 const third=accent({line,wordIndex:2,progressMs:ms,playing:opts.playing,reducedMotion:opts.reducedMotion,plan:x});
 assert.ok(first>=0&&first<=1&&second>=0&&second<=1&&third>=0&&third<=1);
 if(ms<1000||ms>=3000||!opts.playing||opts.reducedMotion)assert.equal(first+second+third,0);
}
const source=(file)=>fs.readFileSync(file,'utf8');
const dom=source('components/KineticLyrics.tsx'),stage=source('components/visualizer/VisualizerStage.tsx'),scene=source('components/visualizer/Lyrics3DScene.tsx');
for(const [name,content] of [['DOM',dom],['stage',stage],['3D',scene]]){ok(content.includes('V748'),'missing V748 '+name);}
ok(dom.includes('lyricWordAccentV748('));ok(scene.includes('lyricWordAccentV748('));ok(scene.includes('studioV748.max3DWidth'));ok(stage.includes('sectionV748:directedSection'));ok(dom.includes('v748-performance-studio'));
const registry=source('components/visualizer/registry.tsx');ok(registry.includes('performanceV748'));
const css=source('app/globals.css');ok(css.includes('var(--v748-shadow'));ok(!css.includes('calc(var(--v748-accent'));
const settings=source('components/SettingsPanel.tsx');ok(settings.includes('V748 · Lyrics Performance Studio'));
const ui=source('context/UiPreferencesContext.tsx');ok(ui.includes('lyricsPerformanceV748:{enabled:true'));
console.log(`PASS V748 Lyrics Performance Studio: ${count} deterministic checks (18,000 playback/genre/view frames)`);
